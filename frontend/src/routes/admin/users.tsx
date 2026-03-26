import { createFileRoute } from "@tanstack/react-router";
import { Heading, Box } from "@chakra-ui/react";

function UsersPage() {
  return (
    <Box>
      <Heading size="lg">Users</Heading>
    </Box>
  );
}

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});
