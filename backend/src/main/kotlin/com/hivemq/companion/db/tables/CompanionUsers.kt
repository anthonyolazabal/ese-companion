package com.hivemq.companion.db.tables

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.kotlin.datetime.timestamp

object CompanionUsers : Table("companion_users") {
    val id = uuid("id")
    val username = varchar("username", 255).uniqueIndex()
    val email = varchar("email", 255)
    val passwordHash = varchar("password_hash", 255)
    val role = varchar("role", 20) // admin, readwrite, readonly
    val createdAt = timestamp("created_at")
    val updatedAt = timestamp("updated_at")

    override val primaryKey = PrimaryKey(id)
}
