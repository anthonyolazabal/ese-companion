package com.hivemq.companion.config

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class AppConfigTest {
    @Test
    fun `loads required database config from env map`() {
        val env = mapOf(
            "ESE_COMPANION_DB_TYPE" to "postgresql",
            "ESE_COMPANION_DB_HOST" to "localhost",
            "ESE_COMPANION_DB_PORT" to "5432",
            "ESE_COMPANION_DB_NAME" to "companion",
            "ESE_COMPANION_DB_USER" to "admin",
            "ESE_COMPANION_DB_PASSWORD" to "secret",
            "ESE_COMPANION_JWT_SECRET" to "jwt-key-at-least-16ch",
            "ESE_COMPANION_ENCRYPTION_KEY" to "aes-key-1234567890123456"
        )
        val config = AppConfig.fromEnv(env)
        assertEquals(DatabaseType.POSTGRESQL, config.database.type)
        assertEquals("localhost", config.database.host)
        assertEquals(5432, config.database.port)
        assertEquals(8989, config.server.httpPort)
        assertEquals(9090, config.server.httpsPort)
    }

    @Test
    fun `throws on missing required env var`() {
        val env = mapOf("ESE_COMPANION_DB_TYPE" to "postgresql")
        assertFailsWith<IllegalStateException> {
            AppConfig.fromEnv(env)
        }
    }

    @Test
    fun `uses default values for optional config`() {
        val env = requiredEnvVars()
        val config = AppConfig.fromEnv(env)
        assertEquals(500, config.security.rateLimitPerMinute)
        assertEquals(10, config.pool.maxPerDb)
        assertEquals(50, config.pool.maxTotal)
        assertEquals(90, config.audit.retentionDays)
        assertEquals(60, config.healthCheck.intervalSeconds)
    }

    @Test
    fun `parses JDBC URL correctly for each database type`() {
        val pgConfig = AppConfig.fromEnv(requiredEnvVars("postgresql")).database
        assertEquals("jdbc:postgresql://localhost:5432/companion", pgConfig.jdbcUrl)

        val mysqlConfig = AppConfig.fromEnv(requiredEnvVars("mysql")).database
        assertEquals("jdbc:mysql://localhost:5432/companion", mysqlConfig.jdbcUrl)

        val mssqlConfig = AppConfig.fromEnv(requiredEnvVars("sqlserver")).database
        assert(mssqlConfig.jdbcUrl.startsWith("jdbc:sqlserver://localhost:5432"))
    }

    @Test
    fun `parses size values correctly`() {
        val env = requiredEnvVars() + ("ESE_COMPANION_MAX_REQUEST_SIZE" to "2MB")
        val config = AppConfig.fromEnv(env)
        assertEquals(2 * 1024 * 1024L, config.security.maxRequestSizeBytes)
    }

    private fun requiredEnvVars(dbType: String = "postgresql") = mapOf(
        "ESE_COMPANION_DB_TYPE" to dbType,
        "ESE_COMPANION_DB_HOST" to "localhost",
        "ESE_COMPANION_DB_PORT" to "5432",
        "ESE_COMPANION_DB_NAME" to "companion",
        "ESE_COMPANION_DB_USER" to "user",
        "ESE_COMPANION_DB_PASSWORD" to "pass",
        "ESE_COMPANION_JWT_SECRET" to "secret-at-least-16chars",
        "ESE_COMPANION_ENCRYPTION_KEY" to "0123456789abcdef"
    )
}
