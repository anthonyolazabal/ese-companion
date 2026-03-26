package com.hivemq.companion.auth

import com.hivemq.companion.dto.*
import com.hivemq.companion.service.AuditLogService
import com.hivemq.companion.service.UserService
import io.ktor.http.*
import io.ktor.server.auth.*
import io.ktor.server.plugins.origin
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.util.*
import java.util.concurrent.ConcurrentHashMap

class TokenRevocationStore {
    private val revokedTokens = ConcurrentHashMap.newKeySet<String>()

    fun revoke(token: String) {
        revokedTokens.add(token)
    }

    fun isRevoked(token: String): Boolean {
        return revokedTokens.contains(token)
    }
}

fun Route.authRoutes(
    jwtService: JwtService,
    userService: UserService,
    sessionManager: SessionManager,
    bruteForceProtection: BruteForceProtection,
    tokenRevocationStore: TokenRevocationStore,
    auditLogService: AuditLogService? = null,
) {
    route("/api/v1/auth") {

        post("/login") {
            val request = call.receive<LoginRequest>()
            val username = request.username
            val password = request.password

            // Check brute force lock
            if (bruteForceProtection.isLocked(username)) {
                call.respond(HttpStatusCode.Locked, ErrorResponse("Account is temporarily locked due to too many failed login attempts"))
                return@post
            }

            val user = userService.findByUsername(username)
            if (user == null || !userService.verifyPassword(user, password)) {
                bruteForceProtection.recordFailure(username)
                call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Invalid username or password"))
                return@post
            }

            bruteForceProtection.recordSuccess(username)

            // Create new session (invalidates old one)
            val sessionId = sessionManager.createSession(user.id)

            val accessToken = jwtService.generateAccessToken(user.id, user.username, user.role, sessionId)
            val refreshToken = jwtService.generateRefreshToken(user.id, sessionId)

            auditLogService?.log(
                actorType = "user",
                actorId = user.id,
                actorName = user.username,
                domain = "companion",
                action = "create",
                resourceType = "session",
                resourceId = sessionId,
                resourceName = user.username,
                ipAddress = call.request.origin.remoteHost,
                userAgent = call.request.header("User-Agent") ?: "unknown",
            )

            call.respond(
                HttpStatusCode.OK,
                LoginResponse(
                    accessToken = accessToken,
                    refreshToken = refreshToken,
                    user = UserInfo(
                        id = user.id.toString(),
                        username = user.username,
                        email = user.email,
                        role = user.role,
                    ),
                )
            )
        }

        post("/refresh") {
            val request = call.receive<RefreshRequest>()
            val decoded = jwtService.verifyToken(request.refreshToken)

            if (decoded == null) {
                call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Invalid or expired refresh token"))
                return@post
            }

            val type = decoded.getClaim("type")?.asString()
            if (type != "refresh") {
                call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Invalid token type"))
                return@post
            }

            if (tokenRevocationStore.isRevoked(request.refreshToken)) {
                call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Token has been revoked"))
                return@post
            }

            val userId = try {
                java.util.UUID.fromString(decoded.subject)
            } catch (e: Exception) {
                call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Invalid token"))
                return@post
            }

            val sessionId = decoded.getClaim("sessionId")?.asString()
            if (sessionId == null || !sessionManager.isSessionValid(userId, sessionId)) {
                call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Session is no longer valid"))
                return@post
            }

            val user = userService.findById(userId)
            if (user == null) {
                call.respond(HttpStatusCode.Unauthorized, ErrorResponse("User not found"))
                return@post
            }

            // Revoke old refresh token
            tokenRevocationStore.revoke(request.refreshToken)

            val newAccessToken = jwtService.generateAccessToken(user.id, user.username, user.role, sessionId)
            val newRefreshToken = jwtService.generateRefreshToken(user.id, sessionId)

            call.respond(HttpStatusCode.OK, TokenResponse(accessToken = newAccessToken, refreshToken = newRefreshToken))
        }

        authenticate("auth-jwt", "auth-apikey", strategy = AuthenticationStrategy.FirstSuccessful) {
            post("/logout") {
                val principal = call.principal<UserPrincipal>()
                if (principal != null) {
                    sessionManager.invalidateSession(principal.userId)
                    // Revoke the current access token
                    val authHeader = call.request.header(HttpHeaders.Authorization)
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        tokenRevocationStore.revoke(authHeader.removePrefix("Bearer "))
                    }
                    auditLogService?.log(
                        actorType = "user",
                        actorId = principal.userId,
                        actorName = principal.username,
                        domain = "companion",
                        action = "delete",
                        resourceType = "session",
                        resourceId = principal.sessionId,
                        resourceName = principal.username,
                        ipAddress = call.request.origin.remoteHost,
                        userAgent = call.request.header("User-Agent") ?: "unknown",
                    )
                }
                call.respond(HttpStatusCode.OK, mapOf("message" to "Logged out successfully"))
            }
        }
    }
}
