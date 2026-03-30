package com.hivemq.companion.ese.tables

import kotlinx.datetime.Instant
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.kotlin.datetime.timestamp

// ---------------------------------------------------------------------------
// MQTT domain
// ---------------------------------------------------------------------------

object MqttUsers : Table("users") {
    val id = integer("id").autoIncrement()
    val username = text("username").uniqueIndex()
    val password = text("password").nullable()
    val passwordIterations = integer("password_iterations")
    val passwordSalt = text("password_salt")
    val algorithm = varchar("algorithm", 32)
    val createdAt = timestamp("created_at")
    val updatedAt = timestamp("updated_at")
    override val primaryKey = PrimaryKey(id)
}

object MqttRoles : Table("roles") {
    val id = integer("id").autoIncrement()
    val name = text("name").uniqueIndex()
    val description = text("description").nullable()
    val createdAt = timestamp("created_at")
    val updatedAt = timestamp("updated_at")
    override val primaryKey = PrimaryKey(id)
}

object MqttPermissions : Table("permissions") {
    val id = integer("id").autoIncrement()
    val topic = text("topic")
    val publishAllowed = bool("publish_allowed")
    val subscribeAllowed = bool("subscribe_allowed")
    val qos0Allowed = bool("qos_0_allowed")
    val qos1Allowed = bool("qos_1_allowed")
    val qos2Allowed = bool("qos_2_allowed")
    val retainedMsgsAllowed = bool("retained_msgs_allowed")
    val sharedSubAllowed = bool("shared_sub_allowed")
    val sharedGroup = text("shared_group").nullable()
    val createdAt = timestamp("created_at")
    val updatedAt = timestamp("updated_at")
    override val primaryKey = PrimaryKey(id)
}

object MqttUserRoles : Table("user_roles") {
    val userId = integer("user_id").references(MqttUsers.id)
    val roleId = integer("role_id").references(MqttRoles.id)
    val createdAt = timestamp("created_at")
    val updatedAt = timestamp("updated_at")
    override val primaryKey = PrimaryKey(userId, roleId)
}

object MqttRolePermissions : Table("role_permissions") {
    val role = integer("role").references(MqttRoles.id)
    val permission = integer("permission").references(MqttPermissions.id)
    val createdAt = timestamp("created_at")
    val updatedAt = timestamp("updated_at")
    override val primaryKey = PrimaryKey(role, permission)
}

object MqttUserPermissions : Table("user_permissions") {
    val userId = integer("user_id").references(MqttUsers.id)
    val permission = integer("permission").references(MqttPermissions.id)
    val createdAt = timestamp("created_at")
    val updatedAt = timestamp("updated_at")
    override val primaryKey = PrimaryKey(userId, permission)
}

// ---------------------------------------------------------------------------
// Control Center domain
// ---------------------------------------------------------------------------

object CcUsers : Table("cc_users") {
    val id = integer("id").autoIncrement()
    val username = text("username").uniqueIndex()
    val password = text("password").nullable()
    val passwordIterations = integer("password_iterations")
    val passwordSalt = text("password_salt")
    val algorithm = varchar("algorithm", 32)
    val createdAt = timestamp("created_at")
    val updatedAt = timestamp("updated_at")
    override val primaryKey = PrimaryKey(id)
}

object CcRoles : Table("cc_roles") {
    val id = integer("id").autoIncrement()
    val name = text("name").uniqueIndex()
    val description = text("description").nullable()
    val createdAt = timestamp("created_at")
    val updatedAt = timestamp("updated_at")
    override val primaryKey = PrimaryKey(id)
}

object CcPermissions : Table("cc_permissions") {
    val id = integer("id").autoIncrement()
    val permissionString = text("permission_string")
    val description = text("description").nullable()
    val createdAt = timestamp("created_at")
    val updatedAt = timestamp("updated_at")
    override val primaryKey = PrimaryKey(id)
}

object CcUserRoles : Table("cc_user_roles") {
    val userId = integer("user_id").references(CcUsers.id)
    val roleId = integer("role_id").references(CcRoles.id)
    val createdAt = timestamp("created_at")
    val updatedAt = timestamp("updated_at")
    override val primaryKey = PrimaryKey(userId, roleId)
}

