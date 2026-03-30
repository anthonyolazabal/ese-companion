import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  Spinner,
  IconButton,
} from "@chakra-ui/react";
import { X, Plus, Trash2 } from "lucide-react";
import { eseApi } from "../../api/eseApi";
import { toaster } from "../../toaster";
import type { EseRole } from "../../api/types";

interface UserRolesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  connId: string;
  domain: string;
  userId: number;
  username: string;
  onChanged: () => void;
}

export function UserRolesDrawer({
  isOpen,
  onClose,
  connId,
  domain,
  userId,
  username,
  onChanged,
}: UserRolesDrawerProps) {
  const [allRoles, setAllRoles] = useState<EseRole[]>([]);
  const [assignedIds, setAssignedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesRes, assignedRoleIds] = await Promise.all([
        eseApi.listRoles(connId, domain, 1, 1000),
        eseApi.getUserRoleIds(connId, domain, userId),
      ]);
      setAllRoles(rolesRes.items);
      setAssignedIds(new Set(assignedRoleIds));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [connId, domain, userId]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, fetchData]);

  const handleAssign = async (roleId: number) => {
    setSaving(roleId);
    try {
      await eseApi.assignRoleToUser(connId, domain, userId, roleId);
      setAssignedIds((prev) => new Set([...prev, roleId]));
      onChanged();
      toaster.create({
        title: "Role assigned",
        description: `Role added to user "${username}"`,
        type: "success",
      });
    } catch (err) {
      toaster.create({
        title: "Failed to assign role",
        description: err instanceof Error ? err.message : "An error occurred",
        type: "error",
      });
    } finally {
      setSaving(null);
    }
  };

  const handleRevoke = async (roleId: number) => {
    setSaving(roleId);
    try {
      await eseApi.revokeRoleFromUser(connId, domain, userId, roleId);
      setAssignedIds((prev) => {
        const next = new Set(prev);
        next.delete(roleId);
        return next;
      });
      onChanged();
      toaster.create({
        title: "Role revoked",
        description: `Role removed from user "${username}"`,
        type: "success",
      });
    } catch (err) {
      toaster.create({
        title: "Failed to revoke role",
        description: err instanceof Error ? err.message : "An error occurred",
        type: "error",
      });
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
        w={{ base: "full", md: "480px" }}
        bg={{ base: "white", _dark: "gray.800" }}
        zIndex="1500"
        boxShadow="xl"
        overflowY="auto"
        p="6"
      >
        <Flex justify="space-between" align="center" mb="6">
          <VStack align="flex-start" gap="0">
            <Heading size="md">Manage Roles</Heading>
            <Text fontSize="sm" color="gray.500">
              User: {username}
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
        ) : allRoles.length === 0 ? (
          <Text color="gray.500" textAlign="center" py="8">
            No roles available in this domain. Create roles first.
          </Text>
        ) : (
          <VStack gap="2" align="stretch">
            <Text fontSize="xs" color="gray.500" mb="2">
              Click + to assign a role to this user, or the trash icon to revoke it.
            </Text>
            {allRoles.map((role) => {
              const isAssigned = assignedIds.has(role.id);
              const isSaving = saving === role.id;
              return (
                <Flex
                  key={role.id}
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
                    <Text fontSize="sm" fontWeight="medium">{role.name}</Text>
                    {role.description && (
                      <Text fontSize="xs" color="gray.500">{role.description}</Text>
                    )}
                  </Box>
                  {isAssigned ? (
                    <IconButton
                      aria-label="Revoke role"
                      variant="ghost"
                      size="sm"
                      colorPalette="red"
                      onClick={() => handleRevoke(role.id)}
                      loading={isSaving}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  ) : (
                    <IconButton
                      aria-label="Assign role"
                      variant="ghost"
                      size="sm"
                      colorPalette="green"
                      onClick={() => handleAssign(role.id)}
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
