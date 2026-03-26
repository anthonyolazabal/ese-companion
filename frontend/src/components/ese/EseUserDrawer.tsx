import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
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
import {
  AlgorithmPicker,
  DEFAULT_ITERATIONS,
  type Algorithm,
} from "./AlgorithmPicker";
import type { EseUser } from "../../api/types";

interface EseUserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    username: string;
    password: string;
    algorithm: string;
    iterations: number;
    memory?: number;
  }) => void;
  user?: EseUser | null;
  isSaving?: boolean;
}

export function EseUserDrawer({
  isOpen,
  onClose,
  onSave,
  user,
  isSaving = false,
}: EseUserDrawerProps) {
  const isEdit = !!user;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [algorithm, setAlgorithm] = useState<Algorithm>("PKCS5S2");
  const [iterations, setIterations] = useState(100_000);
  const [memory, setMemory] = useState(65536);

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setUsername(user.username);
        setPassword("");
        setAlgorithm(user.algorithm as Algorithm);
        setIterations(user.iterations);
        setMemory(65536);
      } else {
        setUsername("");
        setPassword("");
        setAlgorithm("PKCS5S2");
        setIterations(DEFAULT_ITERATIONS.PKCS5S2);
        setMemory(65536);
      }
    }
  }, [isOpen, user]);

  const handleAlgorithmChange = (
    algo: Algorithm,
    defaultIterations: number,
  ) => {
    setAlgorithm(algo);
    setIterations(defaultIterations);
  };

  const handleSubmit = () => {
    const data: {
      username: string;
      password: string;
      algorithm: string;
      iterations: number;
      memory?: number;
    } = {
      username,
      password,
      algorithm,
      iterations,
    };
    if (algorithm === "ARGON2ID") {
      data.memory = memory;
    }
    onSave(data);
  };

  const canSave = username.trim() !== "" && (isEdit || password.trim() !== "");

  return (
    <DrawerRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()} placement="end" size="md">
      <DrawerBackdrop />
      <DrawerPositioner>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{isEdit ? "Edit User" : "Create User"}</DrawerTitle>
          </DrawerHeader>
          <DrawerCloseTrigger />
          <DrawerBody>
            <VStack gap="4" align="stretch">
              <Box>
                <Text fontWeight="medium" fontSize="sm" mb="1">
                  Username
                </Text>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                />
              </Box>

              <Box>
                <Text fontWeight="medium" fontSize="sm" mb="1">
                  Password{isEdit ? " (leave empty to keep)" : ""}
                </Text>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    isEdit ? "Leave empty to keep current" : "Enter password"
                  }
                />
              </Box>

              <AlgorithmPicker
                value={algorithm}
                onChange={handleAlgorithmChange}
              />

              <Box>
                <Text fontWeight="medium" fontSize="sm" mb="1">
                  Iterations
                </Text>
                <Input
                  type="number"
                  value={iterations}
                  onChange={(e) => setIterations(Number(e.target.value))}
                  min={0}
                />
              </Box>

              {algorithm === "ARGON2ID" && (
                <Box>
                  <Text fontWeight="medium" fontSize="sm" mb="1">
                    Memory (KB)
                  </Text>
                  <Input
                    type="number"
                    value={memory}
                    onChange={(e) => setMemory(Number(e.target.value))}
                    min={1024}
                  />
                </Box>
              )}
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
