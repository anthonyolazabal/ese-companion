package com.hivemq.companion.db

import com.hivemq.companion.config.DatabaseConfig
import com.hivemq.companion.config.DatabaseType
import com.hivemq.companion.db.tables.ApiKeys
import com.hivemq.companion.db.tables.AuditLogs
import com.hivemq.companion.db.tables.CompanionUsers
import com.hivemq.companion.db.tables.DatabaseConnections
import kotlinx.datetime.Clock
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.UUID
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class CompanionDatabaseTest {

    private fun createTestDatabase(): CompanionDatabase {
        val config = DatabaseConfig(
            type = DatabaseType.POSTGRESQL, // type is irrelevant for H2
            host = "localhost",
            port = 5432,
            name = "test",
            user = "sa",
            password = "",
        )
        return CompanionDatabase(config)
    }

    private fun createH2Database(): CompanionDatabase {
        // We use H2 directly instead of going through DatabaseConfig.jdbcUrl
        // because H2 has its own URL format
        return CompanionDatabase.createForTest(
            jdbcUrl = "jdbc:h2:mem:test_${UUID.randomUUID()};DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE;CASE_INSENSITIVE_IDENTIFIERS=TRUE",
            driver = "org.h2.Driver",
        )
    }

    @Test
    fun `tables exist after migration`() {
        val db = createH2Database()
        try {
            transaction(db.database) {
                // Verify all tables exist by querying them (would throw if they don't exist)
                CompanionUsers.selectAll().toList()
                DatabaseConnections.selectAll().toList()
                ApiKeys.selectAll().toList()
                AuditLogs.selectAll().toList()
            }
        } finally {
            db.close()
        }
    }

    @Test
    fun `insert and read user`() {
        val db = createH2Database()
        try {
            val userId = UUID.randomUUID()
            val now = Clock.System.now()

            transaction(db.database) {
                CompanionUsers.insert {
                    it[id] = userId
                    it[username] = "testuser"
                    it[email] = "test@example.com"
                    it[passwordHash] = "\$2a\$10\$dummyhash"
                    it[role] = "admin"
                    it[createdAt] = now
                    it[updatedAt] = now
                }
            }

            val user = transaction(db.database) {
                CompanionUsers.selectAll()
                    .where { CompanionUsers.id eq userId }
                    .single()
            }

            assertNotNull(user)
            assertEquals("testuser", user[CompanionUsers.username])
            assertEquals("test@example.com", user[CompanionUsers.email])
            assertEquals("admin", user[CompanionUsers.role])
        } finally {
            db.close()
        }
    }

    @Test
    fun `insert and read database connection`() {
        val db = createH2Database()
        try {
            val connId = UUID.randomUUID()
            val now = Clock.System.now()

            transaction(db.database) {
                DatabaseConnections.insert {
                    it[id] = connId
                    it[name] = "test-postgres"
                    it[description] = "Test PostgreSQL connection"
                    it[dbType] = "POSTGRESQL"
                    it[host] = "localhost"
                    it[port] = 5432
                    it[databaseName] = "mydb"
                    it[username] = "dbuser"
                    it[password] = "encrypted-password"
                    it[sslEnabled] = false
                    it[healthStatus] = "UNKNOWN"
                    it[createdAt] = now
                    it[updatedAt] = now
                }
            }

            val conn = transaction(db.database) {
                DatabaseConnections.selectAll()
                    .where { DatabaseConnections.id eq connId }
                    .single()
            }

            assertNotNull(conn)
            assertEquals("test-postgres", conn[DatabaseConnections.name])
            assertEquals("POSTGRESQL", conn[DatabaseConnections.dbType])
            assertEquals(5432, conn[DatabaseConnections.port])
        } finally {
            db.close()
        }
    }

    @Test
    fun `insert and read audit log`() {
        val db = createH2Database()
        try {
            val now = Clock.System.now()
            val actorId = UUID.randomUUID()

            transaction(db.database) {
                AuditLogs.insert {
                    it[timestamp] = now
                    it[actorType] = "user"
                    it[AuditLogs.actorId] = actorId
                    it[actorName] = "admin"
                    it[domain] = "companion"
                    it[action] = "create"
                    it[resourceType] = "user"
                    it[resourceId] = actorId.toString()
                    it[ipAddress] = "127.0.0.1"
                    it[userAgent] = "test-agent"
                }
            }

            val log = transaction(db.database) {
                AuditLogs.selectAll().single()
            }

            assertNotNull(log)
            assertEquals("user", log[AuditLogs.actorType])
            assertEquals("companion", log[AuditLogs.domain])
            assertTrue(log[AuditLogs.id] > 0)
        } finally {
            db.close()
        }
    }
}
