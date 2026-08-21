import { forwardRef } from "react";
import Image from "next/image";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Transaction } from "@/lib/types";
import { formatDate, formatNaira } from "@/lib/format";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-dashed border-surface-border py-2 text-sm last:border-0">
      <span className="text-ink-400">{label}</span>
      <span className="text-right font-semibold text-ink-900">{value}</span>
    </div>
  );
}

/**
 * The single visual receipt design this app has — both the PDF and image export reuse this
 * exact rendered element (via html2canvas) rather than each building their own layout. Kept
 * as a plain, un-styled-by-theme card (bg-white/ink text always) since it's meant to be
 * captured as an image/PDF, not to adapt to the app's light/dark chrome.
 */
export const TransactionReceipt = forwardRef<HTMLDivElement, { transaction: Transaction }>(
  function TransactionReceipt({ transaction: t }, ref) {
    const fee = t.fee ?? 0;
    const total = t.amount + fee;

    return (
      <div ref={ref} className="w-[380px] bg-white p-6 text-ink-900">
        <div className="mb-5 flex items-center justify-center gap-2">
          <Image src="/logo.png" alt="AppGlobal Payment" width={28} height={28} className="rounded-lg" />
          <span className="font-display text-base font-bold text-navy-950">
            AppGlobal <span className="text-brand-500">Payment</span>
          </span>
        </div>

        <div className="mb-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            {t.direction === "CREDIT" ? "Money In" : "Money Out"}
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-ink-900">{formatNaira(t.amount)}</p>
          <div className="mt-2 flex justify-center">
            <Badge tone={statusTone(t.status)}>{t.status}</Badge>
          </div>
        </div>

        <div className="mb-4">
          <Row label="Reference" value={t.reference} />
          <Row label="Type" value={t.kind} />
          <Row label="Date" value={formatDate(t.date)} />
          <Row label="Description" value={t.description} />
        </div>

        {t.beneficiary && (
          <div className="mb-4 rounded-lg bg-surface p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">Beneficiary</p>
            <Row label="Name" value={t.beneficiary.name} />
            {t.beneficiary.bankName && <Row label="Bank" value={t.beneficiary.bankName} />}
            {t.beneficiary.accountNumber && <Row label="Account No." value={t.beneficiary.accountNumber} />}
          </div>
        )}

        {t.biller && (
          <div className="mb-4 rounded-lg bg-surface p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">Biller</p>
            <Row label="Biller" value={t.biller.billerName} />
            <Row label="Customer No." value={t.biller.customerNumber} />
            <Row label="Service" value={t.biller.serviceType} />
          </div>
        )}

        <div className="border-t border-surface-border pt-3">
          <Row label="Amount" value={formatNaira(t.amount)} />
          <Row label="Fee" value={formatNaira(fee)} />
          <div className="mt-2 flex items-center justify-between border-t border-surface-border pt-2">
            <span className="text-sm font-semibold text-ink-700">Total</span>
            <span className="font-display text-base font-bold text-ink-900">{formatNaira(total)}</span>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-ink-400">
          This is a system-generated receipt from AppGlobal Payment.
        </p>
      </div>
    );
  }
);
