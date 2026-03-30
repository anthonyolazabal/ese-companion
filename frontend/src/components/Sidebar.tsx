import { Link, useLocation } from "@tanstack/react-router";
import {
  Box,
  Flex,
  Text,
  VStack,
  DrawerRoot,
  DrawerBackdrop,
  DrawerPositioner,
  DrawerContent,
  DrawerBody,
  DrawerCloseTrigger,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Users,
  FolderCog,
  FileText,
} from "lucide-react";
import { useAuth } from "../auth/useAuth";
import { dashboardApi } from "../api/dashboardApi";
import { HealthDot } from "./HealthDot";

interface SidebarContentProps {
  onNavigate?: () => void;
}

function SidebarContent({ onNavigate }: SidebarContentProps) {
  const { isAdmin } = useAuth();
  const location = useLocation();

  const { data: dashboard } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.get,
    refetchInterval: 30000,
  });

  const isActive = (path: string) => location.pathname === path;

  const navItemStyles = (path: string) => ({
    align: "center" as const,
    gap: "2",
    p: "2",
    borderRadius: "md",
    cursor: "pointer" as const,
    transition: "all 0.15s ease",
    bg: isActive(path)
      ? { base: "yellow.50", _dark: "yellow.950" }
      : "transparent",
    color: isActive(path)
      ? { base: "yellow.700", _dark: "yellow.200" }
      : undefined,
    fontWeight: isActive(path) ? "semibold" : "normal",
    _hover: {
      bg: isActive(path)
        ? { base: "yellow.50", _dark: "yellow.950" }
        : { base: "gray.200", _dark: "gray.800" },
    },
  });

  return (
    <Flex direction="column" h="100%" p="4" gap="1">
      {/* Dashboard Link */}
      <Link to="/" style={{ textDecoration: "none" }} onClick={onNavigate}>
        <Flex {...navItemStyles("/")}>
          <LayoutDashboard size={18} />
          <Text fontSize="sm">Dashboard</Text>
        </Flex>
      </Link>

      {/* Connections Section */}
      <Text
        fontSize="xs"
        fontWeight="bold"
        textTransform="uppercase"
        color="gray.500"
        mt="4"
        mb="1"
        px="2"
        letterSpacing="wider"
      >
        Connections
      </Text>

      {dashboard?.connections && dashboard.connections.length > 0 ? (
        <VStack gap="0" align="stretch">
          {dashboard.connections.map((conn) => (
            <Link
              key={conn.id}
              to={`/connections/${conn.id}` as string}
              style={{ textDecoration: "none" }}
              onClick={onNavigate}
            >
              <Flex
                {...navItemStyles(`/connections/${conn.id}`)}
                pl="3"
              >
                <HealthDot status={conn.healthStatus} />
                <Text fontSize="sm" truncate>
                  {conn.name}
                </Text>
              </Flex>
            </Link>
          ))}
        </VStack>
      ) : (
        <Text fontSize="xs" color="gray.500" px="3" py="1">
          No connections
        </Text>
      )}

      {/* Admin Section */}
      {isAdmin && (
        <>
          <Text
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
            color="gray.500"
            mt="4"
            mb="1"
            px="2"
            letterSpacing="wider"
          >
            Admin
          </Text>

          <Link
            to="/admin/users"
            style={{ textDecoration: "none" }}
            onClick={onNavigate}
          >
            <Flex {...navItemStyles("/admin/users")}>
              <Users size={18} />
              <Text fontSize="sm">Users</Text>
            </Flex>
          </Link>

          <Link
            to={"/admin/connections" as string}
            style={{ textDecoration: "none" }}
            onClick={onNavigate}
          >
            <Flex {...navItemStyles("/admin/connections")}>
              <FolderCog size={18} />
              <Text fontSize="sm">Connections</Text>
            </Flex>
          </Link>

          <Link
            to="/admin/audit-logs"
            style={{ textDecoration: "none" }}
            onClick={onNavigate}
          >
            <Flex {...navItemStyles("/admin/audit-logs")}>
              <FileText size={18} />
              <Text fontSize="sm">Audit Logs</Text>
            </Flex>
          </Link>
        </>
      )}
    </Flex>
  );
}

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Mobile Drawer */}
      <DrawerRoot
        open={mobileOpen}
        onOpenChange={(e) => !e.open && onMobileClose()}
        placement="start"
      >
        <DrawerBackdrop />
        <DrawerPositioner>
          <DrawerContent maxW="240px">
            <DrawerCloseTrigger />
            <DrawerBody p="0">
              <SidebarContent onNavigate={onMobileClose} />
            </DrawerBody>
          </DrawerContent>
        </DrawerPositioner>
      </DrawerRoot>

      {/* Desktop Sidebar */}
      <Box
        as="nav"
        w="240px"
        minW="240px"
        bg={{ base: "gray.50", _dark: "gray.900" }}
        borderRight="1px solid"
        borderColor={{ base: "gray.200", _dark: "gray.700" }}
        display={{ base: "none", md: "flex" }}
        flexDirection="column"
        overflowY="auto"
      >
        <SidebarContent />
      </Box>
    </>
  );
}
