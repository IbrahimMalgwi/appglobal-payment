"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, Plus, Briefcase, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { agents as seedAgents } from "@/lib/mock-data";
import { AgentRecord } from "@/lib/types";
import { formatNaira, initials } from "@/lib/format";
import { useToast } from "@/context/ToastContext";

const emptyAddForm = {
  name: "",
  businessName: "",
  phone: "",
  email: "",
  address: "",
  bankName: "",
  accountNumber: "",
};

const inputClass =
  "w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none";

export default function AgentManagementPage() {
  const { showToast } = useToast();
  const [agents, setAgents] = useState<AgentRecord[]>(seedAgents);
  const [search, setSearch] = useState("");

  // Add Agent modal
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(emptyAddForm);
  const [addingAgent, setAddingAgent] = useState(false);

  // Assign modal
  const [assignAgent, setAssignAgent] = useState<AgentRecord | null>(null);
  const [assignMerchant, setAssignMerchant] = useState("");
  const [assignTask, setAssignTask] = useState("");
  const [assigning, setAssigning] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter(
      (a) => a.name.toLowerCase().includes(q) || a.businessName.toLowerCase().includes(q)
    );
  }, [search, agents]);

  function handleAddAgent() {
    const required = [
      addForm.name,
      addForm.businessName,
      addForm.phone,
      addForm.email,
      addForm.address,
      addForm.bankName,
      addForm.accountNumber,
    ];
    if (required.some((v) => !v.trim())) {
      showToast("Please fill in all fields to onboard an agent.", "error");
      return;
    }
    setAddingAgent(true);
    // Mock onboarding — no real backend call.
    setTimeout(() => {
      const newAgent: AgentRecord = {
        id: `agt_${Date.now()}`,
        name: addForm.name.trim(),
        businessName: addForm.businessName.trim(),
        phone: addForm.phone.trim(),
        email: addForm.email.trim(),
        address: addForm.address.trim(),
        status: "pending", // not active until their terminal is set up
        terminals: { total: 0, active: 0, inactive: 0 },
        bankName: addForm.bankName.trim(),
        accountNumber: addForm.accountNumber.trim(),
        transactionVolumeToday: 0,
        transactionCountToday: 0,
        terminalWithdrawalsToday: 0,
        commissionBalance: 0,
      };
      setAgents((prev) => [newAgent, ...prev]);
      setAddingAgent(false);
      setAddOpen(false);
      setAddForm(emptyAddForm);
      showToast(`${newAgent.name} onboarded as a pending agent.`);
    }, 700);
  }

  function openAssign(agent: AgentRecord) {
    setAssignAgent(agent);
    setAssignMerchant(agent.assignment?.businessOrMerchant ?? "");
    setAssignTask(agent.assignment?.task ?? "");
  }

  function handleAssign() {
    if (!assignAgent) return;
    if (!assignMerchant.trim()) {
      showToast("Enter a business or merchant to assign this agent to.", "error");
      return;
    }
    const agent = assignAgent;
    const merchant = assignMerchant.trim();
    const task = assignTask.trim();
    setAssigning(true);
    // Mock assignment — no real backend call.
    setTimeout(() => {
      setAgents((prev) =>
        prev.map((a) =>
          a.id === agent.id
            ? { ...a, assignment: { businessOrMerchant: merchant, task: task || undefined } }
            : a
        )
      );
      setAssigning(false);
      setAssignAgent(null);
      showToast(`${agent.name} assigned to ${merchant}.`);
    }, 700);
  }

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
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          <Plus size={16} /> Add Agent
        </button>
      </div>

      <Card>
        <ul>
          {filtered.map((agent) => (
            <li
              key={agent.id}
              className="flex items-center border-b border-surface-border/70 last:border-0 hover:bg-surface/60"
            >
              <Link href={`/aro/agents/${agent.id}`} className="flex min-w-0 flex-1 items-center gap-4 px-5 py-4">
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
              <div className="flex shrink-0 items-center gap-1 pr-4">
                <button
                  onClick={() => openAssign(agent)}
                  title="Assign agent"
                  className="flex items-center gap-1.5 rounded-lg border border-surface-border px-2.5 py-1.5 text-xs font-semibold text-brand-600 hover:bg-surface"
                >
                  <Briefcase size={14} />
                  <span className="hidden sm:inline">Assign</span>
                </button>
                <ChevronRight size={18} className="text-ink-300" />
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-5 py-16 text-center text-sm text-ink-400">No agents match your search.</li>
          )}
        </ul>
      </Card>

      {/* Add Agent */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Onboard a new agent">
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Full name" value={addForm.name} onChange={(v) => setAddForm((f) => ({ ...f, name: v }))} />
            <FormField label="Business name" value={addForm.businessName} onChange={(v) => setAddForm((f) => ({ ...f, businessName: v }))} />
            <FormField label="Phone" value={addForm.phone} onChange={(v) => setAddForm((f) => ({ ...f, phone: v }))} />
            <FormField label="Email" value={addForm.email} onChange={(v) => setAddForm((f) => ({ ...f, email: v }))} />
          </div>
          <FormField label="Address" value={addForm.address} onChange={(v) => setAddForm((f) => ({ ...f, address: v }))} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Bank name" value={addForm.bankName} onChange={(v) => setAddForm((f) => ({ ...f, bankName: v }))} />
            <FormField label="Account number" value={addForm.accountNumber} onChange={(v) => setAddForm((f) => ({ ...f, accountNumber: v }))} />
          </div>
          <button
            onClick={handleAddAgent}
            disabled={addingAgent}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-70"
          >
            {addingAgent && <Loader2 size={16} className="animate-spin" />}
            {addingAgent ? "Onboarding agent..." : "Onboard Agent"}
          </button>
        </div>
      </Modal>

      {/* Assign / Reassign */}
      <Modal
        open={!!assignAgent}
        onClose={() => setAssignAgent(null)}
        title={assignAgent ? `Assign ${assignAgent.name}` : "Assign agent"}
      >
        <div className="space-y-4">
          <FormField
            label="Business / Merchant"
            value={assignMerchant}
            onChange={setAssignMerchant}
            placeholder="e.g. Doe Retail Ventures"
          />
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-700">Task / Note (optional)</label>
            <textarea
              value={assignTask}
              onChange={(e) => setAssignTask(e.target.value)}
              placeholder="e.g. POS terminal support & reconciliation"
              rows={3}
              className={inputClass}
            />
          </div>
          <button
            onClick={handleAssign}
            disabled={assigning}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-70"
          >
            {assigning && <Loader2 size={16} className="animate-spin" />}
            {assigning ? "Assigning..." : "Save Assignment"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink-700">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}
