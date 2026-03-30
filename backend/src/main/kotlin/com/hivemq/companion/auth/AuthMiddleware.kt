package com.hivemq.companion.auth

import com.hivemq.companion.service.ApiKeyService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.response.*
import java.util.*
import java.util.concurrent.ConcurrentHashMap

data class UserPrincipal(
    val userId: UUID,
    val username: String,
    val role: String,
    val sessionId: String,
    val scopes: List<String>? = null,
) : Principal

class SessionManager {
    // userId -> active sessionId
    private val activeSessions = ConcurrentHashMap<UUID, String>()

    fun createSession(userId: UUID): String {
        val sessionId = UUID.randomUUID().toString()
        activeSessions[userId] = sessionId
        return sessionId
    }

    fun isSessionValid(userId: UUID, sessionId: String): Boolean {
        return activeSessions[userId] == sessionId
    }

    fun invalidateSession(userId: UUID) {
        activeSessions.remove(userId)
    }
}

class BruteForceProtection {
    data class AttemptInfo(
        val failedCount: Int = 0,
        val lockedUntil: Long? = null,
        val lockCount: Int = 0,
    )

    private val attempts = ConcurrentHashMap<String, AttemptInfo>()

    fun isLocked(username: String): Boolean {
        val info = attempts[username] ?: return false
        val lockedUntil = info.lockedUntil ?: return false
        if (System.currentTimeMillis() >= lockedUntil) {
            // Lock expired but keep lockCount for escalation
            attempts[username] = info.copy(failedCount = 0, lockedUntil = null)
            return false
        }
        return true
    }

    fun recordFailure(username: String) {
        val info = attempts.getOrDefault(username, AttemptInfo())
        val newFailedCount = info.failedCount + 1
        if (newFailedCount >= MAX_ATTEMPTS) {
            val newLockCount = info.lockCount + 1
            val lockDurationMs = calculateLockDuration(newLockCount)
            attempts[username] = AttemptInfo(
                failedCount = newFailedCount,
                lockedUntil = System.currentTimeMillis() + lockDurationMs,
                lockCount = newLockCount,
            )
        } else {
            attempts[username] = info.copy(failedCount = newFailedCount)
        }
    }

    fun recordSuccess(username: String) {
        attempts.remove(username)
    }

    fun unlock(username: String) {
        attempts.remove(username)
    }

    private fun calculateLockDuration(lockCount: Int): Long {
        // 15min, 30min, 60min max
        val minutes = when (lockCount) {
            1 -> 15L
            2 -> 30L
            else -> 60L
        }
        return minutes * 60 * 1000
    }

    companion object {
        const val MAX_ATTEMPTS = 5
    }
}

fun Application.configureAuth(
    jwtService: JwtService,
    sessionManager: SessionManager,
    apiKeyService: ApiKeyService? = null,
) {
    install(Authentication) {
        jwt("auth-jwt") {
            verifier(
                com.auth0.jwt.JWT.require(jwtService.algorithm)
                    .withIssuer(JwtService.ISSUER)
                    .build()
            )
            validate { credential ->
                val type = credential.payload.getClaim("type")?.asString()
                if (type != "access") return@validate null

                val userId = try {
                    UUID.fromString(credential.payload.subject)
                } catch (e: Exception) {
                    return@validate null
                }
                val username = credential.payload.getClaim("username")?.asString() ?: return@validate null
                val role = credential.payload.getClaim("role")?.asString() ?: return@validate null
                val sessionId = credential.payload.getClaim("sessionId")?.asString() ?: return@validate null

                // Verify session is still active
                if (!sessionManager.isSessionValid(userId, sessionId)) return@validate null

                UserPrincipal(userId, username, role, sessionId)
            }
            challenge { _, _ ->
                call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Invalid or expired token"))
            }
        }

        // API key authentication provider (always registered; skips if no service)
        register(ApiKeyAuthProvider(apiKeyService))
    }
}

/**
 * Custom authentication provider that checks the X-API-Key header.
 */
class ApiKeyAuthProvider(private val apiKeyService: ApiKeyService?) : AuthenticationProvider(
    object : Config("auth-apikey") {}
) {
    override suspend fun onAuthenticate(context: AuthenticationContext) {
        val call = context.call
        val apiKey = call.request.headers["X-API-Key"]

        if (apiKey == null || apiKeyService == null) {
            context.challenge("ApiKeyAuth", AuthenticationFailedCause.NoCredentials) { challenge, authCall ->
                authCall.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Missing authentication"))
                challenge.complete()
            }
            return
        }

        val validation = apiKeyService.validateApiKey(apiKey)
        if (validation == null) {
            context.challenge("ApiKeyAuth", AuthenticationFailedCause.InvalidCredentials) { challenge, authCall ->
                authCall.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Invalid or expired API key"))
                challenge.complete()
            }
            return
        }

        val principal = UserPrincipal(
            userId = validation.userId,
            username = validation.username,
            role = validation.role,
            sessionId = "api-key",
            scopes = validation.scopes,
        )
        context.principal(principal)
    }
}
