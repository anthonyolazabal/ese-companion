# ESE Companion v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build ESE Companion v2 — a Kotlin/React application for centrally managing multiple HiveMQ ESE databases with local user management, API keys, and audit logging.

**Architecture:** Single Ktor monolith serving a React SPA and REST API. Companion database (PostgreSQL/MySQL/SQL Server) stores users, connections, API keys, and audit logs. Dynamic connection pools connect to N ESE databases. CryptoService reimplements all 6 ESE hash algorithms in Kotlin via BouncyCastle.

**Tech Stack:** Kotlin + Ktor + Exposed ORM + BouncyCastle (backend), React 19 + Chakra UI 3 + TanStack Router/Query/Table (frontend), Gradle + Vite, Docker + Helm

**Reference documents:**
- PRD: `docs/PRD.md`
- ESE schemas: `references/mysql_create.sql`, `references/postgresql_create.sql`, `references/mssql_create.sql`
- Default inserts: `references/insert/default_permissions_insert.sql`, `references/insert/default_roles_insert.sql`
- Crypto reference: `/Users/anthonyolazabal/Projects/devs/hivemq-ese-helper/src/main/java/com/hivemq/extensions/security/crypto/`
- UI template: `/Users/anthonyolazabal/Projects/devs/hivemq-template-ui/`
- Archived v1: `ArchiveVersion1/`

---

## Phase 1: Project Scaffolding

> All tasks in this phase can run in **parallel** — they have no dependencies on each other.

---

### Task 1.1: Backend — Gradle Project Setup

**Files:**
- Create: `backend/build.gradle.kts`
- Create: `backend/settings.gradle.kts`
- Create: `backend/gradle/libs.versions.toml`
- Create: `backend/src/main/kotlin/com/hivemq/companion/Application.kt`
- Create: `backend/src/main/resources/application.conf`
- Create: `backend/src/test/kotlin/com/hivemq/companion/ApplicationTest.kt`

- [ ] **Step 1: Initialize Gradle Kotlin project**

Create `backend/settings.gradle.kts`:
```kotlin
rootProject.name = "ese-companion"
```

Create `backend/gradle/libs.versions.toml` with version catalog:
```toml
[versions]
kotlin = "2.1.0"
ktor = "3.1.1"
exposed = "0.58.0"
hikari = "6.2.1"
bouncycastle = "1.80"
logback = "1.5.16"
kompendium = "4.0.0"
postgresql = "42.7.5"
mysql = "9.2.0"
mssql = "12.8.1.jre11"
jbcrypt = "0.4"
flyway = "11.3.4"
kotlinx-serialization = "1.8.0"
kotlinx-datetime = "0.6.1"

[libraries]
ktor-server-core = { module = "io.ktor:ktor-server-core", version.ref = "ktor" }
ktor-server-netty = { module = "io.ktor:ktor-server-netty", version.ref = "ktor" }
ktor-server-content-negotiation = { module = "io.ktor:ktor-server-content-negotiation", version.ref = "ktor" }
ktor-serialization-kotlinx-json = { module = "io.ktor:ktor-serialization-kotlinx-json", version.ref = "ktor" }
ktor-server-auth = { module = "io.ktor:ktor-server-auth", version.ref = "ktor" }
ktor-server-auth-jwt = { module = "io.ktor:ktor-server-auth-jwt", version.ref = "ktor" }
ktor-server-cors = { module = "io.ktor:ktor-server-cors", version.ref = "ktor" }
ktor-server-status-pages = { module = "io.ktor:ktor-server-status-pages", version.ref = "ktor" }
ktor-server-rate-limit = { module = "io.ktor:ktor-server-rate-limit", version.ref = "ktor" }
ktor-server-call-logging = { module = "io.ktor:ktor-server-call-logging", version.ref = "ktor" }
ktor-server-default-headers = { module = "io.ktor:ktor-server-default-headers", version.ref = "ktor" }
ktor-server-tls = { module = "io.ktor:ktor-network-tls-certificates", version.ref = "ktor" }
ktor-server-test = { module = "io.ktor:ktor-server-test-host", version.ref = "ktor" }
exposed-core = { module = "org.jetbrains.exposed:exposed-core", version.ref = "exposed" }
exposed-dao = { module = "org.jetbrains.exposed:exposed-dao", version.ref = "exposed" }
exposed-jdbc = { module = "org.jetbrains.exposed:exposed-jdbc", version.ref = "exposed" }
exposed-json = { module = "org.jetbrains.exposed:exposed-json", version.ref = "exposed" }
exposed-kotlin-datetime = { module = "org.jetbrains.exposed:exposed-kotlin-datetime", version.ref = "exposed" }
hikari = { module = "com.zaxxer:HikariCP", version.ref = "hikari" }
bouncycastle = { module = "org.bouncycastle:bcpkix-jdk18on", version.ref = "bouncycastle" }
logback = { module = "ch.qos.logback:logback-classic", version.ref = "logback" }
kompendium-core = { module = "io.bkbn:kompendium-core", version.ref = "kompendium" }
postgresql = { module = "org.postgresql:postgresql", version.ref = "postgresql" }
mysql = { module = "com.mysql:mysql-connector-j", version.ref = "mysql" }
mssql = { module = "com.microsoft.sqlserver:mssql-jdbc", version.ref = "mssql" }
jbcrypt = { module = "org.mindrot:jbcrypt", version.ref = "jbcrypt" }
flyway-core = { module = "org.flywaydb:flyway-core", version.ref = "flyway" }
flyway-postgresql = { module = "org.flywaydb:flyway-database-postgresql", version.ref = "flyway" }
flyway-mysql = { module = "org.flywaydb:flyway-mysql", version.ref = "flyway" }
flyway-sqlserver = { module = "org.flywaydb:flyway-database-sqlserver", version.ref = "flyway" }
kotlinx-serialization-json = { module = "org.jetbrains.kotlinx:kotlinx-serialization-json", version.ref = "kotlinx-serialization" }
kotlinx-datetime = { module = "org.jetbrains.kotlinx:kotlinx-datetime", version.ref = "kotlinx-datetime" }
kotlin-test = { module = "org.jetbrains.kotlin:kotlin-test", version.ref = "kotlin" }

[plugins]
kotlin-jvm = { id = "org.jetbrains.kotlin.jvm", version.ref = "kotlin" }
kotlin-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
ktor = { id = "io.ktor.plugin", version.ref = "ktor" }
shadow = { id = "com.gradleup.shadow", version = "9.0.0-beta4" }
```

