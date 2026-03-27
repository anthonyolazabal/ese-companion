import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
  HStack,
  Switch,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Copy, Check } from "lucide-react";
import { apiKeysApi } from "../../api/apiKeysApi";
import type { ApiKeyCreated } from "../../api/types";

interface ApiKeyCreateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_SCOPES = ["ese:read", "ese:write", "ese:admin"] as const;

export function ApiKeyCreateDrawer({ isOpen, onClose }: ApiKeyCreateDrawerProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState("");
  const [createdKey, setCreatedKey] = useState<ApiKeyCreated | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () =>
      apiKeysApi.create({
        name,
        scopes,
        expiresAt: new Date(expiresAt).toISOString(),
      }),
    onSuccess: (data) => {
      setCreatedKey(data);
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to create API key.");
    },
  });

  const toggleScope = (scope: string) => {
    setScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  };

  const handleCopy = async () => {
    if (createdKey) {
      await navigator.clipboard.writeText(createdKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setName("");
    setScopes([]);
    setExpiresAt("");
    setCreatedKey(null);
    setCopied(false);
    setError(null);
    createMutation.reset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (scopes.length === 0) {
      setError("Select at least one scope.");
      return;
    }
    if (!expiresAt) {
      setError("Expiration date is required.");
      return;
    }

    createMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top="0"
      right="0"
      bottom="0"
      left="0"
      zIndex="drawer"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <Box
        position="absolute"
        top="0"
        right="0"
        bottom="0"
        left="0"
        bg="blackAlpha.600"
      />

      {/* Drawer panel */}
      <Box
        position="absolute"
        top="0"
        right="0"
        bottom="0"
        w="420px"
        maxW="100vw"
        bg={{ base: "white", _dark: "gray.800" }}
        boxShadow="xl"
        display="flex"
        flexDirection="column"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Flex align="center" justify="space-between" p="4" borderBottom="1px solid" borderColor={{ base: "gray.200", _dark: "gray.700" }}>
          <Heading size="sm">Create API Key</Heading>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X size={18} />
          </Button>
        </Flex>

        {/* Body */}
        <Box flex="1" overflow="auto" p="6">
          {createdKey ? (
            <VStack gap="4" align="stretch">
              <Box
                p="4"
                borderRadius="md"
                bg={{ base: "green.50", _dark: "green.900/30" }}
                border="1px solid"
                borderColor={{ base: "green.200", _dark: "green.700" }}
              >
                <Text fontSize="sm" fontWeight="bold" color={{ base: "green.700", _dark: "green.300" }} mb="2">
                  API Key Created Successfully
                </Text>
                <Text fontSize="xs" color={{ base: "green.600", _dark: "green.400" }} mb="3">
                  This key will only be shown once. Copy it now.
                </Text>
                <Box
                  p="3"
                  borderRadius="md"
                  bg={{ base: "green.100", _dark: "green.900/50" }}
                  fontFamily="mono"
                  fontSize="sm"
                  wordBreak="break-all"
                >
                  {createdKey.key}
                </Box>
                <Button
                  size="sm"
                  variant="outline"
                  mt="3"
                  onClick={handleCopy}
                  colorPalette={copied ? "green" : "gray"}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy Key"}
                </Button>
              </Box>

              <Flex justify="flex-end">
                <Button onClick={handleClose}>Done</Button>
              </Flex>
            </VStack>
          ) : (
            <form onSubmit={handleSubmit}>
              <VStack gap="4" align="stretch">
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb="1">
                    Name
                  </Text>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. CI/CD Pipeline"
                    required
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb="2">
                    Scopes
                  </Text>
                  <VStack gap="2" align="stretch">
                    {AVAILABLE_SCOPES.map((scope) => (
                      <HStack
                        key={scope}
                        as="label"
                        gap="2"
                        cursor="pointer"
                        p="2"
                        borderRadius="md"
                        border="1px solid"
                        borderColor={
                          scopes.includes(scope)
                            ? { base: "blue.300", _dark: "blue.600" }
                            : { base: "gray.200", _dark: "gray.700" }
                        }
                        bg={
                          scopes.includes(scope)
                            ? { base: "blue.50", _dark: "blue.900/20" }
                            : "transparent"
                        }
                        _hover={{
                          borderColor: { base: "blue.300", _dark: "blue.600" },
                        }}
                        transition="all 0.15s"
                      >
                        <Switch.Root
                          checked={scopes.includes(scope)}
                          onCheckedChange={() => toggleScope(scope)}
                          colorPalette="yellow"
                          size="sm"
                        >
                          <Switch.HiddenInput />
                          <Switch.Control>
                            <Switch.Thumb />
                          </Switch.Control>
                        </Switch.Root>
                        <Text fontSize="sm">{scope}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb="1">
                    Expiration Date
                  </Text>
                  <Input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </Box>

                {error && (
                  <Box
                    p="3"
                    borderRadius="md"
                    bg={{ base: "red.50", _dark: "red.900/30" }}
                    color={{ base: "red.700", _dark: "red.300" }}
                  >
                    <Text fontSize="sm">{error}</Text>
                  </Box>
                )}

                <Flex justify="flex-end" gap="2" pt="2">
                  <Button variant="ghost" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    colorPalette="yellow"
                    loading={createMutation.isPending}
                  >
                    Create
                  </Button>
                </Flex>
              </VStack>
            </form>
          )}
        </Box>
      </Box>
    </Box>
  );
}
