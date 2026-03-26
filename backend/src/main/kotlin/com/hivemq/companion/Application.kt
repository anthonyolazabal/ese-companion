package com.hivemq.companion

import com.hivemq.companion.auth.*
import com.hivemq.companion.dto.ErrorResponse
import com.hivemq.companion.ese.EseConnectionManager
import com.hivemq.companion.ese.routes.eseRoutes
import com.hivemq.companion.ese.service.EseService
import com.hivemq.companion.routes.ForbiddenException
import com.hivemq.companion.routes.apiKeyRoutes
import com.hivemq.companion.routes.auditLogRoutes
import com.hivemq.companion.routes.connectionRoutes
import com.hivemq.companion.routes.dashboardRoutes
import com.hivemq.companion.routes.userRoutes
import com.hivemq.companion.service.ApiKeyService
import com.hivemq.companion.service.AuditLogService
import com.hivemq.companion.service.ConnectionService
import com.hivemq.companion.service.UserService
import org.jetbrains.exposed.sql.Database
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
    connectionService: ConnectionService? = null,
    eseService: EseService? = null,
    companionDatabase: Database? = null,
    eseConnectionManager: EseConnectionManager? = null,
    apiKeyService: ApiKeyService? = null,
    auditLogService: AuditLogService? = null,
) {
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = false
            isLenient = false
            ignoreUnknownKeys = true
        })
    }

    install(StatusPages) {
        exception<ForbiddenException> { call, cause ->
            call.respond(HttpStatusCode.Forbidden, ErrorResponse(cause.message ?: "Forbidden"))
        }
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

    val apiKeys = apiKeyService

    if (jwt != null) {
        configureAuth(jwt, sessions, apiKeys)
    }

    routing {
        get("/health/live") {
            call.respondText("OK")
        }
        if (jwt != null && users != null) {
            authRoutes(jwt, users, sessions, bruteForce, revocationStore)
            userRoutes(users)
            if (apiKeys != null) {
                apiKeyRoutes(apiKeys)
            }
        }
        if (connectionService != null) {
            connectionRoutes(connectionService)
        }
        if (eseService != null) {
            eseRoutes(eseService)
        }
        if (companionDatabase != null && eseConnectionManager != null) {
            dashboardRoutes(companionDatabase, eseConnectionManager)
        }
        if (auditLogService != null) {
            auditLogRoutes(auditLogService)
        }
    }
}
