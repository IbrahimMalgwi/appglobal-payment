"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, notFound } from "next/navigation";
import { Mail, Phone, MapPin, Landmark, Briefcase, ChevronRight, UserMinus, Loader2, X, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Table, Column } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { addPosTerminal, getAgentById, removeAgentFromPortfolio } from "@/lib/mock-data";
import { getAgentPerformanceRows, getTerminalCounts, getTerminalsForAccount, getTransactionsForTerminal } from "@/lib/aro-analytics";
import { AroTransactionRecord } from "@/lib/types";
import { formatDate, formatNaira, formatTxnType, initials } from "@/lib/format";
import { useToast } from "@/context/ToastContext";

/**
 * Full agent-profile UI (details, Overview/Business Accounts/Transactions tabs, real
 * Agent -> Account -> POS -> Transactions drill-down, optional Remove-from-portfolio action).
 * Shared by /aro/agents/[id] (ARO viewing their own agent) and /bdo/agents/[id] (BDO viewing
 * any agent org-wide) so the drill-down logic isn't duplicated across roles — only `basePath`
 * and `canRemove` vary.
 */
export function AgentProfileView({
  agentId,
  basePath,
  canRemove,
  performedBy,
}: {
  agentId: string;
  basePath: string;
  canRemove: boolean;
  performedBy: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const tab = searchParams.get("tab") ?? "overview";
  const accountId = searchParams.get("accountId");
  const posTerminalId = searchParams.get("posTerminalId");

  const [, forceRerender] = useState(0);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [addTerminalOpen, setAddTerminalOpen] = useState(false);
  const [newSerial, setNewSerial] = useState("");
  const [addingTerminal, setAddingTerminal] = useState(false);

  // Not memoized on purpose: getAgentById reads the shared mutable `agents` array (see
  // removeAgentFromPortfolio in lib/mock-data.ts), so it must be recomputed on every render
  // to reflect an in-place status change made elsewhere in this session.
  const agent = getAgentById(agentId);

  const allAgentTxns: AroTransactionRecord[] = agent
    ? agent.businessAccounts.flatMap((acc) => getTerminalsForAccount(acc.id)).flatMap((t) => getTransactionsForTerminal(t.id))
    : [];

  const scopedTxns: AroTransactionRecord[] = posTerminalId
    ? allAgentTxns.filter((t) => t.posTerminalId === posTerminalId)
    : accountId
      ? allAgentTxns.filter((t) => t.accountId === accountId)
      : allAgentTxns;

  if (!agent) return notFound();

  const perf = getAgentPerformanceRows(agent.aroId, { agentId: agent.id })[0];
  const terminalCounts = getTerminalCounts(agent.id);

  function setParam(key: string, value: string | null) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    router.push(`${basePath}/${agent!.id}?${p.toString()}`);
  }

  async function confirmRemove() {
    setRemoving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    removeAgentFromPortfolio(agent!.id, performedBy);
    setRemoving(false);
    setRemoveOpen(false);
    forceRerender((v) => v + 1);
    showToast(`${agent!.name} was removed from the portfolio. Their history stays intact.`);
  }

  async function confirmAddTerminal() {
    if (!newSerial.trim() || !accountId) return;
    setAddingTerminal(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    addPosTerminal(agent!.id, accountId, newSerial.trim());
    setAddingTerminal(false);
    setAddTerminalOpen(false);
    setNewSerial("");
    forceRerender((v) => v + 1);
    showToast(`Terminal ${newSerial.trim()} assigned. It'll show as active once transactions start.`);
  }

  const txnColumns: Column<AroTransactionRecord>[] = [
    { header: "Date", render: (t) => <span className="text-ink-500">{formatDate(t.date)}</span> },
    {
      header: "Type",
      render: (t) => (
        <span className="font-medium text-ink-700">
          {formatTxnType(t.type)}
          {t.billCategory ? ` · ${t.billCategory}` : ""}
        </span>
      ),
    },
    { header: "Reference", hideOnMobile: true, render: (t) => <span className="text-ink-500">{t.reference}</span> },
    { header: "Amount", align: "right", render: (t) => <span className="font-semibold">{formatNaira(t.amount)}</span> },
    { header: "Status", render: (t) => <Badge tone={statusTone(t.status)}>{t.status}</Badge> },
  ];

  return (
    <div>
      <PageHeader
        title="Agent Profile"
        description="Full details for this agent."
        action={
          canRemove &&
          agent.status !== "removed" && (
            <button
              onClick={() => setRemoveOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-danger/30 px-3.5 py-2.5 text-sm font-semibold text-danger hover:bg-danger/10"
            >
              <UserMinus size={16} /> Remove from portfolio
            </button>
          )
        }
      />

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
          <div className="flex items-center gap-2 text-sm text-ink-600 sm:col-span-2 lg:col-span-4">
            <Briefcase size={15} className="shrink-0 text-ink-400" />
            {agent.assignment ? (
              <span>
                Assigned to <span className="font-semibold text-ink-900">{agent.assignment.businessOrMerchant}</span>
                {agent.assignment.task ? ` — ${agent.assignment.task}` : ""}
              </span>
            ) : (
              <span className="text-ink-400">Unassigned</span>
            )}
          </div>
        </div>
      </Card>

      <div className="mb-5">
        <Tabs
          tabs={[
            { key: "overview", label: "Overview" },
            { key: "accounts", label: "Business Accounts" },
            { key: "transactions", label: "Transactions" },
          ]}
          defaultTab="overview"
        />
      </div>

      {tab === "overview" && perf && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Card className="p-5">
            <p className="mb-4 text-sm font-semibold text-ink-700">All-time activity</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-ink-400">Transaction volume</p>
                <p className="font-display text-lg font-bold text-ink-900">{formatNaira(perf.totalTransactionVolume)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400">Transaction count</p>
                <p className="font-display text-lg font-bold text-ink-900">{perf.totalTransactionCount}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400">POS terminals</p>
                <p className="font-display text-lg font-bold text-ink-900">
                  {terminalCounts.active}/{terminalCounts.total} active
                </p>
              </div>
              <div>
                <p className="text-xs text-ink-400">Commission (total)</p>
                <p className="font-display text-lg font-bold text-ink-900">{formatNaira(perf.commissionTotal)}</p>
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
              <div>
                <p className="text-xs text-ink-400">Onboarded</p>
                <p className="text-sm font-semibold text-ink-900">{formatDate(agent.onboardingDate)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 md:col-span-2">
            <p className="mb-4 text-sm font-semibold text-ink-700">Breakdown</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-surface p-4">
                <p className="text-xs text-ink-400">Transfer</p>
                <p className="font-display text-lg font-bold text-ink-900">{formatNaira(perf.transferInVolume)}</p>
                <p className="text-[11px] text-ink-400">{perf.transferInCount} txns</p>
              </div>
              <div className="rounded-xl bg-surface p-4">
                <p className="text-xs text-ink-400">Card</p>
                <p className="font-display text-lg font-bold text-ink-900">{formatNaira(perf.cardWithdrawalVolume)}</p>
                <p className="text-[11px] text-ink-400">{perf.cardWithdrawalCount} txns</p>
              </div>
              <div className="rounded-xl bg-surface p-4">
                <p className="text-xs text-ink-400">Bill Payment</p>
                <p className="font-display text-lg font-bold text-ink-900">{formatNaira(perf.billPaymentVolume)}</p>
                <p className="text-[11px] text-ink-400">{perf.billPaymentCount} txns</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === "accounts" && !accountId && (
        <Card>
          <div className="px-5 pt-5">
            <h2 className="font-display text-lg font-bold text-ink-900">Business Accounts</h2>
            <p className="text-sm text-ink-400">Select an account to see its POS terminals.</p>
          </div>
          <ul className="mt-4">
            {agent.businessAccounts.map((acc) => {
              const terminals = getTerminalsForAccount(acc.id);
              return (
                <li key={acc.id} className="border-b border-surface-border/70 last:border-0 hover:bg-surface/60">
                  <button
                    onClick={() => setParam("accountId", acc.id)}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                      <Landmark size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-900">{acc.accountName}</p>
                      <p className="text-xs text-ink-400">Acct. No {acc.accountNumber}</p>
                    </div>
                    <div className="hidden shrink-0 text-right sm:block">
                      <p className="text-xs text-ink-400">POS terminals</p>
                      <p className="text-sm font-semibold text-ink-900">{terminals.length}</p>
                    </div>
                    <ChevronRight size={18} className="shrink-0 text-ink-300" />
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {tab === "accounts" && accountId && (
        <Card>
          <div className="flex items-center justify-between px-5 pt-5">
            <div>
              <h2 className="font-display text-lg font-bold text-ink-900">
                {agent.businessAccounts.find((a) => a.id === accountId)?.accountName ?? "Account"} — POS Terminals
              </h2>
              <p className="text-sm text-ink-400">Select a terminal to see its transaction history.</p>
            </div>
            <div className="flex items-center gap-3">
              {canRemove && (
                <button
                  onClick={() => setAddTerminalOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-600"
                >
                  <Plus size={14} /> Add Terminal
                </button>
              )}
              <button
                onClick={() => setParam("accountId", null)}
                className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                <X size={13} /> Back to accounts
              </button>
            </div>
          </div>
          <ul className="mt-4">
            {getTerminalsForAccount(accountId).map((t) => (
              <li key={t.id} className="border-b border-surface-border/70 last:border-0 hover:bg-surface/60">
                <button
                  onClick={() => {
                    router.push(`${basePath}/${agent!.id}?tab=transactions&posTerminalId=${t.id}`);
                  }}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-ink-900">{t.serial}</p>
                      <Badge tone={statusTone(t.status)}>{t.status}</Badge>
                    </div>
                    <p className="text-xs text-ink-400">
                      {t.transactionCount} txns · {formatNaira(t.transactionVolume)}
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-xs text-ink-400">Commission</p>
                    <p className="text-sm font-semibold text-ink-900">{formatNaira(t.commissionGenerated)}</p>
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-ink-300" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === "transactions" && (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
            <h2 className="font-display text-lg font-bold text-ink-900">{agent.name}&apos;s Transactions</h2>
            {(accountId || posTerminalId) && (
              <Link
                href={`${basePath}/${agent.id}?tab=transactions`}
                className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                <X size={13} /> Clear terminal/account filter
              </Link>
            )}
          </div>
          <div className="mt-4">
            <Table columns={txnColumns} rows={scopedTxns} pageSize={8} emptyMessage="No transactions from this agent yet." />
          </div>
        </Card>
      )}

      {canRemove && (
        <Modal open={removeOpen} onClose={() => setRemoveOpen(false)} title="Remove agent from portfolio">
          <div className="space-y-4">
            <p className="text-sm text-ink-600">
              Are you sure you want to remove <span className="font-semibold text-ink-900">{agent.name}</span> from your
              portfolio? Their transaction, commission, and referral history will remain intact — this only changes their
              status.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRemoveOpen(false)}
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
      )}

      {canRemove && (
        <Modal open={addTerminalOpen} onClose={() => setAddTerminalOpen(false)} title="Add POS Terminal">
          <div className="space-y-4">
            <p className="text-sm text-ink-600">
              Assign a new terminal to{" "}
              <span className="font-semibold text-ink-900">
                {agent.businessAccounts.find((a) => a.id === accountId)?.accountName ?? "this account"}
              </span>
              . It starts inactive until its first transaction.
            </p>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-700">Terminal serial</label>
              <input
                value={newSerial}
                onChange={(e) => setNewSerial(e.target.value)}
                placeholder="e.g. POS-4821"
                className="w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
              />
            </div>
            <button
              onClick={confirmAddTerminal}
              disabled={addingTerminal || !newSerial.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-70"
            >
              {addingTerminal && <Loader2 size={16} className="animate-spin" />}
              {addingTerminal ? "Assigning..." : "Assign terminal"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
