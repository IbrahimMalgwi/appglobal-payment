"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteTabs } from "@/components/ui/RouteTabs";
import { Modal } from "@/components/ui/Modal";
import { TransfersTable } from "@/components/modules/TransfersTable";
import { interbankTransfers as seedTransfers } from "@/lib/mock-data";
import { TransferRecord } from "@/lib/types";
import { lookupBankAccount, MOCK_BANK_REGISTRY } from "@/lib/smart-lookup";
import { useToast } from "@/context/ToastContext";
import { useRequireAccess } from "@/components/access/RequireAccess";
import { apiPost } from "@/lib/api-client";

const tabs = [
  { href: "/transfers/apppay", label: "AppPay Transfer" },
  { href: "/transfers/interbank", label: "Interbank Transfer" },
];

export default function InterbankTransferPage() {
  const allowed = useRequireAccess("transfers");
  const { showToast } = useToast();
  const [records, setRecords] = useState<TransferRecord[]>(seedTransfers);
  const [open, setOpen] = useState(false);

  const [accountNumber, setAccountNumber] = useState("");
  const [manualBank, setManualBank] = useState("");
  const [manualName, setManualName] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Purely derived from accountNumber — no effect needed, never goes stale.
  const lookupAttempted = accountNumber.length === 10;
  const lookup = lookupAttempted ? lookupBankAccount(accountNumber) : null;

  function resetForm() {
    setAccountNumber("");
    setManualBank("");
    setManualName("");
    setAmount("");
  }

  async function handleSend() {
    if (accountNumber.length !== 10) {
      showToast("Enter a 10-digit account number.", "error");
      return;
    }
    const recipient = lookup ? lookup.accountName : manualName.trim();
    const bank = lookup ? lookup.bankName : manualBank;
    if (!recipient) {
      showToast("Enter the recipient's name.", "error");
      return;
    }
    if (!bank) {
      showToast("Select the recipient's bank.", "error");
      return;
    }
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      showToast("Enter a valid amount.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const record = await apiPost<TransferRecord>("/api/transfers", {
        network: "interbank",
        recipient,
        bank,
        amount: parsedAmount,
      });
      setRecords((prev) => [record, ...prev]);
      setOpen(false);
      resetForm();
      showToast(`₦${parsedAmount.toLocaleString()} sent to ${recipient} at ${bank}.`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Transfer failed. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (!allowed) return null;

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
        onCtaClick={() => {
          resetForm();
          setOpen(true);
        }}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Send to Another Bank">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-700">Account number</label>
            <input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
              placeholder="0123456789"
              inputMode="numeric"
              className="w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
            />
          </div>

          {lookup && (
            <div className="flex items-start gap-2 rounded-lg bg-success/10 px-3 py-2.5 text-sm text-success">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">{lookup.accountName}</p>
                <p className="text-xs">{lookup.bankName}</p>
              </div>
            </div>
          )}

          {lookupAttempted && !lookup && (
            <div className="space-y-4 rounded-lg border border-surface-border p-3">
              <p className="text-xs text-ink-500">
                We couldn&apos;t automatically verify this account — please select the bank.
              </p>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink-700">Bank</label>
                <select
                  value={manualBank}
                  onChange={(e) => setManualBank(e.target.value)}
                  className="w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
                >
                  <option value="">Select a bank</option>
                  {MOCK_BANK_REGISTRY.map((b) => (
                    <option key={b.bankCode} value={b.bankName}>
                      {b.bankName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink-700">Recipient name</label>
                <input
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g. Ada Okafor"
                  className="w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
                />
              </div>
            </div>
          )}

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
