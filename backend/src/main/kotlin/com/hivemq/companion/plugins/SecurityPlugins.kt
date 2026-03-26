package com.hivemq.companion.plugins

import com.hivemq.companion.config.SecurityConfig
import com.hivemq.companion.dto.ErrorResponse
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.defaultheaders.*
import io.ktor.server.plugins.ratelimit.*
import io.ktor.server.plugins.origin
import io.ktor.server.request.*
import io.ktor.server.response.*
import kotlin.time.Duration.Companion.minutes

fun Application.configureSecurityPlugins(config: SecurityConfig, httpsEnabled: Boolean = false) {
    // 1. Rate Limiting
    install(RateLimit) {
        global {
            rateLimiter(limit = config.rateLimitPerMinute, refillPeriod = 1.minutes)
            requestKey { call -> call.request.origin.remoteHost }
        }
        register(RateLimitName("auth")) {
            rateLimiter(limit = 10, refillPeriod = 1.minutes)
            requestKey { call -> call.request.origin.remoteHost }
        }
    }

    // 2. Security Headers
    install(DefaultHeaders) {
        header("X-Frame-Options", "DENY")
        header("X-Content-Type-Options", "nosniff")
        header("X-XSS-Protection", "0")
        header("Referrer-Policy", "strict-origin-when-cross-origin")
        header(
            "Content-Security-Policy",
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
        )
        if (httpsEnabled) {
            header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
        }
    }

    // 3. CORS
    install(CORS) {
        if (config.corsOrigins.contains("*")) {
            anyHost()
        } else if (config.corsOrigins.isNotEmpty()) {
            config.corsOrigins.forEach { origin ->
                allowHost(
                    origin.removePrefix("https://").removePrefix("http://"),
                    schemes = listOf("http", "https")
                )
            }
        }
        allowHeader(HttpHeaders.Authorization)
        allowHeader(HttpHeaders.ContentType)
        allowHeader("X-API-Key")
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowMethod(HttpMethod.Patch)
    }

    // 4. Request size limit
    val maxSize = config.maxRequestSizeBytes
    install(createApplicationPlugin("RequestSizeLimit") {
        onCall { call ->
            val contentLength = call.request.header(HttpHeaders.ContentLength)?.toLongOrNull()
            if (contentLength != null && contentLength > maxSize) {
                call.respond(
                    HttpStatusCode.PayloadTooLarge,
                    ErrorResponse("Request body too large. Maximum size: $maxSize bytes")
                )
            }
        }
    })
}