Create `backend/build.gradle.kts`:
```kotlin
plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.ktor)
    alias(libs.plugins.shadow)
}

group = "com.hivemq"
version = "2.0.0"

application {
    mainClass.set("com.hivemq.companion.ApplicationKt")
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(libs.ktor.server.core)
    implementation(libs.ktor.server.netty)
    implementation(libs.ktor.server.content.negotiation)
    implementation(libs.ktor.serialization.kotlinx.json)
    implementation(libs.ktor.server.auth)
    implementation(libs.ktor.server.auth.jwt)
    implementation(libs.ktor.server.cors)
    implementation(libs.ktor.server.status.pages)
    implementation(libs.ktor.server.rate.limit)
    implementation(libs.ktor.server.call.logging)
    implementation(libs.ktor.server.default.headers)
    implementation(libs.ktor.server.tls)
    implementation(libs.exposed.core)
    implementation(libs.exposed.dao)
    implementation(libs.exposed.jdbc)
    implementation(libs.exposed.json)
    implementation(libs.exposed.kotlin.datetime)
    implementation(libs.hikari)
    implementation(libs.bouncycastle)
    implementation(libs.logback)
    implementation(libs.kompendium.core)
    implementation(libs.postgresql)
    implementation(libs.mysql)
    implementation(libs.mssql)
    implementation(libs.flyway.core)
    implementation(libs.flyway.postgresql)
    implementation(libs.flyway.mysql)
    implementation(libs.flyway.sqlserver)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.kotlinx.datetime)

    testImplementation(libs.ktor.server.test)
    testImplementation(libs.kotlin.test)
}

kotlin {
    jvmToolchain(21)
}
```

- [ ] **Step 2: Create minimal Ktor application**

Create `backend/src/main/resources/application.conf`:
```hocon
ktor {
    deployment {
        port = 8989
        port = ${?ESE_COMPANION_PORT}
    }
    application {
        modules = [ com.hivemq.companion.ApplicationKt.module ]
    }
}
```

Create `backend/src/main/kotlin/com/hivemq/companion/Application.kt`:
```kotlin
package com.hivemq.companion

import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun main() {
    embeddedServer(Netty, port = 8989) {
        module()
    }.start(wait = true)
}

fun Application.module() {
    routing {
        get("/health/live") {
            call.respondText("OK")
        }
    }
}
```

- [ ] **Step 3: Write test for health endpoint**

Create `backend/src/test/kotlin/com/hivemq/companion/ApplicationTest.kt`:
```kotlin
package com.hivemq.companion

import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import kotlin.test.Test
import kotlin.test.assertEquals

class ApplicationTest {
    @Test
    fun `health live returns OK`() = testApplication {
        application { module() }
        val response = client.get("/health/live")
        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals("OK", response.bodyAsText())
    }
}
```

- [ ] **Step 4: Verify build and test**

Run: `cd backend && ./gradlew build`
Expected: BUILD SUCCESSFUL, 1 test passed

- [ ] **Step 5: Commit**

```bash
git add backend/
git commit -m "feat: scaffold Kotlin/Ktor backend project with Gradle"
```

---

### Task 1.2: Backend — Configuration System

**Files:**
- Create: `backend/src/main/kotlin/com/hivemq/companion/config/AppConfig.kt`
- Create: `backend/src/test/kotlin/com/hivemq/companion/config/AppConfigTest.kt`

- [ ] **Step 1: Write failing test for config loading**

Create `backend/src/test/kotlin/com/hivemq/companion/config/AppConfigTest.kt`:
```kotlin
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
            "ESE_COMPANION_JWT_SECRET" to "jwt-key",
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
        assertEquals(100, config.security.rateLimitPerMinute)
        assertEquals(10, config.pool.maxPerDb)
        assertEquals(50, config.pool.maxTotal)
        assertEquals(90, config.audit.retentionDays)
        assertEquals(60, config.healthCheck.intervalSeconds)
    }

    private fun requiredEnvVars() = mapOf(
        "ESE_COMPANION_DB_TYPE" to "postgresql",
        "ESE_COMPANION_DB_HOST" to "localhost",
        "ESE_COMPANION_DB_PORT" to "5432",
        "ESE_COMPANION_DB_NAME" to "companion",
        "ESE_COMPANION_DB_USER" to "user",
        "ESE_COMPANION_DB_PASSWORD" to "pass",
        "ESE_COMPANION_JWT_SECRET" to "secret",
        "ESE_COMPANION_ENCRYPTION_KEY" to "0123456789abcdef"
    )
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && ./gradlew test`
Expected: FAIL — `AppConfig` class not found

- [ ] **Step 3: Implement AppConfig**

