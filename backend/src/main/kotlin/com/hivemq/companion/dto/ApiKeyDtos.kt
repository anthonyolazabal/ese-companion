package com.hivemq.companion.dto

import kotlinx.serialization.Serializable

@Serializable
data class CreateApiKeyRequest(
    val name: String,
    val scopes: List<String>,
    val expiresAt: String,
)

@Serializable
data class UpdateApiKeyRequest(
    val name: String? = null,
    val scopes: List<String>? = null,
    val expiresAt: String? = null,
)

@Serializable
data class ApiKeyResponse(
    val id: String,
    val name: String,
    val keyPrefix: String,
    val scopes: List<String>,
    val expiresAt: String,
    val lastUsedAt: String?,
    val createdAt: String,
    val userId: String,
)

@Serializable
data class ApiKeyCreatedResponse(
    val id: String,
    val name: String,
    val key: String,
    val keyPrefix: String,
    val scopes: List<String>,
    val expiresAt: String,
    val createdAt: String,
)
