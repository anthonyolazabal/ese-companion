import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { CompanionUser } from "../../api/types";

interface CompanionUserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: CompanionUser | null;
  onSave: (data: {
    username: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<void>;
}

const ROLES = ["admin", "readwrite", "readonly"] as const;

export function CompanionUserDrawer({
  isOpen,
  onClose,
  user,
  onSave,
}: CompanionUserDrawerProps) {
  const isEdit = !!user;
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("readonly");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setRole(user.role);
      setPassword("");
    } else {
      setUsername("");
      setEmail("");
      setPassword("");
      setRole("readonly");
    }
    setError("");
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave({ username, email, password, role });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
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
      {/* Drawer panel */}
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
          <Heading size="md">{isEdit ? "Edit User" : "Create User"}</Heading>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </Flex>

        <Box as="form" onSubmit={handleSubmit}>
          <VStack gap="4" align="stretch">
            {error && (
              <Box p="3" bg="red.50" borderColor="red.200" border="1px solid" borderRadius="md">
                <Text color="red.600" fontSize="sm">{error}</Text>
              </Box>
            )}

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb="1">Username</Text>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                disabled={isEdit}
                required
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb="1">Email</Text>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb="1">
                Password{isEdit ? " (leave blank to keep current)" : ""}
              </Text>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEdit ? "Leave blank to keep current" : "Password"}
                required={!isEdit}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb="1">Role</Text>
              <Flex gap="2">
                {ROLES.map((r) => (
                  <Button
                    key={r}
                    type="button"
                    size="sm"
                    variant={role === r ? "solid" : "outline"}
                    colorPalette={role === r ? "yellow" : "gray"}
                    onClick={() => setRole(r)}
                  >
                    {r}
                  </Button>
                ))}
              </Flex>
            </Box>

            <Flex gap="3" mt="4">
              <Button
                type="submit"
                colorPalette="yellow"
                loading={saving}
                loadingText="Saving..."
                flex="1"
              >
                {isEdit ? "Update" : "Create"}
              </Button>
              <Button variant="outline" onClick={onClose} flex="1">
                Cancel
              </Button>
            </Flex>
          </VStack>
        </Box>
      </Box>
    </>
  );
}
