package com.hivemq.companion.dto

import kotlinx.serialization.Serializable

@Serializable
data class CreateConnectionRequest(
    val name: String,
    val description: String? = null,
    val dbType: String,
    val host: String,
    val port: Int,
    val databaseName: String,
    val username: String,
    val password: String,
    val sslEnabled: Boolean = false,
    val sslIgnoreCertificate: Boolean = false,
    val connectionParams: String? = null,
)

@Serializable
data class UpdateConnectionRequest(
    val name: String? = null,
    val description: String? = null,
    val host: String? = null,
    val port: Int? = null,
    val databaseName: String? = null,
    val username: String? = null,
    val password: String? = null,
    val sslEnabled: Boolean? = null,
    val sslIgnoreCertificate: Boolean? = null,
    val connectionParams: String? = null,
)

@Serializable
data class ConnectionResponse(
    val id: String,
    val name: String,
    val description: String?,
    val dbType: String,
    val host: String,
    val port: Int,
    val databaseName: String,
    val username: String,
    val sslEnabled: Boolean,
    val sslIgnoreCertificate: Boolean,
    val connectionParams: String?,
    val healthStatus: String,
    val lastHealthCheck: String?,
    val createdAt: String,
    val updatedAt: String,
)

@Serializable
data class TestConnectionResponse(val success: Boolean, val message: String)

@Serializable
data class HealthResponse(val status: String, val lastCheck: String?)
