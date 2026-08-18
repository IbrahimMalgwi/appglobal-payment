"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  TrendingUp,
  ArrowDownToLine,
  CreditCard,
  Receipt,
  Percent,
  Award,
  Trophy,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { BarChart, BarChartDatum } from "@/components/modules/BarChart";
import { FilterBar } from "@/components/modules/FilterBar";
import { useResolvedDateRange } from "@/components/modules/DateRangeFilter";
import { useFilterParams } from "@/lib/filter-state";
import {
  getAgentPerformanceRows,
  getAroPortfolioSummary,
  getBestAndLeastPerformingAgents,
  getLargestTransaction,
  PerformanceMetric,
} from "@/lib/aro-analytics";
import { formatDate, formatNaira, formatTxnType } from "@/lib/format";
import { useApp } from "@/context/AppContext";
import { useRequireAccess } from "@/components/access/RequireAccess";

const fieldKeys: readonly string[] = [];

const metricTabs: { key: PerformanceMetric; label: string }[] = [
  { key: "totalTransactionVolume", label: "Transaction Volume" },
  { key: "totalTransactionCount", label: "Transaction Count" },
  { key: "commissionTotal", label: "Commission" },
];

function metricDisplay(value: number, metric: PerformanceMetric): string {
  if (metric === "totalTransactionCount") return `${value}`;
  return formatNaira(value);
}

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

