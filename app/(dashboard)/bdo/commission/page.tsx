"use client";

import { Suspense, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import { Badge, statusTone } from "@/components/ui/Badge";
import { FilterBar, FilterFieldDef } from "@/components/modules/FilterBar";
import { useResolvedDateRange } from "@/components/modules/DateRangeFilter";
import { useFilterParams } from "@/lib/filter-state";
import { CommissionRow, getBdoOrgSummary, getCommissionRows } from "@/lib/aro-analytics";
import { aros } from "@/lib/mock-data";
import { AroTransactionType, CommissionStatus } from "@/lib/types";
import { formatDate, formatNaira, formatTxnType } from "@/lib/format";
import { useRequireAccess } from "@/components/access/RequireAccess";

type Row = CommissionRow & { id: string; aroName: string };

const txnTypes: AroTransactionType[] = ["TransferIn", "CardWithdrawal", "BillPayment"];
const statusOptions: CommissionStatus[] = ["paid", "pending"];
const fieldKeys = ["aroId", "type", "status"] as const;

function BdoCommissionContent() {
  const { values, setValue, dateRange, setDateRange, clearAll } = useFilterParams(fieldKeys, "thisMonth");
  const resolvedRange = useResolvedDateRange(dateRange);

  const scopeAroId = values.aroId === "ALL" ? null : values.aroId;
  const aroNameLookup = useMemo(() => new Map(aros.map((a) => [a.id, a.name])), []);
  const summary = useMemo(() => getBdoOrgSummary(resolvedRange), [resolvedRange]);

  const rows = useMemo<Row[]>(() => {
    return getCommissionRows(scopeAroId, {
      dateRange: resolvedRange,
      transactionType: values.type !== "ALL" ? (values.type as AroTransactionType) : undefined,
    })
      .filter((c) => values.status === "ALL" || c.status === values.status)
      .map((c) => ({ ...c, id: c.id, aroName: aroNameLookup.get(c.aroId) ?? "—" }));
  }, [scopeAroId, resolvedRange, values, aroNameLookup]);

  const fields: FilterFieldDef[] = [
    {
      key: "aroId",
      label: "ARO",
      value: values.aroId,
      onChange: (v) => setValue("aroId", v),
      options: aros.map((a) => ({ value: a.id, label: a.name })),
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
    { header: "Date", render: (r) => <span className="text-ink-500">{formatDate(r.date)}</span> },
    { header: "Agent", render: (r) => <span className="font-medium text-ink-900">{r.agentName}</span> },
    { header: "ARO", hideOnMobile: true, render: (r) => <span className="text-ink-500">{r.aroName}</span> },
    {
      header: "Type",
      render: (r) => (
        <span className="rounded-md bg-brand-50 px-2 py-1 text-xs font-bold text-brand-600">{formatTxnType(r.transactionType)}</span>
      ),
    },
    {
      header: "Amount",
      align: "right",
      sortable: true,
      sortValue: (r) => r.amount,
      render: (r) => <span className="font-semibold">{formatNaira(r.amount)}</span>,
    },
    { header: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
  ];

  return (
    <div>
      <PageHeader title="Commission Performance" description="Commission generated across every ARO, agent, and POS terminal." />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-ink-400">Total</p>
          <p className="mt-1 font-display text-lg font-bold text-ink-900">{formatNaira(summary.commission.total)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-ink-400">This period</p>
          <p className="mt-1 font-display text-lg font-bold text-ink-900">{formatNaira(summary.commission.forPeriod)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-ink-400">Paid</p>
          <p className="mt-1 font-display text-lg font-bold text-success">{formatNaira(summary.commission.paid)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-ink-400">Pending</p>
          <p className="mt-1 font-display text-lg font-bold text-amber-500">{formatNaira(summary.commission.pending)}</p>
        </Card>
      </div>

      <FilterBar dateRange={{ value: dateRange, onChange: setDateRange }} fields={fields} onClearAll={clearAll} />

      <Card>
        <div className="px-5 pt-5">
          <h2 className="font-display text-lg font-bold text-ink-900">Commission Records</h2>
        </div>
        <div className="mt-4">
          <Table columns={columns} rows={rows} pageSize={10} emptyMessage="No commission records match these filters." />
        </div>
      </Card>
    </div>
  );
}

export default function BdoCommissionPage() {
  const allowed = useRequireAccess("bdo");
  if (!allowed) return null;
  return (
    <Suspense fallback={null}>
      <BdoCommissionContent />
    </Suspense>
  );
}
