"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, Plus, UserMinus, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { FilterBar, FilterFieldDef } from "@/components/modules/FilterBar";
import { useResolvedDateRange } from "@/components/modules/DateRangeFilter";
import { useFilterParams } from "@/lib/filter-state";
import { getAgentsForAro, removeAgentFromPortfolio } from "@/lib/mock-data";
import { isWithinRange } from "@/lib/date-range";
import { AgentRecord, AgentStatus } from "@/lib/types";
import { formatNaira, initials } from "@/lib/format";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { useRequireAccess } from "@/components/access/RequireAccess";

const statuses: AgentStatus[] = ["active", "inactive", "pending", "removed"];
const fieldKeys = ["status"] as const;

function AgentManagementContent() {
  const { currentAroId, userName } = useApp();
  const { showToast } = useToast();
  const [, forceRerender] = useState(0);
  const [search, setSearch] = useState("");
  const { values, setValue, dateRange, setDateRange, clearAll } = useFilterParams(fieldKeys, "allTime");
  const resolvedRange = useResolvedDateRange(dateRange);

  const [removeTarget, setRemoveTarget] = useState<AgentRecord | null>(null);
  const [removing, setRemoving] = useState(false);

  // Not memoized on purpose: getAgentsForAro reads the shared mutable `agents` array (see
  // removeAgentFromPortfolio in lib/mock-data.ts), so it must be recomputed on every render
  // to reflect an in-place status change made elsewhere in this session.
  const agents = getAgentsForAro(currentAroId);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return agents.filter((a) => {
      if (q && !a.name.toLowerCase().includes(q) && !a.businessName.toLowerCase().includes(q)) return false;
      if (values.status !== "ALL" && a.status !== values.status) return false;
      if (!isWithinRange(a.onboardingDate, resolvedRange)) return false;
      return true;
    });
  }, [agents, search, values.status, resolvedRange]);

  async function confirmRemove() {
    if (!removeTarget) return;
    setRemoving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    removeAgentFromPortfolio(removeTarget.id, userName);
    setRemoving(false);
    setRemoveTarget(null);
    forceRerender((v) => v + 1);
    showToast(`${removeTarget.name} was removed from your portfolio. Their history stays intact.`);
  }

  const fields: FilterFieldDef[] = [
    {
      key: "status",
      label: "Status",
      value: values.status,
      onChange: (v) => setValue("status", v),
      options: statuses.map((s) => ({ value: s, label: s })),
    },
  ];

  return (
    <div>
      <PageHeader title="Agent Management" description="All agents assigned to you." />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by agent or business name"
            className="w-full rounded-lg border border-surface-border bg-surface-card py-2.5 pl-10 pr-4 text-sm focus:border-brand-400 focus:outline-none"
          />
        </div>
        <Link
          href="/signup"
          className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          <Plus size={16} /> Add Agent
        </Link>
      </div>

      <FilterBar dateRange={{ value: dateRange, onChange: setDateRange }} fields={fields} onClearAll={clearAll} />

      <Card>
        <ul>
          {filtered.map((agent) => (
            <li key={agent.id} className="border-b border-surface-border/70 last:border-0 hover:bg-surface/60">
              <div className="flex items-center gap-4 px-5 py-4">
                <Link href={`/aro/agents/${agent.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-navy-900 text-sm font-bold text-white">
                    {initials(agent.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-ink-900">{agent.name}</p>
                      <Badge tone={statusTone(agent.status)}>{agent.status}</Badge>
                    </div>
                    <p className="truncate text-xs text-ink-400">{agent.businessName}</p>
                    <p className="truncate text-xs text-ink-400">
                      {agent.assignment ? `Assigned to: ${agent.assignment.businessOrMerchant}` : "Unassigned"}
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-xs text-ink-400">Volume today</p>
                    <p className="text-sm font-semibold text-ink-900">
                      {formatNaira(agent.transactionVolumeToday)}
                    </p>
                  </div>
                </Link>
                {agent.status !== "removed" && (
                  <button
                    onClick={() => setRemoveTarget(agent)}
                    aria-label={`Remove ${agent.name}`}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-400 hover:bg-danger/10 hover:text-danger"
                  >
                    <UserMinus size={16} />
                  </button>
                )}
                <Link href={`/aro/agents/${agent.id}`}>
                  <ChevronRight size={18} className="shrink-0 text-ink-300" />
                </Link>
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-5 py-16 text-center text-sm text-ink-400">No agents match your filters.</li>
          )}
        </ul>
      </Card>

      <Modal open={!!removeTarget} onClose={() => setRemoveTarget(null)} title="Remove agent from portfolio">
        <div className="space-y-4">
          <p className="text-sm text-ink-600">
            Are you sure you want to remove <span className="font-semibold text-ink-900">{removeTarget?.name}</span> from
            your portfolio? Their transaction, commission, and referral history will remain intact — this only changes
            their status.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setRemoveTarget(null)}
              className="flex-1 rounded-lg border border-surface-border py-2.5 text-sm font-semibold text-ink-700 hover:bg-surface"
            >
              Cancel
            </button>
            <button
              onClick={confirmRemove}
              disabled={removing}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-danger py-2.5 text-sm font-semibold text-white hover:bg-danger/90 disabled:opacity-70"
            >
              {removing && <Loader2 size={16} className="animate-spin" />}
              {removing ? "Removing..." : "Remove agent"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function AgentManagementPage() {
  const allowed = useRequireAccess("aro");
  if (!allowed) return null;
  return (
    <Suspense fallback={null}>
      <AgentManagementContent />
    </Suspense>
  );
}
