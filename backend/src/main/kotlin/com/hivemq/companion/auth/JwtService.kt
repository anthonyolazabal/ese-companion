package com.hivemq.companion.auth

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.exceptions.JWTVerificationException
import com.auth0.jwt.interfaces.DecodedJWT
import java.util.*

class JwtService(secret: String) {

    val algorithm: Algorithm = Algorithm.HMAC256(secret)

    private val verifier = JWT.require(algorithm)
        .withIssuer(ISSUER)
        .build()

    fun generateAccessToken(userId: UUID, username: String, role: String, sessionId: String): String {
        val now = Date()
        val expiry = Date(now.time + ACCESS_TOKEN_EXPIRY_MS)
        return JWT.create()
            .withIssuer(ISSUER)
            .withSubject(userId.toString())
            .withClaim("username", username)
            .withClaim("role", role)
            .withClaim("type", "access")
            .withClaim("sessionId", sessionId)
            .withIssuedAt(now)
            .withExpiresAt(expiry)
            .sign(algorithm)
    }

    fun generateRefreshToken(userId: UUID, sessionId: String): String {
        val now = Date()
        val expiry = Date(now.time + REFRESH_TOKEN_EXPIRY_MS)
        return JWT.create()
            .withIssuer(ISSUER)
            .withSubject(userId.toString())
            .withClaim("type", "refresh")
            .withClaim("sessionId", sessionId)
            .withIssuedAt(now)
            .withExpiresAt(expiry)
            .sign(algorithm)
    }

    fun verifyToken(token: String): DecodedJWT? {
        return try {
            verifier.verify(token)
        } catch (e: JWTVerificationException) {
            null
        }
    }

    fun getUserIdFromToken(token: String): UUID? {
        val decoded = verifyToken(token) ?: return null
        return try {
            UUID.fromString(decoded.subject)
        } catch (e: IllegalArgumentException) {
            null
        }
    }

    companion object {
        const val ISSUER = "ese-companion"
        const val ACCESS_TOKEN_EXPIRY_MS = 60L * 60 * 1000 // 60 minutes
        const val REFRESH_TOKEN_EXPIRY_MS = 7L * 24 * 60 * 60 * 1000 // 7 days
    }
}
