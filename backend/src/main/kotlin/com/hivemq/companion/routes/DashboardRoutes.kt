package com.hivemq.companion.routes

import com.hivemq.companion.auth.UserPrincipal
import com.hivemq.companion.db.tables.DatabaseConnections
import com.hivemq.companion.dto.*
import com.hivemq.companion.ese.EseConnectionManager
import com.hivemq.companion.ese.tables.*
import io.ktor.http.*
import io.ktor.server.auth.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.slf4j.LoggerFactory
import java.util.*

private val logger = LoggerFactory.getLogger("DashboardRoutes")

fun Route.dashboardRoutes(companionDatabase: Database, eseConnectionManager: EseConnectionManager) {
    authenticate("auth-jwt", "auth-apikey", strategy = AuthenticationStrategy.FirstSuccessful) {

        get("/api/v1/dashboard") {
            val principal = call.principal<UserPrincipal>()!!
            requireAdmin(principal)

            val connections = transaction(companionDatabase) {
                DatabaseConnections.selectAll().map { row ->
                    val connId = row[DatabaseConnections.id]
                    val name = row[DatabaseConnections.name]
                    val dbType = row[DatabaseConnections.dbType]
                    val healthStatus = row[DatabaseConnections.healthStatus]
                    val lastHealthCheck = row[DatabaseConnections.lastHealthCheck]?.toString()

                    val stats = try {
                        val db = eseConnectionManager.getDatabase(connId)
                        gatherStats(db)
                    } catch (e: Exception) {
                        logger.warn("Failed to gather stats for connection {}: {}", connId, e.message)
                        null
                    }

                    ConnectionSummary(
                        id = connId.toString(),
                        name = name,
                        dbType = dbType,
                        healthStatus = healthStatus,
                        lastHealthCheck = lastHealthCheck,
                        stats = stats,
                    )
                }
            }

            val healthy = connections.count { it.stats != null }
            val unreachable = connections.size - healthy

            call.respond(
                HttpStatusCode.OK,
                DashboardResponse(
                    connections = connections,
                    totalConnections = connections.size,
                    healthyConnections = healthy,
                    unreachableConnections = unreachable,
                )
            )
        }

        get("/api/v1/ese/{connId}/stats") {
            val principal = call.principal<UserPrincipal>()!!
            requireAdmin(principal)

            val connId = try {
                UUID.fromString(call.parameters["connId"])
            } catch (e: Exception) {
                call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid connection ID"))
                return@get
            }

            val db = try {
                eseConnectionManager.getDatabase(connId)
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.NotFound, ErrorResponse("Connection not found"))
                return@get
            }

            val stats = try {
                gatherStats(db)
            } catch (e: Exception) {
                logger.error("Failed to gather stats for connection {}: {}", connId, e.message)
                call.respond(
                    HttpStatusCode.InternalServerError,
                    ErrorResponse("Failed to gather stats: ${e.message}")
                )
                return@get
            }

            call.respond(HttpStatusCode.OK, stats)
        }
    }
}

private fun gatherStats(db: Database): ConnectionStats = transaction(db) {
    ConnectionStats(
        mqtt = DomainStats(
            userCount = MqttUsers.selectAll().count().toInt(),
            roleCount = MqttRoles.selectAll().count().toInt(),
            permissionCount = MqttPermissions.selectAll().count().toInt(),
        ),
        cc = DomainStats(
            userCount = CcUsers.selectAll().count().toInt(),
            roleCount = CcRoles.selectAll().count().toInt(),
            permissionCount = CcPermissions.selectAll().count().toInt(),
        ),
        restApi = DomainStats(
            userCount = RestApiUsers.selectAll().count().toInt(),
            roleCount = RestApiRoles.selectAll().count().toInt(),
            permissionCount = RestApiPermissions.selectAll().count().toInt(),
        ),
    )
}
