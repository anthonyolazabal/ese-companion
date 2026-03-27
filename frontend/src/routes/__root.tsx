import { createRootRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";

function RootLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

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

  // Login page renders without sidebar/topbar
  if (isLoginPage) {
    return <Outlet />;
  }

  // Not authenticated and not on login — will redirect
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Flex direction="column" h="100vh">
      {/* Top Bar */}
      <TopBar onMenuClick={() => setMobileOpen(true)} />

      {/* Body: Sidebar + Content */}
      <Flex flex="1" overflow="hidden">
        <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

        {/* Main content */}
        <Box
          flex="1"
          overflow="auto"
          p="6"
          bg={{ base: "gray.50", _dark: "gray.950" }}
        >
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
