import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
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
import {
  AlgorithmPicker,
  DEFAULT_ITERATIONS,
  type Algorithm,
} from "./AlgorithmPicker";
import type { EseUser, EseRole } from "../../api/types";
import { eseApi } from "../../api/eseApi";
import { toaster } from "../../toaster";

interface EseUserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    username: string;
    password: string;
    algorithm: string;
    iterations: number;
    memory?: number;
  }) => void;
  user?: EseUser | null;
  isSaving?: boolean;
  connId: string;
  domain: string;
  onRolesChanged?: () => void;
}

export function EseUserDrawer({
  isOpen,
  onClose,
  onSave,
  user,
  isSaving = false,
  connId,
  domain,
  onRolesChanged,
}: EseUserDrawerProps) {
  const isEdit = !!user;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [algorithm, setAlgorithm] = useState<Algorithm>("PKCS5S2");
  const [iterations, setIterations] = useState(100_000);
  const [memory, setMemory] = useState(65536);

  // Role assignment state (only in edit mode)
  const [allRoles, setAllRoles] = useState<EseRole[]>([]);
  const [assignedRoleIds, setAssignedRoleIds] = useState<Set<number>>(new Set());
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [savingRoleId, setSavingRoleId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setUsername(user.username);
        setPassword("");
        setAlgorithm(user.algorithm as Algorithm);
        setIterations(user.iterations);
        setMemory(65536);
      } else {
        setUsername("");
        setPassword("");
        setAlgorithm("PKCS5S2");
        setIterations(DEFAULT_ITERATIONS.PKCS5S2);
        setMemory(65536);
      }
    }
  }, [isOpen, user]);

  // Fetch roles when editing a user
  const fetchRoles = useCallback(async () => {
    if (!isEdit || !user) return;
    setLoadingRoles(true);
    try {
      const [rolesRes, assignedIds] = await Promise.all([
        eseApi.listRoles(connId, domain, 1, 1000),
        eseApi.getUserRoleIds(connId, domain, user.id),
      ]);
      setAllRoles(rolesRes.items);
      setAssignedRoleIds(new Set(assignedIds));
    } catch {
      // ignore
    } finally {
      setLoadingRoles(false);
    }
  }, [isEdit, user, connId, domain]);

  useEffect(() => {
    if (isOpen && isEdit) {
      fetchRoles();
    }
  }, [isOpen, isEdit, fetchRoles]);

  const handleAlgorithmChange = (algo: Algorithm, defaultIterations: number) => {
    setAlgorithm(algo);
    setIterations(defaultIterations);
  };

  const handleSubmit = () => {
    const data: {
      username: string;
      password: string;
      algorithm: string;
      iterations: number;
      memory?: number;
    } = { username, password, algorithm, iterations };
    if (algorithm === "ARGON2ID") {
      data.memory = memory;
    }
    onSave(data);
  };

  const handleAssignRole = async (roleId: number) => {
    if (!user) return;
    setSavingRoleId(roleId);
    try {
      await eseApi.assignRoleToUser(connId, domain, user.id, roleId);
      setAssignedRoleIds((prev) => new Set([...prev, roleId]));
      onRolesChanged?.();
      toaster.create({ title: "Role assigned", type: "success" });
    } catch (err) {
      toaster.create({
        title: "Failed to assign role",
        description: err instanceof Error ? err.message : "An error occurred",
        type: "error",
      });
    } finally {
      setSavingRoleId(null);
    }
  };

  const handleRevokeRole = async (roleId: number) => {
    if (!user) return;
    setSavingRoleId(roleId);
    try {
      await eseApi.revokeRoleFromUser(connId, domain, user.id, roleId);
      setAssignedRoleIds((prev) => {
        const next = new Set(prev);
        next.delete(roleId);
        return next;
      });
      onRolesChanged?.();
      toaster.create({ title: "Role revoked", type: "success" });
    } catch (err) {
      toaster.create({
        title: "Failed to revoke role",
        description: err instanceof Error ? err.message : "An error occurred",
        type: "error",
      });
    } finally {
      setSavingRoleId(null);
    }
  };

  const canSave = username.trim() !== "" && (isEdit || password.trim() !== "");

  return (
    <DrawerRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()} placement="end" size="lg">
      <DrawerBackdrop />
      <DrawerPositioner>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{isEdit ? "Edit User" : "Create User"}</DrawerTitle>
          </DrawerHeader>
          <DrawerCloseTrigger />
          <DrawerBody>
            <VStack gap="4" align="stretch">
              <Box>
                <Text fontWeight="medium" fontSize="sm" mb="1">Username</Text>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                />
              </Box>

              <Box>
                <Text fontWeight="medium" fontSize="sm" mb="1">
                  Password{isEdit ? " (leave empty to keep)" : ""}
                </Text>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEdit ? "Leave empty to keep current" : "Enter password"}
                />
              </Box>

              <AlgorithmPicker value={algorithm} onChange={handleAlgorithmChange} />

              <Box>
                <Text fontWeight="medium" fontSize="sm" mb="1">Iterations</Text>
                <Input
                  type="number"
                  value={iterations}
                  onChange={(e) => setIterations(Number(e.target.value))}
                  min={0}
                />
              </Box>

              {algorithm === "ARGON2ID" && (
                <Box>
                  <Text fontWeight="medium" fontSize="sm" mb="1">Memory (KB)</Text>
                  <Input
                    type="number"
                    value={memory}
                    onChange={(e) => setMemory(Number(e.target.value))}
                    min={1024}
                  />
                </Box>
              )}

              {/* Role assignment section — only in edit mode */}
              {isEdit && (
                <>
                  <Separator />
                  <Box>
                    <Heading size="sm" mb="3">Roles</Heading>
                    {loadingRoles ? (
                      <Flex justify="center" py="4">
                        <Spinner size="sm" />
                      </Flex>
                    ) : allRoles.length === 0 ? (
                      <Text fontSize="sm" color="gray.500">
                        No roles available. Create roles first.
                      </Text>
                    ) : (
                      <VStack gap="2" align="stretch">
                        {allRoles.map((role) => {
                          const isAssigned = assignedRoleIds.has(role.id);
                          const isSaving = savingRoleId === role.id;
                          return (
                            <Flex
                              key={role.id}
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
                                <HStack gap="2">
                                  <Text fontSize="sm" fontWeight="medium">{role.name}</Text>
                                  {isAssigned && (
                                    <Badge size="sm" colorPalette="green" variant="subtle">assigned</Badge>
                                  )}
                                </HStack>
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
                                  onClick={() => handleRevokeRole(role.id)}
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
                                  onClick={() => handleAssignRole(role.id)}
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
              )}
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