Create `backend/src/main/kotlin/com/hivemq/companion/config/AppConfig.kt`:
```kotlin
package com.hivemq.companion.config

import kotlinx.serialization.Serializable

enum class DatabaseType { POSTGRESQL, MYSQL, SQLSERVER }

@Serializable
data class DatabaseConfig(
    val type: DatabaseType,
    val host: String,
    val port: Int,
    val name: String,
    val user: String,
    val password: String
) {
    val jdbcUrl: String get() = when (type) {
        DatabaseType.POSTGRESQL -> "jdbc:postgresql://$host:$port/$name"
        DatabaseType.MYSQL -> "jdbc:mysql://$host:$port/$name"
        DatabaseType.SQLSERVER -> "jdbc:sqlserver://$host:$port;databaseName=$name;encrypt=true;trustServerCertificate=true"
    }

    val driverClassName: String get() = when (type) {
        DatabaseType.POSTGRESQL -> "org.postgresql.Driver"
        DatabaseType.MYSQL -> "com.mysql.cj.jdbc.Driver"
        DatabaseType.SQLSERVER -> "com.microsoft.sqlserver.jdbc.SQLServerDriver"
    }
}

data class ServerConfig(
    val httpPort: Int,
    val httpsPort: Int,
    val httpsJksPath: String?,
    val httpsPassword: String?,
    val httpsPkPassword: String?
)

data class SecurityConfig(
    val jwtSecret: String,
    val encryptionKey: String,
    val rateLimitPerMinute: Int,
    val corsOrigins: List<String>,
    val maxRequestSizeBytes: Long
)

data class PoolConfig(
    val maxPerDb: Int,
    val maxTotal: Int,
    val idleTimeoutMinutes: Int,
    val acquireTimeoutSeconds: Int
)

data class AdminSeedConfig(
    val username: String?,
    val password: String?,
    val email: String?
)

data class AuditConfig(
    val retentionDays: Int
)

data class HealthCheckConfig(
    val intervalSeconds: Int
)

data class AppConfig(
    val database: DatabaseConfig,
    val server: ServerConfig,
    val security: SecurityConfig,
    val pool: PoolConfig,
    val adminSeed: AdminSeedConfig,
    val audit: AuditConfig,
    val healthCheck: HealthCheckConfig
) {
    companion object {
        fun fromEnv(env: Map<String, String> = System.getenv()): AppConfig {
            fun required(key: String): String =
                env[key] ?: error("Required environment variable $key is not set")

            fun optional(key: String, default: String): String =
                env[key] ?: default

            return AppConfig(
                database = DatabaseConfig(
                    type = DatabaseType.valueOf(required("ESE_COMPANION_DB_TYPE").uppercase()),
                    host = required("ESE_COMPANION_DB_HOST"),
                    port = required("ESE_COMPANION_DB_PORT").toInt(),
                    name = required("ESE_COMPANION_DB_NAME"),
                    user = required("ESE_COMPANION_DB_USER"),
                    password = required("ESE_COMPANION_DB_PASSWORD")
                ),
                server = ServerConfig(
                    httpPort = optional("ESE_COMPANION_PORT", "8989").toInt(),
                    httpsPort = optional("ESE_COMPANION_HTTPS_PORT", "9090").toInt(),
                    httpsJksPath = env["ESE_COMPANION_HTTPS_JKS_PATH"],
                    httpsPassword = env["ESE_COMPANION_HTTPS_PASSWORD"],
                    httpsPkPassword = env["ESE_COMPANION_HTTPS_PK_PASSWORD"]
                ),
                security = SecurityConfig(
                    jwtSecret = required("ESE_COMPANION_JWT_SECRET"),
                    encryptionKey = required("ESE_COMPANION_ENCRYPTION_KEY"),
                    rateLimitPerMinute = optional("ESE_COMPANION_RATE_LIMIT", "100").toInt(),
                    corsOrigins = optional("ESE_COMPANION_CORS_ORIGINS", "")
                        .split(",").filter { it.isNotBlank() },
                    maxRequestSizeBytes = parseSize(optional("ESE_COMPANION_MAX_REQUEST_SIZE", "1MB"))
                ),
                pool = PoolConfig(
                    maxPerDb = optional("ESE_COMPANION_POOL_MAX_PER_DB", "10").toInt(),
                    maxTotal = optional("ESE_COMPANION_POOL_MAX_TOTAL", "50").toInt(),
                    idleTimeoutMinutes = optional("ESE_COMPANION_POOL_IDLE_TIMEOUT", "10").toInt(),
                    acquireTimeoutSeconds = optional("ESE_COMPANION_POOL_ACQUIRE_TIMEOUT", "5").toInt()
                ),
                adminSeed = AdminSeedConfig(
                    username = env["ESE_COMPANION_ADMIN_USER"],
                    password = env["ESE_COMPANION_ADMIN_PASSWORD"],
                    email = env["ESE_COMPANION_ADMIN_EMAIL"]
                ),
                audit = AuditConfig(
                    retentionDays = optional("ESE_COMPANION_AUDIT_RETENTION_DAYS", "90").toInt()
                ),
                healthCheck = HealthCheckConfig(
                    intervalSeconds = optional("ESE_COMPANION_HEALTH_CHECK_INTERVAL", "60").toInt()
                )
            )
        }

        private fun parseSize(value: String): Long {
            val trimmed = value.trim().uppercase()
            return when {
                trimmed.endsWith("MB") -> trimmed.removeSuffix("MB").trim().toLong() * 1024 * 1024
                trimmed.endsWith("KB") -> trimmed.removeSuffix("KB").trim().toLong() * 1024
                else -> trimmed.toLong()
            }
        }
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend && ./gradlew test`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/
git commit -m "feat: add configuration system with env var loading"
```

---

### Task 1.3: Frontend — Project Setup

**Files:**
- Create: `frontend/` (copy from hivemq-template-ui, adapt)
- Modify: `frontend/package.json` — rename, clean dependencies
- Modify: `frontend/src/routes/__root.tsx` — update branding
- Modify: `frontend/src/main.tsx` — clean up

- [ ] **Step 1: Copy template UI and rename**

```bash
cp -r /Users/anthonyolazabal/Projects/devs/hivemq-template-ui frontend
cd frontend
rm -rf .git node_modules
```

- [ ] **Step 2: Update package.json**

Update `name` to `"ese-companion-ui"`, update `version` to `"2.0.0"`. Remove HiveMQ-specific dependencies if not needed (`@hivemq/ui-library`, `@hivemq/ui-theme`). Keep: React 19, Chakra UI 3, TanStack Router/Query/Table, Vite, Biome, lucide-react.

- [ ] **Step 3: Clean template routes**

Remove template-specific routes (`clients.tsx`). Keep `__root.tsx` and `index.tsx`. Update branding in `__root.tsx` from "HiveMQ" to "ESE Companion". Update sidebar navigation to match PRD (Dashboard, Connections, Admin section, Settings).

- [ ] **Step 4: Install dependencies and verify build**

```bash
cd frontend && pnpm install && pnpm build
```
Expected: Build succeeds

- [ ] **Step 5: Verify dev server starts**

```bash
cd frontend && pnpm dev
```
Expected: Vite dev server starts on port 5175

- [ ] **Step 6: Commit**

```bash
git add frontend/
git commit -m "feat: scaffold React frontend from hivemq-template-ui"
```

---

## Phase 2: Companion Database & Core Services

> Tasks 2.1 and 2.2 can run in **parallel**. Task 2.3 depends on 2.1.

---

### Task 2.1: Companion Database Schema & Migrations

**Files:**
- Create: `backend/src/main/kotlin/com/hivemq/companion/db/CompanionDatabase.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/db/tables/CompanionUsers.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/db/tables/DatabaseConnections.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/db/tables/ApiKeys.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/db/tables/AuditLogs.kt`
- Create: `backend/src/main/resources/db/migration/V1__initial_schema.sql` (per dialect)
- Create: `backend/src/test/kotlin/com/hivemq/companion/db/CompanionDatabaseTest.kt`

- [ ] **Step 1: Define Exposed table objects**

Create Exposed table definitions for all companion tables: `CompanionUsers`, `DatabaseConnections`, `ApiKeys`, `AuditLogs`. Follow the schema exactly as defined in PRD section 2. Use `kotlinx-datetime` for timestamps, UUID for IDs, enums for role/db_type/health_status/actor_type/domain/action.

- [ ] **Step 2: Create Flyway migration scripts**

Create `V1__initial_schema.sql` migration for PostgreSQL. Create equivalent MySQL and SQL Server variants in subdirectories. Scripts must create all 4 tables with proper constraints, indexes, and defaults.

- [ ] **Step 3: Create CompanionDatabase connection manager**

Create `CompanionDatabase.kt` — initializes HikariCP connection pool from `AppConfig.database`, runs Flyway migrations on startup, provides `Database` instance for Exposed transactions.

- [ ] **Step 4: Write integration test**

Test that the database initializes, migrations run, and tables are created. Use an in-memory H2 database for testing (add H2 as `testImplementation` dependency).

- [ ] **Step 5: Run test and verify**

Run: `cd backend && ./gradlew test`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add backend/src/
git commit -m "feat: add companion database schema with Flyway migrations"
```

---

### Task 2.2: Crypto Service — All 6 ESE Algorithms

**Files:**
- Create: `backend/src/main/kotlin/com/hivemq/companion/crypto/CryptoService.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/crypto/HashedPassword.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/crypto/hashers/PlainHasher.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/crypto/hashers/Md5Hasher.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/crypto/hashers/Sha512Hasher.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/crypto/hashers/Pkcs5s2Hasher.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/crypto/hashers/BCryptHasher.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/crypto/hashers/Argon2idHasher.kt`
- Create: `backend/src/test/kotlin/com/hivemq/companion/crypto/CryptoServiceTest.kt`

- [ ] **Step 1: Write failing tests using known test vectors from ESE helper**

