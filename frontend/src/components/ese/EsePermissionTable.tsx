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
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import type { MqttPermission, StringPermission } from "../../api/types";

type AnyPermission = MqttPermission | StringPermission;

function isMqttPermission(p: AnyPermission): p is MqttPermission {
  return "topic" in p;
}

interface EsePermissionTableProps {
  permissions: AnyPermission[];
  domain: string;
  onAdd: () => void;
  onEdit: (perm: AnyPermission) => void;
  onDelete: (perm: AnyPermission) => void;
}

const BoolBadge = ({ value }: { value: boolean }) => (
  <Badge
    size="sm"
    colorPalette={value ? "green" : "red"}
    variant="subtle"
  >
    {value ? "ALLOW" : "DENIED"}
  </Badge>
);

const mqttColumnHelper = createColumnHelper<MqttPermission>();
const stringColumnHelper = createColumnHelper<StringPermission>();

export function EsePermissionTable({
  permissions,
  domain,
  onAdd,
  onEdit,
  onDelete,
}: EsePermissionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const isMqtt = domain === "mqtt";

  const mqttColumns = useMemo(
    () => [
      mqttColumnHelper.accessor("topic", {
        header: "Topic",
        cell: (info) => (
          <Text fontWeight="medium" fontFamily="mono" fontSize="sm">
            {info.getValue()}
          </Text>
        ),
      }),
      mqttColumnHelper.accessor("publishAllowed", {
        header: "Pub",
        cell: (info) => <BoolBadge value={info.getValue()} />,
        size: 50,
      }),
      mqttColumnHelper.accessor("subscribeAllowed", {
        header: "Sub",
        cell: (info) => <BoolBadge value={info.getValue()} />,
        size: 50,
      }),
      mqttColumnHelper.accessor("qos0Allowed", {
        header: "QoS0",
        cell: (info) => <BoolBadge value={info.getValue()} />,
        size: 50,
      }),
      mqttColumnHelper.accessor("qos1Allowed", {
        header: "QoS1",
        cell: (info) => <BoolBadge value={info.getValue()} />,
        size: 50,
      }),
      mqttColumnHelper.accessor("qos2Allowed", {
        header: "QoS2",
        cell: (info) => <BoolBadge value={info.getValue()} />,
        size: 50,
      }),
      mqttColumnHelper.accessor("retainedMsgsAllowed", {
        header: "Retain",
        cell: (info) => <BoolBadge value={info.getValue()} />,
        size: 50,
      }),
      mqttColumnHelper.accessor("sharedSubAllowed", {
        header: "Shared",
        cell: (info) => <BoolBadge value={info.getValue()} />,
        size: 50,
      }),
      mqttColumnHelper.accessor("sharedGroup", {
        header: "Group",
        cell: (info) => info.getValue() ?? "-",
      }),
      mqttColumnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => (
          <HStack gap="1" justify="flex-end">
            <IconButton
              aria-label="Edit permission"
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
              aria-label="Delete permission"
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

  const stringColumns = useMemo(
    () => [
      stringColumnHelper.accessor("permissionString", {
        header: "Permission",
        cell: (info) => (
          <Badge variant="subtle" fontFamily="mono" fontSize="sm">
            {info.getValue()}
          </Badge>
        ),
      }),
      stringColumnHelper.accessor("description", {
        header: "Description",
        cell: (info) => info.getValue() ?? "-",
      }),
      stringColumnHelper.accessor("createdAt", {
        header: "Created",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
      stringColumnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => (
          <HStack gap="1" justify="flex-end">
            <IconButton
              aria-label="Edit permission"
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
              aria-label="Delete permission"
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

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const table = useReactTable({
    data: permissions as any[],
    columns: (isMqtt ? mqttColumns : stringColumns) as any[],
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const colCount = isMqtt ? mqttColumns.length : stringColumns.length;

  return (
    <Box>
      <Flex justify="space-between" align="center" mb="4">
        <Input
          placeholder="Search permissions..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          maxW="300px"
          size="sm"
        />
        <Button size="sm" colorPalette="yellow" onClick={onAdd}>
          <Plus size={16} />
          Add Permission
        </Button>
      </Flex>

      <Box
        borderRadius="md"
        border="1px solid"
        borderColor={{ base: "gray.200", _dark: "gray.700" }}
        overflow="auto"
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
                    whiteSpace="nowrap"
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
                <Table.Cell colSpan={colCount} textAlign="center" py="8">
                  <Text color="gray.500">No permissions found</Text>
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

export type { AnyPermission };
export { isMqttPermission };
