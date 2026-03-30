package com.hivemq.companion.dto

import kotlinx.serialization.Serializable

@Serializable
data class LoginRequest(val username: String, val password: String)

@Serializable
data class LoginResponse(val accessToken: String, val refreshToken: String, val user: UserInfo)

@Serializable
data class RefreshRequest(val refreshToken: String)

@Serializable
data class TokenResponse(val accessToken: String, val refreshToken: String)

@Serializable
data class UserInfo(val id: String, val username: String, val email: String, val role: String)

@Serializable
data class ErrorResponse(val error: String)

@Serializable
data class UserUpdateRequest(
    val email: String? = null,
    val role: String? = null,
    val locked: Boolean? = null,
)
