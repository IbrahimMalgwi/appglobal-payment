"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteTabs } from "@/components/ui/RouteTabs";
import { Modal } from "@/components/ui/Modal";
import { TransfersTable } from "@/components/modules/TransfersTable";
import { appPayTransfers as seedTransfers } from "@/lib/mock-data";
import { TransferRecord } from "@/lib/types";
import { useToast } from "@/context/ToastContext";

const tabs = [
  { href: "/transfers/apppay", label: "AppPay Transfer" },
  { href: "/transfers/interbank", label: "Interbank Transfer" },
];

export default function AppPayTransferPage() {
  const { showToast } = useToast();
  const [records, setRecords] = useState<TransferRecord[]>(seedTransfers);
  const [open, setOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSend() {
    if (!recipient.trim()) {
      showToast("Enter an AppPay username, tag, or account to continue.", "error");
      return;
    }
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      showToast("Enter a valid amount.", "error");
      return;
    }

    setSubmitting(true);
    // Hardcoded/mock processing — no real backend call.
    setTimeout(() => {
      const record: TransferRecord = {
        id: `ap_${Date.now()}`,
        recipient: `${recipient} (AppPay)`,
        bank: "AppPay Wallet",
        amount: parsedAmount,
        date: new Date().toISOString(),
        status: "COMPLETED",
      };
      setRecords((prev) => [record, ...prev]);
      setSubmitting(false);
      setOpen(false);
      setRecipient("");
      setAmount("");
      showToast(`₦${parsedAmount.toLocaleString()} sent to ${recipient} via AppPay — instant, no fees.`);
    }, 700);
  }

  return (
    <div>
      <PageHeader title="Transfers" description="Send instantly to another AppPay user or account — no fees." />
      <div className="mb-5">
        <RouteTabs tabs={tabs} />
      </div>
      <TransfersTable
        title="AppPay Transfers"
        records={records}
        ctaLabel="New AppPay Transfer"
        onCtaClick={() => setOpen(true)}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Send via AppPay">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-700">AppPay username or account</label>
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. @ada_okafor or 0123456789"
              className="w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-700">Amount</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0.00"
              inputMode="decimal"
              className="w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-70"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? "Sending..." : "Send Money"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
