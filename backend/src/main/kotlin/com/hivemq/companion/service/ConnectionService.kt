package com.hivemq.companion.service

import com.hivemq.companion.crypto.AesEncryption
import com.hivemq.companion.db.tables.DatabaseConnections
import com.hivemq.companion.dto.*
import kotlinx.datetime.Clock
import kotlinx.datetime.Instant
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.slf4j.LoggerFactory
import java.sql.DriverManager
import java.util.*

class ConnectionService(private val database: Database, private val aesEncryption: AesEncryption) {

    private val logger = LoggerFactory.getLogger(ConnectionService::class.java)

    private fun ResultRow.toConnectionResponse() = ConnectionResponse(
        id = this[DatabaseConnections.id].toString(),
        name = this[DatabaseConnections.name],
        description = this[DatabaseConnections.description],
        dbType = this[DatabaseConnections.dbType],
        host = this[DatabaseConnections.host],
        port = this[DatabaseConnections.port],
        databaseName = this[DatabaseConnections.databaseName],
        username = this[DatabaseConnections.username],
        sslEnabled = this[DatabaseConnections.sslEnabled],
        sslIgnoreCertificate = this[DatabaseConnections.sslIgnoreCertificate],
        connectionParams = this[DatabaseConnections.connectionParams],
        healthStatus = this[DatabaseConnections.healthStatus],
        lastHealthCheck = this[DatabaseConnections.lastHealthCheck]?.toString(),
        createdAt = this[DatabaseConnections.createdAt].toString(),
        updatedAt = this[DatabaseConnections.updatedAt].toString(),
    )

    suspend fun create(request: CreateConnectionRequest): ConnectionResponse = newSuspendedTransaction(db = database) {
        val now = Clock.System.now()
        val id = UUID.randomUUID()
        val encryptedPassword = aesEncryption.encrypt(request.password)

        DatabaseConnections.insert {
            it[DatabaseConnections.id] = id
            it[name] = request.name
            it[description] = request.description
            it[dbType] = request.dbType.uppercase()
            it[host] = request.host
            it[port] = request.port
            it[databaseName] = request.databaseName
            it[username] = request.username
            it[password] = encryptedPassword
            it[sslEnabled] = request.sslEnabled
            it[sslIgnoreCertificate] = request.sslIgnoreCertificate
            it[connectionParams] = request.connectionParams
            it[healthStatus] = "UNKNOWN"
            it[lastHealthCheck] = null
            it[createdAt] = now
            it[updatedAt] = now
        }

        DatabaseConnections.selectAll().where { DatabaseConnections.id eq id }.single().toConnectionResponse()
    }

    suspend fun update(id: UUID, request: UpdateConnectionRequest): ConnectionResponse? =
        newSuspendedTransaction(db = database) {
            val now = Clock.System.now()
            val count = DatabaseConnections.update({ DatabaseConnections.id eq id }) {
                request.name?.let { name -> it[DatabaseConnections.name] = name }
                request.description?.let { desc -> it[DatabaseConnections.description] = desc }
                request.host?.let { host -> it[DatabaseConnections.host] = host }
                request.port?.let { port -> it[DatabaseConnections.port] = port }
                request.databaseName?.let { dbName -> it[DatabaseConnections.databaseName] = dbName }
                request.username?.let { user -> it[DatabaseConnections.username] = user }
                request.password?.let { pass -> it[DatabaseConnections.password] = aesEncryption.encrypt(pass) }
                request.sslEnabled?.let { ssl -> it[DatabaseConnections.sslEnabled] = ssl }
                request.sslIgnoreCertificate?.let { v -> it[DatabaseConnections.sslIgnoreCertificate] = v }
                request.connectionParams?.let { params -> it[DatabaseConnections.connectionParams] = params }
                it[DatabaseConnections.updatedAt] = now
            }
            if (count == 0) null
            else DatabaseConnections.selectAll().where { DatabaseConnections.id eq id }.singleOrNull()
                ?.toConnectionResponse()
        }

    suspend fun delete(id: UUID): Boolean = newSuspendedTransaction(db = database) {
        DatabaseConnections.deleteWhere { DatabaseConnections.id eq id } > 0
    }

    suspend fun findById(id: UUID): ConnectionResponse? = newSuspendedTransaction(db = database) {
        DatabaseConnections.selectAll().where { DatabaseConnections.id eq id }
            .singleOrNull()
            ?.toConnectionResponse()
    }

