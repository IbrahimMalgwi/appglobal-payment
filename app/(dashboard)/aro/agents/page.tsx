"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { agents } from "@/lib/mock-data";
import { formatNaira, initials } from "@/lib/format";

export default function AgentManagementPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter(
      (a) => a.name.toLowerCase().includes(q) || a.businessName.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div>
      <PageHeader title="Agent Management" description="All agents assigned to you." />

      <div className="relative mb-5 max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by agent or business name"
          className="w-full rounded-lg border border-surface-border bg-surface-card py-2.5 pl-10 pr-4 text-sm focus:border-brand-400 focus:outline-none"
        />
      </div>

      <Card>
        <ul>
          {filtered.map((agent) => (
            <li key={agent.id} className="border-b border-surface-border/70 last:border-0">
              <Link
                href={`/aro/agents/${agent.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-surface/60"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-navy-900 text-sm font-bold text-white">
                  {initials(agent.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-ink-900">{agent.name}</p>
                    <Badge tone={statusTone(agent.status)}>{agent.status}</Badge>
                  </div>
                  <p className="truncate text-xs text-ink-400">{agent.businessName}</p>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <p className="text-xs text-ink-400">Volume today</p>
                  <p className="text-sm font-semibold text-ink-900">
                    {formatNaira(agent.transactionVolumeToday)}
                  </p>
                </div>
                <ChevronRight size={18} className="shrink-0 text-ink-300" />
              </Link>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-5 py-16 text-center text-sm text-ink-400">No agents match your search.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
