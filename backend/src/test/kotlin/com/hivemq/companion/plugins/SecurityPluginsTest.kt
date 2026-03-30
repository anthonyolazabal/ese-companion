package com.hivemq.companion.plugins

import com.hivemq.companion.config.SecurityConfig
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.testing.*
import kotlinx.serialization.json.Json
import kotlin.test.*

class SecurityPluginsTest {

    private fun securityConfig(
        rateLimitPerMinute: Int = 100,
        corsOrigins: List<String> = listOf("*"),
        maxRequestSizeBytes: Long = 1024L,
    ) = SecurityConfig(
        jwtSecret = "test-secret",
        encryptionKey = "test-encryption-key-1234567890ab",
        rateLimitPerMinute = rateLimitPerMinute,
        corsOrigins = corsOrigins,
        maxRequestSizeBytes = maxRequestSizeBytes,
    )

    private fun ApplicationTestBuilder.configureSecurityApp(
        rateLimitPerMinute: Int = 100,
        corsOrigins: List<String> = listOf("*"),
        maxRequestSizeBytes: Long = 1024L,
        httpsEnabled: Boolean = false,
    ) {
        application {
            configureSecurityPlugins(
                securityConfig(rateLimitPerMinute, corsOrigins, maxRequestSizeBytes),
                httpsEnabled,
            )
            install(ContentNegotiation) {
                json(Json { ignoreUnknownKeys = true })
            }
            routing {
                get("/test") {
                    call.respondText("OK")
                }
                post("/test") {
                    call.respondText("OK")
                }
            }
        }
    }

    // --- Rate Limiting ---

    @Test
    fun `rate limiting returns 429 after exceeding limit`() = testApplication {
        configureSecurityApp(rateLimitPerMinute = 2)

        // First two requests should succeed
        repeat(2) {
            val response = client.get("/test")
            assertEquals(HttpStatusCode.OK, response.status, "Request ${it + 1} should succeed")
        }

        // Third request should be rate limited
        val response = client.get("/test")
        assertEquals(HttpStatusCode.TooManyRequests, response.status)
    }

    @Test
    fun `rate limited response includes Retry-After header`() = testApplication {
        configureSecurityApp(rateLimitPerMinute = 1)

        // Exhaust the limit
        client.get("/test")

        // Next request should be rate limited with Retry-After
        val response = client.get("/test")
        assertEquals(HttpStatusCode.TooManyRequests, response.status)
        assertNotNull(response.headers["Retry-After"], "Retry-After header should be present")
    }

    // --- Security Headers ---

    @Test
    fun `response includes X-Frame-Options header`() = testApplication {
        configureSecurityApp()

        val response = client.get("/test")
        assertEquals("DENY", response.headers["X-Frame-Options"])
    }

    @Test
    fun `response includes X-Content-Type-Options header`() = testApplication {
        configureSecurityApp()

        val response = client.get("/test")
        assertEquals("nosniff", response.headers["X-Content-Type-Options"])
    }

    @Test
    fun `response includes Content-Security-Policy header`() = testApplication {
        configureSecurityApp()

        val response = client.get("/test")
        val csp = response.headers["Content-Security-Policy"]
        assertNotNull(csp)
        assertTrue(csp.contains("default-src 'self'"))
    }

    @Test
    fun `response includes Referrer-Policy header`() = testApplication {
        configureSecurityApp()

        val response = client.get("/test")
        assertEquals("strict-origin-when-cross-origin", response.headers["Referrer-Policy"])
    }

    @Test
    fun `HSTS header present when HTTPS enabled`() = testApplication {
        configureSecurityApp(httpsEnabled = true)

        val response = client.get("/test")
        val hsts = response.headers["Strict-Transport-Security"]
        assertNotNull(hsts)
        assertTrue(hsts.contains("max-age="))
    }

    @Test
    fun `HSTS header absent when HTTPS disabled`() = testApplication {
        configureSecurityApp(httpsEnabled = false)

        val response = client.get("/test")
        assertNull(response.headers["Strict-Transport-Security"])
    }

    // --- CORS ---

    @Test
    fun `CORS preflight request returns Access-Control-Allow-Origin`() = testApplication {
        configureSecurityApp(corsOrigins = listOf("*"))

        val response = client.options("/test") {
            header(HttpHeaders.Origin, "http://example.com")
            header(HttpHeaders.AccessControlRequestMethod, "GET")
        }

        assertNotNull(response.headers[HttpHeaders.AccessControlAllowOrigin])
    }

    @Test
    fun `CORS preflight allows configured methods`() = testApplication {
        configureSecurityApp(corsOrigins = listOf("*"))

        val response = client.options("/test") {
            header(HttpHeaders.Origin, "http://example.com")
            header(HttpHeaders.AccessControlRequestMethod, "PUT")
        }

        val allowMethods = response.headers[HttpHeaders.AccessControlAllowMethods]
        assertNotNull(allowMethods)
        assertTrue(allowMethods.contains("PUT"), "PUT should be an allowed method")
    }

    @Test
    fun `CORS preflight allows Authorization header`() = testApplication {
        configureSecurityApp(corsOrigins = listOf("*"))

        val response = client.options("/test") {
            header(HttpHeaders.Origin, "http://example.com")
            header(HttpHeaders.AccessControlRequestMethod, "GET")
            header(HttpHeaders.AccessControlRequestHeaders, "Authorization")
        }

        val allowHeaders = response.headers[HttpHeaders.AccessControlAllowHeaders]
        assertNotNull(allowHeaders)
        assertTrue(
            allowHeaders.contains("Authorization", ignoreCase = true),
            "Authorization should be an allowed header"
        )
    }

    // --- Request Size Limit ---

    @Test
    fun `request exceeding size limit returns 413`() = testApplication {
        configureSecurityApp(maxRequestSizeBytes = 50)

        val largeBody = "x".repeat(200)
        val response = client.post("/test") {
            contentType(ContentType.Application.Json)
            setBody(largeBody)
        }

        assertEquals(HttpStatusCode.PayloadTooLarge, response.status)
    }

    @Test
    fun `request within size limit succeeds`() = testApplication {
        configureSecurityApp(maxRequestSizeBytes = 1024)

        val response = client.post("/test") {
            contentType(ContentType.Application.Json)
            setBody("{}")
        }

        assertEquals(HttpStatusCode.OK, response.status)
    }
}
