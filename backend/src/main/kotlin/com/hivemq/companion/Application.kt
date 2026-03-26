package com.hivemq.companion

import com.hivemq.companion.auth.*
import com.hivemq.companion.config.AppConfig
import com.hivemq.companion.config.SecurityConfig
import com.hivemq.companion.crypto.AesEncryption
import com.hivemq.companion.crypto.CryptoService
import com.hivemq.companion.db.CompanionDatabase
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
import com.hivemq.companion.service.HealthCheckService
import com.hivemq.companion.service.UserService
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.transactions.transaction
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import com.hivemq.companion.plugins.buildKeyStore
import com.hivemq.companion.plugins.configureSecurityPlugins
import com.hivemq.companion.plugins.keyStorePassword
import com.hivemq.companion.plugins.openApiRoutes
import com.hivemq.companion.plugins.privateKeyPassword
import io.ktor.server.http.content.*
import io.ktor.server.routing.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.Json
import java.io.File

fun main() {
    // 1. Load and validate config
    val config = AppConfig.fromEnv()
    println("ESE Companion v2.0.0 starting...")

    // 2. Connect to companion database (Flyway migrations run automatically in init)
    val companionDb = CompanionDatabase(config.database)
    println("Connected to companion database (${config.database.type})")

    // 3. Seed admin if needed
    val userService = UserService(companionDb.database)
    runBlocking { userService.seedAdminIfNeeded(config.adminSeed) }

    // 4. Initialize services
    val aesEncryption = AesEncryption(config.security.encryptionKey)
    val cryptoService = CryptoService()
    val connectionService = ConnectionService(companionDb.database, aesEncryption)
    val eseConnectionManager = EseConnectionManager(config.pool, companionDb.database, aesEncryption)
    val eseService = EseService(eseConnectionManager, cryptoService)
    val apiKeyService = ApiKeyService(companionDb.database)
    val auditLogService = AuditLogService(companionDb.database, config.audit.retentionDays)
    val healthCheckService = HealthCheckService(companionDb.database, aesEncryption, config.healthCheck.intervalSeconds)
    val jwtService = JwtService(config.security.jwtSecret)

    // 5. Start health check scheduler
    val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())
    healthCheckService.start(scope)
    println("Health check scheduler started (interval: ${config.healthCheck.intervalSeconds}s)")

    // 6. Start audit log retention cleanup (daily)
    scope.launch {
        while (isActive) {
            delay(24 * 60 * 60 * 1000L) // 24 hours
            auditLogService.cleanupOldLogs()
        }
    }

    // 7. Register shutdown hook
    Runtime.getRuntime().addShutdownHook(Thread {
        println("Shutting down ESE Companion...")
        healthCheckService.stop()
        eseConnectionManager.closeAll()
        companionDb.close()
        println("Shutdown complete.")
    })

    // 8. Start HTTP + HTTPS server
    val keyStore = buildKeyStore(config.server)
    val ksPassword = keyStorePassword(config.server)
    val pkPassword = privateKeyPassword(config.server)

    embeddedServer(Netty, configure = {
        connector {
            port = config.server.httpPort
        }
        sslConnector(
            keyStore = keyStore,
            keyAlias = "ese-companion",
            keyStorePassword = { ksPassword.toCharArray() },
            privateKeyPassword = { pkPassword.toCharArray() },
        ) {
            port = config.server.httpsPort
        }
    }) {
        module(
            jwtService = jwtService,
            userService = userService,
            connectionService = connectionService,
            eseService = eseService,
            companionDatabase = companionDb.database,
            eseConnectionManager = eseConnectionManager,
            apiKeyService = apiKeyService,
            auditLogService = auditLogService,
            securityConfig = config.security,
            httpsEnabled = true,
            healthCheckDatabase = companionDb.database,
        )
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
    securityConfig: SecurityConfig? = null,
    httpsEnabled: Boolean = false,
    healthCheckDatabase: Database? = null,
) {
    if (securityConfig != null) {
        configureSecurityPlugins(securityConfig, httpsEnabled)
    }

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
        openApiRoutes()
        get("/health/live") {
            call.respondText("OK")
        }
        get("/health/ready") {
            val db = healthCheckDatabase
            if (db != null) {
                try {
                    transaction(db) {
                        exec("SELECT 1")
                    }
                    call.respondText("OK")
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.ServiceUnavailable, "Database not ready")
                }
            } else {
                // No database configured (e.g. in tests), just return OK
                call.respondText("OK")
            }
        }
        if (jwt != null && users != null) {
            authRoutes(jwt, users, sessions, bruteForce, revocationStore, auditLogService)
            userRoutes(users, auditLogService)
            if (apiKeys != null) {
                apiKeyRoutes(apiKeys, auditLogService)
            }
        }
        if (connectionService != null) {
            connectionRoutes(connectionService, auditLogService)
        }
        if (eseService != null) {
            eseRoutes(eseService, auditLogService)
        }
        if (companionDatabase != null && eseConnectionManager != null) {
            dashboardRoutes(companionDatabase, eseConnectionManager)
        }
        if (auditLogService != null) {
            auditLogRoutes(auditLogService)
        }

        // Static files from public/ directory (React SPA build output)
        staticFiles("/", File("public")) {
            default("index.html")
        }

        // SPA fallback: any non-API, non-health path returns index.html
        get("{...}") {
            val path = call.request.uri
            if (!path.startsWith("/api/") && !path.startsWith("/health/")) {
                val indexFile = File("public/index.html")
                if (indexFile.exists()) {
                    call.respondFile(indexFile)
                }
            }
        }
    }
}