Create `CryptoServiceTest.kt` with test cases from the hivemq-ese-helper test suite:
```kotlin
// PLAIN
password="password" → Base64 of raw bytes

// MD5: password="password", salt="salt" (Base64: "c2FsdA=="), iterations=10
→ "FEZXLgoeDSdbbR7FHWHVsQ=="

// SHA512: password="password", salt="salt", iterations=10
→ "Oat8l5/qDJ/1u1iw1gCaGVlIkpEOwry8N+rLgD9guzFUa3/4+MszZLCN3tu7fvCKpGmI4WVkMvCj0l6M06WtWA=="

// PKCS5S2: password="password", salt="salt", iterations=10
→ "3tX9NqzigBkQgHCstazJ24kusEIw9x7Np3wNv5fjio0="

// BCRYPT: password="password", salt="salt", cost=10
→ "9QWSrHiFIROKU05wpfM66ejEgCqhDNTw"

// ARGON2ID_47104KB: password="password", salt="salt", iterations=1
→ "thTADJvVyfkjgiOW37TAJemBbXUaXj6/B3Zm8qI4Ytw="
```

- [ ] **Step 2: Implement each hasher**

Implement all 6 hashers following the exact algorithms from the ESE helper source code at `/Users/anthonyolazabal/Projects/devs/hivemq-ese-helper/src/main/java/com/hivemq/extensions/security/crypto/`. Use BouncyCastle for all digest operations. Critical implementation details:

- MD5/SHA512: `digest(salt + password)` then iterate `N-1` more times feeding hash back
- PKCS5S2: `PKCS5S2ParametersGenerator(SHA512Digest())` with 256-bit key size
- BCrypt: MD5(salt)→16 bytes, SHA512(password)→64 bytes, then `BCrypt.generate()`
- Argon2id: parse memory from algorithm name, parallelism=1, use `Argon2BytesGenerator`
- All Base64 via BouncyCastle's `org.bouncycastle.util.encoders.Base64`

- [ ] **Step 3: Implement CryptoService facade**

Create `CryptoService.kt` with `hashPassword()`, `generateSalt()`, and `verifyPassword()` methods that delegate to the appropriate hasher based on algorithm name.

- [ ] **Step 4: Run tests and verify all test vectors match**

Run: `cd backend && ./gradlew test --tests "*CryptoServiceTest*"`
Expected: All 6+ test cases PASS with exact Base64 matches

- [ ] **Step 5: Commit**

```bash
git add backend/src/
git commit -m "feat: implement CryptoService with all 6 ESE hash algorithms"
```

---

### Task 2.3: AES Encryption Service for Connection Passwords

**Files:**
- Create: `backend/src/main/kotlin/com/hivemq/companion/crypto/AesEncryption.kt`
- Create: `backend/src/test/kotlin/com/hivemq/companion/crypto/AesEncryptionTest.kt`

- [ ] **Step 1: Write failing test**

```kotlin
@Test
fun `encrypts and decrypts round-trip`() {
    val key = "0123456789abcdef0123456789abcdef" // 32 chars = 256-bit
    val aes = AesEncryption(key)
    val plaintext = "my-database-password"
    val encrypted = aes.encrypt(plaintext)
    assertNotEquals(plaintext, encrypted)
    assertEquals(plaintext, aes.decrypt(encrypted))
}
```

- [ ] **Step 2: Implement AES-GCM encryption**

Use AES-256-GCM with random IV. Store as `IV:ciphertext` Base64-encoded. Key derived from `ESE_COMPANION_ENCRYPTION_KEY` env var.

- [ ] **Step 3: Run tests**

