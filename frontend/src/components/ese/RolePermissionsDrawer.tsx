import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Spinner,
  IconButton,
} from "@chakra-ui/react";
import { X, Plus, Trash2 } from "lucide-react";
import { eseApi } from "../../api/eseApi";
import type { MqttPermission, StringPermission } from "../../api/types";

interface RolePermissionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  connId: string;
  domain: string;
  roleId: number;
  roleName: string;
  onChanged: () => void;
}

type Permission = MqttPermission | StringPermission;

function isMqttPermission(p: Permission): p is MqttPermission {
  return "topic" in p;
}

export function RolePermissionsDrawer({
  isOpen,
  onClose,
  connId,
  domain,
  roleId,
  roleName,
  onChanged,
}: RolePermissionsDrawerProps) {
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [assignedIds, setAssignedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all permissions for this domain
      const allPerms = await eseApi.listPermissions(connId, domain, 1, 1000);

      // Fetch role details to get assigned permissions
      // The ESE API doesn't have a direct "get role permissions" endpoint,
      // so we'll use the role_permissions association table.
      // For now, we'll try to get permissions via the role endpoint if it returns them,
      // or we track assigned state locally after assign/revoke operations.
      setAllPermissions(allPerms.items);

      // Try to determine which permissions are assigned
      // We'll attempt to load them by checking each — but a better approach is
      // to just show all and let the user toggle. We start with none assigned
      // and let the user manage from here.
      // TODO: Backend should return assigned permission IDs with role detail
      setAssignedIds(new Set());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [connId, domain]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, fetchData]);

  const handleAssign = async (permId: number) => {
    setSaving(permId);
    try {
      await eseApi.assignPermissionToRole(connId, domain, roleId, permId);
      setAssignedIds((prev) => new Set([...prev, permId]));
      onChanged();
    } catch {
      // ignore
    } finally {
      setSaving(null);
    }
  };

  const handleRevoke = async (permId: number) => {
    setSaving(permId);
    try {
      await eseApi.revokePermissionFromRole(connId, domain, roleId, permId);
      setAssignedIds((prev) => {
        const next = new Set(prev);
        next.delete(permId);
        return next;
      });
      onChanged();
    } catch {
      // ignore
    } finally {
      setSaving(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg="blackAlpha.600"
        zIndex="1400"
        onClick={onClose}
      />
      <Box
        position="fixed"
        top="0"
        right="0"
        bottom="0"
        w={{ base: "full", md: "560px" }}
        bg={{ base: "white", _dark: "gray.800" }}
        zIndex="1500"
        boxShadow="xl"
        overflowY="auto"
        p="6"
      >
        <Flex justify="space-between" align="center" mb="6">
          <VStack align="flex-start" gap="0">
            <Heading size="md">Manage Permissions</Heading>
            <Text fontSize="sm" color="gray.500">
              Role: {roleName}
            </Text>
          </VStack>
          <IconButton aria-label="Close" variant="ghost" size="sm" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </Flex>

        {loading ? (
          <Flex justify="center" py="8">
            <Spinner />
          </Flex>
        ) : allPermissions.length === 0 ? (
          <Text color="gray.500" textAlign="center" py="8">
            No permissions available in this domain. Create permissions first.
          </Text>
        ) : (
          <VStack gap="2" align="stretch">
            <Text fontSize="xs" color="gray.500" mb="2">
              Click + to assign a permission to this role, or the trash icon to revoke it.
            </Text>
            {allPermissions.map((perm) => {
              const isAssigned = assignedIds.has(perm.id);
              const isSaving = saving === perm.id;
              return (
                <Flex
                  key={perm.id}
                  align="center"
                  gap="3"
                  p="3"
                  borderRadius="md"
                  border="1px solid"
                  borderColor={isAssigned
                    ? { base: "green.200", _dark: "green.700" }
                    : { base: "gray.200", _dark: "gray.700" }
                  }
                  bg={isAssigned
                    ? { base: "green.50", _dark: "green.900" }
                    : "transparent"
                  }
                >
                  <Box flex="1">
                    <Text fontSize="sm" fontWeight="medium">
                      {isMqttPermission(perm) ? perm.topic : perm.permissionString}
                    </Text>
                    {isMqttPermission(perm) ? (
                      <HStack gap="1" mt="1" flexWrap="wrap">
                        {perm.publishAllowed && <Badge size="sm" colorPalette="blue">PUB</Badge>}
                        {perm.subscribeAllowed && <Badge size="sm" colorPalette="green">SUB</Badge>}
                        {perm.qos0Allowed && <Badge size="sm" colorPalette="gray">QoS0</Badge>}
                        {perm.qos1Allowed && <Badge size="sm" colorPalette="gray">QoS1</Badge>}
                        {perm.qos2Allowed && <Badge size="sm" colorPalette="gray">QoS2</Badge>}
                        {perm.retainedMsgsAllowed && <Badge size="sm" colorPalette="orange">RET</Badge>}
                        {perm.sharedSubAllowed && <Badge size="sm" colorPalette="purple">SHARED</Badge>}
                      </HStack>
                    ) : (
                      "description" in perm && perm.description && (
                        <Text fontSize="xs" color="gray.500">{perm.description}</Text>
                      )
                    )}
                  </Box>
                  {isAssigned ? (
                    <IconButton
                      aria-label="Revoke permission"
                      variant="ghost"
                      size="sm"
                      colorPalette="red"
                      onClick={() => handleRevoke(perm.id)}
                      loading={isSaving}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  ) : (
                    <IconButton
                      aria-label="Assign permission"
                      variant="ghost"
                      size="sm"
                      colorPalette="green"
                      onClick={() => handleAssign(perm.id)}
                      loading={isSaving}
                    >
                      <Plus size={14} />
                    </IconButton>
                  )}
                </Flex>
              );
            })}
          </VStack>
        )}
      </Box>
    </>
  );
}
