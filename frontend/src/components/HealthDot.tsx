import { Box } from "@chakra-ui/react";

interface HealthDotProps {
  status: string;
}

const statusColorMap: Record<string, string> = {
  HEALTHY: "green.500",
  UNREACHABLE: "red.500",
};

export function HealthDot({ status }: HealthDotProps) {
  const color = statusColorMap[status] ?? "gray.400";

  return (
    <Box
      w="10px"
      h="10px"
      borderRadius="full"
      bg={color}
      flexShrink={0}
    />
  );
}
