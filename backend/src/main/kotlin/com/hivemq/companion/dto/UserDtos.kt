package com.hivemq.companion.dto

import kotlinx.serialization.Serializable

@Serializable
data class CreateUserRequest(val username: String, val email: String, val password: String, val role: String)

@Serializable
data class UpdateUserRequest(
    val email: String? = null,
    val role: String? = null,
    val password: String? = null,
)

@Serializable
data class UserResponse(
    val id: String,
    val username: String,
    val email: String,
    val role: String,
    val createdAt: String,
    val updatedAt: String,
)

@Serializable
data class PaginatedResponse<T>(val items: List<T>, val page: Int, val size: Int, val total: Long)