Run: `cd backend && ./gradlew test --tests "*AesEncryptionTest*"`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add backend/src/
git commit -m "feat: add AES-GCM encryption for stored database passwords"
```

---

## Phase 3: Authentication & User Management

> Tasks 3.1 and 3.2 must be **sequential** (3.2 depends on 3.1). Task 3.3 (frontend login) can start once 3.1 is committed.

---

### Task 3.1: JWT Auth Service & Login Endpoint

**Files:**
- Create: `backend/src/main/kotlin/com/hivemq/companion/auth/JwtService.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/auth/AuthRoutes.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/auth/AuthMiddleware.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/service/UserService.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/dto/AuthDtos.kt`
- Create: `backend/src/test/kotlin/com/hivemq/companion/auth/AuthRoutesTest.kt`

- [ ] **Step 1: Write failing tests for login flow**

Test: POST `/api/v1/auth/login` with valid creds returns JWT + refresh token. Test: invalid creds returns 401. Test: expired token returns 401. Test: refresh endpoint returns new access token.

- [ ] **Step 2: Implement JwtService**

Generate/verify JWT tokens using `ktor-server-auth-jwt`. Access token: 60 min expiry. Refresh token: 7 days expiry. Include user ID, username, role in claims. Single session enforcement: store active session ID per user, invalidate old on new login.

- [ ] **Step 3: Implement UserService**

CRUD operations on `companion_users` table via Exposed. Password hashing with BCrypt (for companion users, not ESE). Admin seeding on first startup.

- [ ] **Step 4: Implement AuthRoutes**

`POST /api/v1/auth/login` — validate credentials, check lockout, issue tokens.
`POST /api/v1/auth/refresh` — validate refresh token, issue new access token.
`POST /api/v1/auth/logout` — add token to revocation list.

- [ ] **Step 5: Implement AuthMiddleware**

Ktor authentication plugin that validates JWT or API key (`X-API-Key` header) on all `/api/v1/*` routes except auth routes. Check revocation list. Extract user context (id, role) for downstream handlers.

- [ ] **Step 6: Implement brute force protection**

Track failed login attempts per username. Lock account after 5 failures. Exponential backoff (15/30/60 min cap).

- [ ] **Step 7: Run tests**

Run: `cd backend && ./gradlew test --tests "*AuthRoutesTest*"`
Expected: All tests PASS

- [ ] **Step 8: Commit**

```bash
git add backend/src/
git commit -m "feat: implement JWT auth with login, refresh, logout, brute force protection"
```

---

### Task 3.2: Companion User Management API

**Files:**
- Create: `backend/src/main/kotlin/com/hivemq/companion/routes/UserRoutes.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/dto/UserDtos.kt`
- Create: `backend/src/test/kotlin/com/hivemq/companion/routes/UserRoutesTest.kt`

- [ ] **Step 1: Write failing tests**

Test CRUD: list users (admin only), get user, create user, update user (including password reset), delete user. Test: non-admin gets 403.

- [ ] **Step 2: Implement UserRoutes**

All routes under `/api/v1/users`. Admin-only authorization check. CRUD operations via UserService. Password changes require current password (for self) or admin role (for others).

- [ ] **Step 3: Run tests and commit**

```bash
git add backend/src/
git commit -m "feat: add companion user management CRUD API"
```

---

### Task 3.3: Frontend — Login Page & Auth Context

**Files:**
- Create: `frontend/src/api/authApi.ts`
- Create: `frontend/src/auth/AuthContext.tsx`
- Create: `frontend/src/auth/useAuth.ts`
- Create: `frontend/src/routes/login.tsx`
- Modify: `frontend/src/routes/__root.tsx` — add auth guard

- [ ] **Step 1: Create auth API client**

Typed API functions for login, refresh, logout using fetch. Store tokens in memory (access) and httpOnly cookie or localStorage (refresh).

- [ ] **Step 2: Create AuthContext**

React context providing: `user`, `login()`, `logout()`, `isAuthenticated`, `role`. Token refresh on mount and before expiry.

- [ ] **Step 3: Create login page**

Chakra UI form with username/password fields, submit button, error handling. Redirect to `/` on success.

- [ ] **Step 4: Add auth guard to root route**

In `__root.tsx`, check auth state. Redirect to `/login` if not authenticated. Pass user context to child routes.

- [ ] **Step 5: Verify login flow works against running backend**

- [ ] **Step 6: Commit**

```bash
git add frontend/src/
git commit -m "feat: add login page with JWT auth flow"
```

---

## Phase 4: Connection Management & ESE Integration

> Tasks 4.1, 4.2, and 4.3 can run in **parallel**. Task 4.4 depends on 4.1 and 4.2.

---

### Task 4.1: Database Connection CRUD API

**Files:**
- Create: `backend/src/main/kotlin/com/hivemq/companion/service/ConnectionService.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/routes/ConnectionRoutes.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/dto/ConnectionDtos.kt`
- Create: `backend/src/test/kotlin/com/hivemq/companion/routes/ConnectionRoutesTest.kt`

- [ ] **Step 1: Write failing tests**

Test CRUD for connections (admin only). Test: connection password is encrypted at rest. Test: test connectivity endpoint. Test: non-admin gets 403.

- [ ] **Step 2: Implement ConnectionService**

CRUD on `database_connections` table. Encrypt password with AesEncryption before storing. Decrypt on read (never expose raw password in list endpoints — only in detail with admin role).

- [ ] **Step 3: Implement ConnectionRoutes**

All routes under `/api/v1/connections`. Admin-only. Include `POST /:connId/test` that attempts a JDBC connection and returns success/failure.

- [ ] **Step 4: Run tests and commit**

```bash
git add backend/src/
git commit -m "feat: add database connection management API with AES encryption"
```

---

### Task 4.2: Dynamic ESE Connection Pool Manager

**Files:**
- Create: `backend/src/main/kotlin/com/hivemq/companion/ese/EseConnectionManager.kt`
- Create: `backend/src/test/kotlin/com/hivemq/companion/ese/EseConnectionManagerTest.kt`

- [ ] **Step 1: Write failing tests**

Test: creates pool on first access. Test: reuses existing pool. Test: evicts idle pool. Test: respects max total connections. Test: different DB types (PG, MySQL, MSSQL) get correct JDBC URLs.

- [ ] **Step 2: Implement EseConnectionManager**

Manages a `ConcurrentHashMap<UUID, HikariDataSource>` of ESE connection pools. Lazy initialization — pool created on first `getDatabase(connId)` call. Configurable limits from `PoolConfig`. Background coroutine evicts idle pools.

- [ ] **Step 3: Run tests and commit**

```bash
git add backend/src/
git commit -m "feat: add dynamic ESE connection pool manager with lazy init and eviction"
```

---

### Task 4.3: Health Check Service

**Files:**
- Create: `backend/src/main/kotlin/com/hivemq/companion/service/HealthCheckService.kt`
- Create: `backend/src/test/kotlin/com/hivemq/companion/service/HealthCheckServiceTest.kt`

- [ ] **Step 1: Write failing tests**

Test: pings a connection and updates health_status. Test: marks unreachable on timeout. Test: scheduler runs at configured interval.

- [ ] **Step 2: Implement HealthCheckService**

Kotlin coroutine that runs every `healthCheck.intervalSeconds`. Iterates all `database_connections`, attempts a lightweight query (`SELECT 1`), updates `health_status` and `last_health_check` timestamp. 5-second timeout per connection.

- [ ] **Step 3: Run tests and commit**

```bash
git add backend/src/
git commit -m "feat: add periodic health check service for ESE connections"
```

---

### Task 4.4: ESE CRUD Routes — All 3 Domains

**Files:**
- Create: `backend/src/main/kotlin/com/hivemq/companion/ese/tables/EseTables.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/ese/service/EseUserService.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/ese/service/EseRoleService.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/ese/service/EsePermissionService.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/ese/service/EseAssociationService.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/ese/routes/EseMqttRoutes.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/ese/routes/EseCcRoutes.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/ese/routes/EseRestApiRoutes.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/ese/dto/EseDtos.kt`
- Create: `backend/src/test/kotlin/com/hivemq/companion/ese/routes/EseMqttRoutesTest.kt`

- [ ] **Step 1: Define Exposed table objects for ESE schemas**

Create Exposed table definitions that match the ESE database schemas from `references/`. Three sets of tables: MQTT (`users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `user_permissions`), CC (`cc_*`), REST API (`rest_api_*`). Note: MQTT permissions have topic-based fields; CC/REST API have `permission_string` + `description`.

- [ ] **Step 2: Implement ESE service layer**

Generic service classes parameterized by domain (mqtt/cc/rest-api) that perform CRUD on the appropriate tables via the dynamic connection pool. `EseUserService.create()` must call `CryptoService.hashPassword()` before inserting. Support pagination (`?page=&size=`) and search (`?search=`).

- [ ] **Step 3: Implement ESE routes for all 3 domains**

Routes under `/api/v1/ese/:connId/mqtt/...`, `/api/v1/ese/:connId/cc/...`, `/api/v1/ese/:connId/rest-api/...`. Authorization based on user role: `readonly` → GET only, `readwrite`/`admin` → full CRUD. Resolve connection pool via `EseConnectionManager.getDatabase(connId)`.

- [ ] **Step 4: Implement association routes**

User-role, role-permission, user-permission assignment/revocation endpoints for all 3 domains.

- [ ] **Step 5: Write tests for MQTT domain CRUD**

Test full CRUD cycle: create user (verify password is hashed), list users with pagination, update user, delete user. Test role and permission CRUD. Test association endpoints.

- [ ] **Step 6: Run tests and commit**

```bash
git add backend/src/
git commit -m "feat: add ESE CRUD routes for MQTT, CC, and REST API domains"
```

---

## Phase 5: API Keys, Audit Logs & Dashboard API

> Tasks 5.1, 5.2, and 5.3 can run in **parallel**.

---

### Task 5.1: API Key Management

**Files:**
- Create: `backend/src/main/kotlin/com/hivemq/companion/service/ApiKeyService.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/routes/ApiKeyRoutes.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/dto/ApiKeyDtos.kt`
- Create: `backend/src/test/kotlin/com/hivemq/companion/routes/ApiKeyRoutesTest.kt`

- [ ] **Step 1: Write failing tests**

Test: create key returns raw key once. Test: list keys shows prefix but not hash. Test: expired key rejected. Test: scopes restrict access. Test: key inherits owner role.

- [ ] **Step 2: Implement ApiKeyService**

Generate secure random key (`esc_` prefix + 32 random bytes Base64). Store BCrypt hash + 8-char prefix. Validate scope against owner's role. Check expiry on every auth attempt.

- [ ] **Step 3: Implement ApiKeyRoutes**

CRUD under `/api/v1/keys`. Users manage own keys. Admins can see all keys.

- [ ] **Step 4: Integrate API key auth into AuthMiddleware**

Check `X-API-Key` header alongside JWT. Resolve key → user → role → scopes.

- [ ] **Step 5: Run tests and commit**

```bash
git add backend/src/
git commit -m "feat: add API key management with scoped, expiring keys"
```

---

### Task 5.2: Audit Log Service & Routes

**Files:**
- Create: `backend/src/main/kotlin/com/hivemq/companion/service/AuditLogService.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/routes/AuditLogRoutes.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/dto/AuditLogDtos.kt`
- Create: `backend/src/test/kotlin/com/hivemq/companion/routes/AuditLogRoutesTest.kt`

- [ ] **Step 1: Implement AuditLogService**

`log()` method that inserts into `audit_logs` table. Called from all service methods (user CRUD, connection CRUD, ESE operations, auth events). Extracts actor info, IP, user agent from Ktor call context. Retention cleanup coroutine runs daily, deletes logs older than `audit.retentionDays`.

- [ ] **Step 2: Implement AuditLogRoutes**

`GET /api/v1/audit-logs` — admin only, filterable by actor, connection, domain, action, date range. Paginated. `GET /api/v1/audit-logs/:logId` — single entry with full details.

- [ ] **Step 3: Integrate audit logging into existing services**

Add `auditLogService.log()` calls to: AuthRoutes (login/logout), UserRoutes (CRUD), ConnectionRoutes (CRUD), EseRoutes (all CRUD operations), ApiKeyRoutes (CRUD).

- [ ] **Step 4: Run tests and commit**

```bash
git add backend/src/
git commit -m "feat: add audit logging service with retention and admin-only API"
```

---

### Task 5.3: Dashboard & Stats API

**Files:**
- Create: `backend/src/main/kotlin/com/hivemq/companion/routes/DashboardRoutes.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/dto/DashboardDtos.kt`
- Create: `backend/src/test/kotlin/com/hivemq/companion/routes/DashboardRoutesTest.kt`

- [ ] **Step 1: Implement dashboard endpoint**

`GET /api/v1/dashboard` — returns all connections with health status + summary stats (user/role/permission counts per domain). Aggregates data from companion DB (connections, health) and ESE DBs (entity counts).

- [ ] **Step 2: Implement per-connection stats**

`GET /api/v1/ese/:connId/stats` — returns user/role/permission counts for each domain (MQTT, CC, REST API) on the specified connection.

- [ ] **Step 3: Run tests and commit**

```bash
git add backend/src/
git commit -m "feat: add dashboard and per-connection stats API"
```

---

## Phase 6: Security Middleware & OpenAPI

> Tasks 6.1 and 6.2 can run in **parallel**.

---

### Task 6.1: Security Middleware (Rate Limiting, Headers, CORS)

**Files:**
- Create: `backend/src/main/kotlin/com/hivemq/companion/plugins/SecurityPlugins.kt`
- Modify: `backend/src/main/kotlin/com/hivemq/companion/Application.kt` — install plugins

- [ ] **Step 1: Implement rate limiting**

Use Ktor's `RateLimit` plugin. Global: 100 req/min per IP. Auth endpoints: 10 req/min per IP. Return 429 with `Retry-After` header.

- [ ] **Step 2: Implement security headers**

Use Ktor's `DefaultHeaders` plugin. Add CSP, X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy.

- [ ] **Step 3: Implement CORS**

Use Ktor's `CORS` plugin. Configure from `ESE_COMPANION_CORS_ORIGINS`. Default: same-origin.

- [ ] **Step 4: Implement request size limit**

Configure Ktor's content length limit from `ESE_COMPANION_MAX_REQUEST_SIZE`.

- [ ] **Step 5: Commit**

```bash
git add backend/src/
git commit -m "feat: add rate limiting, security headers, CORS, request size limits"
```

---

### Task 6.2: OpenAPI Spec Generation & Swagger UI

**Files:**
- Modify: `backend/src/main/kotlin/com/hivemq/companion/Application.kt` — install Kompendium
- Create: `backend/src/main/kotlin/com/hivemq/companion/plugins/OpenApiPlugin.kt`

- [ ] **Step 1: Configure Kompendium**

Install Kompendium plugin with API metadata (title, version, description, contact). Annotate all route handlers with `@KompendiumDoc` for request/response schemas.

- [ ] **Step 2: Add Swagger UI endpoint**

Serve Swagger UI at `/api/v1/docs` using `swagger-ui` webjars. Spec at `/api/v1/openapi.json`.

- [ ] **Step 3: Verify generated spec**

Start the application, fetch `/api/v1/openapi.json`, validate it covers all endpoints.

- [ ] **Step 4: Commit**

```bash
git add backend/src/
git commit -m "feat: add OpenAPI spec generation with Swagger UI"
```

---

## Phase 7: Frontend — Full UI

> Tasks 7.1 through 7.6 have some dependencies. 7.1 (API client) must be first. Then 7.2-7.6 can run in **parallel** (they only depend on 7.1).

---

### Task 7.1: Frontend — API Client Layer

**Files:**
- Create: `frontend/src/api/client.ts` — base fetch wrapper with auth headers
- Create: `frontend/src/api/connectionsApi.ts`
- Create: `frontend/src/api/eseApi.ts`
- Create: `frontend/src/api/usersApi.ts`
- Create: `frontend/src/api/apiKeysApi.ts`
- Create: `frontend/src/api/auditLogsApi.ts`
- Create: `frontend/src/api/dashboardApi.ts`
- Create: `frontend/src/api/types.ts` — shared TypeScript types/interfaces

- [ ] **Step 1: Create base API client**

Fetch wrapper that: attaches `Authorization: Bearer <token>` header, handles 401 (trigger refresh), handles errors uniformly, base URL from env var.

- [ ] **Step 2: Create typed API modules**

One file per domain with typed request/response functions matching all PRD endpoints. Use TanStack Query `queryKey` conventions.

- [ ] **Step 3: Create shared TypeScript types**

Interfaces for all DTOs: `User`, `Connection`, `ApiKey`, `AuditLogEntry`, `DashboardData`, `EseUser`, `EseRole`, `MqttPermission`, `CcPermission`, `RestApiPermission`, `PaginatedResponse<T>`.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/api/
git commit -m "feat: add typed API client layer for all endpoints"
```

---

### Task 7.2: Frontend — Dashboard Page

**Files:**
- Modify: `frontend/src/routes/index.tsx` — replace template with dashboard
- Create: `frontend/src/components/ConnectionCard.tsx`
- Create: `frontend/src/components/HealthDot.tsx`

- [ ] **Step 1: Create HealthDot component**

Small colored circle: green=HEALTHY, red=UNREACHABLE, gray=UNKNOWN.

- [ ] **Step 2: Create ConnectionCard component**

Card showing: connection name, health dot, DB type, entity counts (users/roles/permissions). Clickable → navigates to `/connections/:connId`.

- [ ] **Step 3: Build dashboard page**

Grid of ConnectionCards. "Add Connection" button (admin only). Recent audit log entries section (admin only). Uses `useQuery` to fetch `/api/v1/dashboard`.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/
git commit -m "feat: add dashboard page with connection cards and health status"
```

---

### Task 7.3: Frontend — Connection Detail & ESE Management

**Files:**
- Create: `frontend/src/routes/connections/$connId.tsx` — connection detail page
- Create: `frontend/src/routes/connections/$connId/settings.tsx`
- Create: `frontend/src/components/ese/EseUserTable.tsx`
- Create: `frontend/src/components/ese/EseRoleTable.tsx`
- Create: `frontend/src/components/ese/EsePermissionTable.tsx`
- Create: `frontend/src/components/ese/EseUserDrawer.tsx`
- Create: `frontend/src/components/ese/EseRoleDrawer.tsx`
- Create: `frontend/src/components/ese/EsePermissionDrawer.tsx`
- Create: `frontend/src/components/ese/AlgorithmPicker.tsx`
- Create: `frontend/src/components/DeleteConfirmModal.tsx`

- [ ] **Step 1: Create connection detail page**

Header with connection name, health dot, DB type, stats. Tabs: MQTT | Control Center | REST API. Per-tab: sub-tabs for Users | Roles | Permissions.

- [ ] **Step 2: Create ESE entity tables**

TanStack Table components for users, roles, permissions. Sortable columns, search filter, pagination. Action column with edit/delete buttons.

- [ ] **Step 3: Create ESE entity drawers**

Chakra UI Drawer for create/edit forms. `EseUserDrawer` includes: username, password, algorithm picker (PKCS5S2 default), iterations field (editable, default per algorithm), memory field (Argon2id only), warning badge for PLAIN/MD5. `EseRoleDrawer`: name, description. `EsePermissionDrawer`: topic-based fields (MQTT) or permission_string + description (CC/REST API).

- [ ] **Step 4: Create AlgorithmPicker component**

Dropdown with all 6 algorithms. On change: update default iterations. Show warning badge for PLAIN/MD5.

- [ ] **Step 5: Create DeleteConfirmModal**

Chakra UI Modal with "Are you sure?" message and confirm/cancel buttons.

- [ ] **Step 6: Create connection settings page (admin only)**

Edit connection form. Danger zone with delete button.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/
git commit -m "feat: add connection detail page with ESE entity management"
```

---

### Task 7.4: Frontend — Admin Section (Users, Connections, Audit Logs)

**Files:**
- Create: `frontend/src/routes/admin/users.tsx`
- Create: `frontend/src/routes/admin/audit-logs.tsx`
- Create: `frontend/src/components/admin/CompanionUserTable.tsx`
- Create: `frontend/src/components/admin/CompanionUserDrawer.tsx`
- Create: `frontend/src/components/admin/ConnectionManagementTable.tsx`
- Create: `frontend/src/components/admin/ConnectionDrawer.tsx`
- Create: `frontend/src/components/admin/AuditLogTable.tsx`
- Create: `frontend/src/components/admin/AuditLogDetailDrawer.tsx`

- [ ] **Step 1: Create companion user management page**

TanStack Table listing companion users (username, email, role, created_at). Create/edit drawer with role picker (admin/readwrite/readonly). Delete confirmation modal.

- [ ] **Step 2: Create connection management in admin section**

Table listing all connections with health, DB type, host. Create/edit drawer for adding/modifying connections. Test connection button in drawer.

- [ ] **Step 3: Create audit log page**

TanStack Table with filterable columns: actor, connection, domain, action, date range. Click row → AuditLogDetailDrawer showing full entry (actor info, resource details, JSON details, IP, user agent).

- [ ] **Step 4: Add admin route guards**

All `/admin/*` routes check user role === 'admin', redirect to `/` if not.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/
git commit -m "feat: add admin section with user management, connections, and audit logs"
```

---

### Task 7.5: Frontend — Settings & API Keys

**Files:**
- Create: `frontend/src/routes/settings.tsx`
- Create: `frontend/src/components/settings/ProfileForm.tsx`
- Create: `frontend/src/components/settings/ApiKeyTable.tsx`
- Create: `frontend/src/components/settings/ApiKeyCreateDrawer.tsx`

- [ ] **Step 1: Create settings page**

Two sections: Profile (change password form — requires current password) and API Keys.

- [ ] **Step 2: Create API key management**

Table of own keys (name, prefix, scopes, expires_at, last_used_at). Create drawer with name, scopes checkboxes, expiration date picker. On create: show raw key in a copyable field with warning "This will only be shown once". Delete/revoke with confirmation modal.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/
git commit -m "feat: add settings page with profile and API key management"
```

---

### Task 7.6: Frontend — Sidebar Navigation

**Files:**
- Modify: `frontend/src/routes/__root.tsx` — final sidebar implementation
- Create: `frontend/src/components/Sidebar.tsx`

- [ ] **Step 1: Create Sidebar component**

ESE Companion logo at top. Navigation items: Dashboard, Connections (with inline list of connections + health dots). Admin section (visible only for admin role): Users, Connections Mgmt, Audit Logs. Settings at bottom. Active state indicator. Collapsible.

- [ ] **Step 2: Integrate with root layout**

Update `__root.tsx` to use Sidebar + main content area layout. Dark/light mode toggle in header.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/
git commit -m "feat: finalize sidebar navigation with role-based sections"
```

---

## Phase 8: HTTPS, Static Serving & Docker

> Tasks 8.1 and 8.2 can run in **parallel**. Task 8.3 depends on both.

---

### Task 8.1: HTTPS Support & Static File Serving

**Files:**
- Modify: `backend/src/main/kotlin/com/hivemq/companion/Application.kt`
- Create: `backend/src/main/kotlin/com/hivemq/companion/plugins/HttpsPlugin.kt`

- [ ] **Step 1: Implement HTTPS with auto-generated cert**

If `ESE_COMPANION_HTTPS_JKS_PATH` is set → load JKS keystore. Otherwise → generate self-signed cert using Ktor's `generateCertificate()`. Start both HTTP (8989) and HTTPS (9090) connectors.

- [ ] **Step 2: Implement static file serving**

Serve React build output from `public/` directory. Fallback to `index.html` for SPA client-side routing (all non-API, non-health paths).

- [ ] **Step 3: Commit**

```bash
git add backend/src/
git commit -m "feat: add HTTPS support with auto-generated cert and SPA static serving"
```

---

### Task 8.2: Startup Sequence & Graceful Shutdown

**Files:**
- Modify: `backend/src/main/kotlin/com/hivemq/companion/Application.kt`

- [ ] **Step 1: Implement full startup sequence**

1. Load and validate config
2. Connect to companion DB
3. Run Flyway migrations
4. Seed admin if needed
5. Start health check scheduler
6. Start audit log retention cleanup scheduler
7. Start token revocation cleanup scheduler
8. Start HTTP + HTTPS servers

- [ ] **Step 2: Implement graceful shutdown**

On SIGTERM: stop accepting new requests, drain in-flight requests (30 second timeout), close all ESE connection pools, close companion DB pool, stop schedulers.

- [ ] **Step 3: Implement readiness probe**

`GET /health/ready` → returns 200 if companion DB is connected, 503 otherwise.

- [ ] **Step 4: Commit**

```bash
git add backend/src/
git commit -m "feat: implement full startup sequence with graceful shutdown"
```

---

### Task 8.3: Dockerfile

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`

- [ ] **Step 1: Create multi-stage Dockerfile**

```dockerfile
# Stage 1: Build backend
FROM gradle:8-jdk21 AS backend-build
WORKDIR /app
COPY backend/ .
RUN gradle shadowJar --no-daemon

# Stage 2: Build frontend
FROM node:22-slim AS frontend-build
RUN corepack enable
WORKDIR /app
COPY frontend/ .
RUN pnpm install --frozen-lockfile && pnpm build

# Stage 3: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/build/libs/*-all.jar app.jar
COPY --from=frontend-build /app/dist/ public/
EXPOSE 8989 9090
ENTRYPOINT ["java", "-jar", "app.jar"]
```

- [ ] **Step 2: Create .dockerignore**

```
**/node_modules
**/build
**/dist
**/.gradle
.git
ArchiveVersion1
docs
```

- [ ] **Step 3: Build and test Docker image**

```bash
docker build -t ese-companion:v2 .
```
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add Dockerfile .dockerignore
git commit -m "feat: add multi-stage Dockerfile for production build"
```

