package com.hivemq.companion.routes

import com.hivemq.companion.auth.*
import com.hivemq.companion.config.PoolConfig
import com.hivemq.companion.crypto.AesEncryption
import com.hivemq.companion.db.tables.CompanionUsers
import com.hivemq.companion.db.tables.DatabaseConnections
import com.hivemq.companion.ese.EseConnectionManager
import com.hivemq.companion.ese.tables.*
import com.hivemq.companion.module
import com.hivemq.companion.service.ConnectionService
import com.hivemq.companion.service.UserService
import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import kotlinx.serialization.json.*
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.*
import kotlin.test.*

class DashboardRoutesTest {

    private lateinit var companionDataSource: HikariDataSource
    private lateinit var companionDatabase: Database
    private lateinit var eseDataSource: HikariDataSource
    private lateinit var eseDatabase: Database
    private lateinit var userService: UserService
    private lateinit var connectionService: ConnectionService
    private lateinit var jwtService: JwtService
    private lateinit var sessionManager: SessionManager
    private lateinit var bruteForceProtection: BruteForceProtection
    private lateinit var tokenRevocationStore: TokenRevocationStore
    private lateinit var aesEncryption: AesEncryption
    private lateinit var eseConnectionManager: EseConnectionManager

    @BeforeTest
    fun setUp() {
        val nanos = System.nanoTime()

        // Companion database (connection metadata + users)
        val companionHikari = HikariConfig().apply {
            jdbcUrl = "jdbc:h2:mem:test_dashboard_companion_$nanos;DB_CLOSE_DELAY=-1"
            driverClassName = "org.h2.Driver"
            username = "sa"
            password = ""
            maximumPoolSize = 5
            poolName = "test-dashboard-companion-$nanos"
        }
        companionDataSource = HikariDataSource(companionHikari)
        companionDatabase = Database.connect(companionDataSource)

        transaction(companionDatabase) {
            SchemaUtils.create(CompanionUsers, DatabaseConnections)
        }

        // ESE database (simulated external ESE DB with all domain tables)
        val eseHikari = HikariConfig().apply {
            jdbcUrl = "jdbc:h2:mem:test_dashboard_ese_$nanos;DB_CLOSE_DELAY=-1"
            driverClassName = "org.h2.Driver"
            username = "sa"
            password = ""
            maximumPoolSize = 5
            poolName = "test-dashboard-ese-$nanos"
        }
        eseDataSource = HikariDataSource(eseHikari)
        eseDatabase = Database.connect(eseDataSource)

        transaction(eseDatabase) {
            SchemaUtils.create(
                MqttUsers, MqttRoles, MqttPermissions, MqttUserRoles, MqttRolePermissions, MqttUserPermissions,
                CcUsers, CcRoles, CcPermissions, CcUserRoles, CcRolePermissions, CcUserPermissions,
                RestApiUsers, RestApiRoles, RestApiPermissions, RestApiUserRoles, RestApiRolePermissions, RestApiUserPermissions,
            )
        }

        aesEncryption = AesEncryption("test-encryption-key-for-unit-tests")
        userService = UserService(companionDatabase)
        connectionService = ConnectionService(companionDatabase, aesEncryption)
        jwtService = JwtService("test-secret-key-that-is-long-enough-for-hmac256")
        sessionManager = SessionManager()
        bruteForceProtection = BruteForceProtection()
        tokenRevocationStore = TokenRevocationStore()

        // Stub EseConnectionManager that always returns our in-memory ESE database
        eseConnectionManager = object : EseConnectionManager(
            PoolConfig(), companionDatabase, aesEncryption
        ) {
            override fun getDatabase(connectionId: UUID): Database {
                // Verify the connection exists in the companion DB
                val exists = transaction(companionDatabase) {
                    DatabaseConnections.selectAll()
                        .where { DatabaseConnections.id eq connectionId }
                        .count() > 0
                }
                if (!exists) throw IllegalArgumentException("Connection $connectionId not found")
                return eseDatabase
            }
        }
    }

    @AfterTest
    fun tearDown() {
        companionDataSource.close()
        eseDataSource.close()
    }

    private fun ApplicationTestBuilder.configureApp() {
        application {
            module(
                jwtService, userService, sessionManager, bruteForceProtection, tokenRevocationStore,
                connectionService, null, companionDatabase, eseConnectionManager,
            )
        }
    }

    private suspend fun loginAsAdmin(client: io.ktor.client.HttpClient): String {
        userService.createUser("admin", "admin@test.com", "adminpass", "admin")
        val loginResponse = client.post("/api/v1/auth/login") {
            contentType(ContentType.Application.Json)
            setBody("""{"username":"admin","password":"adminpass"}""")
        }
        val body = Json.parseToJsonElement(loginResponse.bodyAsText()).jsonObject
        return body["accessToken"]!!.jsonPrimitive.content
    }

