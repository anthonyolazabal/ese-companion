package com.hivemq.companion.routes

import com.hivemq.companion.auth.UserPrincipal
import com.hivemq.companion.dto.*
import com.hivemq.companion.service.ApiKeyService
import com.hivemq.companion.service.AuditLogService
import io.ktor.http.*
import io.ktor.server.auth.*
import io.ktor.server.plugins.origin
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.util.*

fun Route.apiKeyRoutes(apiKeyService: ApiKeyService, auditLogService: AuditLogService? = null) {
    authenticate("auth-jwt", "auth-apikey", strategy = AuthenticationStrategy.FirstSuccessful) {
        route("/api/v1/keys") {

            get {
                val principal = call.principal<UserPrincipal>()!!
                val keys = if (principal.role == "admin") {
                    apiKeyService.listAll()
                } else {
                    apiKeyService.listByUser(principal.userId)
                }
                call.respond(HttpStatusCode.OK, keys)
            }

            post {
                val principal = call.principal<UserPrincipal>()!!
                val request = call.receive<CreateApiKeyRequest>()

                val validScopes = setOf("ese:read", "ese:write", "ese:admin")
                if (!validScopes.containsAll(request.scopes)) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid scopes"))
                    return@post
                }

                val created = apiKeyService.create(principal.userId, request)
                auditLogService?.log(
                    actorType = "user",
                    actorId = principal.userId,
                    actorName = principal.username,
                    domain = "companion",
                    action = "create",
                    resourceType = "api_key",
                    resourceId = created.id,
                    resourceName = created.name,
                    ipAddress = call.request.origin.remoteHost,
                    userAgent = call.request.header("User-Agent") ?: "unknown",
                )
                call.respond(HttpStatusCode.Created, created)
            }

            get("/{keyId}") {
                val principal = call.principal<UserPrincipal>()!!
                val keyId = try {
                    UUID.fromString(call.parameters["keyId"])
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid key ID"))
                    return@get
                }

                val key = apiKeyService.findById(keyId)
                if (key == null) {
                    call.respond(HttpStatusCode.NotFound, ErrorResponse("API key not found"))
                    return@get
                }

                // Non-admins can only see their own keys
                if (principal.role != "admin" && key.userId != principal.userId.toString()) {
                    call.respond(HttpStatusCode.NotFound, ErrorResponse("API key not found"))
                    return@get
                }

                call.respond(HttpStatusCode.OK, key)
            }

            put("/{keyId}") {
                val principal = call.principal<UserPrincipal>()!!
                val keyId = try {
                    UUID.fromString(call.parameters["keyId"])
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid key ID"))
                    return@put
                }

                val request = call.receive<UpdateApiKeyRequest>()

                if (request.scopes != null) {
                    val validScopes = setOf("ese:read", "ese:write", "ese:admin")
                    if (!validScopes.containsAll(request.scopes)) {
                        call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid scopes"))
                        return@put
                    }
                }

                val updated = apiKeyService.update(keyId, principal.userId, request)
                if (updated == null) {
                    call.respond(HttpStatusCode.NotFound, ErrorResponse("API key not found"))
                    return@put
                }

                call.respond(HttpStatusCode.OK, updated)
            }

            delete("/{keyId}") {
                val principal = call.principal<UserPrincipal>()!!
                val keyId = try {
                    UUID.fromString(call.parameters["keyId"])
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid key ID"))
                    return@delete
                }

                val deleted = apiKeyService.delete(keyId, principal.userId)
                if (!deleted) {
                    call.respond(HttpStatusCode.NotFound, ErrorResponse("API key not found"))
                    return@delete
                }

                auditLogService?.log(
                    actorType = "user",
                    actorId = principal.userId,
                    actorName = principal.username,
                    domain = "companion",
                    action = "delete",
                    resourceType = "api_key",
                    resourceId = keyId.toString(),
                    ipAddress = call.request.origin.remoteHost,
                    userAgent = call.request.header("User-Agent") ?: "unknown",
                )
                call.respond(HttpStatusCode.OK, mapOf("message" to "API key revoked successfully"))
            }
        }
    }
}
