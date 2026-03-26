package com.hivemq.companion.db.tables

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.kotlin.datetime.timestamp

object DatabaseConnections : Table("database_connections") {
    val id = uuid("id")
    val name = varchar("name", 255).uniqueIndex()
    val description = text("description").nullable()
    val dbType = varchar("db_type", 20) // POSTGRESQL, MYSQL, SQLSERVER
    val host = varchar("host", 255)
    val port = integer("port")
    val databaseName = varchar("database_name", 255)
    val username = varchar("username", 255)
    val password = text("password") // AES-encrypted
    val sslEnabled = bool("ssl_enabled").default(false)
    val connectionParams = text("connection_params").nullable() // JSON string
    val healthStatus = varchar("health_status", 20).default("UNKNOWN") // HEALTHY, UNREACHABLE, UNKNOWN
    val lastHealthCheck = timestamp("last_health_check").nullable()
    val createdAt = timestamp("created_at")
    val updatedAt = timestamp("updated_at")

    override val primaryKey = PrimaryKey(id)
}