function AroOverviewContent() {
  const { currentAroId } = useApp();
  const { dateRange, setDateRange, clearAll } = useFilterParams(fieldKeys, "thisMonth");
  const [metric, setMetric] = useState<PerformanceMetric>("totalTransactionVolume");
  const resolvedRange = useResolvedDateRange(dateRange);

  const summary = useMemo(() => getAroPortfolioSummary(currentAroId, resolvedRange), [currentAroId, resolvedRange]);
  const { best, least } = useMemo(
    () => getBestAndLeastPerformingAgents(currentAroId, "totalTransactionVolume", resolvedRange),
    [currentAroId, resolvedRange]
  );
  const largest = useMemo(
    () => getLargestTransaction(currentAroId, { dateRange: resolvedRange }),
    [currentAroId, resolvedRange]
  );

  const chartData = useMemo<BarChartDatum[]>(() => {
    return [...getAgentPerformanceRows(currentAroId, { dateRange: resolvedRange })]
      .sort((a, b) => b[metric] - a[metric])
      .slice(0, 5)
      .map((r) => ({ label: r.agentName, value: r[metric], displayValue: metricDisplay(r[metric], metric) }));
  }, [currentAroId, resolvedRange, metric]);

  return (
    <div>
      <PageHeader title="Overview" description="Your agent network at a glance." />

      <FilterBar dateRange={{ value: dateRange, onChange: setDateRange }} fields={[]} onClearAll={clearAll} />

      {/* Agent metrics */}
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Agents</p>
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={Users} label="Total Agents" value={`${summary.agents.total}`} />
        <StatCard icon={UserCheck} label="Active" value={`${summary.agents.active}`} />
        <StatCard icon={UserX} label="Inactive" value={`${summary.agents.inactive}`} />
        <StatCard icon={UserPlus} label="Newly Onboarded (30d)" value={`${summary.agents.newlyOnboarded}`} />
        <StatCard icon={UserPlus} label="Onboarded in Period" value={`${summary.agents.onboardedInPeriod}`} />
      </div>

      {/* Transaction metrics */}
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

      <Card className="mb-5 p-5">
        <h2 className="mb-4 font-display text-sm font-bold text-ink-900">Bill Payment Breakdown</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {summary.billBreakdown.map((b) => (
            <div key={b.category} className="rounded-xl bg-surface p-3.5">
              <p className="text-xs text-ink-400">{b.category}</p>
              <p className="mt-1 text-sm font-bold text-ink-900">{formatNaira(b.volume)}</p>
              <p className="text-[11px] text-ink-400">{b.count} txns</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Commission + referral metrics */}
      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
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
            href="/aro/commission"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            View commission breakdown <ArrowRight size={13} />
          </Link>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 font-display text-sm font-bold text-ink-900">
            <Award size={16} className="text-brand-600" /> Referral Bonuses
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-ink-400">Total referred</p>
              <p className="font-display text-lg font-bold text-ink-900">{summary.referral.totalReferred}</p>
            </div>
            <div>
              <p className="text-xs text-ink-400">Bonuses earned</p>
              <p className="font-display text-lg font-bold text-ink-900">{formatNaira(summary.referral.bonusesEarned)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-400">This period</p>
              <p className="font-display text-lg font-bold text-ink-900">{formatNaira(summary.referral.bonusesForPeriod)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-400">Pending</p>
              <p className="font-display text-lg font-bold text-amber-500">{formatNaira(summary.referral.pendingBonuses)}</p>
            </div>
          </div>
          <Link
            href="/aro/referrals"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            View referral history <ArrowRight size={13} />
          </Link>
        </Card>
      </div>

      {/* Best/least performing + largest transaction */}
      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-bold text-ink-900">
            <Trophy size={16} className="text-success" /> Best Performing Agent
          </h2>
          {best ? (
            <Link href={`/aro/agents/${best.agentId}`} className="block hover:opacity-80">
              <p className="text-sm font-semibold text-ink-900">{best.agentName}</p>
              <p className="text-xs text-ink-400">{best.businessName}</p>
              <p className="mt-2 font-display text-lg font-bold text-success">{formatNaira(best.totalTransactionVolume)}</p>
              <p className="text-xs text-ink-400">{best.totalTransactionCount} transactions</p>
            </Link>
          ) : (
            <p className="text-sm text-ink-400">No activity yet in this period.</p>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-bold text-ink-900">
            <TrendingDown size={16} className="text-danger" /> Least Performing Agent
          </h2>
          {least ? (
            <Link href={`/aro/agents/${least.agentId}`} className="block hover:opacity-80">
              <p className="text-sm font-semibold text-ink-900">{least.agentName}</p>
              <p className="text-xs text-ink-400">{least.businessName}</p>
              <p className="mt-2 font-display text-lg font-bold text-danger">{formatNaira(least.totalTransactionVolume)}</p>
              <p className="text-xs text-ink-400">{least.totalTransactionCount} transactions</p>
            </Link>
          ) : (
            <p className="text-sm text-ink-400">No activity yet in this period.</p>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 font-display text-sm font-bold text-ink-900">Largest Transaction</h2>
          {largest ? (
            <Link href={`/aro/agents/${largest.agent.id}?tab=transactions`} className="block hover:opacity-80">
              <p className="font-display text-lg font-bold text-ink-900">{formatNaira(largest.transaction.amount)}</p>
              <p className="text-xs text-ink-400">
                {formatTxnType(largest.transaction.type)}
                {largest.transaction.billCategory ? ` — ${largest.transaction.billCategory}` : ""}
              </p>
              <p className="mt-2 text-sm text-ink-700">{largest.agent.name}</p>
              <p className="text-xs text-ink-400">
                {largest.accountName} · {largest.terminalSerial}
              </p>
              <p className="text-xs text-ink-400">{formatDate(largest.transaction.date)}</p>
            </Link>
          ) : (
            <p className="text-sm text-ink-400">No transactions yet in this period.</p>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-ink-900">Top Agents</h2>
        </div>
        <div className="mb-5 flex flex-wrap gap-2">
          {metricTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setMetric(t.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                metric === t.key ? "bg-brand-500 text-white" : "bg-surface text-ink-600 hover:bg-brand-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <BarChart data={chartData} />
      </Card>
    </div>
  );
}

export default function AroOverviewPage() {
  const allowed = useRequireAccess("aro");
  if (!allowed) return null;
  return (
    <Suspense fallback={null}>
      <AroOverviewContent />
    </Suspense>
  );
}
