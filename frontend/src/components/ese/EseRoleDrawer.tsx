import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  Textarea,
  VStack,
  HStack,
  Badge,
  IconButton,
  Heading,
  Spinner,
  Separator,
} from "@chakra-ui/react";
import {
  DrawerRoot,
  DrawerBackdrop,
  DrawerPositioner,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerCloseTrigger,
  DrawerTitle,
} from "@chakra-ui/react";
import { Plus, Trash2 } from "lucide-react";
import type { EseRole, MqttPermission, StringPermission } from "../../api/types";
import { eseApi } from "../../api/eseApi";
import { toaster } from "../../toaster";

type Permission = MqttPermission | StringPermission;

function isMqttPermission(p: Permission): p is MqttPermission {
  return "topic" in p;
}

interface EseRoleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description?: string; permissionIds?: number[] }) => Promise<void>;
  role?: EseRole | null;
  connId: string;
  domain: string;
  onPermissionsChanged?: () => void;
}

export function EseRoleDrawer({
  isOpen,
  onClose,
  onSave,
  role,
  connId,
  domain,
  onPermissionsChanged,
}: EseRoleDrawerProps) {
  const isEdit = !!role;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Permission state
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [assignedPermIds, setAssignedPermIds] = useState<Set<number>>(new Set());
  const [selectedPermIds, setSelectedPermIds] = useState<Set<number>>(new Set());
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [savingPermId, setSavingPermId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (role) {
        setName(role.name);
        setDescription(role.description ?? "");
      } else {
        setName("");
        setDescription("");
        setSelectedPermIds(new Set());
      }
      setIsSaving(false);
    }
  }, [isOpen, role]);

  // Fetch permissions (both create and edit mode)
  const fetchPermissions = useCallback(async () => {
    setLoadingPerms(true);
    try {
      if (isEdit && role) {
        const [permsRes, assignedIds] = await Promise.all([
          eseApi.listPermissions(connId, domain, 1, 1000),
          eseApi.getRolePermissionIds(connId, domain, role.id),
        ]);
        setAllPermissions(permsRes.items);
        setAssignedPermIds(new Set(assignedIds));
      } else {
        const permsRes = await eseApi.listPermissions(connId, domain, 1, 1000);
        setAllPermissions(permsRes.items);
        setAssignedPermIds(new Set());
      }
    } catch {
      // ignore
    } finally {
      setLoadingPerms(false);
    }
  }, [isEdit, role, connId, domain]);

  useEffect(() => {
    if (isOpen) {
      fetchPermissions();
    }
  }, [isOpen, fetchPermissions]);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const data: { name: string; description?: string; permissionIds?: number[] } = {
        name,
        description: description || undefined,
      };
      if (!isEdit && selectedPermIds.size > 0) {
        data.permissionIds = Array.from(selectedPermIds);
      }
      await onSave(data);
      toaster.create({ title: isEdit ? "Role updated" : "Role created", type: "success" });
    } catch (err) {
      toaster.create({
        title: isEdit ? "Failed to update role" : "Failed to create role",
        description: err instanceof Error ? err.message : "An error occurred",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle permission selection for create mode
  const toggleSelectedPerm = (permId: number) => {
    setSelectedPermIds((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) {
        next.delete(permId);
      } else {
        next.add(permId);
      }
      return next;
    });
  };

  // Assign/revoke for edit mode
  const handleAssignPerm = async (permId: number) => {
    if (!role) return;
    setSavingPermId(permId);
    try {
      await eseApi.assignPermissionToRole(connId, domain, role.id, permId);
      setAssignedPermIds((prev) => new Set([...prev, permId]));
      onPermissionsChanged?.();
      toaster.create({ title: "Permission assigned", type: "success" });
    } catch (err) {
      toaster.create({
        title: "Failed to assign permission",
        description: err instanceof Error ? err.message : "An error occurred",
        type: "error",
      });
    } finally {
      setSavingPermId(null);
    }
  };

  const handleRevokePerm = async (permId: number) => {
    if (!role) return;
    setSavingPermId(permId);
    try {
      await eseApi.revokePermissionFromRole(connId, domain, role.id, permId);
      setAssignedPermIds((prev) => {
        const next = new Set(prev);
        next.delete(permId);
        return next;
      });
      onPermissionsChanged?.();
      toaster.create({ title: "Permission revoked", type: "success" });
    } catch (err) {
      toaster.create({
        title: "Failed to revoke permission",
        description: err instanceof Error ? err.message : "An error occurred",
        type: "error",
      });
    } finally {
      setSavingPermId(null);
    }
  };

  const getPermLabel = (perm: Permission) =>
    isMqttPermission(perm) ? perm.topic : perm.permissionString;

  const getPermDescription = (perm: Permission) =>
    isMqttPermission(perm) ? null : ("description" in perm ? perm.description : null);

  const canSave = name.trim() !== "";

  return (
    <DrawerRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()} placement="end" size="lg">
      <DrawerBackdrop />
      <DrawerPositioner>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{isEdit ? "Edit Role" : "Create Role"}</DrawerTitle>
          </DrawerHeader>
          <DrawerCloseTrigger />
          <DrawerBody>
            <VStack gap="4" align="stretch">
              <Box>
                <Text fontWeight="medium" fontSize="sm" mb="1">Name</Text>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter role name"
                />
              </Box>

              <Box>
                <Text fontWeight="medium" fontSize="sm" mb="1">Description</Text>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter role description (optional)"
                  rows={3}
                />
              </Box>

              {/* Permissions section */}
              <Separator />
              <Box>
                <Heading size="sm" mb="3">Permissions</Heading>
                {loadingPerms ? (
                  <Flex justify="center" py="4">
                    <Spinner size="sm" />
                  </Flex>
                ) : allPermissions.length === 0 ? (
                  <Text fontSize="sm" color="gray.500">
                    No permissions available. Create permissions first.
                  </Text>
                ) : isEdit ? (
                  /* Edit mode: assign/revoke with API calls */
                  <VStack gap="2" align="stretch">
                    {allPermissions.map((perm) => {
                      const isAssigned = assignedPermIds.has(perm.id);
                      const isSavingPerm = savingPermId === perm.id;
                      return (
                        <Flex
                          key={perm.id}
                          align="center"
                          gap="3"
                          p="2.5"
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
                            <HStack gap="2" flexWrap="wrap">
                              <Text fontSize="sm" fontWeight="medium">{getPermLabel(perm)}</Text>
                              {isAssigned && (
                                <Badge size="sm" colorPalette="green" variant="subtle">assigned</Badge>
                              )}
                            </HStack>
                            {isMqttPermission(perm) && (
                              <HStack gap="1" mt="1" flexWrap="wrap">
                                {perm.publishAllowed && <Badge size="sm" colorPalette="blue">PUB</Badge>}
                                {perm.subscribeAllowed && <Badge size="sm" colorPalette="green">SUB</Badge>}
                                {perm.qos0Allowed && <Badge size="sm" colorPalette="gray">QoS0</Badge>}
                                {perm.qos1Allowed && <Badge size="sm" colorPalette="gray">QoS1</Badge>}
                                {perm.qos2Allowed && <Badge size="sm" colorPalette="gray">QoS2</Badge>}
                                {perm.retainedMsgsAllowed && <Badge size="sm" colorPalette="orange">RET</Badge>}
                                {perm.sharedSubAllowed && <Badge size="sm" colorPalette="purple">SHARED</Badge>}
                              </HStack>
                            )}
                            {getPermDescription(perm) && (
                              <Text fontSize="xs" color="gray.500">{getPermDescription(perm)}</Text>
                            )}
                          </Box>
                          {isAssigned ? (
                            <IconButton
                              aria-label="Revoke permission"
                              variant="ghost"
                              size="sm"
                              colorPalette="red"
                              onClick={() => handleRevokePerm(perm.id)}
                              loading={isSavingPerm}
                            >
                              <Trash2 size={14} />
                            </IconButton>
                          ) : (
                            <IconButton
                              aria-label="Assign permission"
                              variant="ghost"
                              size="sm"
                              colorPalette="green"
                              onClick={() => handleAssignPerm(perm.id)}
                              loading={isSavingPerm}
                            >
                              <Plus size={14} />
                            </IconButton>
                          )}
                        </Flex>
                      );
                    })}
                  </VStack>
                ) : (
                  /* Create mode: toggle selection locally */
                  <VStack gap="2" align="stretch">
                    <Text fontSize="xs" color="gray.500" mb="1">
                      Select permissions to assign after creation
                    </Text>
                    {allPermissions.map((perm) => {
                      const isSelected = selectedPermIds.has(perm.id);
                      return (
                        <Flex
                          key={perm.id}
                          align="center"
                          gap="3"
                          p="2.5"
                          borderRadius="md"
                          border="1px solid"
                          borderColor={isSelected
                            ? { base: "yellow.300", _dark: "yellow.700" }
                            : { base: "gray.200", _dark: "gray.700" }
                          }
                          bg={isSelected
                            ? { base: "yellow.50", _dark: "yellow.950" }
                            : "transparent"
                          }
                          cursor="pointer"
                          onClick={() => toggleSelectedPerm(perm.id)}
                          _hover={{
                            borderColor: { base: "yellow.300", _dark: "yellow.600" },
                          }}
                          transition="all 0.15s"
                        >
                          <Box flex="1">
                            <HStack gap="2" flexWrap="wrap">
                              <Text fontSize="sm" fontWeight="medium">{getPermLabel(perm)}</Text>
                              {isSelected && (
                                <Badge size="sm" colorPalette="yellow" variant="subtle">selected</Badge>
                              )}
                            </HStack>
                            {isMqttPermission(perm) && (
                              <HStack gap="1" mt="1" flexWrap="wrap">
                                {perm.publishAllowed && <Badge size="sm" colorPalette="blue">PUB</Badge>}
                                {perm.subscribeAllowed && <Badge size="sm" colorPalette="green">SUB</Badge>}
                                {perm.qos0Allowed && <Badge size="sm" colorPalette="gray">QoS0</Badge>}
                                {perm.qos1Allowed && <Badge size="sm" colorPalette="gray">QoS1</Badge>}
                                {perm.qos2Allowed && <Badge size="sm" colorPalette="gray">QoS2</Badge>}
                                {perm.retainedMsgsAllowed && <Badge size="sm" colorPalette="orange">RET</Badge>}
                                {perm.sharedSubAllowed && <Badge size="sm" colorPalette="purple">SHARED</Badge>}
                              </HStack>
                            )}
                            {getPermDescription(perm) && (
                              <Text fontSize="xs" color="gray.500">{getPermDescription(perm)}</Text>
                            )}
                          </Box>
                        </Flex>
                      );
                    })}
                  </VStack>
                )}
              </Box>
            </VStack>
          </DrawerBody>
          <DrawerFooter>
            <Flex gap="3" w="full" justify="flex-end">
              <Button variant="ghost" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                colorPalette="yellow"
                onClick={handleSubmit}
                disabled={!canSave}
                loading={isSaving}
                loadingText={isEdit ? "Updating..." : "Creating..."}
              >
                {isEdit ? "Update" : "Create"}
              </Button>
            </Flex>
          </DrawerFooter>
        </DrawerContent>
      </DrawerPositioner>
    </DrawerRoot>
  );
}
