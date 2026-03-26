import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Heading,
  Text,
  Box,
  Flex,
  Button,
  Spinner,
  SimpleGrid,
  HStack,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Heart, HeartOff, Cable } from "lucide-react";
import { dashboardApi } from "../api/dashboardApi";
import { useAuth } from "../auth/useAuth";
import { ConnectionCard } from "../components/ConnectionCard";

function DashboardPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.get,
  });

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="lg" colorPalette="purple" />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Box p="4" bg="red.50" borderRadius="md" border="1px solid" borderColor="red.200">
        <Text color="red.600">
          Failed to load dashboard: {error instanceof Error ? error.message : "Unknown error"}
        </Text>
      </Box>
    );
  }

  const dashboard = data!;
  const hasConnections = dashboard.connections.length > 0;

  return (
    <Box>
      <Flex justify="space-between" align="center" mb="6">
        <Heading size="lg">Dashboard</Heading>
        {isAdmin && (
          <Button
            colorPalette="purple"
            size="sm"
            onClick={() => navigate({ to: "/connections/new" as string })}
          >
            <Plus size={16} />
            Add Connection
          </Button>
        )}
      </Flex>

      {/* Summary Stats */}
      <SimpleGrid columns={{ base: 1, sm: 3 }} gap="4" mb="6">
        <StatBox
          icon={<Cable size={18} />}
          label="Total Connections"
          value={dashboard.totalConnections}
        />
        <StatBox
          icon={<Heart size={18} />}
          label="Healthy"
          value={dashboard.healthyConnections}
          color="green.500"
        />
        <StatBox
          icon={<HeartOff size={18} />}
          label="Unreachable"
          value={dashboard.unreachableConnections}
          color={dashboard.unreachableConnections > 0 ? "red.500" : undefined}
        />
      </SimpleGrid>

      {/* Connection Cards Grid */}
      {hasConnections ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
          {dashboard.connections.map((conn) => (
            <ConnectionCard key={conn.id} connection={conn} />
          ))}
        </SimpleGrid>
      ) : (
        <Flex
          direction="column"
          align="center"
          justify="center"
          py="16"
          gap="4"
          borderRadius="lg"
          border="1px dashed"
          borderColor={{ base: "gray.300", _dark: "gray.600" }}
        >
          <Cable size={40} />
          <Text color="gray.500" fontSize="lg">
            No connections configured
          </Text>
          {isAdmin && (
            <Button
              colorPalette="purple"
              size="sm"
              onClick={() => navigate({ to: "/connections/new" as string })}
            >
              <Plus size={16} />
              Add Connection
            </Button>
          )}
        </Flex>
      )}
    </Box>
  );
}

function StatBox({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <Box
      p="4"
      borderRadius="lg"
      border="1px solid"
      borderColor={{ base: "gray.200", _dark: "gray.700" }}
      bg={{ base: "white", _dark: "gray.900" }}
    >
      <HStack gap="3">
        <Box color={color ?? "gray.500"}>{icon}</Box>
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color={color}>
            {value}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {label}
          </Text>
        </Box>
      </HStack>
    </Box>
  );
}

export const Route = createFileRoute("/")({
  component: DashboardPage,
});
