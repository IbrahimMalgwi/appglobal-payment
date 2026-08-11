"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteTabs } from "@/components/ui/RouteTabs";
import { Modal } from "@/components/ui/Modal";
import { TransfersTable } from "@/components/modules/TransfersTable";
import { interbankTransfers as seedTransfers } from "@/lib/mock-data";
import { TransferRecord } from "@/lib/types";
import { useToast } from "@/context/ToastContext";

const tabs = [
  { href: "/transfers/apppay", label: "AppPay Transfer" },
  { href: "/transfers/interbank", label: "Interbank Transfer" },
];

export default function InterbankTransferPage() {
  const { showToast } = useToast();
  const [records, setRecords] = useState<TransferRecord[]>(seedTransfers);
  const [open, setOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [bank, setBank] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSend() {
    if (!recipient.trim() || !bank.trim()) {
      showToast("Enter a recipient and bank to continue.", "error");
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
        id: `ib_${Date.now()}`,
        recipient,
        bank,
        amount: parsedAmount,
        date: new Date().toISOString(),
        status: "COMPLETED",
      };
      setRecords((prev) => [record, ...prev]);
      setSubmitting(false);
      setOpen(false);
      setRecipient("");
      setBank("");
      setAmount("");
      showToast(`₦${parsedAmount.toLocaleString()} sent to ${recipient} at ${bank}.`);
    }, 700);
  }

  return (
    <div>
      <PageHeader title="Transfers" description="Send to an account at any other bank." />
      <div className="mb-5">
        <RouteTabs tabs={tabs} />
      </div>
      <TransfersTable
        title="Interbank Transfers"
        records={records}
        ctaLabel="New Interbank Transfer"
        onCtaClick={() => setOpen(true)}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Send to Another Bank">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-700">Recipient name</label>
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. Ada Okafor"
              className="w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-700">Bank</label>
            <input
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              placeholder="e.g. GTBank"
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