    suspend fun listAll(page: Int, size: Int): PaginatedResponse<ConnectionResponse> =
        newSuspendedTransaction(db = database) {
            val total = DatabaseConnections.selectAll().count()
            val items = DatabaseConnections.selectAll()
                .orderBy(DatabaseConnections.name)
                .limit(size)
                .offset(((page - 1) * size).toLong())
                .map { it.toConnectionResponse() }
            PaginatedResponse(items = items, page = page, size = size, total = total)
        }

    suspend fun testConnection(id: UUID): TestConnectionResponse = newSuspendedTransaction(db = database) {
        val row = DatabaseConnections.selectAll().where { DatabaseConnections.id eq id }.singleOrNull()
            ?: return@newSuspendedTransaction TestConnectionResponse(false, "Connection not found")

        val dbType = row[DatabaseConnections.dbType]
        val host = row[DatabaseConnections.host]
        val port = row[DatabaseConnections.port]
        val dbName = row[DatabaseConnections.databaseName]
        val username = row[DatabaseConnections.username]
        val encryptedPassword = row[DatabaseConnections.password]
        val password = aesEncryption.decrypt(encryptedPassword)
        val sslEnabled = row[DatabaseConnections.sslEnabled]
        val sslIgnoreCert = row[DatabaseConnections.sslIgnoreCertificate]

        val jdbcUrl = buildJdbcUrl(dbType, host, port, dbName, sslEnabled, sslIgnoreCert)

        try {
            DriverManager.setLoginTimeout(5)
            val connection = DriverManager.getConnection(jdbcUrl, username, password)
            connection.use {
                val valid = it.isValid(5)
                if (valid) {
                    // Update health status
                    val now = Clock.System.now()
                    DatabaseConnections.update({ DatabaseConnections.id eq row[DatabaseConnections.id] }) { stmt ->
                        stmt[healthStatus] = "HEALTHY"
                        stmt[lastHealthCheck] = now
                        stmt[updatedAt] = now
                    }
                    TestConnectionResponse(true, "Connection successful")
                } else {
                    TestConnectionResponse(false, "Connection established but validation failed")
                }
            }
        } catch (e: Exception) {
            val now = Clock.System.now()
            DatabaseConnections.update({ DatabaseConnections.id eq row[DatabaseConnections.id] }) { stmt ->
                stmt[healthStatus] = "UNREACHABLE"
                stmt[lastHealthCheck] = now
                stmt[updatedAt] = now
            }
            logger.warn("Connection test failed for $id: ${e.message}")
            TestConnectionResponse(false, "Connection failed: ${e.message}")
        }
    }

    suspend fun getHealth(id: UUID): HealthResponse? = newSuspendedTransaction(db = database) {
        DatabaseConnections.selectAll().where { DatabaseConnections.id eq id }
            .singleOrNull()
            ?.let {
                HealthResponse(
                    status = it[DatabaseConnections.healthStatus],
                    lastCheck = it[DatabaseConnections.lastHealthCheck]?.toString(),
                )
            }
    }

    private fun buildJdbcUrl(dbType: String, host: String, port: Int, databaseName: String, sslEnabled: Boolean, sslIgnoreCert: Boolean): String =
        when (dbType.uppercase()) {
            "POSTGRESQL" -> {
                val base = "jdbc:postgresql://$host:$port/$databaseName"
                val params = mutableListOf<String>()
                if (sslEnabled) {
                    params.add("ssl=true")
                    if (sslIgnoreCert) {
                        params.add("sslmode=require")
                        params.add("sslfactory=org.postgresql.ssl.NonValidatingFactory")
                    }
                }
                if (params.isNotEmpty()) "$base?${params.joinToString("&")}" else base
            }
            "MYSQL" -> {
                val base = "jdbc:mysql://$host:$port/$databaseName"
                val params = mutableListOf<String>()
                if (sslEnabled) {
                    params.add("useSSL=true")
                    params.add("requireSSL=true")
                    if (sslIgnoreCert) {
                        params.add("verifyServerCertificate=false")
                    }
                }
                if (params.isNotEmpty()) "$base?${params.joinToString("&")}" else base
            }
            "SQLSERVER" -> {
                val base = "jdbc:sqlserver://$host:$port;databaseName=$databaseName"
                val params = mutableListOf<String>()
                if (sslEnabled) {
                    params.add("encrypt=true")
                    if (sslIgnoreCert) params.add("trustServerCertificate=true")
                } else {
                    params.add("encrypt=false")
                }
                "$base;${params.joinToString(";")}"
            }
            else -> throw IllegalArgumentException("Unsupported database type: $dbType")
        }
}
