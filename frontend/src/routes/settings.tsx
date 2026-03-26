import { createFileRoute } from "@tanstack/react-router";
import { Heading, Box } from "@chakra-ui/react";

function SettingsPage() {
  return (
    <Box>
      <Heading size="lg">Settings</Heading>
    </Box>
  );
}

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});
