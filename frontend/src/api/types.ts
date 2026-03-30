export interface UserInfo {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserInfo;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

// Connections
export interface Connection {
  id: string;
  name: string;
  description: string | null;
  dbType: string;
  host: string;
  port: number;
  databaseName: string;
  username: string;
  sslEnabled: boolean;
  sslIgnoreCertificate: boolean;
  connectionParams: string | null;
  healthStatus: string;
  lastHealthCheck: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConnectionRequest {
  name: string;
  description?: string;
  dbType: string;
  host: string;
  port: number;
  databaseName: string;
  username: string;
  password: string;
  sslEnabled?: boolean;
  sslIgnoreCertificate?: boolean;
  connectionParams?: string;
}

export interface UpdateConnectionRequest {
  name?: string;
  description?: string;
  host?: string;
  port?: number;
  databaseName?: string;
  username?: string;
  password?: string;
  sslEnabled?: boolean;
  sslIgnoreCertificate?: boolean;
  connectionParams?: string;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
}

// ESE Entities
export interface EseUser {
  id: number;
  username: string;
  algorithm: string;
  iterations: number;
  createdAt: string;
  updatedAt: string;
  roles: string[];
}

export interface CreateEseUserRequest {
  username: string;
  password: string;
  algorithm?: string;
  iterations?: number;
}

export interface UpdateEseUserRequest {
  username?: string;
  password?: string;
  algorithm?: string;
  iterations?: number;
}

export interface EseRole {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEseRoleRequest {
  name: string;
  description?: string;
}

export interface UpdateEseRoleRequest {
  name?: string;
  description?: string;
}

// MQTT permissions (topic-based)
export interface MqttPermission {
  id: number;
  topic: string;
  publishAllowed: boolean;
  subscribeAllowed: boolean;
  qos0Allowed: boolean;
  qos1Allowed: boolean;
  qos2Allowed: boolean;
  retainedMsgsAllowed: boolean;
  sharedSubAllowed: boolean;
  sharedGroup: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMqttPermissionRequest {
  topic: string;
  publishAllowed?: boolean;
  subscribeAllowed?: boolean;
  qos0Allowed?: boolean;
  qos1Allowed?: boolean;
  qos2Allowed?: boolean;
  retainedMsgsAllowed?: boolean;
  sharedSubAllowed?: boolean;
  sharedGroup?: string;
}

// CC/REST API permissions (string-based)
export interface StringPermission {
  id: number;
  permissionString: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStringPermissionRequest {
  permissionString: string;
  description?: string;
}

// Companion Users
export interface CompanionUser {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanionUserRequest {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateCompanionUserRequest {
  email?: string;
  role?: string;
  password?: string;
}

// API Keys
export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  expiresAt: string;
  lastUsedAt: string | null;
  createdAt: string;
  userId: string;
}

export interface ApiKeyCreated {
  id: string;
  name: string;
  key: string;
  keyPrefix: string;
  scopes: string[];
  expiresAt: string;
  createdAt: string;
}

export interface CreateApiKeyRequest {
  name: string;
  scopes: string[];
  expiresAt: string;
}

export interface UpdateApiKeyRequest {
  name?: string;
  scopes?: string[];
  expiresAt?: string;
}

// Audit Logs
export interface AuditLogEntry {
  id: number;
  timestamp: string;
  actorType: string;
  actorName: string;
  connectionName: string | null;
  domain: string;
  action: string;
  resourceType: string;
  resourceName: string | null;
}

export interface AuditLogDetail extends AuditLogEntry {
  actorId: string;
  connectionId: string | null;
  resourceId: string;
  details: string | null;
  ipAddress: string;
  userAgent: string;
}

// Dashboard
export interface DashboardResponse {
  connections: ConnectionSummary[];
  totalConnections: number;
  healthyConnections: number;
  unreachableConnections: number;
}

export interface ConnectionSummary {
  id: string;
  name: string;
  dbType: string;
  healthStatus: string;
  lastHealthCheck: string | null;
  stats: ConnectionStats | null;
}

export interface ConnectionStats {
  mqtt: DomainStats;
  cc: DomainStats;
  restApi: DomainStats;
}

export interface DomainStats {
  userCount: number;
  roleCount: number;
  permissionCount: number;
}
