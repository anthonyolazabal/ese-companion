import { useState } from "react";
import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  VStack,
  Flex,
} from "@chakra-ui/react";
import * as authApi from "../../api/authApi";

export function ProfileForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({
        type: "error",
        text: "New password must be at least 8 characters.",
      });
      return;
    }

    setIsLoading(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setMessage({ type: "success", text: "Password changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to change password.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      p="6"
      borderRadius="lg"
      border="1px solid"
      borderColor={{ base: "gray.200", _dark: "gray.700" }}
      bg={{ base: "white", _dark: "gray.900" }}
      maxW="480px"
    >
      <Heading size="md" mb="4">
        Change Password
      </Heading>

      <form onSubmit={handleSubmit}>
        <VStack gap="4" align="stretch">
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb="1">
              Current Password
            </Text>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
            />
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="medium" mb="1">
              New Password
            </Text>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="medium" mb="1">
              Confirm New Password
            </Text>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </Box>

          {message && (
            <Box
              p="3"
              borderRadius="md"
              bg={
                message.type === "success"
                  ? { base: "green.50", _dark: "green.900/30" }
                  : { base: "red.50", _dark: "red.900/30" }
              }
              color={
                message.type === "success"
                  ? { base: "green.700", _dark: "green.300" }
                  : { base: "red.700", _dark: "red.300" }
              }
            >
              <Text fontSize="sm">{message.text}</Text>
            </Box>
          )}

          <Flex justify="flex-end">
            <Button type="submit" colorPalette="yellow" loading={isLoading}>
              Save Password
            </Button>
          </Flex>
        </VStack>
      </form>
    </Box>
  );
}
