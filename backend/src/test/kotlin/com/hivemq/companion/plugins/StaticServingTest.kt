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
    private val assetsDir = File(publicDir, "assets")
    private val indexFile = File(publicDir, "index.html")
    private val cssFile = File(assetsDir, "index-abc123.css")
    private val jsFile = File(assetsDir, "index-def456.js")

    @BeforeTest
    fun setUp() {
        publicDir.mkdirs()
        assetsDir.mkdirs()
        indexFile.writeText("<!DOCTYPE html><html><body>SPA App</body></html>")
        cssFile.writeText("body { color: red; }")
        jsFile.writeText("console.log('hello');")
    }

    @AfterTest
    fun tearDown() {
        cssFile.delete()
        jsFile.delete()
        indexFile.delete()
        if (assetsDir.exists() && assetsDir.list()?.isEmpty() == true) {
            assetsDir.delete()
        }
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
    fun `API routes take priority over SPA fallback`() = testApplication {
        configureApp()

        // In the minimal test module (no services), no API routes are registered,
        // so singlePageApplication catches all paths. In production, real API routes
        // are registered first and take priority over the SPA fallback.
        // Here we verify that registered routes (like health) are not overridden.
        val response = client.get("/health/live")
        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals("OK", response.bodyAsText())
    }

    @Test
    fun `CSS assets are served with correct MIME type`() = testApplication {
        configureApp()

        val response = client.get("/assets/index-abc123.css")

        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals("body { color: red; }", response.bodyAsText())
        assertTrue(
            response.contentType().toString().contains("css"),
            "CSS files should be served with a CSS content type, got: ${response.contentType()}"
        )
    }

    @Test
    fun `JS assets are served with correct MIME type`() = testApplication {
        configureApp()

        val response = client.get("/assets/index-def456.js")

        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals("console.log('hello');", response.bodyAsText())
        assertTrue(
            response.contentType().toString().contains("javascript"),
            "JS files should be served with a JavaScript content type, got: ${response.contentType()}"
        )
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
