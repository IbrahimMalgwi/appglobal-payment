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
import { getAgentPerformanceRows } from "@/lib/aro-analytics";
import { agents, aros } from "@/lib/mock-data";
import { AgentPerformanceRow, AgentStatus, AroTransactionType } from "@/lib/types";
import { formatDate, formatNaira, formatTxnType } from "@/lib/format";
import { useRequireAccess } from "@/components/access/RequireAccess";

type Row = AgentPerformanceRow & { id: string };

const txnTypes: AroTransactionType[] = ["TransferIn", "CardWithdrawal", "BillPayment"];
const statuses: AgentStatus[] = ["active", "inactive", "pending", "removed"];
const fieldKeys = ["aroId", "agentId", "type", "status"] as const;

function lastActivityLabel(iso: string | null): string {
  return iso ? formatDate(iso) : "—";
}

function BdoAgentPerformanceContent() {
  const router = useRouter();
  const { values, setValue, setValues, dateRange, setDateRange, clearAll } = useFilterParams(fieldKeys, "thisMonth");
  const resolvedRange = useResolvedDateRange(dateRange);

  // BDO is the one place in this app allowed to pass an explicit aroId (or "ALL") as user
  // input — every ARO-role page instead always reads aroId from AppContext.
  const scopeAroId = values.aroId === "ALL" ? null : values.aroId;
  // Hierarchical cascade (FRD 13.2): the Agent dropdown's options are a function of the
  // currently selected ARO, not a static list.
  const agentOptions = useMemo(
    () => agents.filter((a) => values.aroId === "ALL" || a.aroId === values.aroId),
    [values.aroId]
  );

  const rows = useMemo<Row[]>(() => {
    return getAgentPerformanceRows(scopeAroId, {
      dateRange: resolvedRange,
      agentId: values.agentId !== "ALL" ? values.agentId : undefined,
      transactionType: values.type !== "ALL" ? (values.type as AroTransactionType) : undefined,
      agentStatus: values.status !== "ALL" ? (values.status as AgentStatus) : undefined,
    }).map((r) => ({ ...r, id: r.agentId }));
  }, [scopeAroId, resolvedRange, values]);

  const fields: FilterFieldDef[] = [
    {
      key: "aroId",
      label: "ARO",
      value: values.aroId,
      onChange: (v) => setValues({ aroId: v, agentId: "ALL" }),
      options: aros.map((a) => ({ value: a.id, label: a.name })),
    },
    {
      key: "agentId",
      label: "Agent",
      value: values.agentId,
      onChange: (v) => setValue("agentId", v),
      options: agentOptions.map((a) => ({ value: a.id, label: a.name })),
    },
    {
      key: "type",
      label: "Transaction",
      value: values.type,
      onChange: (v) => setValue("type", v),
      options: txnTypes.map((t) => ({ value: t, label: formatTxnType(t) })),
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
    {
      header: "ARO",
      hideOnMobile: true,
      render: (r) => <span className="text-ink-500">{aros.find((a) => a.id === r.aroId)?.name ?? "—"}</span>,
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
      header: "Commission",
      align: "right",
      sortable: true,
      sortValue: (r) => r.commissionTotal,
      render: (r) => <span>{formatNaira(r.commissionTotal)}</span>,
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
      <PageHeader title="Agent Performance" description="Agent performance across the entire network." />

      <FilterBar dateRange={{ value: dateRange, onChange: setDateRange }} fields={fields} onClearAll={clearAll} />

      <Card>
        <div className="px-5 pt-5">
          <h2 className="font-display text-lg font-bold text-ink-900">Agents</h2>
        </div>
        <div className="mt-4">
          <Table
            columns={columns}
            rows={rows}
            pageSize={10}
            onRowClick={(r) => router.push(`/bdo/agents/${r.agentId}?tab=transactions`)}
            emptyMessage="No agent performance data matches these filters."
          />
        </div>
      </Card>
    </div>
  );
}

export default function BdoAgentPerformancePage() {
  const allowed = useRequireAccess("bdo");
  if (!allowed) return null;
  return (
    <Suspense fallback={null}>
      <BdoAgentPerformanceContent />
    </Suspense>
  );
}
