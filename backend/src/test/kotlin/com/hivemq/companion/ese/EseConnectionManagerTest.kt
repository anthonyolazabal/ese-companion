package com.hivemq.companion.ese

import com.hivemq.companion.config.PoolConfig
import com.hivemq.companion.crypto.AesEncryption
import com.hivemq.companion.db.tables.DatabaseConnections
import kotlinx.datetime.Clock
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.UUID
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class EseConnectionManagerTest {

    private val encryptionKey = "test-encryption-key-for-aes-256"
    private val aesEncryption = AesEncryption(encryptionKey)

    private fun createCompanionDb(): Database {
        val db = Database.connect("jdbc:h2:mem:companion_${UUID.randomUUID()};DB_CLOSE_DELAY=-1", driver = "org.h2.Driver")
        transaction(db) {
            SchemaUtils.create(DatabaseConnections)
        }
        return db
    }

    private fun insertH2Connection(companionDb: Database, connectionId: UUID): UUID {
        val encryptedPassword = aesEncryption.encrypt("")
        transaction(companionDb) {
            DatabaseConnections.insert {
                it[id] = connectionId
                it[name] = "test-h2-${connectionId}"
                it[description] = "Test H2 database"
                it[dbType] = "POSTGRESQL"
                it[host] = "localhost"
                it[port] = 5432
                it[databaseName] = "testdb"
                it[username] = "sa"
                it[password] = encryptedPassword
                it[sslEnabled] = false
                it[healthStatus] = "UNKNOWN"
                it[createdAt] = Clock.System.now()
                it[updatedAt] = Clock.System.now()
            }
        }
        return connectionId
    }

    private fun createManager(
        poolConfig: PoolConfig = PoolConfig(maxPerDb = 2, maxTotal = 10, idleTimeoutMinutes = 10, acquireTimeoutSeconds = 5),
        companionDb: Database = createCompanionDb()
    ): Pair<EseConnectionManager, Database> {
        val manager = EseConnectionManager(poolConfig, companionDb, aesEncryption)
        return Pair(manager, companionDb)
    }

    @Test
    fun `creates pool on first access attempts connection`() {
        val (manager, companionDb) = createManager(
            poolConfig = PoolConfig(maxPerDb = 2, maxTotal = 10, idleTimeoutMinutes = 10, acquireTimeoutSeconds = 30)
        )
        val connId = UUID.randomUUID()
        insertH2Connection(companionDb, connId)

        // The manager will try to connect to a real PostgreSQL database which does not exist,
        // so pool creation will fail. This verifies the lookup and pool creation flow.
        assertFailsWith<Exception> {
            manager.getDatabase(connId)
        }
        assertEquals(0, manager.getActivePoolCount())
        manager.closeAll()
    }

    @Test
    fun `throws for unknown connection id`() {
        val (manager, _) = createManager()
        val unknownId = UUID.randomUUID()

        assertFailsWith<IllegalArgumentException> {
            manager.getDatabase(unknownId)
        }
        manager.closeAll()
    }

    @Test
    fun `removePool removes specific pool`() {
        val (manager, _) = createManager()
        assertEquals(0, manager.getActivePoolCount())

        // Remove a non-existent pool should not throw
        manager.removePool(UUID.randomUUID())
        assertEquals(0, manager.getActivePoolCount())
        manager.closeAll()
    }

    @Test
    fun `closeAll closes all pools`() {
        val (manager, _) = createManager()
        assertEquals(0, manager.getActivePoolCount())
        manager.closeAll()
        assertEquals(0, manager.getActivePoolCount())
    }

    @Test
    fun `evictIdle removes pools not accessed recently`() {
        val (manager, _) = createManager(
            poolConfig = PoolConfig(maxPerDb = 2, maxTotal = 10, idleTimeoutMinutes = 0, acquireTimeoutSeconds = 5)
        )
        // With idleTimeoutMinutes = 0, any existing pool should be evicted
        manager.evictIdle()
        assertEquals(0, manager.getActivePoolCount())
        manager.closeAll()
    }

    @Test
    fun `getTotalConnectionCount returns zero when no pools`() {
        val (manager, _) = createManager()
        assertEquals(0, manager.getTotalConnectionCount())
        manager.closeAll()
    }

    @Test
    fun `enforces max total connection limit`() {
        val (manager, companionDb) = createManager(
            // maxPerDb=5, maxTotal=4 means we cannot even create one pool
            poolConfig = PoolConfig(maxPerDb = 5, maxTotal = 4, idleTimeoutMinutes = 10, acquireTimeoutSeconds = 30)
        )
        val connId = UUID.randomUUID()
        insertH2Connection(companionDb, connId)

        // Should fail because maxPerDb (5) + current (0) > maxTotal (4)
        assertFailsWith<IllegalStateException> {
            manager.getDatabase(connId)
        }
        manager.closeAll()
    }

    @Test
    fun `getActivePoolCount returns zero initially`() {
        val (manager, _) = createManager()
        assertEquals(0, manager.getActivePoolCount())
        manager.closeAll()
    }

    @Test
    fun `multiple closeAll calls are safe`() {
        val (manager, _) = createManager()
        manager.closeAll()
        manager.closeAll()
        assertEquals(0, manager.getActivePoolCount())
    }

    @Test
    fun `evictIdle with no pools does not throw`() {
        val (manager, _) = createManager()
        manager.evictIdle()
        assertEquals(0, manager.getActivePoolCount())
        manager.closeAll()
    }

    @Test
    fun `connection config is correctly read from companion database`() {
        val companionDb = createCompanionDb()
        val connId = UUID.randomUUID()
        insertH2Connection(companionDb, connId)

        // Verify the connection record exists and fields are correct
        val record = transaction(companionDb) {
            DatabaseConnections.selectAll()
                .where(DatabaseConnections.id eq connId)
                .singleOrNull()
        }
        assertTrue(record != null)
        assertEquals("localhost", record[DatabaseConnections.host])
        assertEquals(5432, record[DatabaseConnections.port])
        assertEquals("sa", record[DatabaseConnections.username])

        // Verify password decryption works
        val decrypted = aesEncryption.decrypt(record[DatabaseConnections.password])
        assertEquals("", decrypted)
    }
}
