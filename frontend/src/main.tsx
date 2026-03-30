import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { ThemeProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { system } from "./theme";
import { queryClient } from "./queryClient";
import { router } from "./router";
import { AuthProvider } from "./auth/AuthContext";
import {
  Toaster,
  Toast,
  Portal,
  Stack,
  Spinner,
} from "@chakra-ui/react";
import { toaster } from "./toaster";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/700.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChakraProvider value={system}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            <Portal>
              <Toaster toaster={toaster} insetInline={{ mdDown: "4" }}>
                {(toast) => (
                  <Toast.Root width={{ md: "sm" }}>
                    {toast.type === "loading" ? (
                      <Spinner size="sm" color="blue.solid" />
                    ) : (
                      <Toast.Indicator />
                    )}
                    <Stack gap="1" flex="1" maxWidth="100%">
                      {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
                      {toast.description && (
                        <Toast.Description>{toast.description}</Toast.Description>
                      )}
                    </Stack>
                    {toast.meta?.closable && <Toast.CloseTrigger />}
                  </Toast.Root>
                )}
              </Toaster>
            </Portal>
          </QueryClientProvider>
        </AuthProvider>
      </ThemeProvider>
    </ChakraProvider>
  </StrictMode>,
);
