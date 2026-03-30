package com.hivemq.companion.ese.dto

import kotlinx.serialization.Serializable

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

@Serializable
data class CreateEseUserRequest(
    val username: String,
    val password: String,
    val algorithm: String = "PKCS5S2",
    val iterations: Int = 100,
    val memory: Int? = null,
) {
    /** Resolves the full algorithm name (e.g. ARGON2ID -> ARGON2ID_65536KB). */
    val resolvedAlgorithm: String get() =
        if (algorithm == "ARGON2ID" && memory != null) "ARGON2ID_${memory}KB" else algorithm
}

@Serializable
data class UpdateEseUserRequest(
    val username: String? = null,
    val password: String? = null,
    val algorithm: String? = null,
    val iterations: Int? = null,
    val memory: Int? = null,
) {
    fun resolveAlgorithm(fallback: String): String {
        val algo = algorithm ?: fallback
        return if (algo == "ARGON2ID" && memory != null) "ARGON2ID_${memory}KB" else algo
    }
}

@Serializable
data class EseUserResponse(
    val id: Int,
    val username: String,
    val algorithm: String,
    val iterations: Int,
    val createdAt: String,
    val updatedAt: String,
    val roles: List<String> = emptyList(),
)

@Serializable
data class EseUserDetailResponse(
    val id: Int,
    val username: String,
    val algorithm: String,
    val iterations: Int,
    val createdAt: String,
    val updatedAt: String,
    val roles: List<EseRoleResponse> = emptyList(),
    val permissions: List<EsePermissionResponse> = emptyList(),
)

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

@Serializable
data class CreateEseRoleRequest(val name: String, val description: String? = null)

@Serializable
data class UpdateEseRoleRequest(val name: String? = null, val description: String? = null)

@Serializable
data class EseRoleResponse(
    val id: Int,
    val name: String,
    val description: String?,
    val createdAt: String,
    val updatedAt: String,
)

// ---------------------------------------------------------------------------
// Permissions — polymorphic: MQTT vs string-based (CC / REST API)
// ---------------------------------------------------------------------------

@Serializable
data class CreateMqttPermissionRequest(
    val topic: String,
    val publishAllowed: Boolean = false,
    val subscribeAllowed: Boolean = false,
    val qos0Allowed: Boolean = false,
    val qos1Allowed: Boolean = false,
    val qos2Allowed: Boolean = false,
    val retainedMsgsAllowed: Boolean = false,
    val sharedSubAllowed: Boolean = false,
    val sharedGroup: String? = null,
)

@Serializable
data class UpdateMqttPermissionRequest(
    val topic: String? = null,
    val publishAllowed: Boolean? = null,
    val subscribeAllowed: Boolean? = null,
    val qos0Allowed: Boolean? = null,
    val qos1Allowed: Boolean? = null,
    val qos2Allowed: Boolean? = null,
    val retainedMsgsAllowed: Boolean? = null,
    val sharedSubAllowed: Boolean? = null,
    val sharedGroup: String? = null,
)

@Serializable
data class CreateStringPermissionRequest(
    val permissionString: String,
    val description: String? = null,
)

@Serializable
data class UpdateStringPermissionRequest(
    val permissionString: String? = null,
    val description: String? = null,
)

/**
 * Unified permission response. For MQTT permissions the topic-based fields are populated;
 * for CC/REST API permissions [permissionString] and [description] are populated.
 */
@Serializable
data class EsePermissionResponse(
    val id: Int,
    // MQTT fields (null for CC / REST API)
    val topic: String? = null,
    val publishAllowed: Boolean? = null,
    val subscribeAllowed: Boolean? = null,
    val qos0Allowed: Boolean? = null,
    val qos1Allowed: Boolean? = null,
    val qos2Allowed: Boolean? = null,
    val retainedMsgsAllowed: Boolean? = null,
    val sharedSubAllowed: Boolean? = null,
    val sharedGroup: String? = null,
    // CC / REST API fields (null for MQTT)
    val permissionString: String? = null,
    val description: String? = null,
    val createdAt: String,
    val updatedAt: String,
)

// ---------------------------------------------------------------------------
// Association responses
// ---------------------------------------------------------------------------

@Serializable
data class AssociationResponse(val message: String)
