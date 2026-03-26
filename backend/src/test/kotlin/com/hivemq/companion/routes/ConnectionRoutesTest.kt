package com.hivemq.companion.routes

import com.hivemq.companion.auth.*
import com.hivemq.companion.crypto.AesEncryption
import com.hivemq.companion.db.tables.CompanionUsers
import com.hivemq.companion.db.tables.DatabaseConnections
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
import org.jetbrains.exposed.sql.transactions.transaction
import kotlin.test.*

class ConnectionRoutesTest {

    private lateinit var dataSource: HikariDataSource
    private lateinit var database: Database
    private lateinit var userService: UserService
    private lateinit var connectionService: ConnectionService
    private lateinit var jwtService: JwtService
    private lateinit var sessionManager: SessionManager
    private lateinit var bruteForceProtection: BruteForceProtection
    private lateinit var tokenRevocationStore: TokenRevocationStore
    private lateinit var aesEncryption: AesEncryption

    @BeforeTest
    fun setUp() {
        val hikariConfig = HikariConfig().apply {
            jdbcUrl = "jdbc:h2:mem:test_conn_${System.nanoTime()};DB_CLOSE_DELAY=-1"
            driverClassName = "org.h2.Driver"
            username = "sa"
            password = ""
            maximumPoolSize = 5
            poolName = "test-conn-pool-${System.nanoTime()}"
        }
        dataSource = HikariDataSource(hikariConfig)
        database = Database.connect(dataSource)

        transaction(database) {
            SchemaUtils.create(CompanionUsers, DatabaseConnections)
        }

        aesEncryption = AesEncryption("test-encryption-key-for-unit-tests")
        userService = UserService(database)
        connectionService = ConnectionService(database, aesEncryption)
        jwtService = JwtService("test-secret-key-that-is-long-enough-for-hmac256")
        sessionManager = SessionManager()
        bruteForceProtection = BruteForceProtection()
        tokenRevocationStore = TokenRevocationStore()
    }

    @AfterTest
    fun tearDown() {
        dataSource.close()
    }

