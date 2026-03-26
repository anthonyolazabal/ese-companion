import { createFileRoute } from "@tanstack/react-router";
import { Heading, Text, Box } from "@chakra-ui/react";

function DashboardPage() {
  return (
    <Box>
      <Heading size="lg" mb="4">
        ESE Companion v2 Dashboard
      </Heading>
      <Text color="gray.500">Manage your HiveMQ ESE databases centrally.</Text>
    </Box>
  );
}

export const Route = createFileRoute("/")({
  component: DashboardPage,
});
