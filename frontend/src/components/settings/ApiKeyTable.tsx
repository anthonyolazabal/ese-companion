import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Badge,
  HStack,
  Table,
} from "@chakra-ui/react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { apiKeysApi } from "../../api/apiKeysApi";
import type { ApiKey } from "../../api/types";
import { ApiKeyCreateDrawer } from "./ApiKeyCreateDrawer";

const scopeColorMap: Record<string, string> = {
  "ese:read": "blue",
  "ese:write": "orange",
  "ese:admin": "purple",
};

const columnHelper = createColumnHelper<ApiKey>();

export function ApiKeyTable() {
  const queryClient = useQueryClient();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ApiKey | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["api-keys"],
    queryFn: () => apiKeysApi.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiKeysApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      setDeleteTarget(null);
    },
  });

  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => (
        <Text fontWeight="medium">{info.getValue()}</Text>
      ),
    }),
    columnHelper.accessor("keyPrefix", {
      header: "Key",
      cell: (info) => (
        <Text fontFamily="mono" fontSize="sm" color="gray.500">
          {info.getValue()}...
        </Text>
      ),
    }),
    columnHelper.accessor("scopes", {
      header: "Scopes",
      cell: (info) => (
        <HStack gap="1" flexWrap="wrap">
          {info.getValue().map((scope) => (
            <Badge
              key={scope}
              colorPalette={scopeColorMap[scope] ?? "gray"}
              variant="subtle"
              fontSize="xs"
            >
              {scope}
            </Badge>
          ))}
        </HStack>
      ),
    }),
    columnHelper.accessor("expiresAt", {
      header: "Expires",
      cell: (info) => {
        const date = new Date(info.getValue());
        const isExpired = date < new Date();
        return (
          <Text fontSize="sm" color={isExpired ? "red.500" : undefined}>
            {date.toLocaleDateString()}
          </Text>
        );
      },
    }),
    columnHelper.accessor("lastUsedAt", {
      header: "Last Used",
      cell: (info) => {
        const val = info.getValue();
        return (
          <Text fontSize="sm" color="gray.500">
            {val ? new Date(val).toLocaleDateString() : "Never"}
          </Text>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          size="xs"
          variant="ghost"
          colorPalette="red"
          onClick={() => setDeleteTarget(row.original)}
        >
          <Trash2 size={14} />
        </Button>
      ),
    }),
  ];

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Box>
      <Flex justify="space-between" align="center" mb="4">
        <Heading size="md">API Keys</Heading>
        <Button
          size="sm"
          colorPalette="yellow"
          onClick={() => setIsDrawerOpen(true)}
        >
          <Plus size={16} />
          Create API Key
        </Button>
      </Flex>

      {error && (
        <Box
          p="3"
          mb="4"
          borderRadius="md"
          bg={{ base: "red.50", _dark: "red.900/30" }}
          color={{ base: "red.700", _dark: "red.300" }}
        >
          <Text fontSize="sm">
            {error instanceof Error ? error.message : "Failed to load API keys."}
          </Text>
        </Box>
      )}

      {isLoading ? (
        <Text color="gray.500">Loading API keys...</Text>
      ) : (
        <Box
          borderRadius="lg"
          border="1px solid"
          borderColor={{ base: "gray.200", _dark: "gray.700" }}
          overflow="hidden"
        >
          <Table.Root size="sm">
            <Table.Header>
              {table.getHeaderGroups().map((headerGroup) => (
                <Table.Row key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Table.ColumnHeader
                      key={header.id}
                      px="4"
                      py="3"
                      fontSize="xs"
                      fontWeight="bold"
                      textTransform="uppercase"
                      color="gray.500"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </Table.ColumnHeader>
                  ))}
                </Table.Row>
              ))}
            </Table.Header>
            <Table.Body>
              {table.getRowModel().rows.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={columns.length} textAlign="center" py="8">
                    <Text color="gray.500">No API keys yet.</Text>
                  </Table.Cell>
                </Table.Row>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <Table.Row key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <Table.Cell key={cell.id} px="4" py="3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table.Root>
        </Box>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="modal"
          onClick={() => setDeleteTarget(null)}
        >
          <Box
            bg={{ base: "white", _dark: "gray.800" }}
            p="6"
            borderRadius="lg"
            maxW="400px"
            w="full"
            mx="4"
            boxShadow="xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Heading size="sm" mb="2">
              Revoke API Key
            </Heading>
            <Text fontSize="sm" color="gray.500" mb="4">
              Are you sure you want to revoke the key "{deleteTarget.name}"? This
              action cannot be undone.
            </Text>
            <Flex justify="flex-end" gap="2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                colorPalette="red"
                loading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
              >
                Revoke
              </Button>
            </Flex>
          </Box>
        </Box>
      )}

      <ApiKeyCreateDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </Box>
  );
}
