import { Box, Flex, Heading, Text, Badge, HStack, VStack } from "@chakra-ui/react";
import { useNavigate } from "@tanstack/react-router";
import { HealthDot } from "./HealthDot";
import type { ConnectionSummary } from "../api/types";

interface ConnectionCardProps {
  connection: ConnectionSummary;
}

const dbTypePalette: Record<string, string> = {
  postgresql: "blue",
  mysql: "orange",
  mssql: "purple",
};

export function ConnectionCard({ connection }: ConnectionCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate({ to: "/connections/$connId", params: { connId: connection.id } });
  };

  const stats = connection.stats;

  return (
    <Box
      p="5"
      borderRadius="lg"
      border="1px solid"
      borderColor={{ base: "gray.200", _dark: "gray.700" }}
      bg={{ base: "white", _dark: "gray.900" }}
      cursor="pointer"
      _hover={{
        borderColor: { base: "gray.300", _dark: "gray.600" },
        boxShadow: "md",
      }}
      transition="all 0.2s"
      onClick={handleClick}
    >
      <VStack align="stretch" gap="3">
        <Flex justify="space-between" align="center">
          <HStack gap="2">
            <HealthDot status={connection.healthStatus} />
            <Heading size="sm">{connection.name}</Heading>
          </HStack>
          <Badge
            colorPalette={dbTypePalette[connection.dbType] ?? "gray"}
            variant="subtle"
            fontSize="xs"
          >
            {connection.dbType}
          </Badge>
        </Flex>

        <Text fontSize="xs" color="gray.500">
          {connection.healthStatus === "HEALTHY"
            ? "Connected"
            : connection.healthStatus === "UNREACHABLE"
              ? "Unreachable"
              : "Unknown"}
          {connection.lastHealthCheck &&
            ` \u00B7 Checked ${new Date(connection.lastHealthCheck).toLocaleString()}`}
        </Text>

        {stats && (
          <VStack align="stretch" gap="2" pt="1">
            <DomainRow label="MQTT" stats={stats.mqtt} />
            <DomainRow label="CC" stats={stats.cc} />
            <DomainRow label="REST API" stats={stats.restApi} />
          </VStack>
        )}
      </VStack>
    </Box>
  );
}

function DomainRow({
  label,
  stats,
}: {
  label: string;
  stats: { userCount: number; roleCount: number; permissionCount: number };
}) {
  return (
    <Flex justify="space-between" align="center" fontSize="xs">
      <Text fontWeight="medium" color="gray.500" minW="60px">
        {label}
      </Text>
      <HStack gap="3">
        <Text>
          {stats.userCount} user{stats.userCount !== 1 ? "s" : ""}
        </Text>
        <Text>
          {stats.roleCount} role{stats.roleCount !== 1 ? "s" : ""}
        </Text>
        <Text>
          {stats.permissionCount} perm{stats.permissionCount !== 1 ? "s" : ""}
        </Text>
      </HStack>
    </Flex>
  );
}
