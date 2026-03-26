package com.hivemq.companion.service

import com.hivemq.companion.config.DatabaseType
import com.hivemq.companion.crypto.AesEncryption
import com.hivemq.companion.db.tables.DatabaseConnections
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.datetime.Clock
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.update
import org.slf4j.LoggerFactory
import java.sql.DriverManager
import java.util.Properties
import java.util.UUID

class HealthCheckService(
    private val database: Database,
    private val aesEncryption: AesEncryption,
    private val intervalSeconds: Int = 60,
) {

    private val logger = LoggerFactory.getLogger(HealthCheckService::class.java)
    private var job: Job? = null

    companion object {
        const val STATUS_HEALTHY = "HEALTHY"
        const val STATUS_UNREACHABLE = "UNREACHABLE"
        const val STATUS_UNKNOWN = "UNKNOWN"
        private const val CONNECTION_TIMEOUT_SECONDS = 5
    }

    fun start(scope: CoroutineScope) {
        job = scope.launch {
            while (isActive) {
                try {
                    checkAllConnections()
                } catch (e: Exception) {
                    logger.error("Error during health check cycle", e)
                }
                delay(intervalSeconds * 1000L)
            }
        }
    }

    fun stop() {
        job?.cancel()
        job = null
    }

    val isRunning: Boolean
        get() = job?.isActive == true

    suspend fun checkAllConnections() {
        val connections = newSuspendedTransaction(db = database) {
            DatabaseConnections.selectAll().map { row ->
                ConnectionInfo(
                    id = row[DatabaseConnections.id],
                    dbType = row[DatabaseConnections.dbType],
                    host = row[DatabaseConnections.host],
                    port = row[DatabaseConnections.port],
                    databaseName = row[DatabaseConnections.databaseName],
                    username = row[DatabaseConnections.username],
                    encryptedPassword = row[DatabaseConnections.password],
                )
            }
        }

        logger.info("Running health check for ${connections.size} connection(s)")

        for (conn in connections) {
            val status = testConnection(conn)
            updateConnectionStatus(conn.id, status)
        }
    }

    suspend fun checkConnection(connectionId: UUID): String {
        val conn = newSuspendedTransaction(db = database) {
            DatabaseConnections.selectAll()
                .where { DatabaseConnections.id eq connectionId }
                .singleOrNull()
                ?.let { row ->
                    ConnectionInfo(
                        id = row[DatabaseConnections.id],
                        dbType = row[DatabaseConnections.dbType],
                        host = row[DatabaseConnections.host],
                        port = row[DatabaseConnections.port],
                        databaseName = row[DatabaseConnections.databaseName],
                        username = row[DatabaseConnections.username],
                        encryptedPassword = row[DatabaseConnections.password],
                    )
                }
        } ?: return STATUS_UNKNOWN

        val status = testConnection(conn)
        updateConnectionStatus(connectionId, status)
        return status
    }

    private fun testConnection(conn: ConnectionInfo): String {
        return try {
            val password = aesEncryption.decrypt(conn.encryptedPassword)
            val jdbcUrl = buildJdbcUrl(conn)

            val props = Properties().apply {
                setProperty("user", conn.username)
                setProperty("password", password)
                setProperty("loginTimeout", CONNECTION_TIMEOUT_SECONDS.toString())
                setProperty("connectTimeout", (CONNECTION_TIMEOUT_SECONDS * 1000).toString())
                setProperty("socketTimeout", (CONNECTION_TIMEOUT_SECONDS * 1000).toString())
            }

            DriverManager.setLoginTimeout(CONNECTION_TIMEOUT_SECONDS)
            DriverManager.getConnection(jdbcUrl, props).use { connection ->
                connection.createStatement().use { stmt ->
                    stmt.queryTimeout = CONNECTION_TIMEOUT_SECONDS
                    stmt.executeQuery("SELECT 1").close()
                }
            }

            logger.debug("Connection {} is HEALTHY", conn.id)
            STATUS_HEALTHY
        } catch (e: Exception) {
            logger.debug("Connection {} is UNREACHABLE: {}", conn.id, e.message)
            STATUS_UNREACHABLE
        }
    }

    private fun buildJdbcUrl(conn: ConnectionInfo): String {
        val type = DatabaseType.fromString(conn.dbType)
        return when (type) {
            DatabaseType.POSTGRESQL -> "jdbc:postgresql://${conn.host}:${conn.port}/${conn.databaseName}"
            DatabaseType.MYSQL -> "jdbc:mysql://${conn.host}:${conn.port}/${conn.databaseName}"
            DatabaseType.SQLSERVER -> "jdbc:sqlserver://${conn.host}:${conn.port};databaseName=${conn.databaseName};encrypt=true;trustServerCertificate=true"
        }
    }

    private suspend fun updateConnectionStatus(connectionId: UUID, status: String) {
        val now = Clock.System.now()
        newSuspendedTransaction(db = database) {
            DatabaseConnections.update({ DatabaseConnections.id eq connectionId }) {
                it[healthStatus] = status
                it[lastHealthCheck] = now
            }
        }
    }

    private data class ConnectionInfo(
        val id: UUID,
        val dbType: String,
        val host: String,
        val port: Int,
        val databaseName: String,
        val username: String,
        val encryptedPassword: String,
    )
}
