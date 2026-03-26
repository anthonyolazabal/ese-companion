package com.hivemq.companion.routes

import com.hivemq.companion.auth.*
import com.hivemq.companion.db.tables.ApiKeys
import com.hivemq.companion.db.tables.CompanionUsers
import com.hivemq.companion.module
import com.hivemq.companion.service.ApiKeyService
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

class ApiKeyRoutesTest {

    private lateinit var dataSource: HikariDataSource
    private lateinit var database: Database
    private lateinit var userService: UserService
    private lateinit var apiKeyService: ApiKeyService
    private lateinit var jwtService: JwtService
    private lateinit var sessionManager: SessionManager
    private lateinit var bruteForceProtection: BruteForceProtection
    private lateinit var tokenRevocationStore: TokenRevocationStore

    @BeforeTest
    fun setUp() {
        val hikariConfig = HikariConfig().apply {
            jdbcUrl = "jdbc:h2:mem:test_apikeys_${System.nanoTime()};DB_CLOSE_DELAY=-1"
            driverClassName = "org.h2.Driver"
            username = "sa"
            password = ""
            maximumPoolSize = 5
            poolName = "test-pool-apikeys-${System.nanoTime()}"
        }
        dataSource = HikariDataSource(hikariConfig)
        database = Database.connect(dataSource)

        transaction(database) {
            SchemaUtils.create(CompanionUsers, ApiKeys)
        }

        userService = UserService(database)
        apiKeyService = ApiKeyService(database)
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
            module(
                jwtService, userService, sessionManager, bruteForceProtection,
                tokenRevocationStore, apiKeyService = apiKeyService,
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

    private suspend fun loginAsUser(client: io.ktor.client.HttpClient): String {
        userService.createUser("regularuser", "user@test.com", "userpass", "readonly")
        val loginResponse = client.post("/api/v1/auth/login") {
            contentType(ContentType.Application.Json)
            setBody("""{"username":"regularuser","password":"userpass"}""")
        }
        val body = Json.parseToJsonElement(loginResponse.bodyAsText()).jsonObject
        return body["accessToken"]!!.jsonPrimitive.content
    }

    @Test
    fun `create key returns raw key once`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        val response = client.post("/api/v1/keys") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody("""{"name":"Test Key","scopes":["ese:read"],"expiresAt":"2099-12-31T23:59:59Z"}""")
        }

        assertEquals(HttpStatusCode.Created, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertTrue(body.containsKey("key"))
        assertTrue(body["key"]!!.jsonPrimitive.content.startsWith("esc_"))
        assertEquals("Test Key", body["name"]!!.jsonPrimitive.content)
        assertTrue(body.containsKey("id"))
        assertTrue(body.containsKey("keyPrefix"))
        assertEquals("esc_", body["keyPrefix"]!!.jsonPrimitive.content.take(4))
    }

    @Test
    fun `list keys shows prefix but not hash`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        // Create a key first
        client.post("/api/v1/keys") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody("""{"name":"List Test","scopes":["ese:read"],"expiresAt":"2099-12-31T23:59:59Z"}""")
        }

        val response = client.get("/api/v1/keys") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val keys = Json.parseToJsonElement(response.bodyAsText()).jsonArray
        assertTrue(keys.size >= 1)
        val key = keys[0].jsonObject
        assertTrue(key.containsKey("keyPrefix"))
        assertFalse(key.containsKey("key"))
        assertFalse(key.containsKey("keyHash"))
    }

    @Test
    fun `get key by ID`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        val createResponse = client.post("/api/v1/keys") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody("""{"name":"Get Test","scopes":["ese:read","ese:write"],"expiresAt":"2099-12-31T23:59:59Z"}""")
        }
        val created = Json.parseToJsonElement(createResponse.bodyAsText()).jsonObject
        val keyId = created["id"]!!.jsonPrimitive.content

        val response = client.get("/api/v1/keys/$keyId") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertEquals("Get Test", body["name"]!!.jsonPrimitive.content)
        assertEquals(keyId, body["id"]!!.jsonPrimitive.content)
        val scopes = body["scopes"]!!.jsonArray.map { it.jsonPrimitive.content }
        assertTrue(scopes.contains("ese:read"))
        assertTrue(scopes.contains("ese:write"))
    }

    @Test
    fun `update key name and scopes`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        val createResponse = client.post("/api/v1/keys") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody("""{"name":"Old Name","scopes":["ese:read"],"expiresAt":"2099-12-31T23:59:59Z"}""")
        }
        val created = Json.parseToJsonElement(createResponse.bodyAsText()).jsonObject
        val keyId = created["id"]!!.jsonPrimitive.content

        val response = client.put("/api/v1/keys/$keyId") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody("""{"name":"New Name","scopes":["ese:read","ese:write"]}""")
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertEquals("New Name", body["name"]!!.jsonPrimitive.content)
        val scopes = body["scopes"]!!.jsonArray.map { it.jsonPrimitive.content }
        assertTrue(scopes.contains("ese:write"))
    }

    @Test
    fun `delete key`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        val createResponse = client.post("/api/v1/keys") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody("""{"name":"To Delete","scopes":["ese:read"],"expiresAt":"2099-12-31T23:59:59Z"}""")
        }
        val created = Json.parseToJsonElement(createResponse.bodyAsText()).jsonObject
        val keyId = created["id"]!!.jsonPrimitive.content

        val deleteResponse = client.delete("/api/v1/keys/$keyId") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }
        assertEquals(HttpStatusCode.OK, deleteResponse.status)

        // Verify key is gone
        val getResponse = client.get("/api/v1/keys/$keyId") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }
        assertEquals(HttpStatusCode.NotFound, getResponse.status)
    }

    @Test
    fun `API key auth - valid key accesses protected endpoint`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        // Create an API key
        val createResponse = client.post("/api/v1/keys") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody("""{"name":"Auth Test","scopes":["ese:read"],"expiresAt":"2099-12-31T23:59:59Z"}""")
        }
        val created = Json.parseToJsonElement(createResponse.bodyAsText()).jsonObject
        val rawKey = created["key"]!!.jsonPrimitive.content

        // Use the API key to access a protected endpoint
        val response = client.get("/api/v1/keys") {
            header("X-API-Key", rawKey)
        }

        assertEquals(HttpStatusCode.OK, response.status)
    }

    @Test
    fun `expired key returns 401`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        // Create an API key that already expired
        val createResponse = client.post("/api/v1/keys") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody("""{"name":"Expired Key","scopes":["ese:read"],"expiresAt":"2020-01-01T00:00:00Z"}""")
        }
        val created = Json.parseToJsonElement(createResponse.bodyAsText()).jsonObject
        val rawKey = created["key"]!!.jsonPrimitive.content

        // Try to use expired key
        val response = client.get("/api/v1/keys") {
            header("X-API-Key", rawKey)
        }

        assertEquals(HttpStatusCode.Unauthorized, response.status)
    }
}