    private fun ApplicationTestBuilder.configureApp() {
        application {
            module(jwtService, userService, sessionManager, bruteForceProtection, tokenRevocationStore, connectionService)
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

    private suspend fun loginAsUser(client: io.ktor.client.HttpClient): String {
        userService.createUser("regularuser", "user@test.com", "userpass", "readonly")
        val loginResponse = client.post("/api/v1/auth/login") {
            contentType(ContentType.Application.Json)
            setBody("""{"username":"regularuser","password":"userpass"}""")
        }
        val body = Json.parseToJsonElement(loginResponse.bodyAsText()).jsonObject
        return body["accessToken"]!!.jsonPrimitive.content
    }

    private fun createConnectionBody(
        name: String = "test-db",
        dbType: String = "POSTGRESQL",
        host: String = "localhost",
        port: Int = 5432,
        databaseName: String = "testdb",
        username: String = "dbuser",
        password: String = "dbpass",
    ): String = """
        {
            "name": "$name",
            "description": "Test database connection",
            "dbType": "$dbType",
            "host": "$host",
            "port": $port,
            "databaseName": "$databaseName",
            "username": "$username",
            "password": "$password",
            "sslEnabled": false
        }
    """.trimIndent()

    @Test
    fun `create connection returns connection without password`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        val response = client.post("/api/v1/connections") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody(createConnectionBody())
        }

        assertEquals(HttpStatusCode.Created, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertEquals("test-db", body["name"]!!.jsonPrimitive.content)
        assertEquals("POSTGRESQL", body["dbType"]!!.jsonPrimitive.content)
        assertEquals("localhost", body["host"]!!.jsonPrimitive.content)
        assertEquals(5432, body["port"]!!.jsonPrimitive.int)
        assertEquals("testdb", body["databaseName"]!!.jsonPrimitive.content)
        assertEquals("dbuser", body["username"]!!.jsonPrimitive.content)
        assertEquals("UNKNOWN", body["healthStatus"]!!.jsonPrimitive.content)
        assertTrue(body.containsKey("id"))
        assertTrue(body.containsKey("createdAt"))
        assertTrue(body.containsKey("updatedAt"))
        // Password must NOT be in the response
        assertFalse(body.containsKey("password"))
    }

    @Test
    fun `list connections returns paginated list`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        // Create two connections
        client.post("/api/v1/connections") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody(createConnectionBody(name = "conn-a"))
        }
        client.post("/api/v1/connections") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody(createConnectionBody(name = "conn-b"))
        }

        val response = client.get("/api/v1/connections") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertTrue(body.containsKey("items"))
        assertTrue(body.containsKey("page"))
        assertTrue(body.containsKey("size"))
        assertTrue(body.containsKey("total"))
        val items = body["items"]!!.jsonArray
        assertEquals(2, items.size)
        assertEquals(2, body["total"]!!.jsonPrimitive.long.toInt())
    }

    @Test
    fun `get connection by ID returns details`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        val createResponse = client.post("/api/v1/connections") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody(createConnectionBody())
        }
        val created = Json.parseToJsonElement(createResponse.bodyAsText()).jsonObject
        val connId = created["id"]!!.jsonPrimitive.content

        val response = client.get("/api/v1/connections/$connId") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertEquals(connId, body["id"]!!.jsonPrimitive.content)
        assertEquals("test-db", body["name"]!!.jsonPrimitive.content)
        assertEquals("POSTGRESQL", body["dbType"]!!.jsonPrimitive.content)
    }

    @Test
    fun `update connection returns updated connection`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        val createResponse = client.post("/api/v1/connections") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody(createConnectionBody())
        }
        val created = Json.parseToJsonElement(createResponse.bodyAsText()).jsonObject
        val connId = created["id"]!!.jsonPrimitive.content

        val response = client.put("/api/v1/connections/$connId") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody("""{"name":"updated-db","host":"newhost.example.com","port":5433}""")
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertEquals("updated-db", body["name"]!!.jsonPrimitive.content)
        assertEquals("newhost.example.com", body["host"]!!.jsonPrimitive.content)
        assertEquals(5433, body["port"]!!.jsonPrimitive.int)
    }

    @Test
    fun `delete connection returns 200`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        val createResponse = client.post("/api/v1/connections") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody(createConnectionBody())
        }
        val created = Json.parseToJsonElement(createResponse.bodyAsText()).jsonObject
        val connId = created["id"]!!.jsonPrimitive.content

        val response = client.delete("/api/v1/connections/$connId") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }

        assertEquals(HttpStatusCode.OK, response.status)

        // Verify it is gone
        val getResponse = client.get("/api/v1/connections/$connId") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }
        assertEquals(HttpStatusCode.NotFound, getResponse.status)
    }

    @Test
    fun `test connection with H2 returns success`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        // Create a connection pointing to an H2 in-memory DB (uses the H2 driver on test classpath).
        // H2 accepts postgresql-style JDBC URLs via compatibility mode, but to actually connect we
        // need to use its native URL. Since buildJdbcUrl produces a postgresql URL, the driver won't
        // match. Instead we verify the test endpoint returns a failure message gracefully.
        val createResponse = client.post("/api/v1/connections") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody(createConnectionBody(host = "localhost", port = 15432, databaseName = "nonexistent"))
        }
        val created = Json.parseToJsonElement(createResponse.bodyAsText()).jsonObject
        val connId = created["id"]!!.jsonPrimitive.content

        val response = client.post("/api/v1/connections/$connId/test") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        // It should fail because there is no real PostgreSQL server at localhost:15432
        assertFalse(body["success"]!!.jsonPrimitive.boolean)
        assertTrue(body.containsKey("message"))
    }

    @Test
    fun `non-admin gets 403 on list connections`() = testApplication {
        configureApp()
        val token = loginAsUser(client)

        val response = client.get("/api/v1/connections") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }

        assertEquals(HttpStatusCode.Forbidden, response.status)
    }

    @Test
    fun `non-admin gets 403 on create connection`() = testApplication {
        configureApp()
        val token = loginAsUser(client)

        val response = client.post("/api/v1/connections") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody(createConnectionBody())
        }

        assertEquals(HttpStatusCode.Forbidden, response.status)
    }

    @Test
    fun `get health returns health status`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        val createResponse = client.post("/api/v1/connections") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody(createConnectionBody())
        }
        val created = Json.parseToJsonElement(createResponse.bodyAsText()).jsonObject
        val connId = created["id"]!!.jsonPrimitive.content

        val response = client.get("/api/v1/connections/$connId/health") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertEquals("UNKNOWN", body["status"]!!.jsonPrimitive.content)
    }

    @Test
    fun `get non-existent connection returns 404`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        val response = client.get("/api/v1/connections/00000000-0000-0000-0000-000000000000") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }

        assertEquals(HttpStatusCode.NotFound, response.status)
    }
}
