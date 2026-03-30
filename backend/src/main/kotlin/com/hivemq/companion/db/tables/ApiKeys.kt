package com.hivemq.companion.db.tables

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.kotlin.datetime.timestamp

object ApiKeys : Table("api_keys") {
    val id = uuid("id")
    val userId = uuid("user_id").references(CompanionUsers.id)
    val name = varchar("name", 255)
    val keyHash = varchar("key_hash", 255) // BCrypt hash
    val keyPrefix = char("key_prefix", 8)
    val scopes = text("scopes") // JSON array
    val expiresAt = timestamp("expires_at")
    val lastUsedAt = timestamp("last_used_at").nullable()
    val createdAt = timestamp("created_at")

    override val primaryKey = PrimaryKey(id)
}