---

## Phase 9: Helm Chart

> Single task, no dependencies beyond Phase 8.

---

### Task 9.1: Helm Chart

**Files:**
- Create: `helm/ese-companion/Chart.yaml`
- Create: `helm/ese-companion/values.yaml`
- Create: `helm/ese-companion/templates/_helpers.tpl`
- Create: `helm/ese-companion/templates/deployment.yaml`
- Create: `helm/ese-companion/templates/service.yaml`
- Create: `helm/ese-companion/templates/configmap.yaml`
- Create: `helm/ese-companion/templates/secret.yaml`
- Create: `helm/ese-companion/templates/ingress.yaml`
- Create: `helm/ese-companion/templates/serviceaccount.yaml`
- Create: `helm/ese-companion/templates/hpa.yaml`
- Create: `helm/ese-companion/README.md`

- [ ] **Step 1: Create Chart.yaml**

```yaml
apiVersion: v2
name: ese-companion
description: HiveMQ ESE Companion — centralized ESE database management
type: application
version: 1.0.0
appVersion: "2.0.0"
```

- [ ] **Step 2: Create values.yaml**

Include all configurable values: image (repository, tag, pullPolicy), database (type, host, port, name, user, password), admin seed (user, password, email), security (jwtSecret, encryptionKey), https (jksPath, password, pkPassword), service (httpPort: 8989, httpsPort: 9090, type: ClusterIP), ingress (enabled: false), resources (requests/limits), autoscaling (enabled: false), pool config, health check interval, audit retention.

