package com.hivemq.companion.service

import com.hivemq.companion.db.tables.AuditLogs
import com.hivemq.companion.dto.AuditLogDetailResponse
import com.hivemq.companion.dto.AuditLogResponse
import com.hivemq.companion.dto.PaginatedResponse
import kotlinx.datetime.Clock
import kotlinx.datetime.Instant
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.greaterEq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.lessEq
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.slf4j.LoggerFactory
import java.util.*
import kotlin.time.Duration.Companion.days

class AuditLogService(private val database: Database, private val retentionDays: Int = 90) {

    private val logger = LoggerFactory.getLogger(AuditLogService::class.java)

    suspend fun log(
        actorType: String,
        actorId: UUID,
        actorName: String,
        connectionId: UUID? = null,
        connectionName: String? = null,
        domain: String,
        action: String,
        resourceType: String,
        resourceId: String,
        resourceName: String? = null,
        details: String? = null,
        ipAddress: String,
        userAgent: String,
    ) {
        newSuspendedTransaction(db = database) {
            AuditLogs.insert {
                it[AuditLogs.timestamp] = Clock.System.now()
                it[AuditLogs.actorType] = actorType
                it[AuditLogs.actorId] = actorId
                it[AuditLogs.actorName] = actorName
                it[AuditLogs.connectionId] = connectionId
                it[AuditLogs.connectionName] = connectionName
                it[AuditLogs.domain] = domain
                it[AuditLogs.action] = action
                it[AuditLogs.resourceType] = resourceType
                it[AuditLogs.resourceId] = resourceId
                it[AuditLogs.resourceName] = resourceName
                it[AuditLogs.details] = details
                it[AuditLogs.ipAddress] = ipAddress
                it[AuditLogs.userAgent] = userAgent
            }
        }
    }

    suspend fun list(
        page: Int,
        size: Int,
        actorId: UUID? = null,
        connectionId: UUID? = null,
        domain: String? = null,
        action: String? = null,
        fromDate: String? = null,
        toDate: String? = null,
    ): PaginatedResponse<AuditLogResponse> = newSuspendedTransaction(db = database) {
        val conditions = mutableListOf<Op<Boolean>>()

        actorId?.let { conditions.add(AuditLogs.actorId eq it) }
        connectionId?.let { conditions.add(AuditLogs.connectionId eq it) }
        domain?.let { conditions.add(AuditLogs.domain eq it) }
        action?.let { conditions.add(AuditLogs.action eq it) }
        fromDate?.let {
            val instant = Instant.parse(it)
            conditions.add(AuditLogs.timestamp greaterEq instant)
        }
        toDate?.let {
            val instant = Instant.parse(it)
            conditions.add(AuditLogs.timestamp lessEq instant)
        }

        val whereClause: Op<Boolean> = if (conditions.isEmpty()) {
            Op.TRUE
        } else {
            conditions.reduce { acc, op -> acc and op }
        }

        val total = AuditLogs.selectAll().where { whereClause }.count()

        val items = AuditLogs.selectAll()
            .where { whereClause }
            .orderBy(AuditLogs.timestamp, SortOrder.DESC)
            .limit(size)
            .offset(((page - 1) * size).toLong())
            .map { row ->
                AuditLogResponse(
                    id = row[AuditLogs.id],
                    timestamp = row[AuditLogs.timestamp].toString(),
                    actorType = row[AuditLogs.actorType],
                    actorName = row[AuditLogs.actorName],
                    connectionName = row[AuditLogs.connectionName],
                    domain = row[AuditLogs.domain],
                    action = row[AuditLogs.action],
                    resourceType = row[AuditLogs.resourceType],
                    resourceName = row[AuditLogs.resourceName],
                )
            }

        PaginatedResponse(items = items, page = page, size = size, total = total)
    }

    suspend fun findById(logId: Long): AuditLogDetailResponse? = newSuspendedTransaction(db = database) {
        AuditLogs.selectAll().where { AuditLogs.id eq logId }
            .singleOrNull()
            ?.let { row ->
                AuditLogDetailResponse(
                    id = row[AuditLogs.id],
                    timestamp = row[AuditLogs.timestamp].toString(),
                    actorType = row[AuditLogs.actorType],
                    actorId = row[AuditLogs.actorId].toString(),
                    actorName = row[AuditLogs.actorName],
                    connectionId = row[AuditLogs.connectionId]?.toString(),
                    connectionName = row[AuditLogs.connectionName],
                    domain = row[AuditLogs.domain],
                    action = row[AuditLogs.action],
                    resourceType = row[AuditLogs.resourceType],
                    resourceId = row[AuditLogs.resourceId],
                    resourceName = row[AuditLogs.resourceName],
                    details = row[AuditLogs.details],
                    ipAddress = row[AuditLogs.ipAddress],
                    userAgent = row[AuditLogs.userAgent],
                )
            }
    }

    suspend fun cleanupOldLogs() {
        val cutoff = Clock.System.now().minus(retentionDays.days)
        val deleted = newSuspendedTransaction(db = database) {
            AuditLogs.deleteWhere { AuditLogs.timestamp lessEq cutoff }
        }
        logger.info("Audit log cleanup: removed $deleted entries older than $retentionDays days")
    }
}
