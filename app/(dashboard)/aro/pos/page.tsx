"use client";

import { Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Trophy, TrendingDown, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import { Badge, statusTone } from "@/components/ui/Badge";
import { FilterBar, FilterFieldDef } from "@/components/modules/FilterBar";
import { useResolvedDateRange } from "@/components/modules/DateRangeFilter";
import { useFilterParams } from "@/lib/filter-state";
import { getBestLeastPos, getPosPerformanceRows } from "@/lib/aro-analytics";
import { getAgentsForAro } from "@/lib/mock-data";
import { AroTransactionType, PosPerformanceRow } from "@/lib/types";
import { formatDate, formatNaira, formatTxnType } from "@/lib/format";
import { useApp } from "@/context/AppContext";
import { useRequireAccess } from "@/components/access/RequireAccess";

type Row = PosPerformanceRow & { id: string };

const txnTypes: AroTransactionType[] = ["TransferIn", "CardWithdrawal", "BillPayment"];
const statusOptions: ("active" | "inactive")[] = ["active", "inactive"];
const fieldKeys = ["agentId", "type", "status"] as const;

function AroPosPerformanceContent() {
  const { currentAroId } = useApp();
  const router = useRouter();
  const { values, setValue, dateRange, setDateRange, clearAll } = useFilterParams(fieldKeys, "thisMonth");
  const resolvedRange = useResolvedDateRange(dateRange);

  const aroAgents = useMemo(() => getAgentsForAro(currentAroId), [currentAroId]);

  const rows = useMemo<Row[]>(() => {
    return getPosPerformanceRows(currentAroId, {
      dateRange: resolvedRange,
      agentId: values.agentId !== "ALL" ? values.agentId : undefined,
      transactionType: values.type !== "ALL" ? (values.type as AroTransactionType) : undefined,
    })
      .filter((r) => values.status === "ALL" || r.status === values.status)
      .map((r) => ({ ...r, id: r.terminalId }));
  }, [currentAroId, resolvedRange, values]);

  const { best, least, inactive } = useMemo(() => getBestLeastPos(rows), [rows]);

  const fields: FilterFieldDef[] = [
    {
      key: "agentId",
      label: "Agent",
      value: values.agentId,
      onChange: (v) => setValue("agentId", v),
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
      key: "status",
      label: "Status",
      value: values.status,
      onChange: (v) => setValue("status", v),
      options: statusOptions.map((s) => ({ value: s, label: s })),
    },
  ];

  const columns: Column<Row>[] = [
    {
      header: "Terminal",
      render: (r) => <span className="font-semibold text-ink-900">{r.serial}</span>,
    },
    { header: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
    {
      header: "Agent",
      render: (r) => (
        <div>
          <p className="font-medium text-ink-900">{r.agentName}</p>
          <p className="text-xs text-ink-400">{r.accountName}</p>
        </div>
      ),
    },
    {
      header: "Txn Count",
      align: "right",
      sortable: true,
      sortValue: (r) => r.transactionCount,
      render: (r) => <span className="font-semibold">{r.transactionCount}</span>,
    },
    {
      header: "Txn Volume",
      align: "right",
      sortable: true,
      sortValue: (r) => r.transactionVolume,
      render: (r) => <span className="font-semibold">{formatNaira(r.transactionVolume)}</span>,
    },
    {
      header: "Commission",
      align: "right",
      sortable: true,
      sortValue: (r) => r.commissionGenerated,
      render: (r) => <span>{formatNaira(r.commissionGenerated)}</span>,
    },
    {
      header: "Last Transaction",
      hideOnMobile: true,
      render: (r) => <span className="text-ink-500">{r.lastTransactionDate ? formatDate(r.lastTransactionDate) : "—"}</span>,
    },
  ];

  return (
    <div>
      <PageHeader title="POS Performance" description="Every POS terminal across your agent network." />

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-bold text-ink-900">
            <Trophy size={16} className="text-success" /> Best Performing Terminal
          </h2>
          {best ? (
            <div>
              <p className="text-sm font-semibold text-ink-900">{best.serial}</p>
              <p className="text-xs text-ink-400">
                {best.agentName} · {best.accountName}
              </p>
              <p className="mt-2 font-display text-lg font-bold text-success">{formatNaira(best.transactionVolume)}</p>
            </div>
          ) : (
            <p className="text-sm text-ink-400">No activity yet.</p>
          )}
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-bold text-ink-900">
            <TrendingDown size={16} className="text-danger" /> Least Performing Terminal
          </h2>
          {least ? (
            <div>
              <p className="text-sm font-semibold text-ink-900">{least.serial}</p>
              <p className="text-xs text-ink-400">
                {least.agentName} · {least.accountName}
              </p>
              <p className="mt-2 font-display text-lg font-bold text-danger">{formatNaira(least.transactionVolume)}</p>
            </div>
          ) : (
            <p className="text-sm text-ink-400">No activity yet.</p>
          )}
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-bold text-ink-900">
            <AlertTriangle size={16} className="text-amber-500" /> Inactive Terminals
          </h2>
          <p className="font-display text-2xl font-bold text-ink-900">{inactive.length}</p>
          <p className="text-xs text-ink-400">out of {rows.length} terminals in view</p>
        </Card>
      </div>

      <FilterBar dateRange={{ value: dateRange, onChange: setDateRange }} fields={fields} onClearAll={clearAll} />

      <Card>
        <div className="px-5 pt-5">
          <h2 className="font-display text-lg font-bold text-ink-900">POS Terminals</h2>
          <p className="text-sm text-ink-400">Click a terminal to see its full transaction history.</p>
        </div>
        <div className="mt-4">
          <Table
            columns={columns}
            rows={rows}
            pageSize={8}
            onRowClick={(r) => router.push(`/aro/agents/${r.agentId}?tab=transactions&posTerminalId=${r.terminalId}`)}
            emptyMessage="No POS terminals match these filters."
          />
        </div>
      </Card>
    </div>
  );
}

export default function AroPosPerformancePage() {
  const allowed = useRequireAccess("aro");
  if (!allowed) return null;
  return (
    <Suspense fallback={null}>
      <AroPosPerformanceContent />
    </Suspense>
  );
}
