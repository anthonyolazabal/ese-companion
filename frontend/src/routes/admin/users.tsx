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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "../../auth/useAuth";
import { usersApi } from "../../api/usersApi";
import type { CompanionUser } from "../../api/types";
import { CompanionUserDrawer } from "../../components/admin/CompanionUserDrawer";

const columnHelper = createColumnHelper<CompanionUser>();

function RoleBadge({ role }: { role: string }) {
  const colorMap: Record<string, string> = {
    admin: "yellow",
    readwrite: "blue",
    readonly: "gray",
  };
  const c = colorMap[role] ?? "gray";
  return (
    <Box
      as="span"
      px="2"
      py="0.5"
      borderRadius="full"
      fontSize="xs"
      fontWeight="bold"
      bg={`${c}.100`}
      color={`${c}.700`}
    >
      {role}
    </Box>
  );
}

function UsersPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<CompanionUser[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CompanionUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CompanionUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const pageSize = 20;

  useEffect(() => {
    if (!isAdmin) {
      navigate({ to: "/" });
    }
  }, [isAdmin, navigate]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersApi.list(page, pageSize);
      setUsers(res.items);
      setTotal(res.total);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSaveUser = async (data: {
    username: string;
    email: string;
    password: string;
    role: string;
  }) => {
    if (editingUser) {
      const updateData: Record<string, string> = { email: data.email, role: data.role };
      if (data.password) updateData.password = data.password;
      await usersApi.update(editingUser.id, updateData);
    } else {
      await usersApi.create(data);
    }
    await fetchUsers();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await usersApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      await fetchUsers();
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    columnHelper.accessor("username", {
      header: "Username",
      cell: (info) => <Text fontWeight="medium">{info.getValue()}</Text>,
    }),
    columnHelper.accessor("email", {
      header: "Email",
    }),
    columnHelper.accessor("role", {
      header: "Role",
      cell: (info) => <RoleBadge role={info.getValue()} />,
    }),
    columnHelper.accessor("createdAt", {
      header: "Created",
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Flex gap="2">
          <Button
            size="xs"
            variant="ghost"
            onClick={() => {
              setEditingUser(row.original);
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
      ),
    }),
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = Math.ceil(total / pageSize);

  if (!isAdmin) return null;

  return (
    <Box>
      <Flex justify="space-between" align="center" mb="6">
        <Heading size="lg">Users</Heading>
        <Button
          colorPalette="yellow"
          size="sm"
          onClick={() => {
            setEditingUser(null);
            setDrawerOpen(true);
          }}
        >
          <Plus size={16} />
          Create User
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
                      <Text color="gray.500">No users found</Text>
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

      <CompanionUserDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSave={handleSaveUser}
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
            <Heading size="sm" mb="3">Delete User</Heading>
            <Text fontSize="sm" mb="4">
              Are you sure you want to delete user <strong>{deleteTarget.username}</strong>?
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

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});
