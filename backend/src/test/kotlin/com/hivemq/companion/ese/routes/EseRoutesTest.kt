package com.hivemq.companion.ese.routes

import com.hivemq.companion.auth.*
import com.hivemq.companion.crypto.CryptoService
import com.hivemq.companion.db.tables.CompanionUsers
import com.hivemq.companion.db.tables.DatabaseConnections
import com.hivemq.companion.ese.dto.*
import com.hivemq.companion.ese.service.EseService
import com.hivemq.companion.ese.tables.*
import com.hivemq.companion.ese.EseConnectionManager
import com.hivemq.companion.module
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
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.UUID
import kotlin.test.*

class EseRoutesTest {

    private lateinit var companionDs: HikariDataSource
    private lateinit var companionDb: Database
    private lateinit var eseDs: HikariDataSource
    private lateinit var eseDb: Database
    private lateinit var userService: UserService
    private lateinit var jwtService: JwtService
    private lateinit var sessionManager: SessionManager
    private lateinit var bruteForceProtection: BruteForceProtection
    private lateinit var tokenRevocationStore: TokenRevocationStore
    private lateinit var cryptoService: CryptoService
    private lateinit var eseService: EseService

    // Fixed UUID to use as the connection ID (we bypass the real EseConnectionManager)
    private val testConnId = UUID.fromString("00000000-0000-0000-0000-000000000001")

    @BeforeTest
    fun setUp() {
        // Companion DB (for auth)
        val companionConfig = HikariConfig().apply {
            jdbcUrl = "jdbc:h2:mem:companion_${System.nanoTime()};DB_CLOSE_DELAY=-1"
            driverClassName = "org.h2.Driver"
            username = "sa"
            password = ""
            maximumPoolSize = 5
            poolName = "companion-pool-${System.nanoTime()}"
        }
        companionDs = HikariDataSource(companionConfig)
        companionDb = Database.connect(companionDs)

        transaction(companionDb) {
            SchemaUtils.create(CompanionUsers, DatabaseConnections)
        }

        // ESE DB (the target database for CRUD)
        val eseConfig = HikariConfig().apply {
            jdbcUrl = "jdbc:h2:mem:ese_${System.nanoTime()};DB_CLOSE_DELAY=-1"
            driverClassName = "org.h2.Driver"
            username = "sa"
            password = ""
            maximumPoolSize = 5
            poolName = "ese-pool-${System.nanoTime()}"
        }
        eseDs = HikariDataSource(eseConfig)
        eseDb = Database.connect(eseDs)

        transaction(eseDb) {
            SchemaUtils.create(
                MqttUsers, MqttRoles, MqttPermissions,
                MqttUserRoles, MqttRolePermissions, MqttUserPermissions,
                CcUsers, CcRoles, CcPermissions,
                CcUserRoles, CcRolePermissions, CcUserPermissions,
                RestApiUsers, RestApiRoles, RestApiPermissions,
                RestApiUserRoles, RestApiRolePermissions, RestApiUserPermissions,
            )
        }

        userService = UserService(companionDb)
        jwtService = JwtService("test-secret-key-that-is-long-enough-for-hmac256")
        sessionManager = SessionManager()
        bruteForceProtection = BruteForceProtection()
        tokenRevocationStore = TokenRevocationStore()
        cryptoService = CryptoService()

        // Create a stub EseConnectionManager that always returns our H2 ese database
        val stubManager = object : EseConnectionManager(
            com.hivemq.companion.config.PoolConfig(),
            companionDb,
            com.hivemq.companion.crypto.AesEncryption("test-encryption-key-for-unit-tests"),
        ) {
            override fun getDatabase(connectionId: UUID): Database {
                if (connectionId == testConnId) return eseDb
                throw IllegalArgumentException("Connection $connectionId not found")
            }
        }

        eseService = EseService(stubManager, cryptoService)
    }

    @AfterTest
    fun tearDown() {
        eseDs.close()
        companionDs.close()
    }

    private fun ApplicationTestBuilder.configureApp() {
        application {
            module(jwtService, userService, sessionManager, bruteForceProtection, tokenRevocationStore, eseService = eseService)
        }
    }

    private suspend fun loginAsAdmin(client: io.ktor.client.HttpClient): String {
        userService.createUser("admin", "admin@test.com", "adminpass", "admin")
        val resp = client.post("/api/v1/auth/login") {
            contentType(ContentType.Application.Json)
            setBody("""{"username":"admin","password":"adminpass"}""")
        }
        val body = Json.parseToJsonElement(resp.bodyAsText()).jsonObject
        return body["accessToken"]!!.jsonPrimitive.content
    }

