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
import type { EseRole, MqttPermission, StringPermission } from "../../api/types";
import { eseApi } from "../../api/eseApi";

type Permission = MqttPermission | StringPermission;

function isMqttPermission(p: Permission): p is MqttPermission {
  return "topic" in p;
}

interface EseRoleTableProps {
  roles: EseRole[];
  onAdd: () => void;
  onEdit: (role: EseRole) => void;
  onDelete: (role: EseRole) => void;
  connId: string;
  domain: string;
}

const columnHelper = createColumnHelper<EseRole>();

function ExpandedPermissions({
  connId,
  domain,
  roleId,
  colSpan,
}: {
  connId: string;
  domain: string;
  roleId: number;
  colSpan: number;
}) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [assignedIds, setAssignedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [allPerms, assignedPermIds] = await Promise.all([
          eseApi.listPermissions(connId, domain, 1, 1000),
          eseApi.getRolePermissionIds(connId, domain, roleId),
        ]);
        if (!cancelled) {
          setPermissions(allPerms.items);
          setAssignedIds(new Set(assignedPermIds));
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [connId, domain, roleId]);

  const assigned = permissions.filter((p) => assignedIds.has(p.id));

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
          <Text fontSize="sm" color="gray.500" pl="8">No permissions assigned to this role</Text>
        </Table.Cell>
      </Table.Row>
    );
  }

  return (
    <Table.Row>
      <Table.Cell colSpan={colSpan} py="3" px="8">
        <Text fontSize="xs" fontWeight="bold" color="gray.500" mb="2">
          ASSIGNED PERMISSIONS ({assigned.length})
        </Text>
        <Flex gap="2" flexWrap="wrap">
          {assigned.map((perm) => (
            <Box
              key={perm.id}
              px="3"
              py="1.5"
              borderRadius="md"
              border="1px solid"
              borderColor={{ base: "green.200", _dark: "green.700" }}
              bg={{ base: "green.50", _dark: "green.900" }}
              fontSize="xs"
            >
              <Text fontWeight="medium">
                {isMqttPermission(perm) ? perm.topic : perm.permissionString}
              </Text>
              {isMqttPermission(perm) && (
                <HStack gap="1" mt="1" flexWrap="wrap">
                  {perm.publishAllowed && <Badge size="sm" colorPalette="blue">PUB</Badge>}
                  {perm.subscribeAllowed && <Badge size="sm" colorPalette="green">SUB</Badge>}
                  {perm.qos0Allowed && <Badge size="sm" colorPalette="gray">QoS0</Badge>}
                  {perm.qos1Allowed && <Badge size="sm" colorPalette="gray">QoS1</Badge>}
                  {perm.qos2Allowed && <Badge size="sm" colorPalette="gray">QoS2</Badge>}
                  {perm.retainedMsgsAllowed && <Badge size="sm" colorPalette="orange">RET</Badge>}
                  {perm.sharedSubAllowed && <Badge size="sm" colorPalette="purple">SHARED</Badge>}
                </HStack>
              )}
              {!isMqttPermission(perm) && perm.description && (
                <Text color="gray.500" mt="0.5">{perm.description}</Text>
              )}
            </Box>
          ))}
        </Flex>
      </Table.Cell>
    </Table.Row>
  );
}

export function EseRoleTable({
  roles,
  onAdd,
  onEdit,
  onDelete,
  connId,
  domain,
}: EseRoleTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [expanded, setExpanded] = useState<ExpandedState>({});

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
    [onEdit, onDelete],
  );

  const table = useReactTable({
    data: roles,
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
                  <Text color="gray.500">No roles found</Text>
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
                    <ExpandedPermissions
                      connId={connId}
                      domain={domain}
                      roleId={row.original.id}
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
