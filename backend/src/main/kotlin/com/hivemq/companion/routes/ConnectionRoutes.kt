package com.hivemq.companion.routes

import com.hivemq.companion.auth.UserPrincipal
import com.hivemq.companion.dto.*
import com.hivemq.companion.service.AuditLogService
import com.hivemq.companion.service.ConnectionService
import io.ktor.http.*
import io.ktor.server.auth.*
import io.ktor.server.plugins.origin
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.util.*

fun Route.connectionRoutes(connectionService: ConnectionService, auditLogService: AuditLogService? = null) {
    authenticate("auth-jwt", "auth-apikey", strategy = AuthenticationStrategy.FirstSuccessful) {
        route("/api/v1/connections") {

            get {
                val principal = call.principal<UserPrincipal>()!!
                requireAdmin(principal)

                val page = call.request.queryParameters["page"]?.toIntOrNull() ?: 1
                val size = call.request.queryParameters["size"]?.toIntOrNull() ?: 20

                val result = connectionService.listAll(page, size)
                call.respond(HttpStatusCode.OK, result)
            }

            post {
                val principal = call.principal<UserPrincipal>()!!
                requireAdmin(principal)

                val request = call.receive<CreateConnectionRequest>()
                val connection = connectionService.create(request)
                auditLogService?.log(
                    actorType = "user",
                    actorId = principal.userId,
                    actorName = principal.username,
                    domain = "companion",
                    action = "create",
                    resourceType = "connection",
                    resourceId = connection.id,
                    resourceName = connection.name,
                    ipAddress = call.request.origin.remoteHost,
                    userAgent = call.request.header("User-Agent") ?: "unknown",
                )
                call.respond(HttpStatusCode.Created, connection)
            }

            get("/{connId}") {
                val principal = call.principal<UserPrincipal>()!!
                requireAdmin(principal)

                val connId = try {
                    UUID.fromString(call.parameters["connId"])
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid connection ID"))
                    return@get
                }

                val connection = connectionService.findById(connId)
                if (connection == null) {
                    call.respond(HttpStatusCode.NotFound, ErrorResponse("Connection not found"))
                    return@get
                }

                call.respond(HttpStatusCode.OK, connection)
            }

            put("/{connId}") {
                val principal = call.principal<UserPrincipal>()!!
                requireAdmin(principal)

                val connId = try {
                    UUID.fromString(call.parameters["connId"])
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid connection ID"))
                    return@put
                }

                val request = call.receive<UpdateConnectionRequest>()
                val updated = connectionService.update(connId, request)
                if (updated == null) {
                    call.respond(HttpStatusCode.NotFound, ErrorResponse("Connection not found"))
                    return@put
                }

                auditLogService?.log(
                    actorType = "user",
                    actorId = principal.userId,
                    actorName = principal.username,
                    domain = "companion",
                    action = "update",
                    resourceType = "connection",
                    resourceId = connId.toString(),
                    resourceName = updated.name,
                    ipAddress = call.request.origin.remoteHost,
                    userAgent = call.request.header("User-Agent") ?: "unknown",
                )
                call.respond(HttpStatusCode.OK, updated)
            }

            delete("/{connId}") {
                val principal = call.principal<UserPrincipal>()!!
                requireAdmin(principal)

                val connId = try {
                    UUID.fromString(call.parameters["connId"])
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid connection ID"))
                    return@delete
                }

                val deleted = connectionService.delete(connId)
                if (!deleted) {
                    call.respond(HttpStatusCode.NotFound, ErrorResponse("Connection not found"))
                    return@delete
                }

                auditLogService?.log(
                    actorType = "user",
                    actorId = principal.userId,
                    actorName = principal.username,
                    domain = "companion",
                    action = "delete",
                    resourceType = "connection",
                    resourceId = connId.toString(),
                    ipAddress = call.request.origin.remoteHost,
                    userAgent = call.request.header("User-Agent") ?: "unknown",
                )
                call.respond(HttpStatusCode.OK, mapOf("message" to "Connection deleted successfully"))
            }

            post("/{connId}/test") {
                val principal = call.principal<UserPrincipal>()!!
                requireAdmin(principal)

                val connId = try {
                    UUID.fromString(call.parameters["connId"])
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid connection ID"))
                    return@post
                }

                val result = connectionService.testConnection(connId)
                call.respond(HttpStatusCode.OK, result)
            }

            get("/{connId}/health") {
                val principal = call.principal<UserPrincipal>()!!
                requireAdmin(principal)

                val connId = try {
                    UUID.fromString(call.parameters["connId"])
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid connection ID"))
                    return@get
                }

                val health = connectionService.getHealth(connId)
                if (health == null) {
                    call.respond(HttpStatusCode.NotFound, ErrorResponse("Connection not found"))
                    return@get
                }

                call.respond(HttpStatusCode.OK, health)
            }
        }
    }
}
