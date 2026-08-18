"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Plus, Tv, Banknote, Loader2, ChevronLeft } from "lucide-react";
import { clsx } from "clsx";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { DisputesTable } from "@/components/modules/DisputesTable";
import { disputes as seedDisputes } from "@/lib/mock-data";
import { DisputeCategory, DisputeRecord } from "@/lib/types";
import { useToast } from "@/context/ToastContext";
import { apiPost } from "@/lib/api-client";

const inputClass =
  "w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none";

function DisputeContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const category = (searchParams.get("tab") ?? "pos") as DisputeCategory;

  const [records, setRecords] = useState<DisputeRecord[]>(seedDisputes);

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

  const filtered = useMemo(() => records.filter((d) => d.category === category), [records, category]);
  const counts = {
    pos: records.filter((d) => d.category === "pos").length,
    withdrawal: records.filter((d) => d.category === "withdrawal").length,
  };

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
      // Show the tab the new dispute landed in so it appears at the top of the list.
      switchToTab(type);
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
        description="Raise and track issues with failed POS transactions or withdrawals."
        action={
          <button
            onClick={() => {
              resetModal();
              setOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            <Plus size={16} /> New Dispute
          </button>
        }
      />

      <div className="mb-5">
        <Tabs
          tabs={[
            { key: "pos", label: "POS", badge: counts.pos },
            { key: "withdrawal", label: "Withdrawal", badge: counts.withdrawal },
          ]}
          defaultTab="pos"
        />
      </div>

      <DisputesTable
        title={category === "pos" ? "POS Disputes" : "Withdrawal Disputes"}
        records={filtered}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={step === "type" ? "New Dispute" : type === "pos" ? "POS Dispute" : "Withdrawal Dispute"}
      >
        {step === "type" ? (
          <div className="space-y-3">
            <p className="text-sm text-ink-500">What kind of transaction are you disputing?</p>
            <button
              onClick={() => pickType("withdrawal")}
              className="flex w-full items-center gap-3 rounded-xl border border-surface-border p-4 text-left hover:border-brand-300"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600">
                <Banknote size={20} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink-900">Withdrawal Dispute</span>
                <span className="block text-xs text-ink-400">Cash not dispensed, wrong amount, etc.</span>
              </span>
            </button>
            <button
              onClick={() => pickType("pos")}
              className="flex w-full items-center gap-3 rounded-xl border border-surface-border p-4 text-left hover:border-brand-300"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600">
                <Tv size={20} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink-900">POS Dispute</span>
                <span className="block text-xs text-ink-400">Double charge, failed transfer, etc.</span>
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setStep("type")}
              className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              <ChevronLeft size={14} /> Change type
            </button>
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
