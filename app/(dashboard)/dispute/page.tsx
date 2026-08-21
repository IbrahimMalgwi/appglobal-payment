"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Plus, Tv, Banknote, CreditCard, Loader2, ChevronLeft } from "lucide-react";
import { clsx } from "clsx";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { DisputesTable } from "@/components/modules/DisputesTable";
import { Badge, statusTone } from "@/components/ui/Badge";
import { disputes as seedDisputes, transactions } from "@/lib/mock-data";
import { DisputeCategory, DisputeRecord } from "@/lib/types";
import { useToast } from "@/context/ToastContext";
import { apiPost } from "@/lib/api-client";
import { useApp } from "@/context/AppContext";
import { formatDate, formatNaira } from "@/lib/format";

const inputClass =
  "w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none";

const CATEGORY_LABELS: Record<DisputeCategory, string> = {
  pos: "POS",
  withdrawal: "Withdrawal",
  card: "Card",
  transaction: "Transaction",
};

// Manually pickable in the "New Dispute" type picker — "transaction" is deliberately excluded
// since it's only ever assigned by the Raise Dispute action on a specific Transaction Details
// page, never chosen by hand. "card" is business-only (see isBusiness below).
const TYPE_PICKER_OPTIONS: {
  key: DisputeCategory;
  label: string;
  description: string;
  icon: typeof Tv;
}[] = [
  { key: "withdrawal", label: "Withdrawal Dispute", description: "Cash not dispensed, wrong amount, etc.", icon: Banknote },
  { key: "pos", label: "POS Dispute", description: "Double charge, failed transfer, etc.", icon: Tv },
  { key: "card", label: "Card Dispute", description: "Unauthorized charge, declined but debited, etc.", icon: CreditCard },
];

function DisputeContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { userType } = useApp();

  // Personal accounts have no POS or withdrawal-via-POS activity, so those dispute
  // categories don't apply — they only ever see disputes raised from Transaction Details.
  const isPersonal = userType === "personal";
  // Business/agent accounts get the full category set (POS, Withdrawal, Card, plus the
  // transaction-linked category) — ARO/BDO keep the original two-tab POS/Withdrawal view.
  const isBusiness = userType === "business";
  const typePickerOptions = isBusiness ? TYPE_PICKER_OPTIONS : TYPE_PICKER_OPTIONS.filter((o) => o.key !== "card");

  const category = (searchParams.get("tab") ?? "pos") as DisputeCategory;

  // The seeded disputes are POS/withdrawal-terminal issues ("Terminal charged twice", "Cash
  // not dispensed") — they don't correspond to anything a personal account could raise, so
  // personal users start with an empty list that only ever grows via the Raise Dispute action
  // on Transaction Details, never from this shared seed data.
  const [records, setRecords] = useState<DisputeRecord[]>(isPersonal ? [] : seedDisputes);

  // Deep-link from Transaction Details' "Raise Dispute" button: opens straight to the form
  // step, pre-filled, instead of the type picker — reusing this exact submission flow rather
  // than building a second dispute form. Read once via lazy initializers (this component
  // mounts fresh on every navigation into /dispute, so there's no need for an effect here).
  const isPrefilled = searchParams.get("prefillOpen") === "1";

  // New-dispute modal: a type picker (step "type") then the form (step "form").
  const [open, setOpen] = useState(isPrefilled);
  const [step, setStep] = useState<"type" | "form">(isPrefilled ? "form" : "type");
  const [type, setType] = useState<DisputeCategory>(
    () => (searchParams.get("prefillType") as DisputeCategory | null) ?? "pos"
  );
  const [reference, setReference] = useState(() => searchParams.get("prefillReference") ?? "");
  const [amount, setAmount] = useState(() => searchParams.get("prefillAmount") ?? "");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Detail view opened by clicking a row in the list below.
  const [viewing, setViewing] = useState<DisputeRecord | null>(null);

  const filtered = useMemo(() => {
    if (isPersonal) {
      return [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return records.filter((d) => d.category === category);
  }, [records, category, isPersonal]);
  const counts = {
    pos: records.filter((d) => d.category === "pos").length,
    withdrawal: records.filter((d) => d.category === "withdrawal").length,
    card: records.filter((d) => d.category === "card").length,
    transaction: records.filter((d) => d.category === "transaction").length,
  };
  const tabDefs = isBusiness
    ? [
        { key: "pos", label: "POS", badge: counts.pos },
        { key: "withdrawal", label: "Withdrawal", badge: counts.withdrawal },
        { key: "card", label: "Card", badge: counts.card },
        { key: "transaction", label: "Transaction", badge: counts.transaction },
      ]
    : [
        { key: "pos", label: "POS", badge: counts.pos },
        { key: "withdrawal", label: "Withdrawal", badge: counts.withdrawal },
      ];

  function resetModal() {
    setStep("type");
    setReference("");
    setAmount("");
    setDescription("");
  }

  function pickType(picked: DisputeCategory) {
    setType(picked);
    setStep("form");
  }

  function switchToTab(tab: DisputeCategory) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}`);
  }

  async function handleSubmit() {
    if (!reference.trim()) {
      showToast("Enter the transaction reference.", "error");
      return;
    }
    const parsed = Number(amount);
    if (!parsed || parsed <= 0) {
      showToast("Enter a valid amount.", "error");
      return;
    }
    if (!description.trim()) {
      showToast("Add a short description of the issue.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const record = await apiPost<DisputeRecord>("/api/disputes", {
        category: type,
        reference,
        amount: parsed,
        reason: description,
      });
      setRecords((prev) => [record, ...prev]);
      setOpen(false);
      resetModal();
      // Show the tab the new dispute landed in so it appears at the top of the list —
      // personal accounts have no tabs, so there's nothing to switch to.
      if (!isPersonal) {
        switchToTab(type);
      }
      showToast("Dispute submitted — we'll review it and get back to you.");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Couldn't submit the dispute. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Dispute"
        description={
          isPersonal
            ? "Track disputes you've raised from your transactions."
            : isBusiness
              ? "Raise and track issues with POS transactions, withdrawals, card charges, or a specific transaction."
              : "Raise and track issues with failed POS transactions or withdrawals."
        }
        action={
          !isPersonal ? (
            <button
              onClick={() => {
                resetModal();
                setOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
            >
              <Plus size={16} /> New Dispute
            </button>
          ) : undefined
        }
      />

      {!isPersonal && (
        <div className="mb-5">
          <Tabs tabs={tabDefs} defaultTab="pos" />
        </div>
      )}

      <DisputesTable
        title={isPersonal ? "My Disputes" : `${CATEGORY_LABELS[category]} Disputes`}
        records={filtered}
        onRowClick={setViewing}
        emptyMessage={
          isPersonal
            ? "No disputes yet. Raise one from a transaction's details page."
            : "No disputes recorded."
        }
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={step === "type" ? "New Dispute" : isPersonal ? "Dispute" : `${CATEGORY_LABELS[type]} Dispute`}
      >
        {step === "type" ? (
          <div className="space-y-3">
            <p className="text-sm text-ink-500">What kind of transaction are you disputing?</p>
            {typePickerOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => pickType(opt.key)}
                className="flex w-full items-center gap-3 rounded-xl border border-surface-border p-4 text-left hover:border-brand-300"
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600">
                  <opt.icon size={20} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink-900">{opt.label}</span>
                  <span className="block text-xs text-ink-400">{opt.description}</span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {!isPersonal && (
              <button
                onClick={() => setStep("type")}
                className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                <ChevronLeft size={14} /> Change type
              </button>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-700">Transaction reference</label>
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. WDL-000123"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-700">Amount</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0.00"
                inputMode="decimal"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what went wrong"
                rows={3}
                className={clsx(inputClass, "resize-none")}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-70"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? "Submitting..." : "Submit dispute"}
            </button>
          </div>
        )}
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Dispute Details">
        {viewing && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Reference</p>
                <p className="mt-0.5 font-display text-lg font-bold text-ink-900">{viewing.reference}</p>
              </div>
              <Badge tone={statusTone(viewing.status)}>{viewing.status}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-xl bg-surface px-4 py-3.5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Amount</p>
                <p className="mt-0.5 text-sm font-semibold text-ink-900">{formatNaira(viewing.amount)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Date raised</p>
                <p className="mt-0.5 text-sm font-semibold text-ink-900">{formatDate(viewing.date)}</p>
              </div>
              {!isPersonal && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Type</p>
                  <p className="mt-0.5 text-sm font-semibold text-ink-900">{CATEGORY_LABELS[viewing.category]} Dispute</p>
                </div>
              )}
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">Description</p>
              <p className="text-sm text-ink-700">{viewing.reason}</p>
            </div>

            {(() => {
              const linkedTransaction = transactions.find((t) => t.reference === viewing.reference);
              if (!linkedTransaction) return null;
              return (
                <button
                  onClick={() => {
                    setViewing(null);
                    router.push(`/transactions/${linkedTransaction.id}`);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-surface-border py-2.5 text-sm font-semibold text-brand-600 hover:bg-surface"
                >
                  View transaction
                </button>
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function DisputePage() {
  return (
    <Suspense fallback={null}>
      <DisputeContent />
    </Suspense>
  );
}
