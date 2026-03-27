package com.hivemq.companion.config

enum class DatabaseType(val jdbcPrefix: String, val driverClassName: String) {
    POSTGRESQL("jdbc:postgresql", "org.postgresql.Driver"),
    MYSQL("jdbc:mysql", "com.mysql.cj.jdbc.Driver"),
    SQLSERVER("jdbc:sqlserver", "com.microsoft.sqlserver.jdbc.SQLServerDriver");

    companion object {
        fun fromString(value: String): DatabaseType = when (value.lowercase()) {
            "postgresql", "postgres" -> POSTGRESQL
            "mysql" -> MYSQL
            "sqlserver", "mssql" -> SQLSERVER
            else -> throw IllegalArgumentException("Unsupported database type: $value")
        }
    }
}

data class DatabaseConfig(
    val type: DatabaseType,
    val host: String,
    val port: Int,
    val name: String,
    val user: String,
    val password: String,
) {
    val jdbcUrl: String
        get() = when (type) {
            DatabaseType.POSTGRESQL -> "jdbc:postgresql://$host:$port/$name"
            DatabaseType.MYSQL -> "jdbc:mysql://$host:$port/$name"
            DatabaseType.SQLSERVER -> "jdbc:sqlserver://$host:$port;databaseName=$name;encrypt=true;trustServerCertificate=true"
        }

    val driverClassName: String get() = type.driverClassName
}

data class ServerConfig(
    val httpPort: Int = 8989,
    val httpsPort: Int = 9090,
    val httpsJksPath: String? = null,
    val httpsPassword: String? = null,
    val httpsPkPassword: String? = null,
)

data class SecurityConfig(
    val jwtSecret: String,
    val encryptionKey: String,
    val rateLimitPerMinute: Int = 500,
    val corsOrigins: List<String> = emptyList(),
    val maxRequestSizeBytes: Long = 1L * 1024 * 1024,
)

data class PoolConfig(
    val maxPerDb: Int = 10,
    val maxTotal: Int = 50,
    val idleTimeoutMinutes: Int = 10,
    val acquireTimeoutSeconds: Int = 5,
)

data class AdminSeedConfig(
    val username: String? = null,
    val password: String? = null,
    val email: String? = null,
)

data class AuditConfig(
    val retentionDays: Int = 90,
)

data class HealthCheckConfig(
    val intervalSeconds: Int = 60,
)

data class AppConfig(
    val database: DatabaseConfig,
    val server: ServerConfig,
    val security: SecurityConfig,
    val pool: PoolConfig,
    val adminSeed: AdminSeedConfig,
    val audit: AuditConfig,
    val healthCheck: HealthCheckConfig,
) {
    companion object {
        fun fromEnv(env: Map<String, String> = System.getenv()): AppConfig {
            fun required(key: String): String =
                env[key] ?: throw IllegalStateException("Missing required environment variable: $key")

            fun optional(key: String): String? = env[key]
            fun optionalInt(key: String, default: Int): Int =
                env[key]?.toIntOrNull() ?: default

            val database = DatabaseConfig(
                type = DatabaseType.fromString(required("ESE_COMPANION_DB_TYPE")),
                host = required("ESE_COMPANION_DB_HOST"),
                port = required("ESE_COMPANION_DB_PORT").toInt(),
                name = required("ESE_COMPANION_DB_NAME"),
                user = required("ESE_COMPANION_DB_USER"),
                password = required("ESE_COMPANION_DB_PASSWORD"),
            )

            val server = ServerConfig(
                httpPort = optionalInt("ESE_COMPANION_HTTP_PORT", 8989),
                httpsPort = optionalInt("ESE_COMPANION_HTTPS_PORT", 9090),
                httpsJksPath = optional("ESE_COMPANION_HTTPS_JKS_PATH"),
                httpsPassword = optional("ESE_COMPANION_HTTPS_PASSWORD"),
                httpsPkPassword = optional("ESE_COMPANION_HTTPS_PK_PASSWORD"),
            )

            val security = SecurityConfig(
                jwtSecret = required("ESE_COMPANION_JWT_SECRET"),
                encryptionKey = required("ESE_COMPANION_ENCRYPTION_KEY"),
                rateLimitPerMinute = optionalInt("ESE_COMPANION_RATE_LIMIT", 500),
                corsOrigins = optional("ESE_COMPANION_CORS_ORIGINS")
                    ?.split(",")
                    ?.map { it.trim() }
                    ?.filter { it.isNotEmpty() }
                    ?: emptyList(),
                maxRequestSizeBytes = optional("ESE_COMPANION_MAX_REQUEST_SIZE")
                    ?.let { parseSize(it) }
                    ?: (1L * 1024 * 1024),
            )

            val pool = PoolConfig(
                maxPerDb = optionalInt("ESE_COMPANION_POOL_MAX_PER_DB", 10),
                maxTotal = optionalInt("ESE_COMPANION_POOL_MAX_TOTAL", 50),
                idleTimeoutMinutes = optionalInt("ESE_COMPANION_POOL_IDLE_TIMEOUT", 10),
                acquireTimeoutSeconds = optionalInt("ESE_COMPANION_POOL_ACQUIRE_TIMEOUT", 5),
            )

            val adminSeed = AdminSeedConfig(
                username = optional("ESE_COMPANION_ADMIN_USERNAME"),
                password = optional("ESE_COMPANION_ADMIN_PASSWORD"),
                email = optional("ESE_COMPANION_ADMIN_EMAIL"),
            )

            val audit = AuditConfig(
                retentionDays = optionalInt("ESE_COMPANION_AUDIT_RETENTION_DAYS", 90),
            )

            val healthCheck = HealthCheckConfig(
                intervalSeconds = optionalInt("ESE_COMPANION_HEALTH_CHECK_INTERVAL", 60),
            )

            return AppConfig(
                database = database,
                server = server,
                security = security,
                pool = pool,
                adminSeed = adminSeed,
                audit = audit,
                healthCheck = healthCheck,
            )
        }

        private fun parseSize(value: String): Long {
            val trimmed = value.trim().uppercase()
            return when {
                trimmed.endsWith("GB") -> trimmed.removeSuffix("GB").trim().toLong() * 1024 * 1024 * 1024
                trimmed.endsWith("MB") -> trimmed.removeSuffix("MB").trim().toLong() * 1024 * 1024
                trimmed.endsWith("KB") -> trimmed.removeSuffix("KB").trim().toLong() * 1024
                trimmed.endsWith("B") -> trimmed.removeSuffix("B").trim().toLong()
                else -> trimmed.toLong()
            }
        }
    }
}
