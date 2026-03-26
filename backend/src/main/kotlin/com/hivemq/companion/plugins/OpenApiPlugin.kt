package com.hivemq.companion.plugins

import io.ktor.http.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.openApiRoutes() {
    get("/api/v1/openapi.json") {
        call.respondText(OPENAPI_SPEC, ContentType.Application.Json)
    }

    get("/api/v1/docs") {
        call.respondText(SWAGGER_UI_HTML, ContentType.Text.Html)
    }
}

private val SWAGGER_UI_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ESE Companion API Docs</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
    <style>
        html { box-sizing: border-box; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin: 0; background: #fafafa; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
        SwaggerUIBundle({
            url: '/api/v1/openapi.json',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIBundle.SwaggerUIStandalonePreset
            ],
            layout: "BaseLayout"
        });
    </script>
</body>
</html>
""".trimIndent()

private val OPENAPI_SPEC = """
{
  "openapi": "3.0.3",
  "info": {
    "title": "ESE Companion API",
    "description": "API for managing HiveMQ Enterprise Security Extension (ESE) configurations, including users, roles, permissions, connections, and companion platform resources.",
    "version": "2.0.0",
    "contact": {
      "name": "HiveMQ"
    }
  },
  "servers": [
    {
      "url": "/",
      "description": "Current server"
    }
  ],
  "tags": [
    { "name": "Auth", "description": "Authentication and session management" },
    { "name": "Users", "description": "Companion platform user management" },
    { "name": "API Keys", "description": "API key management" },
    { "name": "Connections", "description": "ESE database connection management" },
    { "name": "ESE Users", "description": "ESE domain user management (MQTT, CC, REST API)" },
    { "name": "ESE Roles", "description": "ESE domain role management" },
    { "name": "ESE Permissions", "description": "ESE domain permission management" },
    { "name": "Dashboard", "description": "Dashboard and statistics" },
    { "name": "Audit Logs", "description": "Audit log retrieval" },
    { "name": "Health", "description": "Health check endpoints" }
  ],
  "paths": {
    "/health/live": {
      "get": {
        "tags": ["Health"],
        "summary": "Liveness probe",
        "operationId": "healthLive",
        "security": [],
        "responses": {
          "200": {
            "description": "Service is alive",
            "content": {
              "text/plain": {
                "schema": { "type": "string", "example": "OK" }
              }
            }
          }
        }
      }
    },
    "/api/v1/auth/login": {
      "post": {
        "tags": ["Auth"],
        "summary": "Authenticate and obtain tokens",
        "operationId": "login",
        "security": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "${'$'}ref": "#/components/schemas/LoginRequest" }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Login successful",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/LoginResponse" }
              }
            }
          },
          "401": {
            "description": "Invalid credentials",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          },
          "423": {
            "description": "Account temporarily locked",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/v1/auth/refresh": {
      "post": {
        "tags": ["Auth"],
        "summary": "Refresh access token",
        "operationId": "refreshToken",
        "security": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "${'$'}ref": "#/components/schemas/RefreshRequest" }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Tokens refreshed",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/TokenResponse" }
              }
            }
          },
          "401": {
            "description": "Invalid or expired refresh token",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/v1/auth/logout": {
      "post": {
        "tags": ["Auth"],
        "summary": "Logout and invalidate session",
        "operationId": "logout",
        "responses": {
          "200": {
            "description": "Logged out successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": { "type": "string" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/users": {
      "get": {
        "tags": ["Users"],
        "summary": "List all users (admin only)",
        "operationId": "listUsers",
        "parameters": [
          { "name": "page", "in": "query", "schema": { "type": "integer", "default": 1 } },
          { "name": "size", "in": "query", "schema": { "type": "integer", "default": 20 } }
        ],
        "responses": {
          "200": {
            "description": "Paginated list of users",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/PaginatedUserResponse" }
              }
            }
          },
          "403": {
            "description": "Admin access required",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      },
      "post": {
        "tags": ["Users"],
        "summary": "Create a new user (admin only)",
        "operationId": "createUser",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "${'$'}ref": "#/components/schemas/CreateUserRequest" }
            }
          }
        },
        "responses": {
          "201": {
            "description": "User created",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/UserResponse" }
              }
            }
          },
          "409": {
            "description": "Username already exists",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/v1/users/{userId}": {
      "get": {
        "tags": ["Users"],
        "summary": "Get user by ID (admin only)",
        "operationId": "getUser",
        "parameters": [
          { "name": "userId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } }
        ],
        "responses": {
          "200": {
            "description": "User details",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/UserResponse" }
              }
            }
          },
          "404": {
            "description": "User not found",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      },
      "put": {
        "tags": ["Users"],
        "summary": "Update a user (admin only)",
        "operationId": "updateUser",
        "parameters": [
          { "name": "userId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "${'$'}ref": "#/components/schemas/UpdateUserRequest" }
            }
          }
        },
        "responses": {
          "200": {
            "description": "User updated",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/UserResponse" }
              }
            }
          },
          "404": {
            "description": "User not found",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      },
      "delete": {
        "tags": ["Users"],
        "summary": "Delete a user (admin only)",
        "operationId": "deleteUser",
        "parameters": [
          { "name": "userId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } }
        ],
        "responses": {
          "200": {
            "description": "User deleted",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": { "message": { "type": "string" } }
                }
              }
            }
          },
          "404": {
            "description": "User not found",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/v1/keys": {
      "get": {
        "tags": ["API Keys"],
        "summary": "List API keys",
        "operationId": "listApiKeys",
        "responses": {
          "200": {
            "description": "List of API keys",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": { "${'$'}ref": "#/components/schemas/ApiKeyResponse" }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": ["API Keys"],
        "summary": "Create a new API key",
        "operationId": "createApiKey",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "${'$'}ref": "#/components/schemas/CreateApiKeyRequest" }
            }
          }
        },
        "responses": {
          "201": {
            "description": "API key created",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ApiKeyResponse" }
              }
            }
          },
          "400": {
            "description": "Invalid scopes",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/v1/keys/{keyId}": {
      "get": {
        "tags": ["API Keys"],
        "summary": "Get API key by ID",
        "operationId": "getApiKey",
        "parameters": [
          { "name": "keyId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } }
        ],
        "responses": {
          "200": {
            "description": "API key details",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ApiKeyResponse" }
              }
            }
          },
          "404": {
            "description": "API key not found",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      },
      "put": {
        "tags": ["API Keys"],
        "summary": "Update an API key",
        "operationId": "updateApiKey",
        "parameters": [
          { "name": "keyId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "${'$'}ref": "#/components/schemas/UpdateApiKeyRequest" }
            }
          }
        },
        "responses": {
          "200": {
            "description": "API key updated",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ApiKeyResponse" }
              }
            }
          },
          "404": {
            "description": "API key not found",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      },
      "delete": {
        "tags": ["API Keys"],
        "summary": "Revoke an API key",
        "operationId": "deleteApiKey",
        "parameters": [
          { "name": "keyId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } }
        ],
        "responses": {
          "200": {
            "description": "API key revoked",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": { "message": { "type": "string" } }
                }
              }
            }
          },
          "404": {
            "description": "API key not found",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/v1/connections": {
      "get": {
        "tags": ["Connections"],
        "summary": "List all connections (admin only)",
        "operationId": "listConnections",
        "parameters": [
          { "name": "page", "in": "query", "schema": { "type": "integer", "default": 1 } },
          { "name": "size", "in": "query", "schema": { "type": "integer", "default": 20 } }
        ],
        "responses": {
          "200": {
            "description": "Paginated list of connections",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/PaginatedConnectionResponse" }
              }
            }
          }
        }
      },
      "post": {
        "tags": ["Connections"],
        "summary": "Create a new connection (admin only)",
        "operationId": "createConnection",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "${'$'}ref": "#/components/schemas/CreateConnectionRequest" }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Connection created",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ConnectionResponse" }
              }
            }
          }
        }
      }
    },
    "/api/v1/connections/{connId}": {
      "get": {
        "tags": ["Connections"],
        "summary": "Get connection by ID (admin only)",
        "operationId": "getConnection",
        "parameters": [
          { "name": "connId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } }
        ],
        "responses": {
          "200": {
            "description": "Connection details",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ConnectionResponse" }
              }
            }
          },
          "404": {
            "description": "Connection not found",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      },
      "put": {
        "tags": ["Connections"],
        "summary": "Update a connection (admin only)",
        "operationId": "updateConnection",
        "parameters": [
          { "name": "connId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "${'$'}ref": "#/components/schemas/UpdateConnectionRequest" }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Connection updated",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ConnectionResponse" }
              }
            }
          },
          "404": {
            "description": "Connection not found",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      },
      "delete": {
        "tags": ["Connections"],
        "summary": "Delete a connection (admin only)",
        "operationId": "deleteConnection",
        "parameters": [
          { "name": "connId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } }
        ],
        "responses": {
          "200": {
            "description": "Connection deleted",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": { "message": { "type": "string" } }
                }
              }
            }
          },
          "404": {
            "description": "Connection not found",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/v1/connections/{connId}/test": {
      "post": {
        "tags": ["Connections"],
        "summary": "Test a connection (admin only)",
        "operationId": "testConnection",
        "parameters": [
          { "name": "connId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } }
        ],
        "responses": {
          "200": {
            "description": "Connection test result",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ConnectionTestResult" }
              }
            }
          }
        }
      }
    },
    "/api/v1/connections/{connId}/health": {
      "get": {
        "tags": ["Connections"],
        "summary": "Get connection health (admin only)",
        "operationId": "getConnectionHealth",
        "parameters": [
          { "name": "connId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } }
        ],
        "responses": {
          "200": {
            "description": "Connection health status",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ConnectionHealth" }
              }
            }
          },
          "404": {
            "description": "Connection not found",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/v1/ese/{connId}/{domain}/users": {
      "get": {
        "tags": ["ESE Users"],
        "summary": "List ESE users for a connection and domain",
        "operationId": "listEseUsers",
        "parameters": [
          { "name": "connId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } },
          { "name": "domain", "in": "path", "required": true, "schema": { "type": "string", "enum": ["mqtt", "cc", "rest-api"] } },
          { "name": "page", "in": "query", "schema": { "type": "integer", "default": 1 } },
          { "name": "size", "in": "query", "schema": { "type": "integer", "default": 20 } },
          { "name": "search", "in": "query", "schema": { "type": "string" } }
        ],
        "responses": {
          "200": {
            "description": "Paginated list of ESE users",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/PaginatedEseUserResponse" }
              }
            }
          }
        }
      },
      "post": {
        "tags": ["ESE Users"],
        "summary": "Create an ESE user",
        "operationId": "createEseUser",
        "parameters": [
          { "name": "connId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } },
          { "name": "domain", "in": "path", "required": true, "schema": { "type": "string", "enum": ["mqtt", "cc", "rest-api"] } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "${'$'}ref": "#/components/schemas/CreateEseUserRequest" }
            }
          }
        },
        "responses": {
          "201": {
            "description": "ESE user created",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/EseUserResponse" }
              }
            }
          }
        }
      }
    },
    "/api/v1/ese/{connId}/{domain}/users/{id}": {
      "get": {
        "tags": ["ESE Users"],
        "summary": "Get ESE user by ID",
        "operationId": "getEseUser",
        "parameters": [
          { "name": "connId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } },
          { "name": "domain", "in": "path", "required": true, "schema": { "type": "string", "enum": ["mqtt", "cc", "rest-api"] } },
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "responses": {
          "200": {
            "description": "ESE user details",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/EseUserResponse" }
              }
            }
          },
          "404": {
            "description": "User not found",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      },
      "put": {
        "tags": ["ESE Users"],
        "summary": "Update an ESE user",
        "operationId": "updateEseUser",
        "parameters": [
          { "name": "connId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } },
          { "name": "domain", "in": "path", "required": true, "schema": { "type": "string", "enum": ["mqtt", "cc", "rest-api"] } },
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "${'$'}ref": "#/components/schemas/UpdateEseUserRequest" }
            }
          }
        },
        "responses": {
          "200": {
            "description": "ESE user updated",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/EseUserResponse" }
              }
            }
          },
          "404": {
            "description": "User not found",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      },
      "delete": {
        "tags": ["ESE Users"],
        "summary": "Delete an ESE user",
        "operationId": "deleteEseUser",
        "parameters": [
          { "name": "connId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } },
          { "name": "domain", "in": "path", "required": true, "schema": { "type": "string", "enum": ["mqtt", "cc", "rest-api"] } },
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "responses": {
          "200": {
            "description": "User deleted",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/AssociationResponse" }
              }
            }
          },
          "404": {
            "description": "User not found",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/v1/ese/{connId}/{domain}/users/{id}/roles/{roleId}": {
      "post": {
        "tags": ["ESE Users"],
        "summary": "Assign a role to an ESE user",
        "operationId": "assignRoleToEseUser",
        "parameters": [
          { "name": "connId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } },
          { "name": "domain", "in": "path", "required": true, "schema": { "type": "string", "enum": ["mqtt", "cc", "rest-api"] } },
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } },
          { "name": "roleId", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "responses": {
          "201": {
            "description": "Role assigned to user",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/AssociationResponse" }
              }
            }
          },
          "409": {
            "description": "Association already exists",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      },
      "delete": {
        "tags": ["ESE Users"],
        "summary": "Remove a role from an ESE user",
        "operationId": "removeRoleFromEseUser",
        "parameters": [
          { "name": "connId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } },
          { "name": "domain", "in": "path", "required": true, "schema": { "type": "string", "enum": ["mqtt", "cc", "rest-api"] } },
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } },
          { "name": "roleId", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "responses": {
          "200": {
            "description": "Role removed from user",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/AssociationResponse" }
              }
            }
          },
          "404": {
            "description": "Association not found",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/v1/ese/{connId}/{domain}/users/{id}/permissions/{permId}": {
      "post": {
        "tags": ["ESE Users"],
        "summary": "Assign a permission to an ESE user",
        "operationId": "assignPermissionToEseUser",
        "parameters": [
          { "name": "connId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } },
          { "name": "domain", "in": "path", "required": true, "schema": { "type": "string", "enum": ["mqtt", "cc", "rest-api"] } },
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } },
          { "name": "permId", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "responses": {
          "201": {
            "description": "Permission assigned to user",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/AssociationResponse" }
              }
            }
          },
          "409": {
            "description": "Association already exists",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      },
      "delete": {
        "tags": ["ESE Users"],
        "summary": "Remove a permission from an ESE user",
        "operationId": "removePermissionFromEseUser",
        "parameters": [
          { "name": "connId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } },
          { "name": "domain", "in": "path", "required": true, "schema": { "type": "string", "enum": ["mqtt", "cc", "rest-api"] } },
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } },
          { "name": "permId", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "responses": {
          "200": {
            "description": "Permission removed from user",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/AssociationResponse" }
              }
            }
          },
          "404": {
            "description": "Association not found",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/v1/ese/{connId}/{domain}/roles": {
      "get": {
        "tags": ["ESE Roles"],
        "summary": "List ESE roles for a connection and domain",
        "operationId": "listEseRoles",
        "parameters": [
          { "name": "connId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } },
          { "name": "domain", "in": "path", "required": true, "schema": { "type": "string", "enum": ["mqtt", "cc", "rest-api"] } },
          { "name": "page", "in": "query", "schema": { "type": "integer", "default": 1 } },
          { "name": "size", "in": "query", "schema": { "type": "integer", "default": 20 } }
        ],
        "responses": {
          "200": {
            "description": "Paginated list of ESE roles",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/PaginatedEseRoleResponse" }
              }
            }
          }
        }
      },
      "post": {
        "tags": ["ESE Roles"],
        "summary": "Create an ESE role",
        "operationId": "createEseRole",
        "parameters": [
          { "name": "connId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } },
          { "name": "domain", "in": "path", "required": true, "schema": { "type": "string", "enum": ["mqtt", "cc", "rest-api"] } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "${'$'}ref": "#/components/schemas/CreateEseRoleRequest" }
            }
          }
        },
        "responses": {
          "201": {
            "description": "ESE role created",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/EseRoleResponse" }
              }
            }
          }
        }
      }
    },
    "/api/v1/ese/{connId}/{domain}/roles/{id}": {
      "put": {
        "tags": ["ESE Roles"],
        "summary": "Update an ESE role",
        "operationId": "updateEseRole",
        "parameters": [
          { "name": "connId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } },
          { "name": "domain", "in": "path", "required": true, "schema": { "type": "string", "enum": ["mqtt", "cc", "rest-api"] } },
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "${'$'}ref": "#/components/schemas/UpdateEseRoleRequest" }
            }
          }
        },
        "responses": {
          "200": {
            "description": "ESE role updated",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/EseRoleResponse" }
              }
            }
          },
          "404": {
            "description": "Role not found",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      },
      "delete": {
        "tags": ["ESE Roles"],
        "summary": "Delete an ESE role",
        "operationId": "deleteEseRole",
        "parameters": [
          { "name": "connId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } },
          { "name": "domain", "in": "path", "required": true, "schema": { "type": "string", "enum": ["mqtt", "cc", "rest-api"] } },
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "responses": {
          "200": {
            "description": "Role deleted",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/AssociationResponse" }
              }
            }
          },
          "404": {
            "description": "Role not found",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/v1/ese/{connId}/{domain}/roles/{id}/permissions/{permId}": {
      "post": {
        "tags": ["ESE Roles"],
        "summary": "Assign a permission to an ESE role",
        "operationId": "assignPermissionToEseRole",
        "parameters": [
          { "name": "connId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } },
          { "name": "domain", "in": "path", "required": true, "schema": { "type": "string", "enum": ["mqtt", "cc", "rest-api"] } },
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } },
          { "name": "permId", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "responses": {
          "201": {
            "description": "Permission assigned to role",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/AssociationResponse" }
              }
            }
          },
          "409": {
            "description": "Association already exists",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      },
      "delete": {
        "tags": ["ESE Roles"],
        "summary": "Remove a permission from an ESE role",
        "operationId": "removePermissionFromEseRole",
        "parameters": [
          { "name": "connId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } },
          { "name": "domain", "in": "path", "required": true, "schema": { "type": "string", "enum": ["mqtt", "cc", "rest-api"] } },
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } },
          { "name": "permId", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "responses": {
          "200": {
            "description": "Permission removed from role",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/AssociationResponse" }
              }
            }
          },
          "404": {
            "description": "Association not found",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/v1/ese/{connId}/{domain}/permissions": {
      "get": {
        "tags": ["ESE Permissions"],
        "summary": "List ESE permissions for a connection and domain",
        "operationId": "listEsePermissions",
        "parameters": [
          { "name": "connId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } },
          { "name": "domain", "in": "path", "required": true, "schema": { "type": "string", "enum": ["mqtt", "cc", "rest-api"] } },
          { "name": "page", "in": "query", "schema": { "type": "integer", "default": 1 } },
          { "name": "size", "in": "query", "schema": { "type": "integer", "default": 20 } }
        ],
        "responses": {
          "200": {
            "description": "Paginated list of ESE permissions",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/PaginatedEsePermissionResponse" }
              }
            }
          }
        }
      },
      "post": {
        "tags": ["ESE Permissions"],
        "summary": "Create an ESE permission",
        "operationId": "createEsePermission",
        "parameters": [
          { "name": "connId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } },
          { "name": "domain", "in": "path", "required": true, "schema": { "type": "string", "enum": ["mqtt", "cc", "rest-api"] } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "oneOf": [
                  { "${'$'}ref": "#/components/schemas/CreateMqttPermissionRequest" },
                  { "${'$'}ref": "#/components/schemas/CreateStringPermissionRequest" }
                ]
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "ESE permission created",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/EsePermissionResponse" }
              }
            }
          }
        }
      }
    },
    "/api/v1/ese/{connId}/{domain}/permissions/{id}": {
      "put": {
        "tags": ["ESE Permissions"],
        "summary": "Update an ESE permission",
        "operationId": "updateEsePermission",
        "parameters": [
          { "name": "connId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } },
          { "name": "domain", "in": "path", "required": true, "schema": { "type": "string", "enum": ["mqtt", "cc", "rest-api"] } },
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "oneOf": [
                  { "${'$'}ref": "#/components/schemas/UpdateMqttPermissionRequest" },
                  { "${'$'}ref": "#/components/schemas/UpdateStringPermissionRequest" }
                ]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "ESE permission updated",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/EsePermissionResponse" }
              }
            }
          },
          "404": {
            "description": "Permission not found",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      },
      "delete": {
        "tags": ["ESE Permissions"],
        "summary": "Delete an ESE permission",
        "operationId": "deleteEsePermission",
        "parameters": [
          { "name": "connId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } },
          { "name": "domain", "in": "path", "required": true, "schema": { "type": "string", "enum": ["mqtt", "cc", "rest-api"] } },
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "responses": {
          "200": {
            "description": "Permission deleted",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/AssociationResponse" }
              }
            }
          },
          "404": {
            "description": "Permission not found",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/v1/dashboard": {
      "get": {
        "tags": ["Dashboard"],
        "summary": "Get dashboard overview (admin only)",
        "operationId": "getDashboard",
        "responses": {
          "200": {
            "description": "Dashboard overview with connection summaries and statistics",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/DashboardResponse" }
              }
            }
          }
        }
      }
    },
    "/api/v1/ese/{connId}/stats": {
      "get": {
        "tags": ["Dashboard"],
        "summary": "Get statistics for a specific connection (admin only)",
        "operationId": "getConnectionStats",
        "parameters": [
          { "name": "connId", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } }
        ],
        "responses": {
          "200": {
            "description": "Connection statistics",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ConnectionStats" }
              }
            }
          },
          "404": {
            "description": "Connection not found",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/v1/audit-logs": {
      "get": {
        "tags": ["Audit Logs"],
        "summary": "List audit logs (admin only)",
        "operationId": "listAuditLogs",
        "parameters": [
          { "name": "page", "in": "query", "schema": { "type": "integer", "default": 1 } },
          { "name": "size", "in": "query", "schema": { "type": "integer", "default": 20 } },
          { "name": "actorId", "in": "query", "schema": { "type": "string", "format": "uuid" } },
          { "name": "connectionId", "in": "query", "schema": { "type": "string", "format": "uuid" } },
          { "name": "domain", "in": "query", "schema": { "type": "string" } },
          { "name": "action", "in": "query", "schema": { "type": "string" } },
          { "name": "from", "in": "query", "schema": { "type": "string", "format": "date-time" } },
          { "name": "to", "in": "query", "schema": { "type": "string", "format": "date-time" } }
        ],
        "responses": {
          "200": {
            "description": "Paginated list of audit log entries",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/PaginatedAuditLogResponse" }
              }
            }
          }
        }
      }
    },
    "/api/v1/audit-logs/{logId}": {
      "get": {
        "tags": ["Audit Logs"],
        "summary": "Get audit log entry by ID (admin only)",
        "operationId": "getAuditLog",
        "parameters": [
          { "name": "logId", "in": "path", "required": true, "schema": { "type": "integer", "format": "int64" } }
        ],
        "responses": {
          "200": {
            "description": "Audit log entry details",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/AuditLogEntry" }
              }
            }
          },
          "404": {
            "description": "Audit log entry not found",
            "content": {
              "application/json": {
                "schema": { "${'$'}ref": "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT"
      },
      "apiKeyAuth": {
        "type": "apiKey",
        "in": "header",
        "name": "X-API-Key"
      }
    },
    "schemas": {
      "ErrorResponse": {
        "type": "object",
        "required": ["message"],
        "properties": {
          "message": { "type": "string" }
        }
      },
      "AssociationResponse": {
        "type": "object",
        "required": ["message"],
        "properties": {
          "message": { "type": "string" }
        }
      },
      "LoginRequest": {
        "type": "object",
        "required": ["username", "password"],
        "properties": {
          "username": { "type": "string" },
          "password": { "type": "string" }
        }
      },
      "LoginResponse": {
        "type": "object",
        "properties": {
          "accessToken": { "type": "string" },
          "refreshToken": { "type": "string" },
          "user": { "${'$'}ref": "#/components/schemas/UserInfo" }
        }
      },
      "UserInfo": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "username": { "type": "string" },
          "email": { "type": "string" },
          "role": { "type": "string" }
        }
      },
      "RefreshRequest": {
        "type": "object",
        "required": ["refreshToken"],
        "properties": {
          "refreshToken": { "type": "string" }
        }
      },
      "TokenResponse": {
        "type": "object",
        "properties": {
          "accessToken": { "type": "string" },
          "refreshToken": { "type": "string" }
        }
      },
      "UserResponse": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "username": { "type": "string" },
          "email": { "type": "string" },
          "role": { "type": "string" },
          "createdAt": { "type": "string" },
          "updatedAt": { "type": "string" }
        }
      },
      "CreateUserRequest": {
        "type": "object",
        "required": ["username", "email", "password", "role"],
        "properties": {
          "username": { "type": "string" },
          "email": { "type": "string" },
          "password": { "type": "string" },
          "role": { "type": "string", "enum": ["admin", "user", "readonly"] }
        }
      },
      "UpdateUserRequest": {
        "type": "object",
        "properties": {
          "email": { "type": "string" },
          "password": { "type": "string" },
          "role": { "type": "string", "enum": ["admin", "user", "readonly"] }
        }
      },
      "PaginatedUserResponse": {
        "type": "object",
        "properties": {
          "items": { "type": "array", "items": { "${'$'}ref": "#/components/schemas/UserResponse" } },
          "page": { "type": "integer" },
          "size": { "type": "integer" },
          "total": { "type": "integer", "format": "int64" }
        }
      },
      "ApiKeyResponse": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "prefix": { "type": "string" },
          "scopes": { "type": "array", "items": { "type": "string" } },
          "userId": { "type": "string" },
          "createdAt": { "type": "string" },
          "expiresAt": { "type": "string" }
        }
      },
      "CreateApiKeyRequest": {
        "type": "object",
        "required": ["name", "scopes"],
        "properties": {
          "name": { "type": "string" },
          "scopes": { "type": "array", "items": { "type": "string", "enum": ["ese:read", "ese:write", "ese:admin"] } },
          "expiresAt": { "type": "string", "format": "date-time" }
        }
      },
      "UpdateApiKeyRequest": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "scopes": { "type": "array", "items": { "type": "string", "enum": ["ese:read", "ese:write", "ese:admin"] } }
        }
      },
      "ConnectionResponse": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "dbType": { "type": "string" },
          "host": { "type": "string" },
          "port": { "type": "integer" },
          "databaseName": { "type": "string" },
          "username": { "type": "string" },
          "healthStatus": { "type": "string" },
          "lastHealthCheck": { "type": "string" },
          "createdAt": { "type": "string" },
          "updatedAt": { "type": "string" }
        }
      },
      "CreateConnectionRequest": {
        "type": "object",
        "required": ["name", "dbType", "host", "port", "databaseName", "username", "password"],
        "properties": {
          "name": { "type": "string" },
          "dbType": { "type": "string", "enum": ["postgresql", "mysql", "mssql"] },
          "host": { "type": "string" },
          "port": { "type": "integer" },
          "databaseName": { "type": "string" },
          "username": { "type": "string" },
          "password": { "type": "string" },
          "useSsl": { "type": "boolean" }
        }
      },
      "UpdateConnectionRequest": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "host": { "type": "string" },
          "port": { "type": "integer" },
          "databaseName": { "type": "string" },
          "username": { "type": "string" },
          "password": { "type": "string" },
          "useSsl": { "type": "boolean" }
        }
      },
      "PaginatedConnectionResponse": {
        "type": "object",
        "properties": {
          "items": { "type": "array", "items": { "${'$'}ref": "#/components/schemas/ConnectionResponse" } },
          "page": { "type": "integer" },
          "size": { "type": "integer" },
          "total": { "type": "integer", "format": "int64" }
        }
      },
      "ConnectionTestResult": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "message": { "type": "string" },
          "latencyMs": { "type": "integer" }
        }
      },
      "ConnectionHealth": {
        "type": "object",
        "properties": {
          "status": { "type": "string" },
          "lastCheck": { "type": "string" },
          "message": { "type": "string" }
        }
      },
      "EseUserResponse": {
        "type": "object",
        "properties": {
          "id": { "type": "integer" },
          "username": { "type": "string" },
          "password": { "type": "string", "description": "Hashed password" },
          "roles": { "type": "array", "items": { "type": "object" } },
          "permissions": { "type": "array", "items": { "type": "object" } }
        }
      },
      "CreateEseUserRequest": {
        "type": "object",
        "required": ["username", "password"],
        "properties": {
          "username": { "type": "string" },
          "password": { "type": "string" }
        }
      },
      "UpdateEseUserRequest": {
        "type": "object",
        "properties": {
          "username": { "type": "string" },
          "password": { "type": "string" }
        }
      },
      "PaginatedEseUserResponse": {
        "type": "object",
        "properties": {
          "items": { "type": "array", "items": { "${'$'}ref": "#/components/schemas/EseUserResponse" } },
          "page": { "type": "integer" },
          "size": { "type": "integer" },
          "total": { "type": "integer", "format": "int64" }
        }
      },
      "EseRoleResponse": {
        "type": "object",
        "properties": {
          "id": { "type": "integer" },
          "name": { "type": "string" },
          "description": { "type": "string" }
        }
      },
      "CreateEseRoleRequest": {
        "type": "object",
        "required": ["name"],
        "properties": {
          "name": { "type": "string" },
          "description": { "type": "string" }
        }
      },
      "UpdateEseRoleRequest": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "description": { "type": "string" }
        }
      },
      "PaginatedEseRoleResponse": {
        "type": "object",
        "properties": {
          "items": { "type": "array", "items": { "${'$'}ref": "#/components/schemas/EseRoleResponse" } },
          "page": { "type": "integer" },
          "size": { "type": "integer" },
          "total": { "type": "integer", "format": "int64" }
        }
      },
      "EsePermissionResponse": {
        "type": "object",
        "properties": {
          "id": { "type": "integer" },
          "type": { "type": "string" },
          "definition": { "type": "object", "description": "Permission definition varies by domain" }
        }
      },
      "CreateMqttPermissionRequest": {
        "type": "object",
        "properties": {
          "publishAllow": { "type": "string" },
          "publishDeny": { "type": "string" },
          "subscribeAllow": { "type": "string" },
          "subscribeDeny": { "type": "string" }
        }
      },
      "CreateStringPermissionRequest": {
        "type": "object",
        "required": ["permission"],
        "properties": {
          "permission": { "type": "string" }
        }
      },
      "UpdateMqttPermissionRequest": {
        "type": "object",
        "properties": {
          "publishAllow": { "type": "string" },
          "publishDeny": { "type": "string" },
          "subscribeAllow": { "type": "string" },
          "subscribeDeny": { "type": "string" }
        }
      },
      "UpdateStringPermissionRequest": {
        "type": "object",
        "properties": {
          "permission": { "type": "string" }
        }
      },
      "PaginatedEsePermissionResponse": {
        "type": "object",
        "properties": {
          "items": { "type": "array", "items": { "${'$'}ref": "#/components/schemas/EsePermissionResponse" } },
          "page": { "type": "integer" },
          "size": { "type": "integer" },
          "total": { "type": "integer", "format": "int64" }
        }
      },
      "DashboardResponse": {
        "type": "object",
        "properties": {
          "connections": { "type": "array", "items": { "${'$'}ref": "#/components/schemas/ConnectionSummary" } },
          "totalConnections": { "type": "integer" },
          "healthyConnections": { "type": "integer" },
          "unreachableConnections": { "type": "integer" }
        }
      },
      "ConnectionSummary": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "dbType": { "type": "string" },
          "healthStatus": { "type": "string" },
          "lastHealthCheck": { "type": "string" },
          "stats": { "${'$'}ref": "#/components/schemas/ConnectionStats" }
        }
      },
      "ConnectionStats": {
        "type": "object",
        "properties": {
          "mqtt": { "${'$'}ref": "#/components/schemas/DomainStats" },
          "cc": { "${'$'}ref": "#/components/schemas/DomainStats" },
          "restApi": { "${'$'}ref": "#/components/schemas/DomainStats" }
        }
      },
      "DomainStats": {
        "type": "object",
        "properties": {
          "userCount": { "type": "integer" },
          "roleCount": { "type": "integer" },
          "permissionCount": { "type": "integer" }
        }
      },
      "PaginatedAuditLogResponse": {
        "type": "object",
        "properties": {
          "items": { "type": "array", "items": { "${'$'}ref": "#/components/schemas/AuditLogEntry" } },
          "page": { "type": "integer" },
          "size": { "type": "integer" },
          "total": { "type": "integer", "format": "int64" }
        }
      },
      "AuditLogEntry": {
        "type": "object",
        "properties": {
          "id": { "type": "integer", "format": "int64" },
          "actorId": { "type": "string" },
          "actorUsername": { "type": "string" },
          "action": { "type": "string" },
          "domain": { "type": "string" },
          "connectionId": { "type": "string" },
          "resourceType": { "type": "string" },
          "resourceId": { "type": "string" },
          "details": { "type": "string" },
          "timestamp": { "type": "string", "format": "date-time" }
        }
      }
    }
  },
  "security": [
    { "bearerAuth": [] },
    { "apiKeyAuth": [] }
  ]
}
""".trimIndent()
