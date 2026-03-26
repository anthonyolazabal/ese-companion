import { createFileRoute } from "@tanstack/react-router";
import { Heading, Box } from "@chakra-ui/react";

function LoginPage() {
  return (
    <Box>
      <Heading size="lg">Login</Heading>
    </Box>
  );
}

export const Route = createFileRoute("/login")({
  component: LoginPage,
});