    private suspend fun createConnection(client: io.ktor.client.HttpClient, token: String, name: String): String {
        val response = client.post("/api/v1/connections") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody("""
                {
                    "name": "$name",
                    "description": "Test connection",
                    "dbType": "POSTGRESQL",
                    "host": "localhost",
                    "port": 5432,
                    "databaseName": "testdb",
                    "username": "dbuser",
                    "password": "dbpass",
                    "sslEnabled": false
                }
            """.trimIndent())
        }
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        return body["id"]!!.jsonPrimitive.content
    }

    // -----------------------------------------------------------------------
    // Dashboard endpoint tests
    // -----------------------------------------------------------------------

    @Test
    fun `dashboard returns empty when no connections exist`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        val response = client.get("/api/v1/dashboard") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertEquals(0, body["totalConnections"]!!.jsonPrimitive.int)
        assertEquals(0, body["healthyConnections"]!!.jsonPrimitive.int)
        assertEquals(0, body["unreachableConnections"]!!.jsonPrimitive.int)
        assertEquals(0, body["connections"]!!.jsonArray.size)
    }

    @Test
    fun `dashboard returns connection summaries with stats`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        createConnection(client, token, "conn-a")
        createConnection(client, token, "conn-b")

        val response = client.get("/api/v1/dashboard") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertEquals(2, body["totalConnections"]!!.jsonPrimitive.int)
        assertEquals(2, body["healthyConnections"]!!.jsonPrimitive.int)
        assertEquals(0, body["unreachableConnections"]!!.jsonPrimitive.int)

        val connections = body["connections"]!!.jsonArray
        assertEquals(2, connections.size)

        // Each connection should have stats with zero counts (empty ESE DB)
        for (conn in connections) {
            val obj = conn.jsonObject
            assertTrue(obj.containsKey("id"))
            assertTrue(obj.containsKey("name"))
            assertTrue(obj.containsKey("dbType"))
            assertTrue(obj.containsKey("healthStatus"))

            val stats = obj["stats"]!!.jsonObject
            val mqtt = stats["mqtt"]!!.jsonObject
            assertEquals(0, mqtt["userCount"]!!.jsonPrimitive.int)
            assertEquals(0, mqtt["roleCount"]!!.jsonPrimitive.int)
            assertEquals(0, mqtt["permissionCount"]!!.jsonPrimitive.int)
        }
    }

    @Test
    fun `dashboard handles unreachable connections gracefully`() = testApplication {
        // Use a manager that always throws for stats gathering
        val failingManager = object : EseConnectionManager(
            PoolConfig(), companionDatabase, aesEncryption
        ) {
            override fun getDatabase(connectionId: UUID): Database {
                throw RuntimeException("Connection refused")
            }
        }

        application {
            module(
                jwtService, userService, sessionManager, bruteForceProtection, tokenRevocationStore,
                connectionService, null, companionDatabase, failingManager,
            )
        }

        val token = loginAsAdmin(client)
        createConnection(client, token, "unreachable-conn")

        val response = client.get("/api/v1/dashboard") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertEquals(1, body["totalConnections"]!!.jsonPrimitive.int)
        assertEquals(0, body["healthyConnections"]!!.jsonPrimitive.int)
        assertEquals(1, body["unreachableConnections"]!!.jsonPrimitive.int)

        val conn = body["connections"]!!.jsonArray[0].jsonObject
        assertTrue(conn["stats"] is JsonNull)
    }

    @Test
    fun `unauthenticated request to dashboard returns 401`() = testApplication {
        configureApp()

        val response = client.get("/api/v1/dashboard")

        assertEquals(HttpStatusCode.Unauthorized, response.status)
    }

    // -----------------------------------------------------------------------
    // Per-connection stats endpoint tests
    // -----------------------------------------------------------------------

    @Test
    fun `stats endpoint returns counts for a connection`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)
        val connId = createConnection(client, token, "stats-conn")

        // Insert some data into the ESE database
        transaction(eseDatabase) {
            val now = kotlinx.datetime.Clock.System.now()
            MqttUsers.insert {
                it[username] = "mqttuser1"
                it[password] = "hash"
                it[passwordIterations] = 100
                it[passwordSalt] = "salt"
                it[algorithm] = "SHA512"
                it[createdAt] = now
                it[updatedAt] = now
            }
            MqttUsers.insert {
                it[username] = "mqttuser2"
                it[password] = "hash"
                it[passwordIterations] = 100
                it[passwordSalt] = "salt"
                it[algorithm] = "SHA512"
                it[createdAt] = now
                it[updatedAt] = now
            }
            MqttRoles.insert {
                it[name] = "role1"
                it[description] = "test role"
                it[createdAt] = now
                it[updatedAt] = now
            }
            CcUsers.insert {
                it[username] = "ccuser1"
                it[password] = "hash"
                it[passwordIterations] = 100
                it[passwordSalt] = "salt"
                it[algorithm] = "SHA512"
                it[createdAt] = now
                it[updatedAt] = now
            }
        }

        val response = client.get("/api/v1/ese/$connId/stats") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject

        val mqtt = body["mqtt"]!!.jsonObject
        assertEquals(2, mqtt["userCount"]!!.jsonPrimitive.int)
        assertEquals(1, mqtt["roleCount"]!!.jsonPrimitive.int)
        assertEquals(0, mqtt["permissionCount"]!!.jsonPrimitive.int)

        val cc = body["cc"]!!.jsonObject
        assertEquals(1, cc["userCount"]!!.jsonPrimitive.int)
        assertEquals(0, cc["roleCount"]!!.jsonPrimitive.int)
        assertEquals(0, cc["permissionCount"]!!.jsonPrimitive.int)

        val restApi = body["restApi"]!!.jsonObject
        assertEquals(0, restApi["userCount"]!!.jsonPrimitive.int)
        assertEquals(0, restApi["roleCount"]!!.jsonPrimitive.int)
        assertEquals(0, restApi["permissionCount"]!!.jsonPrimitive.int)
    }

    @Test
    fun `stats endpoint returns 404 for non-existent connection`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        val response = client.get("/api/v1/ese/00000000-0000-0000-0000-000000000000/stats") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }

        assertEquals(HttpStatusCode.NotFound, response.status)
    }

    @Test
    fun `unauthenticated request to stats returns 401`() = testApplication {
        configureApp()

        val response = client.get("/api/v1/ese/00000000-0000-0000-0000-000000000000/stats")

        assertEquals(HttpStatusCode.Unauthorized, response.status)
    }
}
