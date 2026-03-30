package com.hivemq.companion.ese.routes

import com.hivemq.companion.auth.UserPrincipal
import com.hivemq.companion.dto.ErrorResponse
import com.hivemq.companion.ese.dto.*
import com.hivemq.companion.ese.service.EseService
import com.hivemq.companion.routes.ForbiddenException
import com.hivemq.companion.service.AuditLogService
import io.ktor.http.*
import io.ktor.server.auth.*
import io.ktor.server.plugins.origin
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.util.*

private val VALID_DOMAINS = setOf("mqtt", "cc", "rest-api")

private fun requireReadWrite(principal: UserPrincipal) {
    if (principal.role == "readonly") throw ForbiddenException("Write access required")
}

private fun mapDomainForAudit(domain: String): String = when (domain) {
    "rest-api" -> "rest_api"
    else -> domain
}

fun Route.eseRoutes(eseService: EseService, auditLogService: AuditLogService? = null) {
    authenticate("auth-jwt", "auth-apikey", strategy = AuthenticationStrategy.FirstSuccessful) {
        route("/api/v1/ese/{connId}/{domain}") {

            // ---------------------------------------------------------------
            // Users
            // ---------------------------------------------------------------
            route("/users") {
                get {
                    val (db, domain, connName) = resolveConnAndDomain(call, eseService) ?: return@get
                    val page = call.request.queryParameters["page"]?.toIntOrNull() ?: 1
                    val size = call.request.queryParameters["size"]?.toIntOrNull() ?: 20
                    val search = call.request.queryParameters["search"]
                    val result = eseService.listUsers(db, domain, page, size, search)
                    call.respond(HttpStatusCode.OK, result)
                }

                get("/{id}") {
                    val (db, domain, connName) = resolveConnAndDomain(call, eseService) ?: return@get
                    val userId = call.parameters["id"]?.toIntOrNull()
                    if (userId == null) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid user ID"))
                        return@get
                    }
                    val user = eseService.getUser(db, domain, userId)
                    if (user == null) {
                        call.respond(HttpStatusCode.NotFound, ErrorResponse("User not found"))
                        return@get
                    }
                    call.respond(HttpStatusCode.OK, user)
                }

                post {
                    val principal = call.principal<UserPrincipal>()!!
                    requireReadWrite(principal)
                    val (db, domain, connName) = resolveConnAndDomain(call, eseService) ?: return@post
                    val connId = call.parameters["connId"]!!
                    val request = call.receive<CreateEseUserRequest>()
                    val user = eseService.createUser(db, domain, request)
                    auditLogService?.log(
                        actorType = "user",
                        actorId = principal.userId,
                        actorName = principal.username,
                        connectionId = UUID.fromString(connId),
                        connectionName = connName,
                        domain = mapDomainForAudit(domain),
                        action = "create",
                        resourceType = "user",
                        resourceId = user.id.toString(),
                        resourceName = user.username,
                        ipAddress = call.request.origin.remoteHost,
                        userAgent = call.request.header("User-Agent") ?: "unknown",
                    )
                    call.respond(HttpStatusCode.Created, user)
                }

                put("/{id}") {
                    val principal = call.principal<UserPrincipal>()!!
                    requireReadWrite(principal)
                    val (db, domain, connName) = resolveConnAndDomain(call, eseService) ?: return@put
                    val connId = call.parameters["connId"]!!
                    val userId = call.parameters["id"]?.toIntOrNull()
                    if (userId == null) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid user ID"))
                        return@put
                    }
                    val request = call.receive<UpdateEseUserRequest>()
                    val updated = eseService.updateUser(db, domain, userId, request)
                    if (updated == null) {
                        call.respond(HttpStatusCode.NotFound, ErrorResponse("User not found"))
                        return@put
                    }
                    auditLogService?.log(
                        actorType = "user",
                        actorId = principal.userId,
                        actorName = principal.username,
                        connectionId = UUID.fromString(connId),
                        connectionName = connName,
                        domain = mapDomainForAudit(domain),
                        action = "update",
                        resourceType = "user",
                        resourceId = userId.toString(),
                        resourceName = updated.username,
                        ipAddress = call.request.origin.remoteHost,
                        userAgent = call.request.header("User-Agent") ?: "unknown",
                    )
                    call.respond(HttpStatusCode.OK, updated)
                }

                delete("/{id}") {
                    val principal = call.principal<UserPrincipal>()!!
                    requireReadWrite(principal)
                    val (db, domain, connName) = resolveConnAndDomain(call, eseService) ?: return@delete
                    val connId = call.parameters["connId"]!!
                    val userId = call.parameters["id"]?.toIntOrNull()
                    if (userId == null) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid user ID"))
                        return@delete
                    }
                    val deleted = eseService.deleteUser(db, domain, userId)
                    if (!deleted) {
                        call.respond(HttpStatusCode.NotFound, ErrorResponse("User not found"))
                        return@delete
                    }
                    auditLogService?.log(
                        actorType = "user",
                        actorId = principal.userId,
                        actorName = principal.username,
                        connectionId = UUID.fromString(connId),
                        connectionName = connName,
                        domain = mapDomainForAudit(domain),
                        action = "delete",
                        resourceType = "user",
                        resourceId = userId.toString(),
                        ipAddress = call.request.origin.remoteHost,
                        userAgent = call.request.header("User-Agent") ?: "unknown",
                    )
                    call.respond(HttpStatusCode.OK, AssociationResponse("User deleted successfully"))
                }

                // Get role IDs assigned to a user
                get("/{id}/roles") {
                    call.principal<UserPrincipal>()!!
                    val (db, domain, connName) = resolveConnAndDomain(call, eseService) ?: return@get
                    val userId = call.parameters["id"]?.toIntOrNull()
                    if (userId == null) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid user ID"))
                        return@get
                    }
                    val roleIds = eseService.getRoleIdsForUser(db, domain, userId)
                    call.respond(roleIds)
                }

                // User-Role associations
                post("/{id}/roles/{roleId}") {
                    val principal = call.principal<UserPrincipal>()!!
                    requireReadWrite(principal)
                    val (db, domain, connName) = resolveConnAndDomain(call, eseService) ?: return@post
                    val connId = call.parameters["connId"]!!
                    val userId = call.parameters["id"]?.toIntOrNull()
                    val roleId = call.parameters["roleId"]?.toIntOrNull()
                    if (userId == null || roleId == null) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid ID"))
                        return@post
                    }
                    val created = eseService.assignRoleToUser(db, domain, userId, roleId)
                    if (!created) {
                        call.respond(HttpStatusCode.Conflict, ErrorResponse("Association already exists"))
                        return@post
                    }
                    auditLogService?.log(
                        actorType = "user",
                        actorId = principal.userId,
                        actorName = principal.username,
                        connectionId = UUID.fromString(connId),
                        connectionName = connName,
                        domain = mapDomainForAudit(domain),
                        action = "create",
                        resourceType = "user_role",
                        resourceId = "$userId:$roleId",
                        ipAddress = call.request.origin.remoteHost,
                        userAgent = call.request.header("User-Agent") ?: "unknown",
                    )
                    call.respond(HttpStatusCode.Created, AssociationResponse("Role assigned to user"))
                }

                delete("/{id}/roles/{roleId}") {
                    val principal = call.principal<UserPrincipal>()!!
                    requireReadWrite(principal)
                    val (db, domain, connName) = resolveConnAndDomain(call, eseService) ?: return@delete
                    val connId = call.parameters["connId"]!!
                    val userId = call.parameters["id"]?.toIntOrNull()
                    val roleId = call.parameters["roleId"]?.toIntOrNull()
                    if (userId == null || roleId == null) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid ID"))
                        return@delete
                    }
                    val removed = eseService.removeRoleFromUser(db, domain, userId, roleId)
                    if (!removed) {
                        call.respond(HttpStatusCode.NotFound, ErrorResponse("Association not found"))
                        return@delete
                    }
                    auditLogService?.log(
                        actorType = "user",
                        actorId = principal.userId,
                        actorName = principal.username,
                        connectionId = UUID.fromString(connId),
                        connectionName = connName,
                        domain = mapDomainForAudit(domain),
                        action = "delete",
                        resourceType = "user_role",
                        resourceId = "$userId:$roleId",
                        ipAddress = call.request.origin.remoteHost,
                        userAgent = call.request.header("User-Agent") ?: "unknown",
                    )
                    call.respond(HttpStatusCode.OK, AssociationResponse("Role removed from user"))
                }

                // User-Permission associations
                post("/{id}/permissions/{permId}") {
                    val principal = call.principal<UserPrincipal>()!!
                    requireReadWrite(principal)
                    val (db, domain, connName) = resolveConnAndDomain(call, eseService) ?: return@post
                    val connId = call.parameters["connId"]!!
                    val userId = call.parameters["id"]?.toIntOrNull()
                    val permId = call.parameters["permId"]?.toIntOrNull()
                    if (userId == null || permId == null) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid ID"))
                        return@post
                    }
                    val created = eseService.assignPermissionToUser(db, domain, userId, permId)
                    if (!created) {
                        call.respond(HttpStatusCode.Conflict, ErrorResponse("Association already exists"))
                        return@post
                    }
                    auditLogService?.log(
                        actorType = "user",
                        actorId = principal.userId,
                        actorName = principal.username,
                        connectionId = UUID.fromString(connId),
                        connectionName = connName,
                        domain = mapDomainForAudit(domain),
                        action = "create",
                        resourceType = "user_permission",
                        resourceId = "$userId:$permId",
                        ipAddress = call.request.origin.remoteHost,
                        userAgent = call.request.header("User-Agent") ?: "unknown",
                    )
                    call.respond(HttpStatusCode.Created, AssociationResponse("Permission assigned to user"))
                }

                delete("/{id}/permissions/{permId}") {
                    val principal = call.principal<UserPrincipal>()!!
                    requireReadWrite(principal)
                    val (db, domain, connName) = resolveConnAndDomain(call, eseService) ?: return@delete
                    val connId = call.parameters["connId"]!!
                    val userId = call.parameters["id"]?.toIntOrNull()
                    val permId = call.parameters["permId"]?.toIntOrNull()
                    if (userId == null || permId == null) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid ID"))
                        return@delete
                    }
                    val removed = eseService.removePermissionFromUser(db, domain, userId, permId)
                    if (!removed) {
                        call.respond(HttpStatusCode.NotFound, ErrorResponse("Association not found"))
                        return@delete
                    }
                    auditLogService?.log(
                        actorType = "user",
                        actorId = principal.userId,
                        actorName = principal.username,
                        connectionId = UUID.fromString(connId),
                        connectionName = connName,
                        domain = mapDomainForAudit(domain),
                        action = "delete",
                        resourceType = "user_permission",
                        resourceId = "$userId:$permId",
                        ipAddress = call.request.origin.remoteHost,
                        userAgent = call.request.header("User-Agent") ?: "unknown",
                    )
                    call.respond(HttpStatusCode.OK, AssociationResponse("Permission removed from user"))
                }
            }

            // ---------------------------------------------------------------
            // Roles
            // ---------------------------------------------------------------
            route("/roles") {
                get {
                    val (db, domain, connName) = resolveConnAndDomain(call, eseService) ?: return@get
                    val page = call.request.queryParameters["page"]?.toIntOrNull() ?: 1
                    val size = call.request.queryParameters["size"]?.toIntOrNull() ?: 20
                    val result = eseService.listRoles(db, domain, page, size)
                    call.respond(HttpStatusCode.OK, result)
                }

                post {
                    val principal = call.principal<UserPrincipal>()!!
                    requireReadWrite(principal)
                    val (db, domain, connName) = resolveConnAndDomain(call, eseService) ?: return@post
                    val connId = call.parameters["connId"]!!
                    val request = call.receive<CreateEseRoleRequest>()
                    val role = eseService.createRole(db, domain, request)
                    auditLogService?.log(
                        actorType = "user",
                        actorId = principal.userId,
                        actorName = principal.username,
                        connectionId = UUID.fromString(connId),
                        connectionName = connName,
                        domain = mapDomainForAudit(domain),
                        action = "create",
                        resourceType = "role",
                        resourceId = role.id.toString(),
                        resourceName = role.name,
                        ipAddress = call.request.origin.remoteHost,
                        userAgent = call.request.header("User-Agent") ?: "unknown",
                    )
                    call.respond(HttpStatusCode.Created, role)
                }

                put("/{id}") {
                    val principal = call.principal<UserPrincipal>()!!
                    requireReadWrite(principal)
                    val (db, domain, connName) = resolveConnAndDomain(call, eseService) ?: return@put
                    val connId = call.parameters["connId"]!!
                    val roleId = call.parameters["id"]?.toIntOrNull()
                    if (roleId == null) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid role ID"))
                        return@put
                    }
                    val request = call.receive<UpdateEseRoleRequest>()
                    val updated = eseService.updateRole(db, domain, roleId, request)
                    if (updated == null) {
                        call.respond(HttpStatusCode.NotFound, ErrorResponse("Role not found"))
                        return@put
                    }
                    auditLogService?.log(
                        actorType = "user",
                        actorId = principal.userId,
                        actorName = principal.username,
                        connectionId = UUID.fromString(connId),
                        connectionName = connName,
                        domain = mapDomainForAudit(domain),
                        action = "update",
                        resourceType = "role",
                        resourceId = roleId.toString(),
                        resourceName = updated.name,
                        ipAddress = call.request.origin.remoteHost,
                        userAgent = call.request.header("User-Agent") ?: "unknown",
                    )
                    call.respond(HttpStatusCode.OK, updated)
                }

                delete("/{id}") {
                    val principal = call.principal<UserPrincipal>()!!
                    requireReadWrite(principal)
                    val (db, domain, connName) = resolveConnAndDomain(call, eseService) ?: return@delete
                    val connId = call.parameters["connId"]!!
                    val roleId = call.parameters["id"]?.toIntOrNull()
                    if (roleId == null) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid role ID"))
                        return@delete
                    }
                    val deleted = eseService.deleteRole(db, domain, roleId)
                    if (!deleted) {
                        call.respond(HttpStatusCode.NotFound, ErrorResponse("Role not found"))
                        return@delete
                    }
                    auditLogService?.log(
                        actorType = "user",
                        actorId = principal.userId,
                        actorName = principal.username,
                        connectionId = UUID.fromString(connId),
                        connectionName = connName,
                        domain = mapDomainForAudit(domain),
                        action = "delete",
                        resourceType = "role",
                        resourceId = roleId.toString(),
                        ipAddress = call.request.origin.remoteHost,
                        userAgent = call.request.header("User-Agent") ?: "unknown",
                    )
                    call.respond(HttpStatusCode.OK, AssociationResponse("Role deleted successfully"))
                }

                // Get permission IDs assigned to a role
                get("/{id}/permissions") {
                    call.principal<UserPrincipal>()!!
                    val (db, domain, connName) = resolveConnAndDomain(call, eseService) ?: return@get
                    val roleId = call.parameters["id"]?.toIntOrNull()
                    if (roleId == null) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid role ID"))
                        return@get
                    }
                    val permIds = eseService.getPermissionIdsForRole(db, domain, roleId)
                    call.respond(permIds)
                }

                // Role-Permission associations
                post("/{id}/permissions/{permId}") {
                    val principal = call.principal<UserPrincipal>()!!
                    requireReadWrite(principal)
                    val (db, domain, connName) = resolveConnAndDomain(call, eseService) ?: return@post
                    val connId = call.parameters["connId"]!!
                    val roleId = call.parameters["id"]?.toIntOrNull()
                    val permId = call.parameters["permId"]?.toIntOrNull()
                    if (roleId == null || permId == null) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid ID"))
                        return@post
                    }
                    val created = eseService.assignPermissionToRole(db, domain, roleId, permId)
                    if (!created) {
                        call.respond(HttpStatusCode.Conflict, ErrorResponse("Association already exists"))
                        return@post
                    }
                    auditLogService?.log(
                        actorType = "user",
                        actorId = principal.userId,
                        actorName = principal.username,
                        connectionId = UUID.fromString(connId),
                        connectionName = connName,
                        domain = mapDomainForAudit(domain),
                        action = "create",
                        resourceType = "role_permission",
                        resourceId = "$roleId:$permId",
                        ipAddress = call.request.origin.remoteHost,
                        userAgent = call.request.header("User-Agent") ?: "unknown",
                    )
                    call.respond(HttpStatusCode.Created, AssociationResponse("Permission assigned to role"))
                }

                delete("/{id}/permissions/{permId}") {
                    val principal = call.principal<UserPrincipal>()!!
                    requireReadWrite(principal)
                    val (db, domain, connName) = resolveConnAndDomain(call, eseService) ?: return@delete
                    val connId = call.parameters["connId"]!!
                    val roleId = call.parameters["id"]?.toIntOrNull()
                    val permId = call.parameters["permId"]?.toIntOrNull()
                    if (roleId == null || permId == null) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid ID"))
                        return@delete
                    }
                    val removed = eseService.removePermissionFromRole(db, domain, roleId, permId)
                    if (!removed) {
                        call.respond(HttpStatusCode.NotFound, ErrorResponse("Association not found"))
                        return@delete
                    }
                    auditLogService?.log(
                        actorType = "user",
                        actorId = principal.userId,
                        actorName = principal.username,
                        connectionId = UUID.fromString(connId),
                        connectionName = connName,
                        domain = mapDomainForAudit(domain),
                        action = "delete",
                        resourceType = "role_permission",
                        resourceId = "$roleId:$permId",
                        ipAddress = call.request.origin.remoteHost,
                        userAgent = call.request.header("User-Agent") ?: "unknown",
                    )
                    call.respond(HttpStatusCode.OK, AssociationResponse("Permission removed from role"))
                }
            }

            // ---------------------------------------------------------------
            // Permissions
            // ---------------------------------------------------------------
            route("/permissions") {
                get {
                    val (db, domain, connName) = resolveConnAndDomain(call, eseService) ?: return@get
                    val page = call.request.queryParameters["page"]?.toIntOrNull() ?: 1
                    val size = call.request.queryParameters["size"]?.toIntOrNull() ?: 20
                    val result = eseService.listPermissions(db, domain, page, size)
                    call.respond(HttpStatusCode.OK, result)
                }

                post {
                    val principal = call.principal<UserPrincipal>()!!
                    requireReadWrite(principal)
                    val (db, domain, connName) = resolveConnAndDomain(call, eseService) ?: return@post
                    val connId = call.parameters["connId"]!!
                    val perm = if (domain == "mqtt") {
                        val request = call.receive<CreateMqttPermissionRequest>()
                        eseService.createMqttPermission(db, request)
                    } else {
                        val request = call.receive<CreateStringPermissionRequest>()
                        eseService.createStringPermission(db, domain, request)
                    }
                    auditLogService?.log(
                        actorType = "user",
                        actorId = principal.userId,
                        actorName = principal.username,
                        connectionId = UUID.fromString(connId),
                        connectionName = connName,
                        domain = mapDomainForAudit(domain),
                        action = "create",
                        resourceType = "permission",
                        resourceId = perm.id.toString(),
                        ipAddress = call.request.origin.remoteHost,
                        userAgent = call.request.header("User-Agent") ?: "unknown",
                    )
                    call.respond(HttpStatusCode.Created, perm)
                }

                put("/{id}") {
                    val principal = call.principal<UserPrincipal>()!!
                    requireReadWrite(principal)
                    val (db, domain, connName) = resolveConnAndDomain(call, eseService) ?: return@put
                    val connId = call.parameters["connId"]!!
                    val permId = call.parameters["id"]?.toIntOrNull()
                    if (permId == null) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid permission ID"))
                        return@put
                    }
                    val updated = if (domain == "mqtt") {
                        val request = call.receive<UpdateMqttPermissionRequest>()
                        eseService.updateMqttPermission(db, permId, request)
                    } else {
                        val request = call.receive<UpdateStringPermissionRequest>()
                        eseService.updateStringPermission(db, domain, permId, request)
                    }
                    if (updated == null) {
                        call.respond(HttpStatusCode.NotFound, ErrorResponse("Permission not found"))
                        return@put
                    }
                    auditLogService?.log(
                        actorType = "user",
                        actorId = principal.userId,
                        actorName = principal.username,
                        connectionId = UUID.fromString(connId),
                        connectionName = connName,
                        domain = mapDomainForAudit(domain),
                        action = "update",
                        resourceType = "permission",
                        resourceId = permId.toString(),
                        ipAddress = call.request.origin.remoteHost,
                        userAgent = call.request.header("User-Agent") ?: "unknown",
                    )
                    call.respond(HttpStatusCode.OK, updated)
                }

                delete("/{id}") {
                    val principal = call.principal<UserPrincipal>()!!
                    requireReadWrite(principal)
                    val (db, domain, connName) = resolveConnAndDomain(call, eseService) ?: return@delete
                    val connId = call.parameters["connId"]!!
                    val permId = call.parameters["id"]?.toIntOrNull()
                    if (permId == null) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid permission ID"))
                        return@delete
                    }
                    val deleted = eseService.deletePermission(db, domain, permId)
                    if (!deleted) {
                        call.respond(HttpStatusCode.NotFound, ErrorResponse("Permission not found"))
                        return@delete
                    }
                    auditLogService?.log(
                        actorType = "user",
                        actorId = principal.userId,
                        actorName = principal.username,
                        connectionId = UUID.fromString(connId),
                        connectionName = connName,
                        domain = mapDomainForAudit(domain),
                        action = "delete",
                        resourceType = "permission",
                        resourceId = permId.toString(),
                        ipAddress = call.request.origin.remoteHost,
                        userAgent = call.request.header("User-Agent") ?: "unknown",
                    )
                    call.respond(HttpStatusCode.OK, AssociationResponse("Permission deleted successfully"))
                }
            }
        }
    }
}

private data class ConnDomain(val db: org.jetbrains.exposed.sql.Database, val domain: String, val connectionName: String)

private suspend fun resolveConnAndDomain(
    call: io.ktor.server.application.ApplicationCall,
    eseService: EseService,
): ConnDomain? {
    val connIdStr = call.parameters["connId"]
    val domain = call.parameters["domain"]

    if (domain == null || domain !in VALID_DOMAINS) {
        call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid domain. Valid: mqtt, cc, rest-api"))
        return null
    }

    val connId = try {
        UUID.fromString(connIdStr)
    } catch (e: Exception) {
        call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid connection ID"))
        return null
    }

    val db = try {
        eseService.getDatabase(connId)
    } catch (e: IllegalArgumentException) {
        call.respond(HttpStatusCode.NotFound, ErrorResponse("Connection not found"))
        return null
    }

    val connectionName = eseService.getConnectionName(connId) ?: connIdStr ?: "unknown"

    return ConnDomain(db, domain, connectionName)
}
