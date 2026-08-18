"use client";

import { Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import { Badge, statusTone } from "@/components/ui/Badge";
import { FilterBar, FilterFieldDef } from "@/components/modules/FilterBar";
import { useResolvedDateRange } from "@/components/modules/DateRangeFilter";
import { useFilterParams } from "@/lib/filter-state";
import { getAgentPerformanceRows, getTerminalsForAccount } from "@/lib/aro-analytics";
import { getAgentsForAro } from "@/lib/mock-data";
import { AgentPerformanceRow, AgentStatus, AroTransactionType } from "@/lib/types";
import { formatDate, formatNaira, formatTxnType } from "@/lib/format";
import { useApp } from "@/context/AppContext";
import { useRequireAccess } from "@/components/access/RequireAccess";

type Row = AgentPerformanceRow & { id: string };

const txnTypes: AroTransactionType[] = ["TransferIn", "CardWithdrawal", "BillPayment"];
const statuses: AgentStatus[] = ["active", "inactive", "pending", "removed"];
const fieldKeys = ["agentId", "type", "accountId", "posTerminalId", "status"] as const;

function lastActivityLabel(iso: string | null): string {
  return iso ? formatDate(iso) : "—";
}

function AroPerformanceContent() {
  const { currentAroId } = useApp();
  const router = useRouter();
  const { values, setValue, setValues, dateRange, setDateRange, clearAll } = useFilterParams(fieldKeys, "thisMonth");
  const resolvedRange = useResolvedDateRange(dateRange);

  const aroAgents = useMemo(() => getAgentsForAro(currentAroId), [currentAroId]);
  const accountOptions = useMemo(
    () =>
      aroAgents
        .filter((a) => values.agentId === "ALL" || a.id === values.agentId)
        .flatMap((a) => a.businessAccounts.map((acc) => ({ value: acc.id, label: `${acc.accountName} (${a.name})` }))),
    [aroAgents, values.agentId]
  );
  const posOptions = useMemo(
    () =>
      aroAgents
        .filter((a) => values.agentId === "ALL" || a.id === values.agentId)
        .flatMap((a) =>
          a.businessAccounts
            .filter((acc) => values.accountId === "ALL" || acc.id === values.accountId)
            .flatMap((acc) => getTerminalsForAccount(acc.id).map((p) => ({ value: p.id, label: p.serial })))
        ),
    [aroAgents, values.agentId, values.accountId]
  );

  const rows = useMemo<Row[]>(() => {
    return getAgentPerformanceRows(currentAroId, {
      dateRange: resolvedRange,
      agentId: values.agentId !== "ALL" ? values.agentId : undefined,
      transactionType: values.type !== "ALL" ? (values.type as AroTransactionType) : undefined,
      accountId: values.accountId !== "ALL" ? values.accountId : undefined,
      posTerminalId: values.posTerminalId !== "ALL" ? values.posTerminalId : undefined,
      agentStatus: values.status !== "ALL" ? (values.status as AgentStatus) : undefined,
    }).map((r) => ({ ...r, id: r.agentId }));
  }, [currentAroId, resolvedRange, values]);

  const fields: FilterFieldDef[] = [
    {
      key: "agentId",
      label: "Agent",
      value: values.agentId,
      onChange: (v) => setValues({ agentId: v, accountId: "ALL", posTerminalId: "ALL" }),
      options: aroAgents.map((a) => ({ value: a.id, label: a.name })),
    },
    {
      key: "type",
      label: "Transaction",
      value: values.type,
      onChange: (v) => setValue("type", v),
      options: txnTypes.map((t) => ({ value: t, label: formatTxnType(t) })),
    },
    {
      key: "accountId",
      label: "Account",
      value: values.accountId,
      onChange: (v) => setValues({ accountId: v, posTerminalId: "ALL" }),
      options: accountOptions,
    },
    {
      key: "posTerminalId",
      label: "POS Terminal",
      value: values.posTerminalId,
      onChange: (v) => setValue("posTerminalId", v),
      options: posOptions,
    },
    {
      key: "status",
      label: "Status",
      value: values.status,
      onChange: (v) => setValue("status", v),
      options: statuses.map((s) => ({ value: s, label: s })),
    },
  ];

  const columns: Column<Row>[] = [
    {
      header: "Agent",
      render: (r) => (
        <div>
          <p className="font-medium text-ink-900">{r.agentName}</p>
          <p className="text-xs text-ink-400">{r.businessName}</p>
        </div>
      ),
    },
    { header: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
    {
      header: "Total Txns",
      align: "right",
      sortable: true,
      sortValue: (r) => r.totalTransactionCount,
      render: (r) => <span className="font-semibold">{r.totalTransactionCount}</span>,
    },
    {
      header: "Total Volume",
      align: "right",
      sortable: true,
      sortValue: (r) => r.totalTransactionVolume,
      render: (r) => <span className="font-semibold">{formatNaira(r.totalTransactionVolume)}</span>,
    },
    {
      header: "Transfer",
      align: "right",
      hideOnMobile: true,
      render: (r) => (
        <span>
          {r.transferInCount} · {formatNaira(r.transferInVolume)}
        </span>
      ),
    },
    {
      header: "Card",
      align: "right",
      hideOnMobile: true,
      render: (r) => (
        <span>
          {r.cardWithdrawalCount} · {formatNaira(r.cardWithdrawalVolume)}
        </span>
      ),
    },
    {
      header: "Bill Payment",
      align: "right",
      hideOnMobile: true,
      render: (r) => (
        <span>
          {r.billPaymentCount} · {formatNaira(r.billPaymentVolume)}
        </span>
      ),
    },
    {
      header: "POS Terminals",
      align: "right",
      hideOnMobile: true,
      render: (r) => (
        <span>
          {r.activeTerminalCount}/{r.posTerminalCount} active
        </span>
      ),
    },
    {
      header: "Commission",
      align: "right",
      sortable: true,
      sortValue: (r) => r.commissionTotal,
      render: (r) => (
        <div>
          <p className="font-semibold">{formatNaira(r.commissionTotal)}</p>
          <p className="text-[11px] text-ink-400">
            {formatNaira(r.commissionPaid)} paid · {formatNaira(r.commissionPending)} pending
          </p>
        </div>
      ),
    },
    {
      header: "Last Activity",
      hideOnMobile: true,
      sortable: true,
      sortValue: (r) => (r.lastActivity ? new Date(r.lastActivity).getTime() : 0),
      render: (r) => <span className="text-ink-500">{lastActivityLabel(r.lastActivity)}</span>,
    },
  ];

  return (
    <div>
      <PageHeader title="Agent Performance" description="Cumulative and filterable performance across your agent network." />

      <FilterBar dateRange={{ value: dateRange, onChange: setDateRange }} fields={fields} onClearAll={clearAll} />

      <Card>
        <div className="px-5 pt-5">
          <h2 className="font-display text-lg font-bold text-ink-900">Agents</h2>
          <p className="text-sm text-ink-400">Click a row to open that agent&apos;s activity log.</p>
        </div>
        <div className="mt-4">
          <Table
            columns={columns}
            rows={rows}
            pageSize={8}
            onRowClick={(r) => router.push(`/aro/agents/${r.agentId}?tab=transactions`)}
            emptyMessage="No agent performance data matches these filters."
          />
        </div>
      </Card>
    </div>
  );
}

export default function AroPerformancePage() {
  const allowed = useRequireAccess("aro");
  if (!allowed) return null;
  return (
    <Suspense fallback={null}>
      <AroPerformanceContent />
    </Suspense>
  );
}
