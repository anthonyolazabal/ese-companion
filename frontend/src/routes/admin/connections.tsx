import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Table,
} from "@chakra-ui/react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Plus, Pencil, Trash2, Zap, Check, X } from "lucide-react";
import { useAuth } from "../../auth/useAuth";
import { connectionsApi } from "../../api/connectionsApi";
import type { Connection } from "../../api/types";
import { HealthDot } from "../../components/HealthDot";
import { ConnectionDrawer } from "../../components/admin/ConnectionDrawer";

const columnHelper = createColumnHelper<Connection>();

function ConnectionsPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Connection | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const pageSize = 20;

  useEffect(() => {
    if (!isAdmin) {
      navigate({ to: "/" });
    }
  }, [isAdmin, navigate]);

  const fetchConnections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await connectionsApi.list(page, pageSize);
      setConnections(res.items);
      setTotal(res.total);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const handleSave = async (data: {
    name: string;
    description: string;
    dbType: string;
    host: string;
    port: number;
    databaseName: string;
    username: string;
    password: string;
    sslEnabled: boolean;
  }) => {
    if (editingConnection) {
      const updateData: Record<string, unknown> = {
        name: data.name,
        description: data.description,
        host: data.host,
        port: data.port,
        databaseName: data.databaseName,
        username: data.username,
        sslEnabled: data.sslEnabled,
      };
      if (data.password) updateData.password = data.password;
      await connectionsApi.update(editingConnection.id, updateData as Parameters<typeof connectionsApi.update>[1]);
    } else {
      await connectionsApi.create(data);
    }
    await fetchConnections();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await connectionsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      await fetchConnections();
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  };

  const handleTest = async (connId: string) => {
    setTestingId(connId);
    try {
      const result = await connectionsApi.test(connId);
      setTestResults((prev) => ({ ...prev, [connId]: result }));
    } catch (err) {
      setTestResults((prev) => ({
        ...prev,
        [connId]: { success: false, message: err instanceof Error ? err.message : "Test failed" },
      }));
    } finally {
      setTestingId(null);
    }
  };

  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => <Text fontWeight="medium">{info.getValue()}</Text>,
    }),
    columnHelper.accessor("dbType", {
      header: "DB Type",
      cell: (info) => (
        <Box
          as="span"
          px="2"
          py="0.5"
          borderRadius="full"
          fontSize="xs"
          fontWeight="bold"
          bg="blue.100"
          color="blue.700"
        >
          {info.getValue()}
        </Box>
      ),
    }),
    columnHelper.accessor("host", {
      header: "Host",
      cell: (info) => (
        <Text fontSize="sm">
          {info.getValue()}:{info.row.original.port}
        </Text>
      ),
    }),
    columnHelper.accessor("healthStatus", {
      header: "Health",
      cell: (info) => (
        <Flex align="center" gap="2">
          <HealthDot status={info.getValue()} />
          <Text fontSize="sm">{info.getValue()}</Text>
        </Flex>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const connId = row.original.id;
        const isTesting = testingId === connId;
        const testResult = testResults[connId];
        return (
          <Flex gap="2" align="center">
            <Button
              size="xs"
              variant="ghost"
              colorPalette={testResult ? (testResult.success ? "green" : "red") : "blue"}
              onClick={() => handleTest(connId)}
              loading={isTesting}
              title={testResult ? testResult.message : "Test connection"}
            >
              {testResult ? (
                testResult.success ? <Check size={14} /> : <X size={14} />
              ) : (
                <Zap size={14} />
              )}
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => {
                setEditingConnection(row.original);
                setDrawerOpen(true);
              }}
            >
              <Pencil size={14} />
            </Button>
            <Button
              size="xs"
              variant="ghost"
              colorPalette="red"
              onClick={() => setDeleteTarget(row.original)}
            >
              <Trash2 size={14} />
            </Button>
          </Flex>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: connections,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = Math.ceil(total / pageSize);

  if (!isAdmin) return null;

  return (
    <Box>
      <Flex justify="space-between" align="center" mb="6">
        <Heading size="lg">Connections</Heading>
        <Button
          colorPalette="yellow"
          size="sm"
          onClick={() => {
            setEditingConnection(null);
            setDrawerOpen(true);
          }}
        >
          <Plus size={16} />
          Add Connection
        </Button>
      </Flex>

      {loading ? (
        <Text color="gray.500">Loading...</Text>
      ) : (
        <>
          <Box
            borderRadius="md"
            border="1px solid"
            borderColor={{ base: "gray.200", _dark: "gray.700" }}
            overflowX="auto"
          >
            <Table.Root size="sm">
              <Table.Header>
                {table.getHeaderGroups().map((hg) => (
                  <Table.Row key={hg.id}>
                    {hg.headers.map((header) => (
                      <Table.ColumnHeader key={header.id} px="4" py="3">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </Table.ColumnHeader>
                    ))}
                  </Table.Row>
                ))}
              </Table.Header>
              <Table.Body>
                {table.getRowModel().rows.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={columns.length} textAlign="center" py="8">
                      <Text color="gray.500">No connections found</Text>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <Table.Row key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <Table.Cell key={cell.id} px="4" py="3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table.Root>
          </Box>

          {totalPages > 1 && (
            <Flex justify="center" align="center" gap="3" mt="4">
              <Button size="xs" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <Text fontSize="sm" color="gray.500">
                Page {page} of {totalPages}
              </Text>
              <Button size="xs" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </Flex>
          )}
        </>
      )}

      <ConnectionDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingConnection(null);
        }}
        connection={editingConnection}
        onSave={handleSave}
      />

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <>
          <Box
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="blackAlpha.600"
            zIndex="1400"
            onClick={() => setDeleteTarget(null)}
          />
          <Box
            position="fixed"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            bg={{ base: "white", _dark: "gray.800" }}
            borderRadius="lg"
            p="6"
            zIndex="1500"
            w="400px"
            boxShadow="xl"
          >
            <Heading size="sm" mb="3">Delete Connection</Heading>
            <Text fontSize="sm" mb="4">
              Are you sure you want to delete connection <strong>{deleteTarget.name}</strong>?
              This action cannot be undone.
            </Text>
            <Flex gap="3" justify="flex-end">
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                colorPalette="red"
                size="sm"
                onClick={handleDelete}
                loading={deleting}
                loadingText="Deleting..."
              >
                Delete
              </Button>
            </Flex>
          </Box>
        </>
      )}
    </Box>
  );
}

export const Route = createFileRoute("/admin/connections")({
  component: ConnectionsPage,
});
