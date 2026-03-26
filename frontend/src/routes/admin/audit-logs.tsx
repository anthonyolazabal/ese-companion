import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  Table,
} from "@chakra-ui/react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useAuth } from "../../auth/useAuth";
import { auditLogsApi } from "../../api/auditLogsApi";
import type { AuditLogEntry, AuditLogDetail } from "../../api/types";
import { AuditLogDetailDrawer } from "../../components/admin/AuditLogDetailDrawer";

const columnHelper = createColumnHelper<AuditLogEntry>();

const DOMAINS = ["", "mqtt", "cc", "rest_api", "system"];
const ACTIONS = ["", "create", "update", "delete", "login", "logout"];

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <Box
      as="span"
      px="2"
      py="0.5"
      borderRadius="full"
      fontSize="xs"
      fontWeight="bold"
      bg={`${color}.100`}
      color={`${color}.700`}
    >
      {children}
    </Box>
  );
}

function domainColor(domain: string): string {
  const map: Record<string, string> = {
    mqtt: "green",
    cc: "blue",
    rest_api: "orange",
    system: "purple",
  };
  return map[domain] ?? "gray";
}

function actionColor(action: string): string {
  const map: Record<string, string> = {
    create: "green",
    update: "blue",
    delete: "red",
    login: "purple",
    logout: "gray",
  };
  return map[action] ?? "gray";
}

function AuditLogsPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [domain, setDomain] = useState("");
  const [action, setAction] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Detail drawer
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AuditLogDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const pageSize = 20;

  useEffect(() => {
    if (!isAdmin) {
      navigate({ to: "/" });
    }
  }, [isAdmin, navigate]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auditLogsApi.list({
        page,
        size: pageSize,
        domain: domain || undefined,
        action: action || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      });
      setEntries(res.items);
      setTotal(res.total);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, domain, action, fromDate, toDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const openDetail = async (id: number) => {
    setSelectedId(id);
    setDetailLoading(true);
    setDetail(null);
    try {
      const d = await auditLogsApi.get(id);
      setDetail(d);
    } catch {
      // ignore
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    columnHelper.accessor("timestamp", {
      header: "Timestamp",
      cell: (info) => (
        <Text fontSize="sm">{new Date(info.getValue()).toLocaleString()}</Text>
      ),
    }),
    columnHelper.accessor("actorName", {
      header: "Actor",
    }),
    columnHelper.accessor("connectionName", {
      header: "Connection",
      cell: (info) => info.getValue() || "N/A",
    }),
    columnHelper.accessor("domain", {
      header: "Domain",
      cell: (info) => <Badge color={domainColor(info.getValue())}>{info.getValue()}</Badge>,
    }),
    columnHelper.accessor("action", {
      header: "Action",
      cell: (info) => <Badge color={actionColor(info.getValue())}>{info.getValue()}</Badge>,
    }),
    columnHelper.accessor("resourceType", {
      header: "Resource",
      cell: (info) => (
        <Text fontSize="sm">
          {info.getValue()}
          {info.row.original.resourceName ? `: ${info.row.original.resourceName}` : ""}
        </Text>
      ),
    }),
  ];

  const table = useReactTable({
    data: entries,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = Math.ceil(total / pageSize);

  if (!isAdmin) return null;

  return (
    <Box>
      <Heading size="lg" mb="6">Audit Logs</Heading>

      {/* Filter bar */}
      <Flex gap="3" mb="4" wrap="wrap" align="flex-end">
        <Box>
          <Text fontSize="xs" fontWeight="medium" mb="1">Domain</Text>
          <select
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid var(--chakra-colors-gray-300)",
              fontSize: "14px",
              background: "transparent",
            }}
          >
            <option value="">All domains</option>
            {DOMAINS.filter(Boolean).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </Box>

        <Box>
          <Text fontSize="xs" fontWeight="medium" mb="1">Action</Text>
          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid var(--chakra-colors-gray-300)",
              fontSize: "14px",
              background: "transparent",
            }}
          >
            <option value="">All actions</option>
            {ACTIONS.filter(Boolean).map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </Box>

        <Box>
          <Text fontSize="xs" fontWeight="medium" mb="1">From</Text>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
            size="sm"
          />
        </Box>

        <Box>
          <Text fontSize="xs" fontWeight="medium" mb="1">To</Text>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
            size="sm"
          />
        </Box>
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
                      <Text color="gray.500">No audit logs found</Text>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <Table.Row
                      key={row.id}
                      cursor="pointer"
                      _hover={{ bg: { base: "gray.50", _dark: "gray.700" } }}
                      onClick={() => openDetail(row.original.id)}
                    >
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

      <AuditLogDetailDrawer
        isOpen={selectedId !== null}
        onClose={() => {
          setSelectedId(null);
          setDetail(null);
        }}
        entry={detail}
        isLoading={detailLoading}
      />
    </Box>
  );
}

export const Route = createFileRoute("/admin/audit-logs")({
  component: AuditLogsPage,
});
