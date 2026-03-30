package com.hivemq.companion.dto

import kotlinx.serialization.Serializable

@Serializable
data class DashboardResponse(
    val connections: List<ConnectionSummary>,
    val totalConnections: Int,
    val healthyConnections: Int,
    val unreachableConnections: Int,
)

@Serializable
data class ConnectionSummary(
    val id: String,
    val name: String,
    val dbType: String,
    val healthStatus: String,
    val lastHealthCheck: String?,
    val stats: ConnectionStats?,
)

@Serializable
data class ConnectionStats(
    val mqtt: DomainStats,
    val cc: DomainStats,
    val restApi: DomainStats,
)

@Serializable
data class DomainStats(
    val userCount: Int,
    val roleCount: Int,
    val permissionCount: Int,
)
