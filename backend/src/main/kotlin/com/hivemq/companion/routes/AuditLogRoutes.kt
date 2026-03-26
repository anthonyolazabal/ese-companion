package com.hivemq.companion.routes

import com.hivemq.companion.auth.UserPrincipal
import com.hivemq.companion.dto.ErrorResponse
import com.hivemq.companion.service.AuditLogService
import io.ktor.http.*
import io.ktor.server.auth.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.util.*

fun Route.auditLogRoutes(auditLogService: AuditLogService) {
    authenticate("auth-jwt") {
        route("/api/v1/audit-logs") {

            get {
                val principal = call.principal<UserPrincipal>()!!
                requireAdmin(principal)

                val page = call.request.queryParameters["page"]?.toIntOrNull() ?: 1
                val size = call.request.queryParameters["size"]?.toIntOrNull() ?: 20
                val actorId = call.request.queryParameters["actorId"]?.let {
                    try { UUID.fromString(it) } catch (e: Exception) { null }
                }
                val connectionId = call.request.queryParameters["connectionId"]?.let {
                    try { UUID.fromString(it) } catch (e: Exception) { null }
                }
                val domain = call.request.queryParameters["domain"]
                val action = call.request.queryParameters["action"]
                val fromDate = call.request.queryParameters["from"]
                val toDate = call.request.queryParameters["to"]

                val result = auditLogService.list(
                    page = page,
                    size = size,
                    actorId = actorId,
                    connectionId = connectionId,
                    domain = domain,
                    action = action,
                    fromDate = fromDate,
                    toDate = toDate,
                )

                call.respond(HttpStatusCode.OK, result)
            }

            get("/{logId}") {
                val principal = call.principal<UserPrincipal>()!!
                requireAdmin(principal)

                val logId = call.parameters["logId"]?.toLongOrNull()
                if (logId == null) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid log ID"))
                    return@get
                }

                val entry = auditLogService.findById(logId)
                if (entry == null) {
                    call.respond(HttpStatusCode.NotFound, ErrorResponse("Audit log entry not found"))
                    return@get
                }

                call.respond(HttpStatusCode.OK, entry)
            }
        }
    }
}
