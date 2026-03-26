package com.hivemq.companion.dto

import kotlinx.serialization.Serializable

@Serializable
data class AuditLogResponse(
    val id: Long,
    val timestamp: String,
    val actorType: String,
    val actorName: String,
    val connectionName: String?,
    val domain: String,
    val action: String,
    val resourceType: String,
    val resourceName: String?,
)

@Serializable
data class AuditLogDetailResponse(
    val id: Long,
    val timestamp: String,
    val actorType: String,
    val actorId: String,
    val actorName: String,
    val connectionId: String?,
    val connectionName: String?,
    val domain: String,
    val action: String,
    val resourceType: String,
    val resourceId: String,
    val resourceName: String?,
    val details: String?,
    val ipAddress: String,
    val userAgent: String,
)
