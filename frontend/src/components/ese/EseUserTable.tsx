import { useState, useMemo } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Table,
  Text,
  IconButton,
  Badge,
} from "@chakra-ui/react";
import { NativeSelectField, NativeSelectRoot } from "@chakra-ui/react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
} from "@tanstack/react-table";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, UserCheck } from "lucide-react";
import type { EseUser } from "../../api/types";

interface EseUserTableProps {
  users: EseUser[];
  onAdd: () => void;
  onEdit: (user: EseUser) => void;
  onDelete: (user: EseUser) => void;
  onManageRoles: (user: EseUser) => void;
}

const columnHelper = createColumnHelper<EseUser>();

export function EseUserTable({
  users,
  onAdd,
  onEdit,
  onDelete,
  onManageRoles,
}: EseUserTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => info.getValue(),
        size: 60,
      }),
      columnHelper.accessor("username", {
        header: "Username",
        cell: (info) => (
          <Text fontWeight="medium">{info.getValue()}</Text>
        ),
      }),
      columnHelper.accessor("algorithm", {
        header: "Algorithm",
        cell: (info) => {
          const value = info.getValue();
          const isWeak = value === "PLAIN" || value === "MD5";
          return (
            <Badge
              colorPalette={isWeak ? "orange" : "green"}
              variant="subtle"
            >
              {value}
            </Badge>
          );
        },
      }),
      columnHelper.accessor("iterations", {
        header: "Iterations",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("roles", {
        header: "Roles",
        cell: (info) => {
          const roles = info.getValue();
          if (!roles || roles.length === 0) {
            return <Text fontSize="xs" color="gray.400">—</Text>;
          }
          return (
            <HStack gap="1" flexWrap="wrap">
              {roles.map((role) => (
                <Badge key={role} colorPalette="purple" variant="subtle" size="sm">
                  {role}
                </Badge>
              ))}
            </HStack>
          );
        },
      }),
      columnHelper.accessor("createdAt", {
        header: "Created",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => (
          <HStack gap="1" justify="flex-end">
            <IconButton
              aria-label="Manage roles"
              variant="ghost"
              size="sm"
              colorPalette="purple"
              onClick={(e) => {
                e.stopPropagation();
                onManageRoles(info.row.original);
              }}
            >
              <UserCheck size={16} />
            </IconButton>
            <IconButton
              aria-label="Edit user"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(info.row.original);
              }}
            >
              <Pencil size={16} />
            </IconButton>
            <IconButton
              aria-label="Delete user"
              variant="ghost"
              size="sm"
              colorPalette="red"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(info.row.original);
              }}
            >
              <Trash2 size={16} />
            </IconButton>
          </HStack>
        ),
        size: 80,
      }),
    ],
    [onEdit, onDelete, onManageRoles],
  );

  const table = useReactTable({
    data: users,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <Box>
      <Flex justify="space-between" align="center" mb="4">
        <Input
          placeholder="Search users..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          maxW="300px"
          size="sm"
        />
        <Button size="sm" colorPalette="blue" onClick={onAdd}>
          <Plus size={16} />
          Add User
        </Button>
      </Flex>

      <Box
        borderRadius="md"
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
                    cursor={header.column.getCanSort() ? "pointer" : "default"}
                    onClick={header.column.getToggleSortingHandler()}
                    userSelect="none"
                  >
                    <HStack gap="1">
                      <Text>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </Text>
                      {header.column.getIsSorted() === "asc" && (
                        <ArrowUp size={14} />
                      )}
                      {header.column.getIsSorted() === "desc" && (
                        <ArrowDown size={14} />
                      )}
                    </HStack>
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            ))}
          </Table.Header>
          <Table.Body>
            {table.getRowModel().rows.length === 0 ? (
              <Table.Row>
                <Table.Cell
                  colSpan={columns.length}
                  textAlign="center"
                  py="8"
                >
                  <Text color="gray.500">No users found</Text>
                </Table.Cell>
              </Table.Row>
            ) : (
              table.getRowModel().rows.map((row) => (
                <Table.Row key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <Table.Cell key={cell.id}>
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

      <Flex justify="space-between" align="center" mt="3">
        <HStack gap="2">
          <Text fontSize="sm" color="gray.500">
            Rows per page:
          </Text>
          <NativeSelectRoot size="sm" w="70px">
            <NativeSelectField
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </NativeSelectField>
          </NativeSelectRoot>
        </HStack>
        <HStack gap="2">
          <Text fontSize="sm" color="gray.500">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount() || 1}
          </Text>
          <Button
            size="xs"
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Prev
          </Button>
          <Button
            size="xs"
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
}
