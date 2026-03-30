package com.hivemq.companion.service

import com.hivemq.companion.config.AdminSeedConfig
import com.hivemq.companion.db.tables.CompanionUsers
import com.hivemq.companion.dto.UserUpdateRequest
import kotlinx.datetime.Clock
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.mindrot.jbcrypt.BCrypt
import org.slf4j.LoggerFactory
import java.util.*

data class UserRecord(
    val id: UUID,
    val username: String,
    val email: String,
    val passwordHash: String,
    val role: String,
)

class UserService(private val database: Database) {

    private val logger = LoggerFactory.getLogger(UserService::class.java)

    private fun ResultRow.toUserRecord() = UserRecord(
        id = this[CompanionUsers.id],
        username = this[CompanionUsers.username],
        email = this[CompanionUsers.email],
        passwordHash = this[CompanionUsers.passwordHash],
        role = this[CompanionUsers.role],
    )

    suspend fun findByUsername(username: String): UserRecord? = newSuspendedTransaction(db = database) {
        CompanionUsers.selectAll().where { CompanionUsers.username eq username }
            .singleOrNull()
            ?.toUserRecord()
    }

    suspend fun findById(id: UUID): UserRecord? = newSuspendedTransaction(db = database) {
        CompanionUsers.selectAll().where { CompanionUsers.id eq id }
            .singleOrNull()
            ?.toUserRecord()
    }

    suspend fun createUser(username: String, email: String, password: String, role: String): UserRecord =
        newSuspendedTransaction(db = database) {
            val now = Clock.System.now()
            val id = UUID.randomUUID()
            val hash = BCrypt.hashpw(password, BCrypt.gensalt())
            CompanionUsers.insert {
                it[CompanionUsers.id] = id
                it[CompanionUsers.username] = username
                it[CompanionUsers.email] = email
                it[CompanionUsers.passwordHash] = hash
                it[CompanionUsers.role] = role
                it[CompanionUsers.createdAt] = now
                it[CompanionUsers.updatedAt] = now
            }
            UserRecord(id, username, email, hash, role)
        }

    suspend fun updateUser(id: UUID, updates: UserUpdateRequest): UserRecord? =
        newSuspendedTransaction(db = database) {
            val now = Clock.System.now()
            val count = CompanionUsers.update({ CompanionUsers.id eq id }) {
                updates.email?.let { email -> it[CompanionUsers.email] = email }
                updates.role?.let { role -> it[CompanionUsers.role] = role }
                it[CompanionUsers.updatedAt] = now
            }
            if (count == 0) null else findById(id)
        }

    suspend fun deleteUser(id: UUID): Boolean = newSuspendedTransaction(db = database) {
        CompanionUsers.deleteWhere { CompanionUsers.id eq id } > 0
    }

    suspend fun listUsers(): List<UserRecord> = newSuspendedTransaction(db = database) {
        CompanionUsers.selectAll().map { it.toUserRecord() }
    }

    fun verifyPassword(user: UserRecord, password: String): Boolean {
        return BCrypt.checkpw(password, user.passwordHash)
    }

    suspend fun changePassword(id: UUID, newPassword: String): Unit = newSuspendedTransaction(db = database) {
        val hash = BCrypt.hashpw(newPassword, BCrypt.gensalt())
        val now = Clock.System.now()
        CompanionUsers.update({ CompanionUsers.id eq id }) {
            it[passwordHash] = hash
            it[updatedAt] = now
        }
    }

    suspend fun seedAdminIfNeeded(config: AdminSeedConfig) {
        val count = newSuspendedTransaction(db = database) {
            CompanionUsers.selectAll().count()
        }
        if (count == 0L) {
            val username = config.username ?: "admin"
            val password = config.password ?: "admin"
            val email = config.email ?: "admin@local"
            createUser(username, email, password, "admin")
            logger.info("Seeded admin user: $username")
        }
    }
}