- [ ] **Step 3: Create templates**

Deployment: single replica, env vars from ConfigMap + Secret, liveness/readiness probes, resource limits. Service: ClusterIP exposing HTTP and HTTPS ports. ConfigMap: non-sensitive env vars. Secret: database password, JWT secret, encryption key, admin password. Ingress: optional, with TLS. ServiceAccount. HPA: optional.

- [ ] **Step 4: Validate chart**

```bash
helm lint helm/ese-companion
helm template ese-companion helm/ese-companion
```
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add helm/
git commit -m "feat: add Helm chart for Kubernetes deployment"
```

---

## Phase 10: Integration & Polish

> Final phase — sequential tasks.

---

### Task 10.1: End-to-End Integration Test

**Files:**
- Create: `docker-compose.yaml` — companion DB + app for local testing
- Create: `backend/src/test/kotlin/com/hivemq/companion/integration/FullFlowTest.kt`

- [ ] **Step 1: Create docker-compose for local development**

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: companion
      POSTGRES_USER: companion
      POSTGRES_PASSWORD: companion
    ports:
      - "5432:5432"

  ese-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: hivemq_ese
      POSTGRES_USER: ese
      POSTGRES_PASSWORD: ese
    ports:
      - "5433:5432"
    volumes:
      - ./references/postgresql_create.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./references/insert/default_permissions_insert.sql:/docker-entrypoint-initdb.d/02-permissions.sql
      - ./references/insert/default_roles_insert.sql:/docker-entrypoint-initdb.d/03-roles.sql
```

