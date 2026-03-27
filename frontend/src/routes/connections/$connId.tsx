import { useState, useCallback, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Box,
  Badge,
  Button,
  Flex,
  Heading,
  HStack,
  Text,
  Spinner,
  VStack,
} from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings } from "lucide-react";
import { connectionsApi } from "../../api/connectionsApi";
import { eseApi } from "../../api/eseApi";
import { HealthDot } from "../../components/HealthDot";
import { EseUserTable } from "../../components/ese/EseUserTable";
import { EseRoleTable } from "../../components/ese/EseRoleTable";
import { EsePermissionTable } from "../../components/ese/EsePermissionTable";
import { EseUserDrawer } from "../../components/ese/EseUserDrawer";
import { EseRoleDrawer } from "../../components/ese/EseRoleDrawer";
import { EsePermissionDrawer } from "../../components/ese/EsePermissionDrawer";
import { DeleteConfirmModal } from "../../components/DeleteConfirmModal";
import { toaster } from "../../toaster";
import type {
  EseUser,
  EseRole,
  MqttPermission,
  StringPermission,
  ConnectionStats,
} from "../../api/types";

type Domain = "mqtt" | "cc" | "rest-api";
type EntityTab = "users" | "roles" | "permissions";

const DOMAIN_LABELS: Record<Domain, string> = {
  mqtt: "MQTT",
  cc: "Control Center",
  "rest-api": "REST API",
};

const DOMAINS: Domain[] = ["mqtt", "cc", "rest-api"];

const dbTypePalette: Record<string, string> = {
  postgresql: "blue",
  mysql: "orange",
  mssql: "purple",
};

