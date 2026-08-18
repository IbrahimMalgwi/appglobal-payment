"use client";

import { Suspense, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import { Badge, statusTone } from "@/components/ui/Badge";
import { FilterBar, FilterFieldDef } from "@/components/modules/FilterBar";
import { useResolvedDateRange } from "@/components/modules/DateRangeFilter";
import { useFilterParams } from "@/lib/filter-state";
import { getAroTransactionRows } from "@/lib/aro-analytics";
import { getAgentsForAro } from "@/lib/mock-data";
import { AroTransactionRecord, AroTransactionType } from "@/lib/types";
import { formatDate, formatNaira, formatTxnType } from "@/lib/format";
import { useApp } from "@/context/AppContext";
import { useRequireAccess } from "@/components/access/RequireAccess";

const txnTypes: AroTransactionType[] = ["TransferIn", "CardWithdrawal", "BillPayment"];
const fieldKeys = ["agentId", "type"] as const;

function AroTransactionMonitoringContent() {
  const { currentAroId } = useApp();
  const { values, setValue, dateRange, setDateRange, clearAll } = useFilterParams(fieldKeys, "thisMonth");
  const resolvedRange = useResolvedDateRange(dateRange);

  const aroAgents = useMemo(() => getAgentsForAro(currentAroId), [currentAroId]);

  const filtered = useMemo(
    () =>
      getAroTransactionRows(currentAroId, {
        dateRange: resolvedRange,
        agentId: values.agentId !== "ALL" ? values.agentId : undefined,
        transactionType: values.type !== "ALL" ? (values.type as AroTransactionType) : undefined,
      }),
    [currentAroId, resolvedRange, values]
  );

  const totals = useMemo(() => {
    const credit = filtered.filter((t) => t.direction === "CREDIT").reduce((s, t) => s + t.amount, 0);
    const debit = filtered.filter((t) => t.direction === "DEBIT").reduce((s, t) => s + t.amount, 0);
    return { credit, debit, net: credit - debit, count: filtered.length };
  }, [filtered]);

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
  ];

  const columns: Column<AroTransactionRecord>[] = [
    { header: "Date & Time", render: (t) => <span className="text-ink-500">{formatDate(t.date)}</span> },
    { header: "Agent", render: (t) => <span className="font-medium text-ink-900">{t.agentName}</span> },
    {
      header: "Type",
      hideOnMobile: true,
      render: (t) => (
        <span className="rounded-md bg-brand-50 px-2 py-1 text-xs font-bold text-brand-600">
          {formatTxnType(t.type)}
          {t.billCategory ? ` · ${t.billCategory}` : ""}
        </span>
      ),
    },
    { header: "Reference", hideOnMobile: true, render: (t) => <span className="text-ink-500">{t.reference}</span> },
    { header: "Amount", align: "right", render: (t) => <span className="font-semibold">{formatNaira(t.amount)}</span> },
    { header: "Status", render: (t) => <Badge tone={statusTone(t.status)}>{t.status}</Badge> },
  ];

  return (
    <div>
      <PageHeader title="Transaction Monitoring" description="Every transaction across your agent network." />

      <FilterBar dateRange={{ value: dateRange, onChange: setDateRange }} fields={fields} onClearAll={clearAll} />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-ink-400">Total Credit</p>
          <p className="mt-1 font-display text-lg font-bold text-success">{formatNaira(totals.credit)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-ink-400">Total Debit</p>
          <p className="mt-1 font-display text-lg font-bold text-danger">{formatNaira(totals.debit)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-ink-400">Net Difference</p>
          <p className="mt-1 font-display text-lg font-bold text-ink-900">{formatNaira(totals.net)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-ink-400">Transaction Count</p>
          <p className="mt-1 font-display text-lg font-bold text-ink-900">{totals.count}</p>
        </Card>
      </div>

      <Card>
        <div className="px-5 pt-5">
          <h2 className="font-display text-lg font-bold text-ink-900">Transactions</h2>
        </div>
        <div className="mt-4">
          <Table columns={columns} rows={filtered} pageSize={10} emptyMessage="No transactions match your filters." />
        </div>
      </Card>
    </div>
  );
}

export default function AroTransactionMonitoringPage() {
  const allowed = useRequireAccess("aro");
  if (!allowed) return null;
  return (
    <Suspense fallback={null}>
      <AroTransactionMonitoringContent />
    </Suspense>
  );
}
