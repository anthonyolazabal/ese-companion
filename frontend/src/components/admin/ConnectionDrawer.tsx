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
import type { Connection } from "../../api/types";
import { connectionsApi } from "../../api/connectionsApi";

interface ConnectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  connection: Connection | null;
  onSave: (data: {
    name: string;
    description: string;
    dbType: string;
    host: string;
    port: number;
    databaseName: string;
    username: string;
    password: string;
    sslEnabled: boolean;
  }) => Promise<void>;
}

const DB_TYPES = ["postgresql", "mysql", "mariadb"] as const;

export function ConnectionDrawer({
  isOpen,
  onClose,
  connection,
  onSave,
}: ConnectionDrawerProps) {
  const isEdit = !!connection;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dbType, setDbType] = useState<string>("postgresql");
  const [host, setHost] = useState("");
  const [port, setPort] = useState(5432);
  const [databaseName, setDatabaseName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [sslEnabled, setSslEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (connection) {
      setName(connection.name);
      setDescription(connection.description ?? "");
      setDbType(connection.dbType);
      setHost(connection.host);
      setPort(connection.port);
      setDatabaseName(connection.databaseName);
      setUsername(connection.username);
      setPassword("");
      setSslEnabled(connection.sslEnabled);
    } else {
      setName("");
      setDescription("");
      setDbType("postgresql");
      setHost("");
      setPort(5432);
      setDatabaseName("");
      setUsername("");
      setPassword("");
      setSslEnabled(false);
    }
    setError("");
    setTestResult(null);
  }, [connection, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave({ name, description, dbType, host, port, databaseName, username, password, sslEnabled });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save connection");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!connection) return;
    setTesting(true);
    setTestResult(null);
    try {
      const result = await connectionsApi.test(connection.id);
      setTestResult(result);
    } catch (err) {
      setTestResult({ success: false, message: err instanceof Error ? err.message : "Test failed" });
    } finally {
      setTesting(false);
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
        w={{ base: "full", md: "520px" }}
        bg={{ base: "white", _dark: "gray.800" }}
        zIndex="1500"
        boxShadow="xl"
        overflowY="auto"
        p="6"
      >
        <Flex justify="space-between" align="center" mb="6">
          <Heading size="md">{isEdit ? "Edit Connection" : "Add Connection"}</Heading>
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
              <Text fontSize="sm" fontWeight="medium" mb="1">Name</Text>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Connection name"
                required
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb="1">Description</Text>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb="1">Database Type</Text>
              <Flex gap="2">
                {DB_TYPES.map((t) => (
                  <Button
                    key={t}
                    type="button"
                    size="sm"
                    variant={dbType === t ? "solid" : "outline"}
                    colorPalette={dbType === t ? "purple" : "gray"}
                    onClick={() => {
                      setDbType(t);
                      if (t === "postgresql") setPort(5432);
                      else if (t === "mysql" || t === "mariadb") setPort(3306);
                    }}
                  >
                    {t}
                  </Button>
                ))}
              </Flex>
            </Box>

            <Flex gap="3">
              <Box flex="3">
                <Text fontSize="sm" fontWeight="medium" mb="1">Host</Text>
                <Input
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="localhost"
                  required
                />
              </Box>
              <Box flex="1">
                <Text fontSize="sm" fontWeight="medium" mb="1">Port</Text>
                <Input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(Number(e.target.value))}
                  required
                />
              </Box>
            </Flex>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb="1">Database Name</Text>
              <Input
                value={databaseName}
                onChange={(e) => setDatabaseName(e.target.value)}
                placeholder="Database name"
                required
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb="1">Username</Text>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Database username"
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

            <Flex align="center" gap="3">
              <Button
                type="button"
                size="sm"
                variant={sslEnabled ? "solid" : "outline"}
                colorPalette={sslEnabled ? "green" : "gray"}
                onClick={() => setSslEnabled(!sslEnabled)}
              >
                SSL {sslEnabled ? "Enabled" : "Disabled"}
              </Button>
            </Flex>

            {isEdit && (
              <Box>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTest}
                  loading={testing}
                  loadingText="Testing..."
                >
                  Test Connection
                </Button>
                {testResult && (
                  <Box
                    mt="2"
                    p="2"
                    borderRadius="md"
                    bg={testResult.success ? "green.50" : "red.50"}
                    border="1px solid"
                    borderColor={testResult.success ? "green.200" : "red.200"}
                  >
                    <Text fontSize="sm" color={testResult.success ? "green.700" : "red.600"}>
                      {testResult.message}
                    </Text>
                  </Box>
                )}
              </Box>
            )}

            <Flex gap="3" mt="4">
              <Button
                type="submit"
                colorPalette="purple"
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
