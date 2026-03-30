package com.hivemq.companion.auth

import com.hivemq.companion.db.tables.CompanionUsers
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
import org.jetbrains.exposed.sql.transactions.transaction
import kotlin.test.*

class AuthRoutesTest {

    private lateinit var dataSource: HikariDataSource
    private lateinit var database: Database
    private lateinit var userService: UserService
    private lateinit var jwtService: JwtService
    private lateinit var sessionManager: SessionManager
    private lateinit var bruteForceProtection: BruteForceProtection
    private lateinit var tokenRevocationStore: TokenRevocationStore

    @BeforeTest
    fun setUp() {
        val hikariConfig = HikariConfig().apply {
            jdbcUrl = "jdbc:h2:mem:test_${System.nanoTime()};DB_CLOSE_DELAY=-1"
            driverClassName = "org.h2.Driver"
            username = "sa"
            password = ""
            maximumPoolSize = 5
            poolName = "test-pool-${System.nanoTime()}"
        }
        dataSource = HikariDataSource(hikariConfig)
        database = Database.connect(dataSource)

        transaction(database) {
            SchemaUtils.create(CompanionUsers)
        }

        userService = UserService(database)
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
            module(jwtService, userService, sessionManager, bruteForceProtection, tokenRevocationStore)
        }
    }

    private suspend fun createTestUser(
        username: String = "testuser",
        password: String = "testpassword",
        email: String = "test@test.com",
        role: String = "admin",
    ) {
        userService.createUser(username, email, password, role)
    }

    @Test
    fun `login with valid credentials returns tokens`() = testApplication {
        configureApp()
        createTestUser()

        val response = client.post("/api/v1/auth/login") {
            contentType(ContentType.Application.Json)
            setBody("""{"username":"testuser","password":"testpassword"}""")
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertTrue(body.containsKey("accessToken"))
        assertTrue(body.containsKey("refreshToken"))
        assertTrue(body.containsKey("user"))
        val user = body["user"]!!.jsonObject
        assertEquals("testuser", user["username"]?.jsonPrimitive?.content)
        assertEquals("test@test.com", user["email"]?.jsonPrimitive?.content)
        assertEquals("admin", user["role"]?.jsonPrimitive?.content)
    }

    @Test
    fun `login with invalid credentials returns 401`() = testApplication {
        configureApp()
        createTestUser()

        val response = client.post("/api/v1/auth/login") {
            contentType(ContentType.Application.Json)
            setBody("""{"username":"testuser","password":"wrongpassword"}""")
        }

        assertEquals(HttpStatusCode.Unauthorized, response.status)
    }

    @Test
    fun `login with non-existent user returns 401`() = testApplication {
        configureApp()

        val response = client.post("/api/v1/auth/login") {
            contentType(ContentType.Application.Json)
            setBody("""{"username":"noone","password":"pass"}""")
        }

        assertEquals(HttpStatusCode.Unauthorized, response.status)
    }

    @Test
    fun `refresh with valid token returns new tokens`() = testApplication {
        configureApp()
        createTestUser()

        // Login first
        val loginResponse = client.post("/api/v1/auth/login") {
            contentType(ContentType.Application.Json)
            setBody("""{"username":"testuser","password":"testpassword"}""")
        }
        val loginBody = Json.parseToJsonElement(loginResponse.bodyAsText()).jsonObject
        val refreshToken = loginBody["refreshToken"]!!.jsonPrimitive.content

        // Refresh
        val response = client.post("/api/v1/auth/refresh") {
            contentType(ContentType.Application.Json)
            setBody("""{"refreshToken":"$refreshToken"}""")
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertTrue(body.containsKey("accessToken"))
        assertTrue(body.containsKey("refreshToken"))
    }

    @Test
    fun `refresh with invalid token returns 401`() = testApplication {
        configureApp()

        val response = client.post("/api/v1/auth/refresh") {
            contentType(ContentType.Application.Json)
            setBody("""{"refreshToken":"invalid.token.here"}""")
        }

        assertEquals(HttpStatusCode.Unauthorized, response.status)
    }

    @Test
    fun `protected endpoint without token returns 401`() = testApplication {
        configureApp()

        val response = client.post("/api/v1/auth/logout")

        assertEquals(HttpStatusCode.Unauthorized, response.status)
    }

    @Test
    fun `protected endpoint with valid token succeeds`() = testApplication {
        configureApp()
        createTestUser()

        // Login
        val loginResponse = client.post("/api/v1/auth/login") {
            contentType(ContentType.Application.Json)
            setBody("""{"username":"testuser","password":"testpassword"}""")
        }
        val loginBody = Json.parseToJsonElement(loginResponse.bodyAsText()).jsonObject
        val accessToken = loginBody["accessToken"]!!.jsonPrimitive.content

        // Access protected endpoint
        val response = client.post("/api/v1/auth/logout") {
            header(HttpHeaders.Authorization, "Bearer $accessToken")
        }

        assertEquals(HttpStatusCode.OK, response.status)
    }

    @Test
    fun `account locks after 5 failed attempts`() = testApplication {
        configureApp()
        createTestUser()

        // 5 failed attempts
        repeat(5) {
            client.post("/api/v1/auth/login") {
                contentType(ContentType.Application.Json)
                setBody("""{"username":"testuser","password":"wrong"}""")
            }
        }

        // 6th attempt should be locked (423)
        val response = client.post("/api/v1/auth/login") {
            contentType(ContentType.Application.Json)
            setBody("""{"username":"testuser","password":"testpassword"}""")
        }

        assertEquals(HttpStatusCode.Locked, response.status)
    }

    @Test
    fun `single session enforcement - old session invalidated on new login`() = testApplication {
        configureApp()
        createTestUser()

        // First login
        val loginResponse1 = client.post("/api/v1/auth/login") {
            contentType(ContentType.Application.Json)
            setBody("""{"username":"testuser","password":"testpassword"}""")
        }
        val token1 = Json.parseToJsonElement(loginResponse1.bodyAsText()).jsonObject["accessToken"]!!.jsonPrimitive.content

        // Second login (invalidates first session)
        client.post("/api/v1/auth/login") {
            contentType(ContentType.Application.Json)
            setBody("""{"username":"testuser","password":"testpassword"}""")
        }

        // First token should no longer work
        val response = client.post("/api/v1/auth/logout") {
            header(HttpHeaders.Authorization, "Bearer $token1")
        }

        assertEquals(HttpStatusCode.Unauthorized, response.status)
    }

    @Test
    fun `refresh token reuse after revocation returns 401`() = testApplication {
        configureApp()
        createTestUser()

        // Login
        val loginResponse = client.post("/api/v1/auth/login") {
            contentType(ContentType.Application.Json)
            setBody("""{"username":"testuser","password":"testpassword"}""")
        }
        val loginBody = Json.parseToJsonElement(loginResponse.bodyAsText()).jsonObject
        val refreshToken = loginBody["refreshToken"]!!.jsonPrimitive.content

        // Use refresh token
        val refreshResponse = client.post("/api/v1/auth/refresh") {
            contentType(ContentType.Application.Json)
            setBody("""{"refreshToken":"$refreshToken"}""")
        }
        assertEquals(HttpStatusCode.OK, refreshResponse.status)

        // Reuse same refresh token (should be revoked)
        val response = client.post("/api/v1/auth/refresh") {
            contentType(ContentType.Application.Json)
            setBody("""{"refreshToken":"$refreshToken"}""")
        }
        assertEquals(HttpStatusCode.Unauthorized, response.status)
    }
}