- [ ] **Step 2: Write integration test**

Full flow: login as admin → create connection → test connection → create MQTT user (verify password hashed) → assign role → verify audit log → create API key → use API key to list users → revoke key.

- [ ] **Step 3: Run and verify**

```bash
docker-compose up -d
cd backend && ./gradlew test --tests "*FullFlowTest*"
```

- [ ] **Step 4: Commit**

```bash
git add docker-compose.yaml backend/src/test/
git commit -m "feat: add docker-compose and end-to-end integration test"
```

---

### Task 10.2: Update CLAUDE.md for v2

**Files:**
- Modify: `docs/CLAUDE.md`

- [ ] **Step 1: Rewrite CLAUDE.md**

Update to reflect v2 tech stack, commands, architecture. Remove all v1 references.

Key sections:
- Build commands: `cd backend && ./gradlew build`, `cd frontend && pnpm build`, `docker build`
- Dev commands: `cd backend && ./gradlew run`, `cd frontend && pnpm dev`
- Test commands: `cd backend && ./gradlew test`, `cd frontend && pnpm test`
- Architecture overview matching PRD
- Env vars reference

- [ ] **Step 2: Commit**

```bash
git add docs/CLAUDE.md
git commit -m "docs: update CLAUDE.md for v2 tech stack"
```

---

## Parallelization Summary

| Phase | Tasks | Parallel? |
|---|---|---|
| 1: Scaffolding | 1.1, 1.2, 1.3 | All parallel |
| 2: DB & Crypto | 2.1, 2.2, 2.3 | 2.1 ∥ 2.2, then 2.3 |
| 3: Auth | 3.1 → 3.2, 3.3 | 3.1 first, then 3.2 ∥ 3.3 |
| 4: Connections & ESE | 4.1, 4.2, 4.3, 4.4 | 4.1 ∥ 4.2 ∥ 4.3, then 4.4 |
| 5: Keys, Audit, Dashboard | 5.1, 5.2, 5.3 | All parallel |
| 6: Security & OpenAPI | 6.1, 6.2 | All parallel |
| 7: Frontend UI | 7.1 → (7.2 ∥ 7.3 ∥ 7.4 ∥ 7.5 ∥ 7.6) | 7.1 first, rest parallel |
| 8: Docker & HTTPS | 8.1 ∥ 8.2 → 8.3 | 8.1 ∥ 8.2, then 8.3 |
| 9: Helm | 9.1 | Single task |
| 10: Integration | 10.1 → 10.2 | Sequential |
