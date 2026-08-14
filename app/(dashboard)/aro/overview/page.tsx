"use client";

import { useState } from "react";
import { Users, TrendingUp, Wallet, Activity } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { BarChart, BarChartDatum } from "@/components/modules/BarChart";
import { agents, getAroSummary } from "@/lib/mock-data";
import { formatNaira } from "@/lib/format";
import { useRequireAccess } from "@/components/access/RequireAccess";

type Metric = "volume" | "count" | "terminal" | "commission";

const metricTabs: { key: Metric; label: string }[] = [
  { key: "volume", label: "Transaction Volume" },
  { key: "count", label: "Transaction Count" },
  { key: "terminal", label: "Terminal Activities" },
  { key: "commission", label: "Commission Balance" },
];

function metricValue(agent: (typeof agents)[number], metric: Metric): number {
  if (metric === "volume") return agent.transactionVolumeToday;
  if (metric === "count") return agent.transactionCountToday;
  if (metric === "terminal") return agent.terminalWithdrawalsToday;
  return agent.commissionBalance;
}

function metricDisplay(agent: (typeof agents)[number], metric: Metric): string {
  if (metric === "volume") return formatNaira(agent.transactionVolumeToday);
  if (metric === "count") return `${agent.transactionCountToday}`;
  if (metric === "terminal") return `${agent.terminalWithdrawalsToday} withdrawals`;
  return formatNaira(agent.commissionBalance);
}

function buildChartData(metric: Metric): BarChartDatum[] {
  return [...agents]
    .sort((a, b) => metricValue(b, metric) - metricValue(a, metric))
    .slice(0, 5)
    .map((a) => ({ label: a.name, value: metricValue(a, metric), displayValue: metricDisplay(a, metric) }));
}

export default function AroOverviewPage() {
  const allowed = useRequireAccess("aro");
  const [metric, setMetric] = useState<Metric>("volume");
  const summary = getAroSummary();
  const chartData = buildChartData(metric);

  if (!allowed) return null;

  const summaryCards = [
    { label: "Active Agents", value: `${summary.activeAgents}`, icon: Users },
    { label: "Total Transaction Volume (Today)", value: formatNaira(summary.totalVolumeToday), icon: TrendingUp },
    { label: "Total Commission Earned (Today)", value: formatNaira(summary.totalCommissionToday), icon: Wallet },
    { label: "Agent Activity Rate", value: `${summary.activityRate}%`, icon: Activity },
  ];

  return (
    <div>
      <PageHeader title="Overview" description="Your agent network at a glance." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((c) => (
          <Card key={c.label} className="p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <c.icon size={18} />
            </div>
            <p className="text-xs text-ink-400">{c.label}</p>
            <p className="mt-1 font-display text-xl font-bold text-ink-900">{c.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-5 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-ink-900">Highest Performing Agents (Today)</h2>
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
