# ESE Companion v2 PRD — Gaps & Improvements

## Critical Gaps

1. **Password Reset Flow** — No specification for:
   - Forgotten password recovery for companion users
   - Email verification or token-based reset
   - API key rotation / regeneration

2. **Connection Pool Configuration** — Vague specifications:
   - Max total connections across all ESE pools
   - Max connections per pool
   - Idle timeout duration (mentioned but not specified)
   - Pool eviction algorithm details

3. **Data Retention Policies** — Missing:
   - Audit log retention period (archive/delete strategy)
   - Revoked token cleanup schedule
   - Health check history retention

4. **Error Handling & Retries** — Not defined:
   - Retryable vs. permanent error classification
   - Exponential backoff algorithms
   - Timeout values for ESE database connections

5. **API Versioning** — No strategy specified
   - How will breaking changes be handled?
   - Deprecation timeline for old API versions?

6. **Token Lifecycle** — JWT details missing:
   - JWT expiration period (access token duration)
   - Refresh token duration and strategy
   - Concurrent session limits per user

7. **Monitoring & Observability** — Beyond health checks:
   - Prometheus metrics format (or similar)
   - Structured logging (JSON? levels?)
   - Request tracing / OpenTelemetry support

## Design Inconsistencies & Unclear Specs

8. **Brute Force Protection Max Lockout** — Says "15min → 30min → 60min" but no cap specified. Will it eventually become permanent?

9. **API Key Scopes** — Three examples given (`ese:read`, `ese:write`, `ese:admin`) but incomplete:
   - Do these apply to all ESE domains (MQTT, CC, REST API) or separately?
   - What about `companion` domain operations (user/connection management)?
   - Can users scope keys to specific connections?

10. **Connection Password Rotation** — How are ESE database passwords updated in `database_connections` table if it changes in the actual database?

11. **Search/Filter Operators** — Mentioned but not detailed:
    - Exact match only? Regex? Full-text?
    - Case-sensitive? Substring?

12. **"Per-connection stats"** — What exactly counts as a stat?
    - User/role/permission counts?
    - Health check frequency?
    - Query execution metrics?

13. **Frontend State Management** — No library specified (Redux? Zustand? TanStack Query caching?)

14. **Time Zone Handling** — Audit logs and timestamps:
    - Server timezone assumed UTC?
    - User locale detected from browser?
    - Editor timestamps in local or UTC?

## Missing Features & Scenarios

15. **Batch Operations** — No support for:
    - Bulk user/role/permission import/export
    - Bulk delete operations
    - CSV upload for ESE data

16. **Multi-ESE-Version Support** — No mention of:
    - Which versions of HiveMQ ESE are compatible?
    - How to handle schema differences between versions?
    - Migration path for old ESE databases?

17. **Resource Quotas** — No mention of limits:
    - Max users/roles/permissions per connection?
    - Max connections per installation?
    - Max API keys per user?
    - Request rate limits per API key (vs. global IP-based)?

18. **Backup & Disaster Recovery** — Not addressed:
    - Companion database backup strategy?
    - Failover procedures?
    - Recovery from corrupted password hashes?

19. **User Session Management** — Details missing:
    - Can users have multiple concurrent sessions?
    - Session timeout / idle timeout?
    - Device/browser tracking?

20. **Frontend Offline Behavior** — No mention of:
    - Service workers / offline-first?
    - Sync strategy for offline changes?
    - Cache invalidation strategy?

21. **CSRF Protection** — Security headers mentioned but:
    - Anti-CSRF token strategy not specified
    - Double-submit cookies? SameSite attribute?

22. **ESE User Algorithm Defaults** — Says PKCS5S2 with 100 iterations, but:
    - Is this validated against ESE's expectations?
    - What if ESE has its own defaults?

## Operational / DevOps Gaps

23. **Graceful Shutdown Duration** — How long is the connection drain period before SIGTERM forces shutdown?

24. **Database Migration Tools** — Flyway mentioned but:
    - How are pending migrations detected?
    - Rollback strategy?
    - Migration versioning scheme?

25. **Container Image Size** — Multi-stage build is good, but:
    - Any size optimization for alpine base?
    - Expected image size range?

26. **Health Check Frequency** — Not specified:
    - How often do ESE connections get pinged?
    - Timeout for health check requests?

27. **Kubernetes Deployment Assumptions** — Helm chart mentioned but:
    - PVC strategy for logs/data?
    - ConfigMap vs. Secret split appropriate?
    - Network policies needed?

## Recommended Enhancements

### Quick Wins

- Enumerate all possible API key scopes and their meanings
- Define audit log retention policy (e.g., 90 days)
- Specify JWT expiration times (5-min access token, 1-day refresh token)
- Add connection pool limits (e.g., max 50 total ESE connections, 10 per pool)
- Clarify timezone handling (all UTC server-side, user locale for display)

### Important for Completeness

- Password reset flow (email token or security questions)
- Batch import/export API and format spec
- Monitoring/metrics export (Prometheus or similar)
- Resource quota enforcement with 429 responses
- API key scope enforcement per-connection option
- Test strategy / load testing assumptions

### Nice-to-Have

- Feature flags system for gradual rollouts
- User activity dashboard (not just audit logs)
- Connection tagging/labels for grouping
- Scheduled jobs (e.g., weekly report of new users created)
- Dark mode theme specification (which colors, contrast ratios?)
