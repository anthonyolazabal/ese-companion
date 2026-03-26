import { createRootRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import { useAuth } from "../auth/useAuth";
import { Sidebar } from "../components/Sidebar";

function RootLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isLoginPage = location.pathname === "/login";

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && !isLoginPage) {
      navigate({ to: "/login" });
    }
    if (isAuthenticated && isLoginPage) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, isLoading, isLoginPage, navigate]);

  // Show nothing while loading auth state
  if (isLoading) {
    return (
      <Flex h="100vh" align="center" justify="center">
        <Text color="gray.500">Loading...</Text>
      </Flex>
    );
  }

  // Login page renders without sidebar
  if (isLoginPage) {
    return <Outlet />;
  }

  // Not authenticated and not on login — will redirect
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Flex h="100vh">
      <Sidebar />

      {/* Main area */}
      <Box flex="1" overflow="auto" p="6" pt={{ base: "14", md: "6" }}>
        <Outlet />
      </Box>
    </Flex>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