object CcRolePermissions : Table("cc_role_permissions") {
    val role = integer("role").references(CcRoles.id)
    val permission = integer("permission").references(CcPermissions.id)
    val createdAt = timestamp("created_at")
    val updatedAt = timestamp("updated_at")
    override val primaryKey = PrimaryKey(role, permission)
}

object CcUserPermissions : Table("cc_user_permissions") {
    val userId = integer("user_id").references(CcUsers.id)
    val permission = integer("permission").references(CcPermissions.id)
    val createdAt = timestamp("created_at")
    val updatedAt = timestamp("updated_at")
    override val primaryKey = PrimaryKey(userId, permission)
}

// ---------------------------------------------------------------------------
// REST API domain
// ---------------------------------------------------------------------------

object RestApiUsers : Table("rest_api_users") {
    val id = integer("id").autoIncrement()
    val username = text("username").uniqueIndex()
    val password = text("password").nullable()
    val passwordIterations = integer("password_iterations")
    val passwordSalt = text("password_salt")
    val algorithm = varchar("algorithm", 32)
    val createdAt = timestamp("created_at")
    val updatedAt = timestamp("updated_at")
    override val primaryKey = PrimaryKey(id)
}

object RestApiRoles : Table("rest_api_roles") {
    val id = integer("id").autoIncrement()
    val name = text("name").uniqueIndex()
    val description = text("description").nullable()
    val createdAt = timestamp("created_at")
    val updatedAt = timestamp("updated_at")
    override val primaryKey = PrimaryKey(id)
}

object RestApiPermissions : Table("rest_api_permissions") {
    val id = integer("id").autoIncrement()
    val permissionString = text("permission_string")
    val description = text("description").nullable()
    val createdAt = timestamp("created_at")
    val updatedAt = timestamp("updated_at")
    override val primaryKey = PrimaryKey(id)
}

object RestApiUserRoles : Table("rest_api_user_roles") {
    val userId = integer("user_id").references(RestApiUsers.id)
    val roleId = integer("role_id").references(RestApiRoles.id)
    val createdAt = timestamp("created_at")
    val updatedAt = timestamp("updated_at")
    override val primaryKey = PrimaryKey(userId, roleId)
}

object RestApiRolePermissions : Table("rest_api_role_permissions") {
    val role = integer("role").references(RestApiRoles.id)
    val permission = integer("permission").references(RestApiPermissions.id)
    val createdAt = timestamp("created_at")
    val updatedAt = timestamp("updated_at")
    override val primaryKey = PrimaryKey(role, permission)
}

object RestApiUserPermissions : Table("rest_api_user_permissions") {
    val userId = integer("user_id").references(RestApiUsers.id)
    val permission = integer("permission").references(RestApiPermissions.id)
    val createdAt = timestamp("created_at")
    val updatedAt = timestamp("updated_at")
    override val primaryKey = PrimaryKey(userId, permission)
}

// ---------------------------------------------------------------------------
// Domain table sets — used by EseService to resolve domain -> tables
// ---------------------------------------------------------------------------

data class EseUserTable(
    val id: Column<Int>,
    val username: Column<String>,
    val password: Column<String?>,
    val passwordIterations: Column<Int>,
    val passwordSalt: Column<String>,
    val algorithm: Column<String>,
    val createdAt: Column<Instant>,
    val updatedAt: Column<Instant>,
    val table: Table,
)

data class EseRoleTable(
    val id: Column<Int>,
    val name: Column<String>,
    val description: Column<String?>,
    val createdAt: Column<Instant>,
    val updatedAt: Column<Instant>,
    val table: Table,
)

data class EseUserRolesTable(
    val userId: Column<Int>,
    val roleId: Column<Int>,
    val createdAt: Column<Instant>,
    val updatedAt: Column<Instant>,
    val table: Table,
)

data class EseRolePermissionsTable(
    val role: Column<Int>,
    val permission: Column<Int>,
    val createdAt: Column<Instant>,
    val updatedAt: Column<Instant>,
    val table: Table,
)

data class EseUserPermissionsTable(
    val userId: Column<Int>,
    val permission: Column<Int>,
    val createdAt: Column<Instant>,
    val updatedAt: Column<Instant>,
    val table: Table,
)

