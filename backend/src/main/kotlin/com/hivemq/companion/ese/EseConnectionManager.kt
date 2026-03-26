package com.hivemq.companion.ese

import com.hivemq.companion.config.DatabaseType
import com.hivemq.companion.config.PoolConfig
import com.hivemq.companion.crypto.AesEncryption
import com.hivemq.companion.db.tables.DatabaseConnections
import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

class EseConnectionManager(
    private val poolConfig: PoolConfig,
    private val companionDatabase: Database,
    private val aesEncryption: AesEncryption
) {
    private val pools = ConcurrentHashMap<UUID, HikariDataSource>()
    private val databases = ConcurrentHashMap<UUID, Database>()
    private val lastAccessed = ConcurrentHashMap<UUID, Long>()

    fun getDatabase(connectionId: UUID): Database {
        lastAccessed[connectionId] = System.currentTimeMillis()

        val existing = pools[connectionId]
        if (existing != null && !existing.isClosed) {
            return databases[connectionId]!!
        }

        // Remove stale entries if pool was closed
        if (existing != null && existing.isClosed) {
            pools.remove(connectionId)
            databases.remove(connectionId)
        }

        // Guard against total connection limit
        enforceMaxTotal()

        // Look up connection config from companion DB
        val config = transaction(companionDatabase) {
            DatabaseConnections.selectAll()
                .where { DatabaseConnections.id eq connectionId }
                .singleOrNull()
                ?: throw IllegalArgumentException("Connection $connectionId not found")
        }

        val dbType = DatabaseType.fromString(config[DatabaseConnections.dbType])
        val host = config[DatabaseConnections.host]
        val port = config[DatabaseConnections.port]
        val databaseName = config[DatabaseConnections.databaseName]
        val username = config[DatabaseConnections.username]
        val encryptedPassword = config[DatabaseConnections.password]
        val password = aesEncryption.decrypt(encryptedPassword)

        val jdbcUrl = buildJdbcUrl(dbType, host, port, databaseName)

        val hikariConfig = HikariConfig().apply {
            this.jdbcUrl = jdbcUrl
            this.username = username
            this.password = password
            this.driverClassName = dbType.driverClassName
            this.maximumPoolSize = poolConfig.maxPerDb
            this.connectionTimeout = poolConfig.acquireTimeoutSeconds * 1000L
            this.idleTimeout = poolConfig.idleTimeoutMinutes * 60 * 1000L
            this.poolName = "ese-pool-$connectionId"
        }

        val dataSource = HikariDataSource(hikariConfig)
        pools[connectionId] = dataSource
        val db = Database.connect(dataSource)
        databases[connectionId] = db
        lastAccessed[connectionId] = System.currentTimeMillis()

        return db
    }

    fun removePool(connectionId: UUID) {
        pools.remove(connectionId)?.close()
        databases.remove(connectionId)
        lastAccessed.remove(connectionId)
    }

    fun closeAll() {
        pools.keys.toList().forEach { removePool(it) }
    }

    fun evictIdle() {
        val cutoff = System.currentTimeMillis() - poolConfig.idleTimeoutMinutes * 60 * 1000L
        lastAccessed.entries
            .filter { it.value < cutoff }
            .forEach { removePool(it.key) }
    }

    fun getActivePoolCount(): Int = pools.count { !it.value.isClosed }

    fun getTotalConnectionCount(): Int =
        pools.values.filter { !it.isClosed }.sumOf { it.maximumPoolSize }

    private fun enforceMaxTotal() {
        if (getTotalConnectionCount() + poolConfig.maxPerDb > poolConfig.maxTotal) {
            evictIdle()
            if (getTotalConnectionCount() + poolConfig.maxPerDb > poolConfig.maxTotal) {
                throw IllegalStateException(
                    "Cannot create new pool: total connection limit of ${poolConfig.maxTotal} would be exceeded"
                )
            }
        }
    }

    private fun buildJdbcUrl(dbType: DatabaseType, host: String, port: Int, name: String): String =
        when (dbType) {
            DatabaseType.POSTGRESQL -> "jdbc:postgresql://$host:$port/$name"
            DatabaseType.MYSQL -> "jdbc:mysql://$host:$port/$name"
            DatabaseType.SQLSERVER -> "jdbc:sqlserver://$host:$port;databaseName=$name;encrypt=true;trustServerCertificate=true"
        }
}
