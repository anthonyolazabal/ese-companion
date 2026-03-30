package com.hivemq.companion.db

import com.hivemq.companion.config.DatabaseConfig
import com.hivemq.companion.db.tables.ApiKeys
import com.hivemq.companion.db.tables.AuditLogs
import com.hivemq.companion.db.tables.CompanionUsers
import com.hivemq.companion.db.tables.DatabaseConnections
import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction
import org.slf4j.LoggerFactory

class CompanionDatabase private constructor(
    val dataSource: HikariDataSource,
) {

    private val logger = LoggerFactory.getLogger(CompanionDatabase::class.java)

    val database: Database

    init {
        database = Database.connect(dataSource)
        createSchema()
        logger.info("Companion database initialized successfully")
    }

    constructor(config: DatabaseConfig) : this(
        dataSource = createHikariDataSource(
            jdbcUrl = config.jdbcUrl,
            driverClassName = config.driverClassName,
            username = config.user,
            password = config.password,
            poolName = "companion-db-pool",
        )
    )

    private fun createSchema() {
        logger.info("Creating/updating companion database schema...")
        transaction(database) {
            SchemaUtils.createMissingTablesAndColumns(
                CompanionUsers,
                DatabaseConnections,
                ApiKeys,
                AuditLogs,
            )
        }
        logger.info("Companion database schema is up to date")
    }

    fun close() {
        dataSource.close()
    }

    companion object {
        fun createForTest(
            jdbcUrl: String,
            driver: String,
        ): CompanionDatabase {
            val ds = createHikariDataSource(
                jdbcUrl = jdbcUrl,
                driverClassName = driver,
                username = "sa",
                password = "",
                poolName = "companion-db-test-pool-${System.nanoTime()}",
            )
            return CompanionDatabase(ds)
        }

        private fun createHikariDataSource(
            jdbcUrl: String,
            driverClassName: String,
            username: String,
            password: String,
            poolName: String,
        ): HikariDataSource {
            val hikariConfig = HikariConfig().apply {
                this.jdbcUrl = jdbcUrl
                this.driverClassName = driverClassName
                this.username = username
                this.password = password
                this.maximumPoolSize = 10
                this.minimumIdle = 2
                this.idleTimeout = 600_000
                this.connectionTimeout = 5_000
                this.maxLifetime = 1_800_000
                this.poolName = poolName
            }
            return HikariDataSource(hikariConfig)
        }
    }
}
