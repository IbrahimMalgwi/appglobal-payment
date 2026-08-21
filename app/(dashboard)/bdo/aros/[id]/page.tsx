"use client";

import { Suspense, useMemo } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { Mail, Users, TrendingUp, Percent, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import { Badge, statusTone } from "@/components/ui/Badge";
import { FilterBar } from "@/components/modules/FilterBar";
import { useResolvedDateRange } from "@/components/modules/DateRangeFilter";
import { useFilterParams } from "@/lib/filter-state";
import { getAgentPerformanceRows, getAroPortfolioSummary } from "@/lib/aro-analytics";
import { getAroById } from "@/lib/mock-data";
import { AgentPerformanceRow } from "@/lib/types";
import { formatDate, formatNaira, initials } from "@/lib/format";
import { useRequireAccess } from "@/components/access/RequireAccess";

type Row = AgentPerformanceRow & { id: string };
const fieldKeys: readonly string[] = [];

function BdoAroDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { dateRange, setDateRange, clearAll } = useFilterParams(fieldKeys, "thisMonth");
  const resolvedRange = useResolvedDateRange(dateRange);

  const aro = getAroById(params.id);
  const summary = useMemo(() => (aro ? getAroPortfolioSummary(aro.id, resolvedRange) : null), [aro, resolvedRange]);
  const rows = useMemo<Row[]>(
    () => (aro ? getAgentPerformanceRows(aro.id, { dateRange: resolvedRange }).map((r) => ({ ...r, id: r.agentId })) : []),
    [aro, resolvedRange]
  );

  if (!aro || !summary) return notFound();

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
      render: (r) => <span className="text-ink-500">{r.lastActivity ? formatDate(r.lastActivity) : "—"}</span>,
    },
  ];

  return (
    <div>
      <PageHeader title="ARO Details" description="Portfolio drill-down for this ARO." />

      <Card className="mb-5 p-6">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-navy-900 text-lg font-bold text-white">
            {initials(aro.name)}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-display text-lg font-bold text-ink-900">{aro.name}</p>
              <Badge tone={statusTone(aro.status)}>{aro.status}</Badge>
            </div>
            <p className="text-sm text-ink-500">{aro.cluster}</p>
            <p className="flex items-center gap-1.5 text-xs text-ink-400">
              <Mail size={12} /> {aro.email}
            </p>
          </div>
        </div>
      </Card>

      <FilterBar dateRange={{ value: dateRange, onChange: setDateRange }} fields={[]} onClearAll={clearAll} />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Users size={18} />
          </div>
          <p className="text-xs text-ink-400">Agents</p>
          <p className="mt-1 font-display text-xl font-bold text-ink-900">
            {summary.agents.active}/{summary.agents.total} active
          </p>
        </Card>
        <Card className="p-5">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <TrendingUp size={18} />
          </div>
          <p className="text-xs text-ink-400">Transaction Volume</p>
          <p className="mt-1 font-display text-xl font-bold text-ink-900">{formatNaira(summary.transactions.totalVolume)}</p>
        </Card>
        <Card className="p-5">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Percent size={18} />
          </div>
          <p className="text-xs text-ink-400">Commission (period)</p>
          <p className="mt-1 font-display text-xl font-bold text-ink-900">{formatNaira(summary.commission.forPeriod)}</p>
        </Card>
        <Card className="p-5">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <UserPlus size={18} />
          </div>
          <p className="text-xs text-ink-400">Onboarded (period)</p>
          <p className="mt-1 font-display text-xl font-bold text-ink-900">{summary.agents.onboardedInPeriod}</p>
        </Card>
      </div>

      <Card>
        <div className="px-5 pt-5">
          <h2 className="font-display text-lg font-bold text-ink-900">Agents</h2>
          <p className="text-sm text-ink-400">Click an agent to drill into their accounts, POS terminals, and transactions.</p>
        </div>
        <div className="mt-4">
          <Table
            columns={columns}
            rows={rows}
            pageSize={8}
            onRowClick={(r) => router.push(`/bdo/agents/${r.agentId}`)}
            emptyMessage="This ARO has no agents yet."
          />
        </div>
      </Card>
    </div>
  );
}

export default function BdoAroDetailPage() {
  const allowed = useRequireAccess("bdo");
  if (!allowed) return null;
  return (
    <Suspense fallback={null}>
      <BdoAroDetailContent />
    </Suspense>
  );
}
