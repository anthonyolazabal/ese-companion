package com.hivemq.companion.db

import com.hivemq.companion.config.DatabaseConfig
import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.flywaydb.core.Flyway
import org.jetbrains.exposed.sql.Database
import org.slf4j.LoggerFactory
import javax.sql.DataSource

class CompanionDatabase private constructor(
    val dataSource: HikariDataSource,
    migrationLocations: Array<String> = arrayOf("classpath:db/migration"),
) {

    private val logger = LoggerFactory.getLogger(CompanionDatabase::class.java)

    val database: Database

    init {
        runMigrations(migrationLocations)
        database = Database.connect(dataSource)
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

    private fun runMigrations(locations: Array<String>) {
        logger.info("Running Flyway migrations...")
        val flyway = Flyway.configure()
            .dataSource(dataSource)
            .locations(*locations)
            .baselineOnMigrate(true)
            .load()
        val result = flyway.migrate()
        logger.info("Flyway migrations completed: ${result.migrationsExecuted} migration(s) executed")
    }

    fun close() {
        dataSource.close()
    }

    companion object {
        /**
         * Create a CompanionDatabase for testing with a custom JDBC URL and driver.
         */
        fun createForTest(
            jdbcUrl: String,
            driver: String,
            migrationLocations: Array<String> = arrayOf("classpath:db/migration"),
        ): CompanionDatabase {
            val ds = createHikariDataSource(
                jdbcUrl = jdbcUrl,
                driverClassName = driver,
                username = "sa",
                password = "",
                poolName = "companion-db-test-pool-${System.nanoTime()}",
            )
            return CompanionDatabase(ds, migrationLocations)
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
                this.idleTimeout = 600_000 // 10 minutes
                this.connectionTimeout = 5_000 // 5 seconds
                this.maxLifetime = 1_800_000 // 30 minutes
                this.poolName = poolName
            }
            return HikariDataSource(hikariConfig)
        }
    }
}
