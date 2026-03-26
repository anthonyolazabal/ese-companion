import { createFileRoute } from "@tanstack/react-router";
import { Heading, Box } from "@chakra-ui/react";

function AuditLogsPage() {
  return (
    <Box>
      <Heading size="lg">Audit Logs</Heading>
    </Box>
  );
}

export const Route = createFileRoute("/admin/audit-logs")({
  component: AuditLogsPage,
});
