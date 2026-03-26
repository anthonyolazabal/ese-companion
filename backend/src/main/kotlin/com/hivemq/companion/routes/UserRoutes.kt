package com.hivemq.companion.routes

import com.hivemq.companion.auth.UserPrincipal
import com.hivemq.companion.dto.*
import com.hivemq.companion.service.UserRecord
import com.hivemq.companion.service.UserService
import io.ktor.http.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.util.*

class ForbiddenException(message: String) : RuntimeException(message)

fun requireAdmin(principal: UserPrincipal) {
    if (principal.role != "admin") throw ForbiddenException("Admin access required")
}

fun UserRecord.toResponse(createdAt: String = "", updatedAt: String = "") = UserResponse(
    id = id.toString(),
    username = username,
    email = email,
    role = role,
    createdAt = createdAt,
    updatedAt = updatedAt,
)

fun Route.userRoutes(userService: UserService) {
    authenticate("auth-jwt", "auth-apikey", strategy = AuthenticationStrategy.FirstSuccessful) {
        route("/api/v1/users") {

            get {
                val principal = call.principal<UserPrincipal>()!!
                requireAdmin(principal)

                val page = call.request.queryParameters["page"]?.toIntOrNull() ?: 1
                val size = call.request.queryParameters["size"]?.toIntOrNull() ?: 20

                val allUsers = userService.listUsers()
                val total = allUsers.size.toLong()
                val items = allUsers
                    .drop((page - 1) * size)
                    .take(size)
                    .map { it.toResponse() }

                call.respond(HttpStatusCode.OK, PaginatedResponse(items = items, page = page, size = size, total = total))
            }

            get("/{userId}") {
                val principal = call.principal<UserPrincipal>()!!
                requireAdmin(principal)

                val userId = try {
                    UUID.fromString(call.parameters["userId"])
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid user ID"))
                    return@get
                }

                val user = userService.findById(userId)
                if (user == null) {
                    call.respond(HttpStatusCode.NotFound, ErrorResponse("User not found"))
                    return@get
                }

                call.respond(HttpStatusCode.OK, user.toResponse())
            }

            post {
                val principal = call.principal<UserPrincipal>()!!
                requireAdmin(principal)

                val request = call.receive<CreateUserRequest>()

                val existing = userService.findByUsername(request.username)
                if (existing != null) {
                    call.respond(HttpStatusCode.Conflict, ErrorResponse("Username already exists"))
                    return@post
                }

                val user = userService.createUser(request.username, request.email, request.password, request.role)
                call.respond(HttpStatusCode.Created, user.toResponse())
            }

            put("/{userId}") {
                val principal = call.principal<UserPrincipal>()!!
                requireAdmin(principal)

                val userId = try {
                    UUID.fromString(call.parameters["userId"])
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid user ID"))
                    return@put
                }

                val request = call.receive<UpdateUserRequest>()

                // Handle password change if requested
                if (request.password != null) {
                    userService.changePassword(userId, request.password)
                }

                // Handle other field updates
                if (request.email != null || request.role != null) {
                    val updateRequest = UserUpdateRequest(email = request.email, role = request.role)
                    userService.updateUser(userId, updateRequest)
                }

                val updated = userService.findById(userId)
                if (updated == null) {
                    call.respond(HttpStatusCode.NotFound, ErrorResponse("User not found"))
                    return@put
                }

                call.respond(HttpStatusCode.OK, updated.toResponse())
            }

            delete("/{userId}") {
                val principal = call.principal<UserPrincipal>()!!
                requireAdmin(principal)

                val userId = try {
                    UUID.fromString(call.parameters["userId"])
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid user ID"))
                    return@delete
                }

                if (userId == principal.userId) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("Cannot delete your own account"))
                    return@delete
                }

                val deleted = userService.deleteUser(userId)
                if (!deleted) {
                    call.respond(HttpStatusCode.NotFound, ErrorResponse("User not found"))
                    return@delete
                }

                call.respond(HttpStatusCode.OK, mapOf("message" to "User deleted successfully"))
            }
        }
    }
}
