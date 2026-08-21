"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import { Badge, statusTone } from "@/components/ui/Badge";
import { FilterBar } from "@/components/modules/FilterBar";
import { useResolvedDateRange } from "@/components/modules/DateRangeFilter";
import { useFilterParams } from "@/lib/filter-state";
import { getAroPortfolioSummary, getReferralRows } from "@/lib/aro-analytics";
import { ReferralBonusRecord } from "@/lib/types";
import { formatDate, formatNaira } from "@/lib/format";
import { useApp } from "@/context/AppContext";
import { useRequireAccess } from "@/components/access/RequireAccess";

type Row = ReferralBonusRecord & { id: string };

const fieldKeys: readonly string[] = [];

function AroReferralsContent() {
  const { currentAroId } = useApp();
  const { dateRange, setDateRange, clearAll } = useFilterParams(fieldKeys, "allTime");
  const resolvedRange = useResolvedDateRange(dateRange);

  const summary = useMemo(() => getAroPortfolioSummary(currentAroId, resolvedRange), [currentAroId, resolvedRange]);
  const rows = useMemo<Row[]>(
    () => getReferralRows(currentAroId, resolvedRange).map((r) => ({ ...r, id: r.id })),
    [currentAroId, resolvedRange]
  );

  const columns: Column<Row>[] = [
    {
      header: "Agent",
      render: (r) => (
        <Link href={`/aro/agents/${r.referredAgentId}`} className="font-medium text-ink-900 hover:text-brand-600">
          {r.referredAgentName}
        </Link>
      ),
    },
    { header: "Onboarding Date", render: (r) => <span className="text-ink-500">{formatDate(r.onboardingDate)}</span> },
    { header: "Agent Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
    {
      header: "Bonus Amount",
      align: "right",
      sortable: true,
      sortValue: (r) => r.bonusAmount,
      render: (r) => <span className="font-semibold">{formatNaira(r.bonusAmount)}</span>,
    },
    { header: "Bonus Status", render: (r) => <Badge tone={statusTone(r.bonusStatus)}>{r.bonusStatus}</Badge> },
    {
      header: "Payment Date",
      hideOnMobile: true,
      render: (r) => <span className="text-ink-500">{r.paymentDate ? formatDate(r.paymentDate) : "—"}</span>,
    },
  ];

  return (
    <div>
      <PageHeader title="Referral Bonuses" description="Agents you onboarded and the bonuses they earned you." />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-ink-400">Total referred</p>
          <p className="mt-1 font-display text-lg font-bold text-ink-900">{summary.referral.totalReferred}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-ink-400">Bonuses earned</p>
          <p className="mt-1 font-display text-lg font-bold text-ink-900">{formatNaira(summary.referral.bonusesEarned)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-ink-400">Paid out</p>
          <p className="mt-1 font-display text-lg font-bold text-success">
            {formatNaira(summary.referral.bonusesEarned - summary.referral.pendingBonuses)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-ink-400">Pending</p>
          <p className="mt-1 font-display text-lg font-bold text-amber-500">{formatNaira(summary.referral.pendingBonuses)}</p>
        </Card>
      </div>

      <FilterBar dateRange={{ value: dateRange, onChange: setDateRange }} fields={[]} onClearAll={clearAll} />

      <Card>
        <div className="px-5 pt-5">
          <h2 className="font-display text-lg font-bold text-ink-900">Referral History</h2>
        </div>
        <div className="mt-4">
          <Table columns={columns} rows={rows} pageSize={10} emptyMessage="No referrals recorded yet." />
        </div>
      </Card>
    </div>
  );
}

export default function AroReferralsPage() {
  const allowed = useRequireAccess("aro");
  if (!allowed) return null;
  return (
    <Suspense fallback={null}>
      <AroReferralsContent />
    </Suspense>
  );
}
