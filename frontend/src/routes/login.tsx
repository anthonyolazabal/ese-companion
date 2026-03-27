import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Image,
  Input,
  Button,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useAuth } from "../auth/useAuth";
import logo from "../assets/logo.png";

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect
  if (isAuthenticated) {
    navigate({ to: "/" });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(username, password);
      navigate({ to: "/" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={{ base: "gray.50", _dark: "gray.950" }}
    >
      <Box
        as="form"
        onSubmit={handleSubmit}
        w="full"
        maxW="400px"
        mx="4"
        p="8"
        bg={{ base: "white", _dark: "gray.900" }}
        borderRadius="xl"
        border="1px solid"
        borderColor={{ base: "gray.200", _dark: "gray.700" }}
        boxShadow="lg"
      >
        <VStack gap="6">
          <Image src={logo} alt="ESE Companion" w="80px" h="80px" mx="auto" />
          <Heading size="lg" textAlign="center">
            ESE Companion v2
          </Heading>

          <Text
            fontSize="sm"
            color={{ base: "gray.600", _dark: "gray.400" }}
            textAlign="center"
          >
            Sign in to manage your HiveMQ ESE databases
          </Text>

          {error && (
            <Box
              w="full"
              p="3"
              bg="red.50"
              borderColor="red.200"
              border="1px solid"
              borderRadius="md"
            >
              <Text color="red.600" fontSize="sm">
                {error}
              </Text>
            </Box>
          )}

          <VStack gap="4" w="full">
            <Box w="full">
              <Text fontSize="sm" fontWeight="medium" mb="1">
                Username
              </Text>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                autoFocus
                required
              />
            </Box>

            <Box w="full">
              <Text fontSize="sm" fontWeight="medium" mb="1">
                Password
              </Text>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </Box>
          </VStack>

          <Button
            type="submit"
            w="full"
            colorPalette="yellow"
            loading={isSubmitting}
            loadingText="Signing in..."
          >
            Sign In
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}

export const Route = createFileRoute("/login")({
  component: LoginPage,
});
