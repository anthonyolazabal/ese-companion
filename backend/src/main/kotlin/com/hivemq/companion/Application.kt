package com.hivemq.companion

import com.hivemq.companion.auth.*
import com.hivemq.companion.dto.ErrorResponse
import com.hivemq.companion.service.UserService
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.json.Json

fun main() {
    embeddedServer(Netty, port = 8989) {
        module()
    }.start(wait = true)
}

fun Application.module(
    jwtService: JwtService? = null,
    userService: UserService? = null,
    sessionManager: SessionManager? = null,
    bruteForceProtection: BruteForceProtection? = null,
    tokenRevocationStore: TokenRevocationStore? = null,
) {
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = false
            isLenient = false
            ignoreUnknownKeys = true
        })
    }

    install(StatusPages) {
        exception<Throwable> { call, cause ->
            call.application.log.error("Unhandled error", cause)
            call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Internal server error"))
        }
    }

    val jwt = jwtService
    val users = userService
    val sessions = sessionManager ?: SessionManager()
    val bruteForce = bruteForceProtection ?: BruteForceProtection()
    val revocationStore = tokenRevocationStore ?: TokenRevocationStore()

    if (jwt != null) {
        configureAuth(jwt, sessions)
    }

    routing {
        get("/health/live") {
            call.respondText("OK")
        }
        if (jwt != null && users != null) {
            authRoutes(jwt, users, sessions, bruteForce, revocationStore)
        }
    }
}