function ConnectionDetailPage() {
  const { connId } = Route.useParams();
  const queryClient = useQueryClient();

  const [activeDomain, setActiveDomain] = useState<Domain>("mqtt");
  const [activeEntity, setActiveEntity] = useState<EntityTab>("users");

  // Drawer states
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [roleDrawerOpen, setRoleDrawerOpen] = useState(false);
  const [permDrawerOpen, setPermDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<EseUser | null>(null);
  const [editingRole, setEditingRole] = useState<EseRole | null>(null);
  const [editingPermission, setEditingPermission] = useState<(MqttPermission | StringPermission) | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "user" | "role" | "permission";
    id: number;
    name: string;
  } | null>(null);

  // Connection details
  const connectionQuery = useQuery({
    queryKey: ["connection", connId],
    queryFn: () => connectionsApi.get(connId),
  });

  // Stats
  const statsQuery = useQuery({
    queryKey: ["connection-stats", connId],
    queryFn: () => eseApi.stats(connId),
  });

  // Users
  const usersQuery = useQuery({
    queryKey: ["ese-users", connId, activeDomain],
    queryFn: () => eseApi.listUsers(connId, activeDomain, 1, 1000),
    staleTime: 30_000,
  });

  // Roles
  const rolesQuery = useQuery({
    queryKey: ["ese-roles", connId, activeDomain],
    queryFn: () => eseApi.listRoles(connId, activeDomain, 1, 1000),
    staleTime: 30_000,
  });

  // Permissions
  const permissionsQuery = useQuery({
    queryKey: ["ese-permissions", connId, activeDomain],
    queryFn: () => eseApi.listPermissions(connId, activeDomain, 1, 1000),
    staleTime: 30_000,
  });

  // Invalidation helper
  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["ese-users", connId, activeDomain] });
    queryClient.invalidateQueries({ queryKey: ["ese-roles", connId, activeDomain] });
    queryClient.invalidateQueries({ queryKey: ["ese-permissions", connId, activeDomain] });
    queryClient.invalidateQueries({ queryKey: ["connection-stats", connId] });
  }, [queryClient, connId, activeDomain]);

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: (data: { username: string; password: string; algorithm: string; iterations: number }) =>
      eseApi.createUser(connId, activeDomain, data),
    onSuccess: () => {
      invalidateAll();
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: { userId: number; username?: string; password?: string; algorithm?: string; iterations?: number }) => {
      const { userId, ...rest } = data;
      return eseApi.updateUser(connId, activeDomain, userId, rest);
    },
    onSuccess: () => {
      invalidateAll();
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => eseApi.deleteUser(connId, activeDomain, userId),
    onSuccess: () => {
      invalidateAll();
      setDeleteTarget(null);
    },
  });

  const createRoleMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      eseApi.createRole(connId, activeDomain, data),
    onSuccess: () => {
      invalidateAll();
      setRoleDrawerOpen(false);
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: (data: { roleId: number; name?: string; description?: string }) => {
      const { roleId, ...rest } = data;
      return eseApi.updateRole(connId, activeDomain, roleId, rest);
    },
    onSuccess: () => {
      invalidateAll();
      setRoleDrawerOpen(false);
      setEditingRole(null);
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (roleId: number) => eseApi.deleteRole(connId, activeDomain, roleId),
    onSuccess: () => {
      invalidateAll();
      setDeleteTarget(null);
    },
  });

  const createMqttPermMutation = useMutation({
    mutationFn: (data: Parameters<typeof eseApi.createMqttPermission>[1]) =>
      eseApi.createMqttPermission(connId, data),
    onSuccess: () => {
      invalidateAll();
      setPermDrawerOpen(false);
      setEditingPermission(null);
      toaster.create({ title: "Permission created", type: "success" });
    },
    onError: (err) => {
      toaster.create({ title: "Failed to create permission", description: err instanceof Error ? err.message : "An error occurred", type: "error" });
    },
  });

  const createStringPermMutation = useMutation({
    mutationFn: (data: Parameters<typeof eseApi.createStringPermission>[2]) =>
      eseApi.createStringPermission(connId, activeDomain, data),
    onSuccess: () => {
      invalidateAll();
      setPermDrawerOpen(false);
      setEditingPermission(null);
      toaster.create({ title: "Permission created", type: "success" });
    },
    onError: (err) => {
      toaster.create({ title: "Failed to create permission", description: err instanceof Error ? err.message : "An error occurred", type: "error" });
    },
  });

  const deletePermMutation = useMutation({
    mutationFn: (permId: number) => eseApi.deletePermission(connId, activeDomain, permId),
    onSuccess: () => {
      invalidateAll();
      setDeleteTarget(null);
    },
  });

  // Reset entity tab when domain changes
  useEffect(() => {
    setActiveEntity("users");
  }, [activeDomain]);

  // Handlers
  const handleUserSave = async (data: { username: string; password: string; algorithm: string; iterations: number; roleIds?: number[] }) => {
    if (editingUser) {
      await new Promise<void>((resolve, reject) => {
        updateUserMutation.mutate({
          userId: editingUser.id,
          username: data.username,
          password: data.password || undefined,
          algorithm: data.algorithm,
          iterations: data.iterations,
        }, { onSuccess: () => resolve(), onError: (err) => reject(err) });
      });
    } else {
      const created = await new Promise<{ id: number }>((resolve, reject) => {
        createUserMutation.mutate(data, {
          onSuccess: (result) => resolve(result as { id: number }),
          onError: (err) => reject(err),
        });
      });
      // Assign selected roles after creation
      if (data.roleIds && data.roleIds.length > 0 && created?.id) {
        for (const roleId of data.roleIds) {
          try {
            await eseApi.assignRoleToUser(connId, activeDomain, created.id, roleId);
          } catch {
            // continue with other roles even if one fails
          }
        }
        invalidateAll();
      }
    }
    setUserDrawerOpen(false);
    setEditingUser(null);
  };

  const handleRoleSave = (data: { name: string; description?: string }) => {
    if (editingRole) {
      updateRoleMutation.mutate({ roleId: editingRole.id, ...data });
    } else {
      createRoleMutation.mutate(data);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "user") deleteUserMutation.mutate(deleteTarget.id);
    if (deleteTarget.type === "role") deleteRoleMutation.mutate(deleteTarget.id);
    if (deleteTarget.type === "permission") deletePermMutation.mutate(deleteTarget.id);
  };

  const connection = connectionQuery.data;
  const stats: ConnectionStats | undefined = statsQuery.data;

  if (connectionQuery.isLoading) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="lg" />
      </Flex>
    );
  }

  if (connectionQuery.isError || !connection) {
    return (
      <Box p="6">
        <Text color="red.500">
          Failed to load connection details. Please go back and try again.
        </Text>
      </Box>
    );
  }

  const domainStats = stats
    ? { mqtt: stats.mqtt, cc: stats.cc, "rest-api": stats.restApi }
    : null;

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="flex-start" mb="6">
        <VStack align="flex-start" gap="2">
          <HStack gap="3">
            <HealthDot status={connection.healthStatus} />
            <Heading size="lg">{connection.name}</Heading>
            <Badge
              colorPalette={dbTypePalette[connection.dbType] ?? "gray"}
              variant="subtle"
            >
              {connection.dbType}
            </Badge>
          </HStack>
          {stats && (
            <Flex gap="4" flexWrap="wrap">
              {DOMAINS.map((d) => {
                const ds = domainStats?.[d];
                if (!ds) return null;
                return (
                  <Box
                    key={d}
                    px="3"
                    py="1.5"
                    borderRadius="md"
                    border="1px solid"
                    borderColor={{ base: "gray.200", _dark: "gray.700" }}
                    fontSize="xs"
                  >
                    <Text fontWeight="bold" mb="0.5">{DOMAIN_LABELS[d]}</Text>
                    <HStack gap="3" color="gray.500">
                      <Text>{ds.userCount} users</Text>
                      <Text>{ds.roleCount} roles</Text>
                      <Text>{ds.permissionCount} perms</Text>
                    </HStack>
                  </Box>
                );
              })}
            </Flex>
          )}
          {connection.description && (
            <Text color="gray.500" fontSize="sm">
              {connection.description}
            </Text>
          )}
        </VStack>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Settings navigation handled by separate route
            window.location.hash = "";
          }}
          display="none"
        >
          <Settings size={16} />
          Settings
        </Button>
      </Flex>

      {/* Domain Tabs */}
      <Flex
        borderBottom="2px solid"
        borderColor={{ base: "gray.200", _dark: "gray.700" }}
        mb="4"
        gap="0"
      >
        {DOMAINS.map((d) => (
          <Button
            key={d}
            variant="ghost"
            size="sm"
            borderBottomWidth="2px"
            borderBottomColor={activeDomain === d ? "gray.700" : "transparent"}
            borderRadius="0"
            color={activeDomain === d ? { base: "gray.800", _dark: "gray.100" } : undefined}
            fontWeight={activeDomain === d ? "bold" : "normal"}
            onClick={() => setActiveDomain(d)}
            px="4"
            pb="2"
          >
            {DOMAIN_LABELS[d]}
          </Button>
        ))}
      </Flex>

      {/* Entity Sub-Navigation */}
      <Flex gap="2" mb="4">
        {(["users", "roles", "permissions"] as EntityTab[]).map((tab) => (
          <Button
            key={tab}
            size="sm"
            variant={activeEntity === tab ? "solid" : "outline"}
            colorPalette={activeEntity === tab ? "yellow" : "gray"}
            onClick={() => setActiveEntity(tab)}
            textTransform="capitalize"
          >
            {tab}
          </Button>
        ))}
      </Flex>

      {/* Entity Content */}
      <Box>
        {(activeEntity === "users" && usersQuery.isLoading) ||
         (activeEntity === "roles" && rolesQuery.isLoading) ||
         (activeEntity === "permissions" && permissionsQuery.isLoading) ? (
          <Flex justify="center" align="center" py="12">
            <Spinner size="lg" colorPalette="yellow" />
          </Flex>
        ) : null}

        {activeEntity === "users" && !usersQuery.isLoading && (
          <EseUserTable
            users={usersQuery.data?.items ?? []}
            onAdd={() => {
              setEditingUser(null);
              setUserDrawerOpen(true);
            }}
            onEdit={(user) => {
              setEditingUser(user);
              setUserDrawerOpen(true);
            }}
            onDelete={(user) =>
              setDeleteTarget({
                type: "user",
                id: user.id,
                name: user.username,
              })
            }
            connId={connId}
            domain={activeDomain}
          />
        )}

        {activeEntity === "roles" && !rolesQuery.isLoading && (
          <EseRoleTable
            roles={rolesQuery.data?.items ?? []}
            onAdd={() => {
              setEditingRole(null);
              setRoleDrawerOpen(true);
            }}
            onEdit={(role) => {
              setEditingRole(role);
              setRoleDrawerOpen(true);
            }}
            onDelete={(role) =>
              setDeleteTarget({
                type: "role",
                id: role.id,
                name: role.name,
              })
            }
            connId={connId}
            domain={activeDomain}
          />
        )}

        {activeEntity === "permissions" && !permissionsQuery.isLoading && (
          <EsePermissionTable
            permissions={
              (permissionsQuery.data?.items ?? []) as (
                | MqttPermission
                | StringPermission
              )[]
            }
            domain={activeDomain}
            onAdd={() => {
              setEditingPermission(null);
              setPermDrawerOpen(true);
            }}
            onEdit={(perm) => {
              setEditingPermission(perm as (MqttPermission | StringPermission));
              setPermDrawerOpen(true);
            }}
            onDelete={(perm) =>
              setDeleteTarget({
                type: "permission",
                id: perm.id,
                name:
                  "topic" in perm
                    ? (perm as MqttPermission).topic
                    : (perm as StringPermission).permissionString,
              })
            }
          />
        )}
      </Box>

      {/* Drawers */}
      <EseUserDrawer
        isOpen={userDrawerOpen}
        onClose={() => {
          setUserDrawerOpen(false);
          setEditingUser(null);
        }}
        onSave={handleUserSave}
        user={editingUser}
        connId={connId}
        domain={activeDomain}
        onRolesChanged={invalidateAll}
      />

      <EseRoleDrawer
        isOpen={roleDrawerOpen}
        onClose={() => {
          setRoleDrawerOpen(false);
          setEditingRole(null);
        }}
        onSave={handleRoleSave}
        role={editingRole}
        isSaving={createRoleMutation.isPending || updateRoleMutation.isPending}
        connId={connId}
        domain={activeDomain}
        onPermissionsChanged={invalidateAll}
      />

      <EsePermissionDrawer
        isOpen={permDrawerOpen}
        onClose={() => {
          setPermDrawerOpen(false);
          setEditingPermission(null);
        }}
        domain={activeDomain}
        permission={editingPermission}
        onSaveMqtt={(data) => {
          if (editingPermission) {
            eseApi.updateMqttPermission(connId, editingPermission.id, data).then(() => {
              invalidateAll();
              setPermDrawerOpen(false);
              setEditingPermission(null);
              toaster.create({ title: "Permission updated", type: "success" });
            }).catch((err) => {
              toaster.create({ title: "Failed to update permission", description: err instanceof Error ? err.message : "An error occurred", type: "error" });
            });
          } else {
            createMqttPermMutation.mutate(data);
          }
        }}
        onSaveString={(data) => {
          if (editingPermission) {
            eseApi.updateStringPermission(connId, activeDomain, editingPermission.id, data).then(() => {
              invalidateAll();
              setPermDrawerOpen(false);
              setEditingPermission(null);
              toaster.create({ title: "Permission updated", type: "success" });
            }).catch((err) => {
              toaster.create({ title: "Failed to update permission", description: err instanceof Error ? err.message : "An error occurred", type: "error" });
            });
          } else {
            createStringPermMutation.mutate(data);
          }
        }}
        isSaving={
          createMqttPermMutation.isPending || createStringPermMutation.isPending
        }
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        entityName={deleteTarget?.name ?? ""}
        isLoading={
          deleteUserMutation.isPending ||
          deleteRoleMutation.isPending ||
          deletePermMutation.isPending
        }
      />
    </Box>
  );
}

export const Route = createFileRoute("/connections/$connId")({
  component: ConnectionDetailPage,
});
