import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { AuditLogDetail } from "../../api/types";

interface AuditLogDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entry: AuditLogDetail | null;
  isLoading: boolean;
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <Box>
      <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
        {label}
      </Text>
      <Text fontSize="sm" mt="0.5">
        {value || "N/A"}
      </Text>
    </Box>
  );
}

function formatJson(raw: string | null): string {
  if (!raw) return "N/A";
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

export function AuditLogDetailDrawer({
  isOpen,
  onClose,
  entry,
  isLoading,
}: AuditLogDetailDrawerProps) {
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
          <Heading size="md">Audit Log Detail</Heading>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </Flex>

        {isLoading && <Text color="gray.500">Loading...</Text>}

        {!isLoading && entry && (
          <VStack gap="4" align="stretch">
            <DetailRow label="ID" value={String(entry.id)} />
            <DetailRow label="Timestamp" value={new Date(entry.timestamp).toLocaleString()} />
            <DetailRow label="Actor Type" value={entry.actorType} />
            <DetailRow label="Actor Name" value={entry.actorName} />
            <DetailRow label="Actor ID" value={entry.actorId} />
            <DetailRow label="Connection" value={entry.connectionName} />
            <DetailRow label="Connection ID" value={entry.connectionId} />
            <DetailRow label="Domain" value={entry.domain} />
            <DetailRow label="Action" value={entry.action} />
            <DetailRow label="Resource Type" value={entry.resourceType} />
            <DetailRow label="Resource Name" value={entry.resourceName} />
            <DetailRow label="Resource ID" value={entry.resourceId} />
            <DetailRow label="IP Address" value={entry.ipAddress} />
            <DetailRow label="User Agent" value={entry.userAgent} />

            <Box>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                Details
              </Text>
              <Box
                mt="1"
                p="3"
                bg={{ base: "gray.50", _dark: "gray.900" }}
                borderRadius="md"
                fontSize="xs"
                fontFamily="mono"
                whiteSpace="pre-wrap"
                overflowX="auto"
                maxH="300px"
                overflowY="auto"
              >
                {formatJson(entry.details)}
              </Box>
            </Box>
          </VStack>
        )}
      </Box>
    </>
  );
}
