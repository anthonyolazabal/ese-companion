import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import {
  DrawerRoot,
  DrawerBackdrop,
  DrawerPositioner,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerCloseTrigger,
  DrawerTitle,
} from "@chakra-ui/react";
import type { EseRole } from "../../api/types";

interface EseRoleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description?: string }) => void;
  role?: EseRole | null;
  isSaving?: boolean;
}

export function EseRoleDrawer({
  isOpen,
  onClose,
  onSave,
  role,
  isSaving = false,
}: EseRoleDrawerProps) {
  const isEdit = !!role;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (role) {
        setName(role.name);
        setDescription(role.description ?? "");
      } else {
        setName("");
        setDescription("");
      }
    }
  }, [isOpen, role]);

  const handleSubmit = () => {
    onSave({
      name,
      description: description || undefined,
    });
  };

  const canSave = name.trim() !== "";

  return (
    <DrawerRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()} placement="end" size="md">
      <DrawerBackdrop />
      <DrawerPositioner>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{isEdit ? "Edit Role" : "Create Role"}</DrawerTitle>
          </DrawerHeader>
          <DrawerCloseTrigger />
          <DrawerBody>
            <VStack gap="4" align="stretch">
              <Box>
                <Text fontWeight="medium" fontSize="sm" mb="1">
                  Name
                </Text>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter role name"
                />
              </Box>

              <Box>
                <Text fontWeight="medium" fontSize="sm" mb="1">
                  Description
                </Text>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter role description (optional)"
                  rows={3}
                />
              </Box>
            </VStack>
          </DrawerBody>
          <DrawerFooter>
            <Flex gap="3" w="full" justify="flex-end">
              <Button variant="ghost" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                colorPalette="blue"
                onClick={handleSubmit}
                disabled={!canSave}
                loading={isSaving}
              >
                {isEdit ? "Update" : "Create"}
              </Button>
            </Flex>
          </DrawerFooter>
        </DrawerContent>
      </DrawerPositioner>
    </DrawerRoot>
  );
}
