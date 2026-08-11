"use client";

import { Suspense, useMemo } from "react";
import { useParams, useSearchParams, notFound } from "next/navigation";
import { Mail, Phone, MapPin, Landmark } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Table, Column } from "@/components/ui/Table";
import { getAgentById, aroTransactions, agentCommissions } from "@/lib/mock-data";
import { AroTransactionRecord } from "@/lib/types";
import { formatDate, formatNaira, initials } from "@/lib/format";

function AgentProfileContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "overview";

  const agent = getAgentById(params.id);
  const agentTxns = useMemo(
    () => (agent ? aroTransactions.filter((t) => t.agentId === agent.id) : []),
    [agent]
  );
  const commission = agentCommissions.find((c) => c.agentId === agent?.id);

  if (!agent) return notFound();

  const txnColumns: Column<AroTransactionRecord>[] = [
    { header: "Date", render: (t) => <span className="text-ink-500">{formatDate(t.date)}</span> },
    { header: "Type", render: (t) => <span className="font-medium text-ink-700">{t.type}</span> },
    { header: "Amount", align: "right", render: (t) => <span className="font-semibold">{formatNaira(t.amount)}</span> },
    { header: "Status", render: (t) => <Badge tone={statusTone(t.status)}>{t.status}</Badge> },
  ];

  return (
    <div>
      <PageHeader title="Agent Profile" description="Full details for this agent." />

      <Card className="mb-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-navy-900 text-lg font-bold text-white">
              {initials(agent.name)}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-display text-lg font-bold text-ink-900">{agent.name}</p>
                <Badge tone={statusTone(agent.status)}>{agent.status}</Badge>
              </div>
              <p className="text-sm text-ink-500">{agent.businessName}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-surface-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2 text-sm text-ink-600">
            <Phone size={15} className="shrink-0 text-ink-400" /> {agent.phone}
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-600">
            <Mail size={15} className="shrink-0 text-ink-400" /> {agent.email}
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-600 sm:col-span-2">
            <MapPin size={15} className="shrink-0 text-ink-400" /> {agent.address}
          </div>
        </div>
      </Card>

      <div className="mb-5">
        <Tabs
          tabs={[
            { key: "overview", label: "Overview" },
            { key: "terminals", label: "Terminals" },
            { key: "transactions", label: "Transactions" },
            { key: "commission", label: "Commission" },
          ]}
          defaultTab="overview"
        />
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Card className="p-5">
            <p className="mb-4 text-sm font-semibold text-ink-700">Today&apos;s activity</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-ink-400">Transaction volume</p>
                <p className="font-display text-lg font-bold text-ink-900">
                  {formatNaira(agent.transactionVolumeToday)}
                </p>
              </div>
              <div>
                <p className="text-xs text-ink-400">Transaction count</p>
                <p className="font-display text-lg font-bold text-ink-900">{agent.transactionCountToday}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400">Terminal withdrawals</p>
                <p className="font-display text-lg font-bold text-ink-900">{agent.terminalWithdrawalsToday}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400">Commission balance</p>
                <p className="font-display text-lg font-bold text-ink-900">
                  {formatNaira(agent.commissionBalance)}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-700">
              <Landmark size={16} /> Account information
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-ink-400">Bank name</p>
                <p className="text-sm font-semibold text-ink-900">{agent.bankName}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400">Account number</p>
                <p className="text-sm font-semibold text-ink-900">{agent.accountNumber}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === "terminals" && (
        <Card className="p-5">
          <p className="mb-4 text-sm font-semibold text-ink-700">Terminal summary</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-surface p-4">
              <p className="text-xs text-ink-400">Total terminal count</p>
              <p className="font-display text-2xl font-bold text-ink-900">{agent.terminals.total}</p>
            </div>
            <div className="rounded-xl bg-surface p-4">
              <p className="text-xs text-ink-400">Active terminals</p>
              <p className="font-display text-2xl font-bold text-success">{agent.terminals.active}</p>
            </div>
            <div className="rounded-xl bg-surface p-4">
              <p className="text-xs text-ink-400">Inactive terminals</p>
              <p className="font-display text-2xl font-bold text-danger">{agent.terminals.inactive}</p>
            </div>
          </div>
        </Card>
      )}

      {tab === "transactions" && (
        <Card>
          <div className="px-5 pt-5">
            <h2 className="font-display text-lg font-bold text-ink-900">{agent.name}&apos;s Transactions</h2>
          </div>
          <div className="mt-4">
            <Table columns={txnColumns} rows={agentTxns} emptyMessage="No transactions from this agent yet." />
          </div>
        </Card>
      )}

      {tab === "commission" && commission && (
        <Card className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm font-semibold text-ink-700">Commission breakdown</p>
            <p className="font-display text-xl font-bold text-ink-900">{formatNaira(commission.totalCommission)}</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-surface p-4">
              <p className="text-xs text-ink-400">Payments</p>
              <p className="font-display text-lg font-bold text-ink-900">
                {formatNaira(commission.breakdown.payments)}
              </p>
            </div>
            <div className="rounded-xl bg-surface p-4">
              <p className="text-xs text-ink-400">Transfer</p>
              <p className="font-display text-lg font-bold text-ink-900">
                {formatNaira(commission.breakdown.transfer)}
              </p>
            </div>
            <div className="rounded-xl bg-surface p-4">
              <p className="text-xs text-ink-400">Cashout</p>
              <p className="font-display text-lg font-bold text-ink-900">
                {formatNaira(commission.breakdown.cashout)}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function AgentProfilePage() {
  return (
    <Suspense fallback={null}>
      <AgentProfileContent />
    </Suspense>
  );
}
