import { useState, useMemo, useEffect, Fragment } from "react";
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
  Spinner,
} from "@chakra-ui/react";
import { NativeSelectField, NativeSelectRoot } from "@chakra-ui/react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
  type ExpandedState,
} from "@tanstack/react-table";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, ChevronRight, ChevronDown } from "lucide-react";
import type { EseUser, EseRole } from "../../api/types";
import { eseApi } from "../../api/eseApi";

interface EseUserTableProps {
  users: EseUser[];
  onAdd: () => void;
  onEdit: (user: EseUser) => void;
  onDelete: (user: EseUser) => void;
  connId: string;
  domain: string;
}

const columnHelper = createColumnHelper<EseUser>();

function ExpandedRoles({
  connId,
  domain,
  userId,
  colSpan,
}: {
  connId: string;
  domain: string;
  userId: number;
  colSpan: number;
}) {
  const [allRoles, setAllRoles] = useState<EseRole[]>([]);
  const [assignedIds, setAssignedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [rolesRes, assignedRoleIds] = await Promise.all([
          eseApi.listRoles(connId, domain, 1, 1000),
          eseApi.getUserRoleIds(connId, domain, userId),
        ]);
        if (!cancelled) {
          setAllRoles(rolesRes.items);
          setAssignedIds(new Set(assignedRoleIds));
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [connId, domain, userId]);

  const assigned = allRoles.filter((r) => assignedIds.has(r.id));

  if (loading) {
    return (
      <Table.Row>
        <Table.Cell colSpan={colSpan} py="4">
          <Flex justify="center"><Spinner size="sm" /></Flex>
        </Table.Cell>
      </Table.Row>
    );
  }

  if (assigned.length === 0) {
    return (
      <Table.Row>
        <Table.Cell colSpan={colSpan} py="3">
          <Text fontSize="sm" color="gray.500" pl="8">No roles assigned to this user</Text>
        </Table.Cell>
      </Table.Row>
    );
  }

  return (
    <Table.Row>
      <Table.Cell colSpan={colSpan} py="3" px="8">
        <Text fontSize="xs" fontWeight="bold" color="gray.500" mb="2">
          ASSIGNED ROLES ({assigned.length})
        </Text>
        <Box>
          {assigned.map((role) => (
            <Flex
              key={role.id}
              align="center"
              gap="3"
              py="2"
              px="3"
              borderBottom="1px solid"
              borderColor={{ base: "gray.100", _dark: "gray.800" }}
              _last={{ borderBottom: "none" }}
              fontSize="xs"
            >
              <Badge colorPalette="yellow" variant="subtle" size="sm">{role.name}</Badge>
              <Box flex="1" />
              {role.description && (
                <Text color="gray.500">{role.description}</Text>
              )}
            </Flex>
          ))}
        </Box>
      </Table.Cell>
    </Table.Row>
  );
}

export function EseUserTable({
  users,
  onAdd,
  onEdit,
  onDelete,
  connId,
  domain,
}: EseUserTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [expanded, setExpanded] = useState<ExpandedState>({});

  // Collapse all expanded rows when data refreshes
  useEffect(() => {
    setExpanded({});
  }, [users]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "expand",
        header: "",
        cell: ({ row }) => (
          <IconButton
            aria-label="Expand"
            variant="ghost"
            size="xs"
            onClick={() => row.toggleExpanded()}
          >
            {row.getIsExpanded() ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </IconButton>
        ),
        size: 40,
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
      columnHelper.accessor("createdAt", {
        header: "Created",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
      columnHelper.accessor("updatedAt", {
        header: "Updated",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => (
          <HStack gap="1" justify="flex-end">
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
    [onEdit, onDelete],
  );

  const table = useReactTable({
    data: users,
    columns,
    state: { sorting, globalFilter, expanded },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
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
        <Button size="sm" colorPalette="yellow" onClick={onAdd}>
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
                      {header.column.getIsSorted() === "asc" && <ArrowUp size={14} />}
                      {header.column.getIsSorted() === "desc" && <ArrowDown size={14} />}
                    </HStack>
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
                <Fragment key={row.id}>
                  <Table.Row
                    cursor="pointer"
                    onClick={() => row.toggleExpanded()}
                    _hover={{ bg: { base: "gray.50", _dark: "gray.900" } }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <Table.Cell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                  {row.getIsExpanded() && (
                    <ExpandedRoles
                      connId={connId}
                      domain={domain}
                      userId={row.original.id}
                      colSpan={columns.length}
                    />
                  )}
                </Fragment>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Box>

      <Flex justify="space-between" align="center" mt="3">
        <HStack gap="2">
          <Text fontSize="sm" color="gray.500">Rows per page:</Text>
          <NativeSelectRoot size="sm" w="70px">
            <NativeSelectField
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </NativeSelectField>
          </NativeSelectRoot>
        </HStack>
        <HStack gap="2">
          <Text fontSize="sm" color="gray.500">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </Text>
          <Button size="xs" variant="outline" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Prev
          </Button>
          <Button size="xs" variant="outline" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
}
