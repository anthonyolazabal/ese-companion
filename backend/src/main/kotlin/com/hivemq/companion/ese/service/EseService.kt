package com.hivemq.companion.ese.service

import com.hivemq.companion.crypto.CryptoService
import com.hivemq.companion.dto.PaginatedResponse
import com.hivemq.companion.ese.EseConnectionManager
import com.hivemq.companion.ese.dto.*
import com.hivemq.companion.ese.tables.*
import kotlinx.datetime.Clock
import kotlinx.datetime.Instant
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.UUID

class EseService(
    private val eseConnectionManager: EseConnectionManager,
    private val cryptoService: CryptoService,
) {
    private fun now(): Instant = Clock.System.now()

    fun getDatabase(connId: UUID): Database = eseConnectionManager.getDatabase(connId)

    // -----------------------------------------------------------------------
    // Users
    // -----------------------------------------------------------------------

    fun listUsers(
        db: Database,
        domain: String,
        page: Int,
        size: Int,
        search: String?,
    ): PaginatedResponse<EseUserResponse> {
        val tables = resolveDomain(domain)
        val u = tables.users
        return transaction(db) {
            var query = u.table.selectAll()
            if (!search.isNullOrBlank()) {
                query = query.where { u.username like "%$search%" }
            }
            val total = query.count()
            val items = query
                .orderBy(u.id)
                .limit(size).offset(((page - 1) * size).toLong())
                .map { it.toUserResponse(u) }
            PaginatedResponse(items = items, page = page, size = size, total = total)
        }
    }

    fun getUser(db: Database, domain: String, userId: Int): EseUserDetailResponse? {
        val tables = resolveDomain(domain)
        val u = tables.users
        val ur = tables.userRoles
        val r = tables.roles
        val up = tables.userPermissions
        return transaction(db) {
            val row = u.table.selectAll().where { u.id eq userId }.singleOrNull() ?: return@transaction null

            val roles = (ur.table innerJoin r.table)
                .selectAll().where { ur.userId eq userId }
                .map { it.toRoleResponse(r) }

            val permissions = if (tables.isMqtt) {
                val mp = tables.mqttPermissions as MqttPermissions
                (up.table innerJoin mp)
                    .selectAll().where { up.userId eq userId }
                    .map { it.toMqttPermissionResponse() }
            } else {
                val sp = tables.stringPermissions!!
                val spCols = resolveStringPermCols(sp)
                (up.table innerJoin sp)
                    .selectAll().where { up.userId eq userId }
                    .map { it.toStringPermissionResponse(spCols) }
            }

            EseUserDetailResponse(
                id = row[u.id],
                username = row[u.username],
                algorithm = row[u.algorithm],
                iterations = row[u.passwordIterations],
                createdAt = row[u.createdAt].toString(),
                updatedAt = row[u.updatedAt].toString(),
                roles = roles,
                permissions = permissions,
            )
        }
    }

    fun createUser(db: Database, domain: String, request: CreateEseUserRequest): EseUserResponse {
        val tables = resolveDomain(domain)
        val u = tables.users
        val hashed = cryptoService.hashPassword(
            password = request.password,
            algorithm = request.algorithm,
            iterations = request.iterations,
        )
        val ts = now()
        return transaction(db) {
            val id = u.table.insert {
                it[u.username] = request.username
                it[u.password] = hashed.hash
                it[u.passwordIterations] = hashed.iterations
                it[u.passwordSalt] = hashed.salt
                it[u.algorithm] = hashed.algorithm
                it[u.createdAt] = ts
                it[u.updatedAt] = ts
            } get u.id

            EseUserResponse(
                id = id,
                username = request.username,
                algorithm = hashed.algorithm,
                iterations = hashed.iterations,
                createdAt = ts.toString(),
                updatedAt = ts.toString(),
            )
        }
    }

    fun updateUser(db: Database, domain: String, userId: Int, request: UpdateEseUserRequest): EseUserResponse? {
        val tables = resolveDomain(domain)
        val u = tables.users
        val ts = now()
        return transaction(db) {
            val existing = u.table.selectAll().where { u.id eq userId }.singleOrNull() ?: return@transaction null

            u.table.update({ u.id eq userId }) {
                if (request.username != null) it[u.username] = request.username
                if (request.password != null) {
                    val algo = request.algorithm ?: existing[u.algorithm]
                    val iters = request.iterations ?: existing[u.passwordIterations]
                    val hashed = cryptoService.hashPassword(request.password, algo, iters)
                    it[u.password] = hashed.hash
                    it[u.passwordIterations] = hashed.iterations
                    it[u.passwordSalt] = hashed.salt
                    it[u.algorithm] = hashed.algorithm
                }
                it[u.updatedAt] = ts
            }

            val updated = u.table.selectAll().where { u.id eq userId }.single()
            updated.toUserResponse(u)
        }
    }

    fun deleteUser(db: Database, domain: String, userId: Int): Boolean {
        val tables = resolveDomain(domain)
        val u = tables.users
        val ur = tables.userRoles
        val up = tables.userPermissions
        return transaction(db) {
            ur.table.deleteWhere { ur.userId eq userId }
            up.table.deleteWhere { up.userId eq userId }
            u.table.deleteWhere { u.id eq userId } > 0
        }
    }

    // -----------------------------------------------------------------------
    // Roles
    // -----------------------------------------------------------------------

    fun listRoles(db: Database, domain: String, page: Int, size: Int): PaginatedResponse<EseRoleResponse> {
        val tables = resolveDomain(domain)
        val r = tables.roles
        return transaction(db) {
            val query = r.table.selectAll()
            val total = query.count()
            val items = query
                .orderBy(r.id)
                .limit(size).offset(((page - 1) * size).toLong())
                .map { it.toRoleResponse(r) }
            PaginatedResponse(items = items, page = page, size = size, total = total)
        }
    }

    fun createRole(db: Database, domain: String, request: CreateEseRoleRequest): EseRoleResponse {
        val tables = resolveDomain(domain)
        val r = tables.roles
        val ts = now()
        return transaction(db) {
            val id = r.table.insert {
                it[r.name] = request.name
                it[r.description] = request.description
                it[r.createdAt] = ts
                it[r.updatedAt] = ts
            } get r.id

            EseRoleResponse(id = id, name = request.name, description = request.description, createdAt = ts.toString(), updatedAt = ts.toString())
        }
    }

    fun updateRole(db: Database, domain: String, roleId: Int, request: UpdateEseRoleRequest): EseRoleResponse? {
        val tables = resolveDomain(domain)
        val r = tables.roles
        val ts = now()
        return transaction(db) {
            r.table.selectAll().where { r.id eq roleId }.singleOrNull() ?: return@transaction null
            r.table.update({ r.id eq roleId }) {
                if (request.name != null) it[r.name] = request.name
                if (request.description != null) it[r.description] = request.description
                it[r.updatedAt] = ts
            }
            val updated = r.table.selectAll().where { r.id eq roleId }.single()
            updated.toRoleResponse(r)
        }
    }

    fun deleteRole(db: Database, domain: String, roleId: Int): Boolean {
        val tables = resolveDomain(domain)
        val r = tables.roles
        val ur = tables.userRoles
        val rp = tables.rolePermissions
        return transaction(db) {
            ur.table.deleteWhere { ur.roleId eq roleId }
            rp.table.deleteWhere { rp.role eq roleId }
            r.table.deleteWhere { r.id eq roleId } > 0
        }
    }

    // -----------------------------------------------------------------------
    // Permissions
    // -----------------------------------------------------------------------

    fun listPermissions(db: Database, domain: String, page: Int, size: Int): PaginatedResponse<EsePermissionResponse> {
        val tables = resolveDomain(domain)
        return transaction(db) {
            if (tables.isMqtt) {
                val mp = tables.mqttPermissions as MqttPermissions
                val query = mp.selectAll()
                val total = query.count()
                val items = query
                    .orderBy(mp.id)
                    .limit(size).offset(((page - 1) * size).toLong())
                    .map { it.toMqttPermissionResponse() }
                PaginatedResponse(items = items, page = page, size = size, total = total)
            } else {
                val sp = tables.stringPermissions!!
                val cols = resolveStringPermCols(sp)
                val query = sp.selectAll()
                val total = query.count()
                val items = query
                    .orderBy(cols.id)
                    .limit(size).offset(((page - 1) * size).toLong())
                    .map { it.toStringPermissionResponse(cols) }
                PaginatedResponse(items = items, page = page, size = size, total = total)
            }
        }
    }

    fun createMqttPermission(db: Database, request: CreateMqttPermissionRequest): EsePermissionResponse {
        val mp = MqttPermissions
        val ts = now()
        return transaction(db) {
            val id = mp.insert {
                it[mp.topic] = request.topic
                it[mp.publishAllowed] = request.publishAllowed
                it[mp.subscribeAllowed] = request.subscribeAllowed
                it[mp.qos0Allowed] = request.qos0Allowed
                it[mp.qos1Allowed] = request.qos1Allowed
                it[mp.qos2Allowed] = request.qos2Allowed
                it[mp.retainedMsgsAllowed] = request.retainedMsgsAllowed
                it[mp.sharedSubAllowed] = request.sharedSubAllowed
                it[mp.sharedGroup] = request.sharedGroup
                it[mp.createdAt] = ts
                it[mp.updatedAt] = ts
            } get mp.id

            EsePermissionResponse(
                id = id, topic = request.topic,
                publishAllowed = request.publishAllowed, subscribeAllowed = request.subscribeAllowed,
                qos0Allowed = request.qos0Allowed, qos1Allowed = request.qos1Allowed,
                qos2Allowed = request.qos2Allowed, retainedMsgsAllowed = request.retainedMsgsAllowed,
                sharedSubAllowed = request.sharedSubAllowed, sharedGroup = request.sharedGroup,
                createdAt = ts.toString(), updatedAt = ts.toString(),
            )
        }
    }

    fun updateMqttPermission(db: Database, permId: Int, request: UpdateMqttPermissionRequest): EsePermissionResponse? {
        val mp = MqttPermissions
        val ts = now()
        return transaction(db) {
            mp.selectAll().where { mp.id eq permId }.singleOrNull() ?: return@transaction null
            mp.update({ mp.id eq permId }) {
                if (request.topic != null) it[mp.topic] = request.topic
                if (request.publishAllowed != null) it[mp.publishAllowed] = request.publishAllowed
                if (request.subscribeAllowed != null) it[mp.subscribeAllowed] = request.subscribeAllowed
                if (request.qos0Allowed != null) it[mp.qos0Allowed] = request.qos0Allowed
                if (request.qos1Allowed != null) it[mp.qos1Allowed] = request.qos1Allowed
                if (request.qos2Allowed != null) it[mp.qos2Allowed] = request.qos2Allowed
                if (request.retainedMsgsAllowed != null) it[mp.retainedMsgsAllowed] = request.retainedMsgsAllowed
                if (request.sharedSubAllowed != null) it[mp.sharedSubAllowed] = request.sharedSubAllowed
                if (request.sharedGroup != null) it[mp.sharedGroup] = request.sharedGroup
                it[mp.updatedAt] = ts
            }
            mp.selectAll().where { mp.id eq permId }.single().toMqttPermissionResponse()
        }
    }

    fun createStringPermission(db: Database, domain: String, request: CreateStringPermissionRequest): EsePermissionResponse {
        val tables = resolveDomain(domain)
        val sp = tables.stringPermissions!!
        val cols = resolveStringPermCols(sp)
        val ts = now()
        return transaction(db) {
            val id = sp.insert {
                it[cols.permissionString] = request.permissionString
                it[cols.description] = request.description
                it[cols.createdAt] = ts
                it[cols.updatedAt] = ts
            } get cols.id

            EsePermissionResponse(
                id = id, permissionString = request.permissionString, description = request.description,
                createdAt = ts.toString(), updatedAt = ts.toString(),
            )
        }
    }

    fun updateStringPermission(db: Database, domain: String, permId: Int, request: UpdateStringPermissionRequest): EsePermissionResponse? {
        val tables = resolveDomain(domain)
        val sp = tables.stringPermissions!!
        val cols = resolveStringPermCols(sp)
        val ts = now()
        return transaction(db) {
            sp.selectAll().where { cols.id eq permId }.singleOrNull() ?: return@transaction null
            sp.update({ cols.id eq permId }) {
                if (request.permissionString != null) it[cols.permissionString] = request.permissionString
                if (request.description != null) it[cols.description] = request.description
                it[cols.updatedAt] = ts
            }
            sp.selectAll().where { cols.id eq permId }.single().toStringPermissionResponse(cols)
        }
    }

    fun deletePermission(db: Database, domain: String, permId: Int): Boolean {
        val tables = resolveDomain(domain)
        val rp = tables.rolePermissions
        val up = tables.userPermissions
        return transaction(db) {
            rp.table.deleteWhere { rp.permission eq permId }
            up.table.deleteWhere { up.permission eq permId }
            if (tables.isMqtt) {
                val mp = tables.mqttPermissions as MqttPermissions
                mp.deleteWhere { mp.id eq permId } > 0
            } else {
                val sp = tables.stringPermissions!!
                val cols = resolveStringPermCols(sp)
                sp.deleteWhere { cols.id eq permId } > 0
            }
        }
    }

    // -----------------------------------------------------------------------
    // Associations
    // -----------------------------------------------------------------------

    fun assignRoleToUser(db: Database, domain: String, userId: Int, roleId: Int): Boolean {
        val tables = resolveDomain(domain)
        val ur = tables.userRoles
        val ts = now()
        return transaction(db) {
            val exists = ur.table.selectAll().where { (ur.userId eq userId) and (ur.roleId eq roleId) }.count() > 0
            if (exists) return@transaction false
            ur.table.insert {
                it[ur.userId] = userId
                it[ur.roleId] = roleId
                it[ur.createdAt] = ts
                it[ur.updatedAt] = ts
            }
            true
        }
    }

    fun getRoleIdsForUser(db: Database, domain: String, userId: Int): List<Int> {
        val tables = resolveDomain(domain)
        val ur = tables.userRoles
        return transaction(db) {
            ur.table.selectAll().where { ur.userId eq userId }
                .map { it[ur.roleId] }
        }
    }

    fun removeRoleFromUser(db: Database, domain: String, userId: Int, roleId: Int): Boolean {
        val tables = resolveDomain(domain)
        val ur = tables.userRoles
        return transaction(db) {
            ur.table.deleteWhere { (ur.userId eq userId) and (ur.roleId eq roleId) } > 0
        }
    }

    fun assignPermissionToUser(db: Database, domain: String, userId: Int, permId: Int): Boolean {
        val tables = resolveDomain(domain)
        val up = tables.userPermissions
        val ts = now()
        return transaction(db) {
            val exists = up.table.selectAll().where { (up.userId eq userId) and (up.permission eq permId) }.count() > 0
            if (exists) return@transaction false
            up.table.insert {
                it[up.userId] = userId
                it[up.permission] = permId
                it[up.createdAt] = ts
                it[up.updatedAt] = ts
            }
            true
        }
    }

    fun removePermissionFromUser(db: Database, domain: String, userId: Int, permId: Int): Boolean {
        val tables = resolveDomain(domain)
        val up = tables.userPermissions
        return transaction(db) {
            up.table.deleteWhere { (up.userId eq userId) and (up.permission eq permId) } > 0
        }
    }

    fun assignPermissionToRole(db: Database, domain: String, roleId: Int, permId: Int): Boolean {
        val tables = resolveDomain(domain)
        val rp = tables.rolePermissions
        val ts = now()
        return transaction(db) {
            val exists = rp.table.selectAll().where { (rp.role eq roleId) and (rp.permission eq permId) }.count() > 0
            if (exists) return@transaction false
            rp.table.insert {
                it[rp.role] = roleId
                it[rp.permission] = permId
                it[rp.createdAt] = ts
                it[rp.updatedAt] = ts
            }
            true
        }
    }

    fun getPermissionIdsForRole(db: Database, domain: String, roleId: Int): List<Int> {
        val tables = resolveDomain(domain)
        val rp = tables.rolePermissions
        return transaction(db) {
            rp.table.selectAll().where { rp.role eq roleId }
                .map { it[rp.permission] }
        }
    }

    fun removePermissionFromRole(db: Database, domain: String, roleId: Int, permId: Int): Boolean {
        val tables = resolveDomain(domain)
        val rp = tables.rolePermissions
        return transaction(db) {
            rp.table.deleteWhere { (rp.role eq roleId) and (rp.permission eq permId) } > 0
        }
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private fun ResultRow.toUserResponse(u: EseUserTable) = EseUserResponse(
        id = this[u.id],
        username = this[u.username],
        algorithm = this[u.algorithm],
        iterations = this[u.passwordIterations],
        createdAt = this[u.createdAt].toString(),
        updatedAt = this[u.updatedAt].toString(),
    )

    private fun ResultRow.toRoleResponse(r: EseRoleTable) = EseRoleResponse(
        id = this[r.id],
        name = this[r.name],
        description = this[r.description],
        createdAt = this[r.createdAt].toString(),
        updatedAt = this[r.updatedAt].toString(),
    )

    private fun ResultRow.toMqttPermissionResponse(): EsePermissionResponse {
        val mp = MqttPermissions
        return EsePermissionResponse(
            id = this[mp.id], topic = this[mp.topic],
            publishAllowed = this[mp.publishAllowed], subscribeAllowed = this[mp.subscribeAllowed],
            qos0Allowed = this[mp.qos0Allowed], qos1Allowed = this[mp.qos1Allowed],
            qos2Allowed = this[mp.qos2Allowed], retainedMsgsAllowed = this[mp.retainedMsgsAllowed],
            sharedSubAllowed = this[mp.sharedSubAllowed], sharedGroup = this[mp.sharedGroup],
            createdAt = this[mp.createdAt].toString(), updatedAt = this[mp.updatedAt].toString(),
        )
    }

    private data class StringPermCols(
        val id: Column<Int>,
        val permissionString: Column<String>,
        val description: Column<String?>,
        val createdAt: Column<Instant>,
        val updatedAt: Column<Instant>,
    )

    private fun resolveStringPermCols(table: Table): StringPermCols = when (table) {
        is CcPermissions -> StringPermCols(CcPermissions.id, CcPermissions.permissionString, CcPermissions.description, CcPermissions.createdAt, CcPermissions.updatedAt)
        is RestApiPermissions -> StringPermCols(RestApiPermissions.id, RestApiPermissions.permissionString, RestApiPermissions.description, RestApiPermissions.createdAt, RestApiPermissions.updatedAt)
        else -> throw IllegalStateException("Unknown string permission table")
    }

    private fun ResultRow.toStringPermissionResponse(cols: StringPermCols) = EsePermissionResponse(
        id = this[cols.id],
        permissionString = this[cols.permissionString],
        description = this[cols.description],
        createdAt = this[cols.createdAt].toString(),
        updatedAt = this[cols.updatedAt].toString(),
    )
}
