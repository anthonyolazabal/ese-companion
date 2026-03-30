import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  Textarea,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import { NativeSelectField, NativeSelectRoot } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2 } from "lucide-react";
import { connectionsApi } from "../../api/connectionsApi";
import { DeleteConfirmModal } from "../../components/DeleteConfirmModal";
import type { UpdateConnectionRequest } from "../../api/types";

function ConnectionSettingsPage() {
  const { connId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState(5432);
  const [databaseName, setDatabaseName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [sslEnabled, setSslEnabled] = useState(false);
  const [connectionParams, setConnectionParams] = useState("");

  const connectionQuery = useQuery({
    queryKey: ["connection", connId],
    queryFn: () => connectionsApi.get(connId),
  });

  useEffect(() => {
    if (connectionQuery.data) {
      const c = connectionQuery.data;
      setName(c.name);
      setDescription(c.description ?? "");
      setHost(c.host);
      setPort(c.port);
      setDatabaseName(c.databaseName);
      setUsername(c.username);
      setPassword("");
      setSslEnabled(c.sslEnabled);
      setConnectionParams(c.connectionParams ?? "");
    }
  }, [connectionQuery.data]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateConnectionRequest) =>
      connectionsApi.update(connId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connection", connId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => connectionsApi.delete(connId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      navigate({ to: "/" });
    },
  });

  const handleSave = () => {
    const data: UpdateConnectionRequest = {
      name,
      description: description || undefined,
      host,
      port,
      databaseName,
      username,
      sslEnabled,
      connectionParams: connectionParams || undefined,
    };
    if (password) data.password = password;
    updateMutation.mutate(data);
  };

  if (connectionQuery.isLoading) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="lg" />
      </Flex>
    );
  }

  if (connectionQuery.isError || !connectionQuery.data) {
    return (
      <Box p="6">
        <Text color="red.500">Failed to load connection settings.</Text>
      </Box>
    );
  }

  return (
    <Box maxW="600px">
      <Flex align="center" gap="3" mb="6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            navigate({
              to: "/connections/$connId",
              params: { connId },
            })
          }
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        <Heading size="lg">Connection Settings</Heading>
      </Flex>

      <VStack gap="4" align="stretch">
        <Box>
          <Text fontWeight="medium" fontSize="sm" mb="1">
            Name
          </Text>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Box>

        <Box>
          <Text fontWeight="medium" fontSize="sm" mb="1">
            Description
          </Text>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </Box>

        <Box>
          <Text fontWeight="medium" fontSize="sm" mb="1">
            Host
          </Text>
          <Input value={host} onChange={(e) => setHost(e.target.value)} />
        </Box>

        <Box>
          <Text fontWeight="medium" fontSize="sm" mb="1">
            Port
          </Text>
          <Input
            type="number"
            value={port}
            onChange={(e) => setPort(Number(e.target.value))}
          />
        </Box>

        <Box>
          <Text fontWeight="medium" fontSize="sm" mb="1">
            Database Name
          </Text>
          <Input
            value={databaseName}
            onChange={(e) => setDatabaseName(e.target.value)}
          />
        </Box>

        <Box>
          <Text fontWeight="medium" fontSize="sm" mb="1">
            Username
          </Text>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Box>

        <Box>
          <Text fontWeight="medium" fontSize="sm" mb="1">
            Password (leave empty to keep current)
          </Text>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave empty to keep current"
          />
        </Box>

        <Box>
          <Text fontWeight="medium" fontSize="sm" mb="1">
            SSL Enabled
          </Text>
          <NativeSelectRoot>
            <NativeSelectField
              value={sslEnabled ? "true" : "false"}
              onChange={(e) => setSslEnabled(e.target.value === "true")}
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </NativeSelectField>
          </NativeSelectRoot>
        </Box>

        <Box>
          <Text fontWeight="medium" fontSize="sm" mb="1">
            Connection Parameters
          </Text>
          <Input
            value={connectionParams}
            onChange={(e) => setConnectionParams(e.target.value)}
            placeholder="e.g. sslmode=require"
          />
        </Box>

        <Flex justify="space-between" pt="4">
          <Button
            colorPalette="red"
            variant="outline"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 size={16} />
            Delete Connection
          </Button>
          <Button
            colorPalette="yellow"
            onClick={handleSave}
            loading={updateMutation.isPending}
          >
            Save Changes
          </Button>
        </Flex>
      </VStack>

      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        entityName={connectionQuery.data.name}
        isLoading={deleteMutation.isPending}
      />
    </Box>
  );
}

export const Route = createFileRoute("/connections/$connId/settings")({
  component: ConnectionSettingsPage,
});
