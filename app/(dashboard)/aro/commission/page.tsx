"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { agents, agentCommissions, aroCommissionSummary } from "@/lib/mock-data";
import { formatNaira } from "@/lib/format";

export default function CommissionBreakdownPage() {
  const [agentId, setAgentId] = useState(agentCommissions[0]?.agentId ?? "");
  const selected = agentCommissions.find((c) => c.agentId === agentId);
  const agent = agents.find((a) => a.id === agentId);

  return (
    <div>
      <PageHeader title="Commission Breakdown" description="Your earnings and each agent's commission." />

      <Card className="mb-5 p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <Wallet size={20} />
          </span>
          <div>
            <p className="text-sm text-ink-400">Your total commission earned</p>
            <p className="font-display text-2xl font-bold text-ink-900">
              {formatNaira(aroCommissionSummary.total)}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 border-t border-surface-border pt-4 sm:grid-cols-3">
          <div className="rounded-xl bg-surface p-4">
            <p className="text-xs text-ink-400">Payments Commission</p>
            <p className="font-display text-lg font-bold text-ink-900">
              {formatNaira(aroCommissionSummary.bySource.payments)}
            </p>
          </div>
          <div className="rounded-xl bg-surface p-4">
            <p className="text-xs text-ink-400">Transfer Commission</p>
            <p className="font-display text-lg font-bold text-ink-900">
              {formatNaira(aroCommissionSummary.bySource.transfer)}
            </p>
          </div>
          <div className="rounded-xl bg-surface p-4">
            <p className="text-xs text-ink-400">Cashout Commission</p>
            <p className="font-display text-lg font-bold text-ink-900">
              {formatNaira(aroCommissionSummary.bySource.cashout)}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-ink-900">Agent Commission Breakdown</h2>
          <select
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="rounded-lg border border-surface-border bg-surface-card px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
          >
            {agentCommissions.map((c) => (
              <option key={c.agentId} value={c.agentId}>
                {c.agentName}
              </option>
            ))}
          </select>
        </div>

        {selected && agent && (
          <>
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-surface p-4">
                <p className="text-xs text-ink-400">Agent</p>
                <p className="text-sm font-semibold text-ink-900">{selected.agentName}</p>
                <p className="text-xs text-ink-400">{agent.businessName}</p>
              </div>
              <div className="rounded-xl bg-surface p-4">
                <p className="text-xs text-ink-400">Total transaction volume</p>
                <p className="font-display text-lg font-bold text-ink-900">
                  {formatNaira(selected.transactionVolume)}
                </p>
              </div>
              <div className="rounded-xl bg-surface p-4">
                <p className="text-xs text-ink-400">Total commission earned</p>
                <p className="font-display text-lg font-bold text-ink-900">
                  {formatNaira(selected.totalCommission)}
                </p>
              </div>
            </div>

            <p className="mb-3 text-sm font-semibold text-ink-700">Commission per transaction type</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-surface p-4">
                <p className="text-xs text-ink-400">Payments</p>
                <p className="font-display text-lg font-bold text-ink-900">
                  {formatNaira(selected.breakdown.payments)}
                </p>
              </div>
              <div className="rounded-xl bg-surface p-4">
                <p className="text-xs text-ink-400">Transfer</p>
                <p className="font-display text-lg font-bold text-ink-900">
                  {formatNaira(selected.breakdown.transfer)}
                </p>
              </div>
              <div className="rounded-xl bg-surface p-4">
                <p className="text-xs text-ink-400">Cashout</p>
                <p className="font-display text-lg font-bold text-ink-900">
                  {formatNaira(selected.breakdown.cashout)}
                </p>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
