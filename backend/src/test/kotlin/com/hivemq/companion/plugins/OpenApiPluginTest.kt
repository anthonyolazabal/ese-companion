package com.hivemq.companion.plugins

import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.routing.*
import io.ktor.server.testing.*
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlin.test.*

class OpenApiPluginTest {

    private fun ApplicationTestBuilder.configureApp() {
        application {
            routing {
                openApiRoutes()
            }
        }
    }

    @Test
    fun `GET openapi json returns valid JSON with openapi field`() = testApplication {
        configureApp()

        val response = client.get("/api/v1/openapi.json")

        assertEquals(HttpStatusCode.OK, response.status)
        val body = response.bodyAsText()
        val json = Json.parseToJsonElement(body).jsonObject
        assertTrue(json.containsKey("openapi"), "Response should contain 'openapi' field")
        assertEquals("3.0.3", json["openapi"]!!.jsonPrimitive.content)
    }

    @Test
    fun `GET openapi json contains expected auth login path`() = testApplication {
        configureApp()

        val response = client.get("/api/v1/openapi.json")
        val json = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        val paths = json["paths"]!!.jsonObject

        assertTrue(paths.containsKey("/api/v1/auth/login"), "Should contain /api/v1/auth/login path")
    }

    @Test
    fun `GET openapi json contains expected users path`() = testApplication {
        configureApp()

        val response = client.get("/api/v1/openapi.json")
        val json = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        val paths = json["paths"]!!.jsonObject

        assertTrue(paths.containsKey("/api/v1/users"), "Should contain /api/v1/users path")
    }

    @Test
    fun `GET openapi json contains expected health path`() = testApplication {
        configureApp()

        val response = client.get("/api/v1/openapi.json")
        val json = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        val paths = json["paths"]!!.jsonObject

        assertTrue(paths.containsKey("/health/live"), "Should contain /health/live path")
    }

    @Test
    fun `GET docs returns HTML containing swagger-ui`() = testApplication {
        configureApp()

        val response = client.get("/api/v1/docs")

        assertEquals(HttpStatusCode.OK, response.status)
        val body = response.bodyAsText()
        assertTrue(body.contains("swagger-ui"), "Response should contain 'swagger-ui'")
        assertTrue(body.contains("SwaggerUIBundle"), "Response should contain 'SwaggerUIBundle'")
    }

    @Test
    fun `GET docs returns Content-Type text html`() = testApplication {
        configureApp()

        val response = client.get("/api/v1/docs")

        assertEquals(HttpStatusCode.OK, response.status)
        val contentType = response.contentType()
        assertNotNull(contentType)
        assertEquals(ContentType.Text.Html.withoutParameters(), contentType.withoutParameters())
    }
}
