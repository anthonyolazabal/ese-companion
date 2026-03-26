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
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Shield } from "lucide-react";
import type { EseRole } from "../../api/types";

interface EseRoleTableProps {
  roles: EseRole[];
  onAdd: () => void;
  onEdit: (role: EseRole) => void;
  onDelete: (role: EseRole) => void;
  onManagePermissions: (role: EseRole) => void;
}

const columnHelper = createColumnHelper<EseRole>();

export function EseRoleTable({
  roles,
  onAdd,
  onEdit,
  onDelete,
  onManagePermissions,
}: EseRoleTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => info.getValue(),
        size: 60,
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => (
          <Text fontWeight="medium">{info.getValue()}</Text>
        ),
      }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: (info) => info.getValue() ?? "-",
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
              aria-label="Manage permissions"
              variant="ghost"
              size="sm"
              colorPalette="purple"
              onClick={(e) => {
                e.stopPropagation();
                onManagePermissions(info.row.original);
              }}
            >
              <Shield size={16} />
            </IconButton>
            <IconButton
              aria-label="Edit role"
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
              aria-label="Delete role"
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
    [onEdit, onDelete, onManagePermissions],
  );

  const table = useReactTable({
    data: roles,
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
          placeholder="Search roles..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          maxW="300px"
          size="sm"
        />
        <Button size="sm" colorPalette="blue" onClick={onAdd}>
          <Plus size={16} />
          Add Role
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
                  <Text color="gray.500">No roles found</Text>
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
