import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        body: { value: "'Roboto', sans-serif" },
        heading: { value: "'Roboto', sans-serif" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
