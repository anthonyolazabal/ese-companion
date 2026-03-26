package com.hivemq.companion.routes

import com.hivemq.companion.auth.*
import com.hivemq.companion.db.tables.AuditLogs
import com.hivemq.companion.db.tables.CompanionUsers
import com.hivemq.companion.module
import com.hivemq.companion.service.AuditLogService
import com.hivemq.companion.service.UserService
import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import kotlinx.coroutines.test.runTest
import kotlinx.serialization.json.*
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.*
import kotlin.test.*

class AuditLogRoutesTest {

    private lateinit var dataSource: HikariDataSource
    private lateinit var database: Database
    private lateinit var userService: UserService
    private lateinit var auditLogService: AuditLogService
    private lateinit var jwtService: JwtService
    private lateinit var sessionManager: SessionManager
    private lateinit var bruteForceProtection: BruteForceProtection
    private lateinit var tokenRevocationStore: TokenRevocationStore

    @BeforeTest
    fun setUp() {
        val hikariConfig = HikariConfig().apply {
            jdbcUrl = "jdbc:h2:mem:test_audit_${System.nanoTime()};DB_CLOSE_DELAY=-1"
            driverClassName = "org.h2.Driver"
            username = "sa"
            password = ""
            maximumPoolSize = 5
            poolName = "test-audit-pool-${System.nanoTime()}"
        }
        dataSource = HikariDataSource(hikariConfig)
        database = Database.connect(dataSource)

        transaction(database) {
            SchemaUtils.create(CompanionUsers, AuditLogs)
        }

        userService = UserService(database)
        auditLogService = AuditLogService(database, retentionDays = 90)
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
                jwtService = jwtService,
                userService = userService,
                sessionManager = sessionManager,
                bruteForceProtection = bruteForceProtection,
                tokenRevocationStore = tokenRevocationStore,
                auditLogService = auditLogService,
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

    private suspend fun createSampleLog(
        domain: String = "companion",
        action: String = "create",
        resourceType: String = "user",
    ) {
        auditLogService.log(
            actorType = "user",
            actorId = UUID.randomUUID(),
            actorName = "testactor",
            domain = domain,
            action = action,
            resourceType = resourceType,
            resourceId = UUID.randomUUID().toString(),
            resourceName = "test-resource",
            details = """{"key":"value"}""",
            ipAddress = "127.0.0.1",
            userAgent = "TestAgent/1.0",
        )
    }

    @Test
    fun `log an entry and retrieve it via list`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        createSampleLog()

        val response = client.get("/api/v1/audit-logs") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertTrue(body.containsKey("items"))
        assertTrue(body.containsKey("page"))
        assertTrue(body.containsKey("size"))
        assertTrue(body.containsKey("total"))
        val items = body["items"]!!.jsonArray
        assertEquals(1, items.size)
        assertEquals("testactor", items[0].jsonObject["actorName"]!!.jsonPrimitive.content)
        assertEquals("companion", items[0].jsonObject["domain"]!!.jsonPrimitive.content)
        assertEquals("create", items[0].jsonObject["action"]!!.jsonPrimitive.content)
    }

    @Test
    fun `filter by domain`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        createSampleLog(domain = "mqtt")
        createSampleLog(domain = "companion")
        createSampleLog(domain = "rest_api")

        val response = client.get("/api/v1/audit-logs?domain=mqtt") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        val items = body["items"]!!.jsonArray
        assertEquals(1, items.size)
        assertEquals("mqtt", items[0].jsonObject["domain"]!!.jsonPrimitive.content)
    }

    @Test
    fun `filter by action`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        createSampleLog(action = "create")
        createSampleLog(action = "delete")
        createSampleLog(action = "update")

        val response = client.get("/api/v1/audit-logs?action=delete") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        val items = body["items"]!!.jsonArray
        assertEquals(1, items.size)
        assertEquals("delete", items[0].jsonObject["action"]!!.jsonPrimitive.content)
    }

    @Test
    fun `get single entry by ID with full details`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        createSampleLog()

        // First get the list to find the ID
        val listResponse = client.get("/api/v1/audit-logs") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }
        val listBody = Json.parseToJsonElement(listResponse.bodyAsText()).jsonObject
        val logId = listBody["items"]!!.jsonArray[0].jsonObject["id"]!!.jsonPrimitive.long

        // Now get the detail
        val response = client.get("/api/v1/audit-logs/$logId") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertEquals(logId, body["id"]!!.jsonPrimitive.long)
        assertEquals("testactor", body["actorName"]!!.jsonPrimitive.content)
        assertEquals("companion", body["domain"]!!.jsonPrimitive.content)
        assertEquals("create", body["action"]!!.jsonPrimitive.content)
        assertEquals("user", body["resourceType"]!!.jsonPrimitive.content)
        assertEquals("test-resource", body["resourceName"]!!.jsonPrimitive.content)
        assertEquals("""{"key":"value"}""", body["details"]!!.jsonPrimitive.content)
        assertEquals("127.0.0.1", body["ipAddress"]!!.jsonPrimitive.content)
        assertEquals("TestAgent/1.0", body["userAgent"]!!.jsonPrimitive.content)
        assertTrue(body.containsKey("actorId"))
        assertTrue(body.containsKey("resourceId"))
    }

    @Test
    fun `non-admin gets 403`() = testApplication {
        configureApp()
        val token = loginAsUser(client)

        val response = client.get("/api/v1/audit-logs") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }

        assertEquals(HttpStatusCode.Forbidden, response.status)
    }

    @Test
    fun `cleanup removes old logs`() = runTest {
        // Use a service with 0 retention days so all logs are "old"
        val cleanupService = AuditLogService(database, retentionDays = 0)

        cleanupService.log(
            actorType = "user",
            actorId = UUID.randomUUID(),
            actorName = "oldactor",
            domain = "companion",
            action = "create",
            resourceType = "user",
            resourceId = UUID.randomUUID().toString(),
            ipAddress = "127.0.0.1",
            userAgent = "TestAgent/1.0",
        )

        // Verify log exists
        val before = cleanupService.list(page = 1, size = 10)
        assertEquals(1, before.total)

        // Run cleanup - with 0 retention days, cutoff is "now" so the log (created moments ago) should be deleted
        cleanupService.cleanupOldLogs()

        val after = cleanupService.list(page = 1, size = 10)
        assertEquals(0, after.total)
    }

    @Test
    fun `get non-existent log returns 404`() = testApplication {
        configureApp()
        val token = loginAsAdmin(client)

        val response = client.get("/api/v1/audit-logs/99999") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }

        assertEquals(HttpStatusCode.NotFound, response.status)
    }
}
