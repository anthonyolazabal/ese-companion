package com.hivemq.companion.db.tables

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.kotlin.datetime.timestamp

object AuditLogs : Table("audit_logs") {
    val id = long("id").autoIncrement()
    val timestamp = timestamp("timestamp")
    val actorType = varchar("actor_type", 20) // user, api_key
    val actorId = uuid("actor_id")
    val actorName = varchar("actor_name", 255)
    val connectionId = uuid("connection_id").nullable()
    val connectionName = varchar("connection_name", 255).nullable()
    val domain = varchar("domain", 20) // mqtt, cc, rest_api, companion
    val action = varchar("action", 20) // create, read, update, delete
    val resourceType = varchar("resource_type", 50)
    val resourceId = varchar("resource_id", 255)
    val resourceName = varchar("resource_name", 255).nullable()
    val details = text("details").nullable() // JSON
    val ipAddress = varchar("ip_address", 45)
    val userAgent = text("user_agent")

    override val primaryKey = PrimaryKey(id)
}
