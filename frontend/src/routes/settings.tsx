import { createFileRoute } from "@tanstack/react-router";
import { Heading, Box, VStack, Text } from "@chakra-ui/react";
import { useAuth } from "../auth/useAuth";
import { ProfileForm } from "../components/settings/ProfileForm";
import { ApiKeyTable } from "../components/settings/ApiKeyTable";

function SettingsPage() {
  const { user } = useAuth();

  return (
    <Box>
      <Heading size="lg" mb="1">
        Settings
      </Heading>
      <Text color="gray.500" mb="6">
        Manage your profile and API keys.
        {user && (
          <Text as="span" fontWeight="medium">
            {" "}
            Logged in as {user.username}
          </Text>
        )}
      </Text>

      <VStack gap="8" align="stretch">
        <ProfileForm />
        <ApiKeyTable />
      </VStack>
    </Box>
  );
}

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});
