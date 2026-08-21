"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  UserCheck,
  UserPlus,
  Receipt,
  TrendingUp,
  ArrowDownToLine,
  CreditCard,
  Percent,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import { FilterBar } from "@/components/modules/FilterBar";
import { useResolvedDateRange } from "@/components/modules/DateRangeFilter";
import { useFilterParams } from "@/lib/filter-state";
import { getAroComparisonRows, getBdoOrgSummary, AroComparisonRow } from "@/lib/aro-analytics";
import { formatNaira } from "@/lib/format";
import { useRequireAccess } from "@/components/access/RequireAccess";

type Row = AroComparisonRow & { id: string };
const fieldKeys: readonly string[] = [];

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <Icon size={18} />
      </div>
      <p className="text-xs text-ink-400">{label}</p>
      <p className="mt-1 font-display text-xl font-bold text-ink-900">{value}</p>
    </Card>
  );
}

function BdoOverviewContent() {
  const { dateRange, setDateRange, clearAll } = useFilterParams(fieldKeys, "thisMonth");
  const resolvedRange = useResolvedDateRange(dateRange);

  const summary = useMemo(() => getBdoOrgSummary(resolvedRange), [resolvedRange]);
  const rows = useMemo<Row[]>(
    () => getAroComparisonRows(resolvedRange).map((r) => ({ ...r, id: r.aroId })),
    [resolvedRange]
  );

  const columns: Column<Row>[] = [
    {
      header: "ARO",
      render: (r) => (
        <Link href={`/bdo/aros/${r.aroId}`} className="font-medium text-ink-900 hover:text-brand-600">
          {r.aroName}
        </Link>
      ),
    },
    { header: "Cluster", hideOnMobile: true, render: (r) => <span className="text-ink-500">{r.cluster}</span> },
    {
      header: "Agents",
      align: "right",
      render: (r) => (
        <span>
          {r.activeAgentCount}/{r.agentCount}
        </span>
      ),
    },
    {
      header: "Volume",
      align: "right",
      sortable: true,
      sortValue: (r) => r.transactionVolume,
      render: (r) => <span className="font-semibold">{formatNaira(r.transactionVolume)}</span>,
    },
    {
      header: "Commission",
      align: "right",
      sortable: true,
      sortValue: (r) => r.commissionTotal,
      render: (r) => <span>{formatNaira(r.commissionTotal)}</span>,
    },
  ];

  return (
    <div>
      <PageHeader title="Overview" description="Network-wide performance across every ARO." />

      <FilterBar dateRange={{ value: dateRange, onChange: setDateRange }} fields={[]} onClearAll={clearAll} />

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">AROs & Agents</p>
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Building2} label="Total AROs" value={`${summary.aros.total}`} />
        <StatCard icon={Users} label="Total Agents" value={`${summary.agents.total}`} />
        <StatCard icon={UserCheck} label="Active Agents" value={`${summary.agents.active}`} />
        <StatCard icon={UserPlus} label="Onboarded in Period" value={`${summary.agents.onboardedInPeriod}`} />
      </div>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Transactions</p>
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Receipt}
          label="Total Transactions"
          value={`${summary.transactions.totalCount} · ${formatNaira(summary.transactions.totalVolume)}`}
        />
        <StatCard
          icon={TrendingUp}
          label="Transfer"
          value={`${summary.transactions.transferInCount} · ${formatNaira(summary.transactions.transferInVolume)}`}
        />
        <StatCard
          icon={ArrowDownToLine}
          label="Card"
          value={`${summary.transactions.cardWithdrawalCount} · ${formatNaira(summary.transactions.cardWithdrawalVolume)}`}
        />
        <StatCard
          icon={CreditCard}
          label="Bill Payment"
          value={`${summary.transactions.billPaymentCount} · ${formatNaira(summary.transactions.billPaymentVolume)}`}
        />
      </div>

      <div className="mb-5 grid grid-cols-1">
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 font-display text-sm font-bold text-ink-900">
            <Percent size={16} className="text-brand-600" /> Commission
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-ink-400">Total</p>
              <p className="font-display text-lg font-bold text-ink-900">{formatNaira(summary.commission.total)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-400">This period</p>
              <p className="font-display text-lg font-bold text-ink-900">{formatNaira(summary.commission.forPeriod)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-400">Pending</p>
              <p className="font-display text-lg font-bold text-amber-500">{formatNaira(summary.commission.pending)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-400">Paid</p>
              <p className="font-display text-lg font-bold text-success">{formatNaira(summary.commission.paid)}</p>
            </div>
          </div>
          <Link
            href="/bdo/commission"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            View commission breakdown <ArrowRight size={13} />
          </Link>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
          <div>
            <h2 className="font-display text-lg font-bold text-ink-900">ARO Ranking</h2>
            <p className="text-sm text-ink-400">Click an ARO to drill into their portfolio.</p>
          </div>
          <Link href="/bdo/aros" className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700">
            Compare AROs <ArrowRight size={13} />
          </Link>
        </div>
        <div className="mt-4">
          <Table columns={columns} rows={rows} emptyMessage="No ARO data yet." />
        </div>
      </Card>
    </div>
  );
}

export default function BdoOverviewPage() {
  const allowed = useRequireAccess("bdo");
  if (!allowed) return null;
  return (
    <Suspense fallback={null}>
      <BdoOverviewContent />
    </Suspense>
  );
}
