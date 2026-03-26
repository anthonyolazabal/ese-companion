package com.hivemq.companion.service

import com.hivemq.companion.db.tables.ApiKeys
import com.hivemq.companion.db.tables.CompanionUsers
import com.hivemq.companion.dto.*
import kotlinx.datetime.Clock
import kotlinx.datetime.Instant
import kotlinx.serialization.json.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.mindrot.jbcrypt.BCrypt
import java.security.SecureRandom
import java.util.*

data class ApiKeyValidation(
    val userId: UUID,
    val username: String,
    val role: String,
    val scopes: List<String>,
)

class ApiKeyService(private val database: Database) {

    private val secureRandom = SecureRandom()

    private fun generateRawKey(): String {
        val bytes = ByteArray(32)
        secureRandom.nextBytes(bytes)
        return "esc_" + Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
    }

    private fun scopesToJson(scopes: List<String>): String {
        return Json.encodeToString(JsonArray.serializer(), JsonArray(scopes.map { JsonPrimitive(it) }))
    }

    private fun jsonToScopes(json: String): List<String> {
        return Json.parseToJsonElement(json).jsonArray.map { it.jsonPrimitive.content }
    }

    private fun ResultRow.toApiKeyResponse(): ApiKeyResponse {
        return ApiKeyResponse(
            id = this[ApiKeys.id].toString(),
            name = this[ApiKeys.name],
            keyPrefix = this[ApiKeys.keyPrefix],
            scopes = jsonToScopes(this[ApiKeys.scopes]),
            expiresAt = this[ApiKeys.expiresAt].toString(),
            lastUsedAt = this[ApiKeys.lastUsedAt]?.toString(),
            createdAt = this[ApiKeys.createdAt].toString(),
            userId = this[ApiKeys.userId].toString(),
        )
    }

    suspend fun create(userId: UUID, request: CreateApiKeyRequest): ApiKeyCreatedResponse =
        newSuspendedTransaction(db = database) {
            val rawKey = generateRawKey()
            val keyHash = BCrypt.hashpw(rawKey, BCrypt.gensalt())
            val keyPrefix = rawKey.take(8)
            val id = UUID.randomUUID()
            val now = Clock.System.now()
            val expiresAt = Instant.parse(request.expiresAt)

            ApiKeys.insert {
                it[ApiKeys.id] = id
                it[ApiKeys.userId] = userId
                it[ApiKeys.name] = request.name
                it[ApiKeys.keyHash] = keyHash
                it[ApiKeys.keyPrefix] = keyPrefix
                it[ApiKeys.scopes] = scopesToJson(request.scopes)
                it[ApiKeys.expiresAt] = expiresAt
                it[ApiKeys.lastUsedAt] = null
                it[ApiKeys.createdAt] = now
            }

            ApiKeyCreatedResponse(
                id = id.toString(),
                name = request.name,
                key = rawKey,
                keyPrefix = keyPrefix,
                scopes = request.scopes,
                expiresAt = expiresAt.toString(),
                createdAt = now.toString(),
            )
        }

    suspend fun listByUser(userId: UUID): List<ApiKeyResponse> = newSuspendedTransaction(db = database) {
        ApiKeys.selectAll().where { ApiKeys.userId eq userId }
            .map { it.toApiKeyResponse() }
    }

    suspend fun listAll(): List<ApiKeyResponse> = newSuspendedTransaction(db = database) {
        ApiKeys.selectAll().map { it.toApiKeyResponse() }
    }

    suspend fun findById(keyId: UUID): ApiKeyResponse? = newSuspendedTransaction(db = database) {
        ApiKeys.selectAll().where { ApiKeys.id eq keyId }
            .singleOrNull()
            ?.toApiKeyResponse()
    }

    suspend fun update(keyId: UUID, userId: UUID, request: UpdateApiKeyRequest): ApiKeyResponse? =
        newSuspendedTransaction(db = database) {
            val existing = ApiKeys.selectAll()
                .where { (ApiKeys.id eq keyId) and (ApiKeys.userId eq userId) }
                .singleOrNull() ?: return@newSuspendedTransaction null

            ApiKeys.update({ (ApiKeys.id eq keyId) and (ApiKeys.userId eq userId) }) {
                request.name?.let { name -> it[ApiKeys.name] = name }
                request.scopes?.let { scopes -> it[ApiKeys.scopes] = scopesToJson(scopes) }
                request.expiresAt?.let { expiresAt -> it[ApiKeys.expiresAt] = Instant.parse(expiresAt) }
            }

            ApiKeys.selectAll().where { ApiKeys.id eq keyId }
                .singleOrNull()
                ?.toApiKeyResponse()
        }

    suspend fun delete(keyId: UUID, userId: UUID): Boolean = newSuspendedTransaction(db = database) {
        ApiKeys.deleteWhere { (ApiKeys.id eq keyId) and (ApiKeys.userId eq userId) } > 0
    }

    suspend fun validateApiKey(rawKey: String): ApiKeyValidation? = newSuspendedTransaction(db = database) {
        if (rawKey.length < 8) return@newSuspendedTransaction null

        val prefix = rawKey.take(8)
        val candidates = ApiKeys.innerJoin(CompanionUsers, { userId }, { CompanionUsers.id })
            .selectAll()
            .where { ApiKeys.keyPrefix eq prefix }
            .toList()

        for (row in candidates) {
            if (BCrypt.checkpw(rawKey, row[ApiKeys.keyHash])) {
                // Check expiry
                val expiresAt = row[ApiKeys.expiresAt]
                if (Clock.System.now() > expiresAt) {
                    return@newSuspendedTransaction null
                }

                // Update last_used_at
                val keyId = row[ApiKeys.id]
                ApiKeys.update({ ApiKeys.id eq keyId }) {
                    it[ApiKeys.lastUsedAt] = Clock.System.now()
                }

                return@newSuspendedTransaction ApiKeyValidation(
                    userId = row[CompanionUsers.id],
                    username = row[CompanionUsers.username],
                    role = row[CompanionUsers.role],
                    scopes = jsonToScopes(row[ApiKeys.scopes]),
                )
            }
        }

        null
    }
}
