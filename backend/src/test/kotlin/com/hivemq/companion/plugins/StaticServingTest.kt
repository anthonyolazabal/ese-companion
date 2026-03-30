package com.hivemq.companion.plugins

import com.hivemq.companion.module
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import java.io.File
import kotlin.test.*

class StaticServingTest {

    private val publicDir = File("public")
    private val indexFile = File(publicDir, "index.html")

    @BeforeTest
    fun setUp() {
        publicDir.mkdirs()
        indexFile.writeText("<!DOCTYPE html><html><body>SPA App</body></html>")
    }

    @AfterTest
    fun tearDown() {
        indexFile.delete()
        // Only delete the directory if it is empty (avoid removing real files)
        if (publicDir.exists() && publicDir.list()?.isEmpty() == true) {
            publicDir.delete()
        }
    }

    private fun ApplicationTestBuilder.configureApp() {
        application {
            module()
        }
    }

    @Test
    fun `SPA fallback returns 200 for unknown path when index html exists`() = testApplication {
        configureApp()

        val response = client.get("/some/unknown/path")

        assertEquals(HttpStatusCode.OK, response.status)
        val body = response.bodyAsText()
        assertTrue(body.contains("SPA App"), "Should serve index.html content for unknown paths")
    }

    @Test
    fun `API routes are not caught by SPA fallback`() = testApplication {
        configureApp()

        val response = client.get("/api/v1/some-api-endpoint")

        // API paths should not be served the SPA index.html
        val body = response.bodyAsText()
        assertFalse(body.contains("SPA App"), "API paths should not return the SPA index.html")
        assertNotEquals(HttpStatusCode.OK, response.status, "API paths should not return 200 with SPA content")
    }

    @Test
    fun `health live route returns OK text`() = testApplication {
        configureApp()

        val response = client.get("/health/live")

        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals("OK", response.bodyAsText())
    }

    @Test
    fun `health ready route returns OK when no database configured`() = testApplication {
        configureApp()

        val response = client.get("/health/ready")

        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals("OK", response.bodyAsText())
    }
}
