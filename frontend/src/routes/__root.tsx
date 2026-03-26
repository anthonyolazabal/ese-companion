import { createRootRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Box, Flex, Heading, Text, IconButton } from "@chakra-ui/react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Cable,
  Users,
  FolderCog,
  FileText,
  Settings,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { useAuth } from "../auth/useAuth";

function RootLayout() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
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

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  return (
    <Flex h="100vh">
      {/* Sidebar */}
      <Box
        as="nav"
        w="240px"
        bg={{ base: "gray.100", _dark: "gray.900" }}
        borderRight="1px solid"
        borderColor={{ base: "gray.200", _dark: "gray.700" }}
        p="4"
        display="flex"
        flexDirection="column"
        gap="2"
      >
        <Heading size="md" mb="4">
          ESE Companion
        </Heading>

        <Link to="/" style={{ textDecoration: "none" }}>
          <Flex align="center" gap="2" p="2" borderRadius="md" _hover={{ bg: "gray.200" }}>
            <LayoutDashboard size={18} />
            <Text>Dashboard</Text>
          </Flex>
        </Link>

        <Flex align="center" gap="2" p="2" borderRadius="md" opacity={0.5} cursor="not-allowed">
          <Cable size={18} />
          <Text>Connections</Text>
        </Flex>

        <Text
          fontSize="xs"
          fontWeight="bold"
          textTransform="uppercase"
          color="gray.500"
          mt="4"
          mb="1"
          px="2"
        >
          Admin
        </Text>

        <Link to="/admin/users" style={{ textDecoration: "none" }}>
          <Flex align="center" gap="2" p="2" borderRadius="md" _hover={{ bg: "gray.200" }}>
            <Users size={18} />
            <Text>Users</Text>
          </Flex>
        </Link>

        <Flex align="center" gap="2" p="2" borderRadius="md" opacity={0.5} cursor="not-allowed">
          <FolderCog size={18} />
          <Text>Connections Mgmt</Text>
        </Flex>

        <Link to="/admin/audit-logs" style={{ textDecoration: "none" }}>
          <Flex align="center" gap="2" p="2" borderRadius="md" _hover={{ bg: "gray.200" }}>
            <FileText size={18} />
            <Text>Audit Logs</Text>
          </Flex>
        </Link>

        <Box mt="auto">
          <Link to="/settings" style={{ textDecoration: "none" }}>
            <Flex align="center" gap="2" p="2" borderRadius="md" _hover={{ bg: "gray.200" }}>
              <Settings size={18} />
              <Text>Settings</Text>
            </Flex>
          </Link>

          {user && (
            <Flex
              align="center"
              gap="2"
              p="2"
              borderRadius="md"
              cursor="pointer"
              _hover={{ bg: "gray.200" }}
              onClick={handleLogout}
              mt="1"
            >
              <LogOut size={18} />
              <Text fontSize="sm">{user.username}</Text>
            </Flex>
          )}
        </Box>
      </Box>

      {/* Main area */}
      <Flex flex="1" direction="column">
        {/* Top bar */}
        <Flex
          as="header"
          align="center"
          justify="flex-end"
          px="4"
          py="2"
          borderBottom="1px solid"
          borderColor={{ base: "gray.200", _dark: "gray.700" }}
        >
          <IconButton
            aria-label="Toggle color mode"
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </IconButton>
        </Flex>

        {/* Content */}
        <Box flex="1" p="6" overflow="auto">
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
