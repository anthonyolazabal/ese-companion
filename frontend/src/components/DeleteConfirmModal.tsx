import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
} from "@chakra-ui/react";
import { createPortal } from "react-dom";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  entityName: string;
  isLoading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  entityName,
  isLoading = false,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <Box
      position="fixed"
      inset="0"
      zIndex="1400"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        position="absolute"
        inset="0"
        bg="blackAlpha.600"
        onClick={onClose}
      />
      <Box
        position="relative"
        bg={{ base: "white", _dark: "gray.800" }}
        borderRadius="lg"
        p="6"
        maxW="md"
        w="full"
        mx="4"
        boxShadow="xl"
      >
        <Heading size="md" mb="4">
          {title}
        </Heading>
        <Text mb="6">
          Are you sure you want to delete <strong>{entityName}</strong>? This
          action cannot be undone.
        </Text>
        <Flex justify="flex-end" gap="3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            colorPalette="red"
            onClick={onConfirm}
            loading={isLoading}
          >
            Delete
          </Button>
        </Flex>
      </Box>
    </Box>,
    document.body,
  );
}