data class DomainTables(
    val users: EseUserTable,
    val roles: EseRoleTable,
    val userRoles: EseUserRolesTable,
    val rolePermissions: EseRolePermissionsTable,
    val userPermissions: EseUserPermissionsTable,
    val isMqtt: Boolean,
    val mqttPermissions: Table? = null,
    val stringPermissions: Table? = null,
)

fun resolveDomain(domain: String): DomainTables = when (domain) {
    "mqtt" -> DomainTables(
        users = EseUserTable(MqttUsers.id, MqttUsers.username, MqttUsers.password, MqttUsers.passwordIterations, MqttUsers.passwordSalt, MqttUsers.algorithm, MqttUsers.createdAt, MqttUsers.updatedAt, MqttUsers),
        roles = EseRoleTable(MqttRoles.id, MqttRoles.name, MqttRoles.description, MqttRoles.createdAt, MqttRoles.updatedAt, MqttRoles),
        userRoles = EseUserRolesTable(MqttUserRoles.userId, MqttUserRoles.roleId, MqttUserRoles.createdAt, MqttUserRoles.updatedAt, MqttUserRoles),
        rolePermissions = EseRolePermissionsTable(MqttRolePermissions.role, MqttRolePermissions.permission, MqttRolePermissions.createdAt, MqttRolePermissions.updatedAt, MqttRolePermissions),
        userPermissions = EseUserPermissionsTable(MqttUserPermissions.userId, MqttUserPermissions.permission, MqttUserPermissions.createdAt, MqttUserPermissions.updatedAt, MqttUserPermissions),
        isMqtt = true,
        mqttPermissions = MqttPermissions,
    )
    "cc" -> DomainTables(
        users = EseUserTable(CcUsers.id, CcUsers.username, CcUsers.password, CcUsers.passwordIterations, CcUsers.passwordSalt, CcUsers.algorithm, CcUsers.createdAt, CcUsers.updatedAt, CcUsers),
        roles = EseRoleTable(CcRoles.id, CcRoles.name, CcRoles.description, CcRoles.createdAt, CcRoles.updatedAt, CcRoles),
        userRoles = EseUserRolesTable(CcUserRoles.userId, CcUserRoles.roleId, CcUserRoles.createdAt, CcUserRoles.updatedAt, CcUserRoles),
        rolePermissions = EseRolePermissionsTable(CcRolePermissions.role, CcRolePermissions.permission, CcRolePermissions.createdAt, CcRolePermissions.updatedAt, CcRolePermissions),
        userPermissions = EseUserPermissionsTable(CcUserPermissions.userId, CcUserPermissions.permission, CcUserPermissions.createdAt, CcUserPermissions.updatedAt, CcUserPermissions),
        isMqtt = false,
        stringPermissions = CcPermissions,
    )
    "rest-api" -> DomainTables(
        users = EseUserTable(RestApiUsers.id, RestApiUsers.username, RestApiUsers.password, RestApiUsers.passwordIterations, RestApiUsers.passwordSalt, RestApiUsers.algorithm, RestApiUsers.createdAt, RestApiUsers.updatedAt, RestApiUsers),
        roles = EseRoleTable(RestApiRoles.id, RestApiRoles.name, RestApiRoles.description, RestApiRoles.createdAt, RestApiRoles.updatedAt, RestApiRoles),
        userRoles = EseUserRolesTable(RestApiUserRoles.userId, RestApiUserRoles.roleId, RestApiUserRoles.createdAt, RestApiUserRoles.updatedAt, RestApiUserRoles),
        rolePermissions = EseRolePermissionsTable(RestApiRolePermissions.role, RestApiRolePermissions.permission, RestApiRolePermissions.createdAt, RestApiRolePermissions.updatedAt, RestApiRolePermissions),
        userPermissions = EseUserPermissionsTable(RestApiUserPermissions.userId, RestApiUserPermissions.permission, RestApiUserPermissions.createdAt, RestApiUserPermissions.updatedAt, RestApiUserPermissions),
        isMqtt = false,
        stringPermissions = RestApiPermissions,
    )
    else -> throw IllegalArgumentException("Unknown domain: $domain. Valid domains: mqtt, cc, rest-api")
}