    private suspend fun loginAsReadonly(client: io.ktor.client.HttpClient): String {
        userService.createUser("viewer", "viewer@test.com", "viewerpass", "readonly")
        val resp = client.post("/api/v1/auth/login") {
            contentType(ContentType.Application.Json)
            setBody("""{"username":"viewer","password":"viewerpass"}""")
        }
        val body = Json.parseToJsonElement(resp.bodyAsText()).jsonObject
        return body["accessToken"]!!.jsonPrimitive.content
    }

    private fun basePath(domain: String = "mqtt") = "/api/v1/ese/$testConnId/$domain"

    // -----------------------------------------------------------------------
    // 1. Create MQTT user — password is hashed
    // -----------------------------------------------------------------------
    @Test
    fun `create MQTT user hashes password`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        val resp = client.post("${basePath()}/users") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody("""{"username":"mqttuser","password":"secret123","algorithm":"PKCS5S2","iterations":100}""")
        }

        assertEquals(HttpStatusCode.Created, resp.status)
        val body = Json.parseToJsonElement(resp.bodyAsText()).jsonObject
        assertEquals("mqttuser", body["username"]!!.jsonPrimitive.content)
        assertEquals("PKCS5S2", body["algorithm"]!!.jsonPrimitive.content)
        assertEquals(100, body["iterations"]!!.jsonPrimitive.int)
        // Password must NOT appear in response
        assertFalse(body.containsKey("password"))

        // Verify the stored password is not plain text
        transaction(eseDb) {
            val row = MqttUsers.selectAll().where { MqttUsers.username eq "mqttuser" }.single()
            assertNotEquals("secret123", row[MqttUsers.password])
            assertTrue(row[MqttUsers.passwordSalt].isNotEmpty())
        }
    }

    // -----------------------------------------------------------------------
    // 2. List MQTT users with pagination
    // -----------------------------------------------------------------------
    @Test
    fun `list MQTT users with pagination`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        // Create 3 users
        for (i in 1..3) {
            client.post("${basePath()}/users") {
                header(HttpHeaders.Authorization, "Bearer $token")
                contentType(ContentType.Application.Json)
                setBody("""{"username":"user$i","password":"pass$i"}""")
            }
        }

        val resp = client.get("${basePath()}/users?page=1&size=2") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }

        assertEquals(HttpStatusCode.OK, resp.status)
        val body = Json.parseToJsonElement(resp.bodyAsText()).jsonObject
        assertEquals(3, body["total"]!!.jsonPrimitive.long.toInt())
        assertEquals(2, body["items"]!!.jsonArray.size)
        assertEquals(1, body["page"]!!.jsonPrimitive.int)
        assertEquals(2, body["size"]!!.jsonPrimitive.int)
    }

    // -----------------------------------------------------------------------
    // 3. Create and list MQTT roles
    // -----------------------------------------------------------------------
    @Test
    fun `create and list MQTT roles`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        val createResp = client.post("${basePath()}/roles") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody("""{"name":"admin-role","description":"Admin role"}""")
        }
        assertEquals(HttpStatusCode.Created, createResp.status)
        val created = Json.parseToJsonElement(createResp.bodyAsText()).jsonObject
        assertEquals("admin-role", created["name"]!!.jsonPrimitive.content)

        val listResp = client.get("${basePath()}/roles") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }
        assertEquals(HttpStatusCode.OK, listResp.status)
        val list = Json.parseToJsonElement(listResp.bodyAsText()).jsonObject
        assertEquals(1, list["total"]!!.jsonPrimitive.long.toInt())
    }

    // -----------------------------------------------------------------------
    // 4. Create MQTT permission (topic-based)
    // -----------------------------------------------------------------------
    @Test
    fun `create MQTT permission topic-based`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        val resp = client.post("${basePath()}/permissions") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody("""{"topic":"sensor/#","publishAllowed":true,"subscribeAllowed":true,"qos0Allowed":true,"qos1Allowed":true,"qos2Allowed":false}""")
        }

        assertEquals(HttpStatusCode.Created, resp.status)
        val body = Json.parseToJsonElement(resp.bodyAsText()).jsonObject
        assertEquals("sensor/#", body["topic"]!!.jsonPrimitive.content)
        assertTrue(body["publishAllowed"]!!.jsonPrimitive.boolean)
        assertTrue(body["subscribeAllowed"]!!.jsonPrimitive.boolean)
        assertTrue(body["qos0Allowed"]!!.jsonPrimitive.boolean)
        assertTrue(body["qos1Allowed"]!!.jsonPrimitive.boolean)
        assertFalse(body["qos2Allowed"]!!.jsonPrimitive.boolean)
    }

    // -----------------------------------------------------------------------
    // 5. Assign role to user
    // -----------------------------------------------------------------------
    @Test
    fun `assign role to MQTT user`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        // Create user
        val userResp = client.post("${basePath()}/users") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody("""{"username":"testuser","password":"pass123"}""")
        }
        val userId = Json.parseToJsonElement(userResp.bodyAsText()).jsonObject["id"]!!.jsonPrimitive.int

        // Create role
        val roleResp = client.post("${basePath()}/roles") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody("""{"name":"testrole","description":"A test role"}""")
        }
        val roleId = Json.parseToJsonElement(roleResp.bodyAsText()).jsonObject["id"]!!.jsonPrimitive.int

        // Assign role to user
        val assignResp = client.post("${basePath()}/users/$userId/roles/$roleId") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }
        assertEquals(HttpStatusCode.Created, assignResp.status)

        // Verify via getUser detail
        val detailResp = client.get("${basePath()}/users/$userId") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }
        val detail = Json.parseToJsonElement(detailResp.bodyAsText()).jsonObject
        val roles = detail["roles"]!!.jsonArray
        assertEquals(1, roles.size)
        assertEquals("testrole", roles[0].jsonObject["name"]!!.jsonPrimitive.content)
    }

    // -----------------------------------------------------------------------
    // 6. Readonly user gets 403 on POST
    // -----------------------------------------------------------------------
    @Test
    fun `readonly user gets 403 on create user`() = testApplication {
        configureApp()
        val token = loginAsReadonly(client)

        val resp = client.post("${basePath()}/users") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody("""{"username":"newuser","password":"pass"}""")
        }

        assertEquals(HttpStatusCode.Forbidden, resp.status)
    }

    // -----------------------------------------------------------------------
    // 7. Domain routing works for CC
    // -----------------------------------------------------------------------
    @Test
    fun `CC domain CRUD works`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        // Create CC user
        val userResp = client.post("${basePath("cc")}/users") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody("""{"username":"ccadmin","password":"ccpass","algorithm":"PKCS5S2","iterations":100}""")
        }
        assertEquals(HttpStatusCode.Created, userResp.status)
        val user = Json.parseToJsonElement(userResp.bodyAsText()).jsonObject
        assertEquals("ccadmin", user["username"]!!.jsonPrimitive.content)

        // Create CC permission (string-based)
        val permResp = client.post("${basePath("cc")}/permissions") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody("""{"permissionString":"HIVEMQ_SUPER_ADMIN","description":"Full access"}""")
        }
        assertEquals(HttpStatusCode.Created, permResp.status)
        val perm = Json.parseToJsonElement(permResp.bodyAsText()).jsonObject
        assertEquals("HIVEMQ_SUPER_ADMIN", perm["permissionString"]!!.jsonPrimitive.content)

        // Verify CC tables are separate — MQTT users list should be empty
        val mqttUsersResp = client.get("${basePath("mqtt")}/users") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }
        val mqttUsers = Json.parseToJsonElement(mqttUsersResp.bodyAsText()).jsonObject
        assertEquals(0, mqttUsers["total"]!!.jsonPrimitive.long.toInt())
    }

    // -----------------------------------------------------------------------
    // Additional: invalid domain returns 400
    // -----------------------------------------------------------------------
    @Test
    fun `invalid domain returns 400`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        val resp = client.get("/api/v1/ese/$testConnId/invalid/users") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }
        assertEquals(HttpStatusCode.BadRequest, resp.status)
    }

    // -----------------------------------------------------------------------
    // Additional: delete user cascades associations
    // -----------------------------------------------------------------------
    @Test
    fun `delete MQTT user removes associations`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        // Create user + role + assign
        val userResp = client.post("${basePath()}/users") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody("""{"username":"deluser","password":"pass123"}""")
        }
        val userId = Json.parseToJsonElement(userResp.bodyAsText()).jsonObject["id"]!!.jsonPrimitive.int

        val roleResp = client.post("${basePath()}/roles") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody("""{"name":"delrole"}""")
        }
        val roleId = Json.parseToJsonElement(roleResp.bodyAsText()).jsonObject["id"]!!.jsonPrimitive.int

        client.post("${basePath()}/users/$userId/roles/$roleId") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }

        // Delete user
        val delResp = client.delete("${basePath()}/users/$userId") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }
        assertEquals(HttpStatusCode.OK, delResp.status)

        // User should be gone
        val getResp = client.get("${basePath()}/users/$userId") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }
        assertEquals(HttpStatusCode.NotFound, getResp.status)

        // Association should be gone too
        transaction(eseDb) {
            val count = MqttUserRoles.selectAll().where { MqttUserRoles.userId eq userId }.count()
            assertEquals(0, count)
        }
    }
}
