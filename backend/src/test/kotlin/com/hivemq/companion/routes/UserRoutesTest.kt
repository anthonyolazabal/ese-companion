package com.hivemq.companion.routes

import com.hivemq.companion.auth.*
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

class UserRoutesTest {

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
    fun `list users as admin returns user list`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        val response = client.get("/api/v1/users") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertTrue(body.containsKey("items"))
        assertTrue(body.containsKey("page"))
        assertTrue(body.containsKey("size"))
        assertTrue(body.containsKey("total"))
        val items = body["items"]!!.jsonArray
        assertTrue(items.size >= 1)
        assertEquals(1, body["page"]!!.jsonPrimitive.int)
        assertEquals(20, body["size"]!!.jsonPrimitive.int)
    }

    @Test
    fun `list users as non-admin returns 403`() = testApplication {
        configureApp()
        val token = loginAsUser(client)

        val response = client.get("/api/v1/users") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }

        assertEquals(HttpStatusCode.Forbidden, response.status)
    }

    @Test
    fun `create user as admin returns created user`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        val response = client.post("/api/v1/users") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody("""{"username":"newuser","email":"new@test.com","password":"newpass123","role":"readwrite"}""")
        }

        assertEquals(HttpStatusCode.Created, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertEquals("newuser", body["username"]!!.jsonPrimitive.content)
        assertEquals("new@test.com", body["email"]!!.jsonPrimitive.content)
        assertEquals("readwrite", body["role"]!!.jsonPrimitive.content)
        assertTrue(body.containsKey("id"))
    }

    @Test
    fun `update user returns updated user`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        // Create a user to update
        userService.createUser("toupdate", "old@test.com", "pass", "readonly")
        val user = userService.findByUsername("toupdate")!!

        val response = client.put("/api/v1/users/${user.id}") {
            header(HttpHeaders.Authorization, "Bearer $token")
            contentType(ContentType.Application.Json)
            setBody("""{"email":"updated@test.com","role":"readwrite"}""")
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertEquals("updated@test.com", body["email"]!!.jsonPrimitive.content)
        assertEquals("readwrite", body["role"]!!.jsonPrimitive.content)
    }

    @Test
    fun `delete user returns 200`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        // Create a user to delete
        userService.createUser("todelete", "del@test.com", "pass", "readonly")
        val user = userService.findByUsername("todelete")!!

        val response = client.delete("/api/v1/users/${user.id}") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }

        assertEquals(HttpStatusCode.OK, response.status)

        // Verify user is deleted
        assertNull(userService.findById(user.id))
    }

    @Test
    fun `cannot delete self returns 400`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        // Get the admin user's ID
        val admin = userService.findByUsername("admin")!!

        val response = client.delete("/api/v1/users/${admin.id}") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }

        assertEquals(HttpStatusCode.BadRequest, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertEquals("Cannot delete your own account", body["error"]!!.jsonPrimitive.content)
    }

    @Test
    fun `get user by ID returns user details`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        val user = userService.findByUsername("admin")!!

        val response = client.get("/api/v1/users/${user.id}") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertEquals("admin", body["username"]!!.jsonPrimitive.content)
        assertEquals("admin@test.com", body["email"]!!.jsonPrimitive.content)
        assertEquals("admin", body["role"]!!.jsonPrimitive.content)
        assertEquals(user.id.toString(), body["id"]!!.jsonPrimitive.content)
    }
}
