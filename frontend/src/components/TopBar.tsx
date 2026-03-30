import { Link } from "@tanstack/react-router";
import { Flex, Text, IconButton, HStack, Image } from "@chakra-ui/react";
import { useTheme } from "next-themes";
import { Settings, Sun, Moon, LogOut, Menu } from "lucide-react";
import { useAuth } from "../auth/useAuth";
import logo from "../assets/logo.png";

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      px="4"
      h="12"
      minH="12"
      bg="gray.800"
      color="gray.100"
      borderBottom="1px solid"
      borderColor="gray.700"
      position="sticky"
      top="0"
      zIndex="sticky"
    >
      {/* Left: hamburger + app name */}
      <HStack gap="3">
        {onMenuClick && (
          <IconButton
            aria-label="Open menu"
            variant="ghost"
            size="sm"
            color="gray.300"
            _hover={{ bg: "gray.700" }}
            display={{ base: "flex", md: "none" }}
            onClick={onMenuClick}
          >
            <Menu size={18} />
          </IconButton>
        )}
        <Image src={logo} alt="ESE Companion" w="24px" h="24px" />
        <Text fontWeight="bold" fontSize="sm" letterSpacing="wide">
          ESE Companion
        </Text>
        <Text fontSize="xs" color="gray.500">
          v2.0
        </Text>
      </HStack>

      {/* Right: settings, theme, user + logout */}
      <HStack gap="1">
        <Link to="/settings" style={{ textDecoration: "none" }}>
          <IconButton
            aria-label="Settings"
            variant="ghost"
            size="sm"
            color="gray.300"
            _hover={{ bg: "gray.700" }}
          >
            <Settings size={16} />
          </IconButton>
        </Link>

        <IconButton
          aria-label="Toggle theme"
          variant="ghost"
          size="sm"
          color="gray.300"
          _hover={{ bg: "gray.700" }}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </IconButton>

        {user && (
          <HStack
            gap="2"
            ml="2"
            pl="2"
            borderLeft="1px solid"
            borderColor="gray.600"
          >
            <Text fontSize="xs" color="gray.400">
              {user.username}
            </Text>
            <IconButton
              aria-label="Logout"
              variant="ghost"
              size="sm"
              color="gray.300"
              _hover={{ bg: "gray.700" }}
              onClick={logout}
            >
              <LogOut size={16} />
            </IconButton>
          </HStack>
        )}
      </HStack>
    </Flex>
  );
}
