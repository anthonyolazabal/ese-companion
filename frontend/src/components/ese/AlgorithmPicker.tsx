import { Box, Badge, Text, Flex } from "@chakra-ui/react";
import { NativeSelectField, NativeSelectRoot } from "@chakra-ui/react";

const ALGORITHMS = [
  "PLAIN",
  "MD5",
  "SHA512",
  "PKCS5S2",
  "BCRYPT",
  "ARGON2ID",
] as const;

export type Algorithm = (typeof ALGORITHMS)[number];

const DEFAULT_ITERATIONS: Record<Algorithm, number> = {
  PLAIN: 0,
  MD5: 0,
  SHA512: 0,
  PKCS5S2: 100_000,
  BCRYPT: 12,
  ARGON2ID: 3,
};

const WEAK_ALGORITHMS: Algorithm[] = ["PLAIN", "MD5"];

interface AlgorithmPickerProps {
  value: Algorithm;
  onChange: (algorithm: Algorithm, defaultIterations: number) => void;
}

export function AlgorithmPicker({ value, onChange }: AlgorithmPickerProps) {
  const isWeak = WEAK_ALGORITHMS.includes(value);

  return (
    <Box>
      <Flex align="center" gap="2" mb="1">
        <Text fontWeight="medium" fontSize="sm">
          Algorithm
        </Text>
        {isWeak && (
          <Badge colorPalette="orange" variant="subtle" fontSize="xs">
            Weak
          </Badge>
        )}
      </Flex>
      <NativeSelectRoot>
        <NativeSelectField
          value={value}
          onChange={(e) => {
            const algo = e.target.value as Algorithm;
            onChange(algo, DEFAULT_ITERATIONS[algo]);
          }}
        >
          {ALGORITHMS.map((algo) => (
            <option key={algo} value={algo}>
              {algo}
            </option>
          ))}
        </NativeSelectField>
      </NativeSelectRoot>
    </Box>
  );
}

export { DEFAULT_ITERATIONS };
