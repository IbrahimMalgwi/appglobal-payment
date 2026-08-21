"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter, notFound } from "next/navigation";
import { ArrowLeft, ShieldAlert, Receipt as ReceiptIcon, Landmark, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge, statusTone } from "@/components/ui/Badge";
import { ReceiptModal } from "@/components/modules/ReceiptModal";
import { getTransactionById, isDisputable } from "@/lib/mock-data";
import { formatDate, formatNaira } from "@/lib/format";
import { useRequireAccess } from "@/components/access/RequireAccess";

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 border-b border-surface-border/70 py-3 last:border-0">
      <span className="text-sm text-ink-400">{label}</span>
      <span className="text-right text-sm font-semibold text-ink-900">{value}</span>
    </div>
  );
}

export default function TransactionDetailsPage() {
  const allowed = useRequireAccess("transactions");
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [receiptOpen, setReceiptOpen] = useState(false);

  if (!allowed) return null;

  const transaction = getTransactionById(params.id);
  if (!transaction) return notFound();

  const fee = transaction.fee ?? 0;
  const total = transaction.amount + fee;
  // Every dispute raised from a transaction's own details page is a "transaction" dispute —
  // distinct from the "pos"/"withdrawal"/"card" categories a business account picks manually
  // when they aren't disputing one specific transaction (see the Dispute page's type picker).
  const disputeHref = `/dispute?prefillOpen=1&prefillType=transaction&prefillReference=${encodeURIComponent(
    transaction.reference
  )}&prefillAmount=${transaction.amount}`;

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        <ArrowLeft size={15} /> Back
      </button>
      <PageHeader title="Transaction Details" description="Full details for this transaction." />

      <Card className="mb-5 p-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            {transaction.direction === "CREDIT" ? "Money In" : "Money Out"}
          </p>
          <p className="mt-1 font-display text-3xl font-bold text-ink-900">{formatNaira(transaction.amount)}</p>
          <div className="mt-3 flex justify-center">
            <Badge tone={statusTone(transaction.status)}>{transaction.status}</Badge>
          </div>
        </div>

        <div className="mt-6 border-t border-surface-border pt-2">
          <DetailRow label="Reference" value={transaction.reference} />
          <DetailRow label="Type" value={transaction.kind} />
          <DetailRow label="Date & time" value={formatDate(transaction.date)} />
          <DetailRow label="Description" value={transaction.description} />
          <DetailRow label="Amount" value={formatNaira(transaction.amount)} />
          <DetailRow label="Fee" value={formatNaira(fee)} />
          <DetailRow label="Total" value={formatNaira(total)} />
        </div>
      </Card>

      {transaction.beneficiary && (
        <Card className="mb-5 p-5">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-700">
            <Landmark size={16} /> Beneficiary
          </p>
          <DetailRow label="Name" value={transaction.beneficiary.name} />
          <DetailRow label="Bank" value={transaction.beneficiary.bankName} />
          <DetailRow label="Bank code" value={transaction.beneficiary.bankCode} />
          <DetailRow label="Account number" value={transaction.beneficiary.accountNumber} />
        </Card>
      )}

      {transaction.biller && (
        <Card className="mb-5 p-5">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-700">
            <FileText size={16} /> Biller
          </p>
          <DetailRow label="Biller" value={transaction.biller.billerName} />
          <DetailRow label="Customer number" value={transaction.biller.customerNumber} />
          <DetailRow label="Service" value={transaction.biller.serviceType} />
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setReceiptOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-surface-border px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-surface"
        >
          <ReceiptIcon size={16} /> View Receipt
        </button>
        {isDisputable(transaction) && (
          <Link
            href={disputeHref}
            className="flex items-center gap-1.5 rounded-lg border border-danger/30 px-4 py-2.5 text-sm font-semibold text-danger hover:bg-danger/10"
          >
            <ShieldAlert size={16} /> Raise Dispute
          </Link>
        )}
      </div>

      <ReceiptModal open={receiptOpen} onClose={() => setReceiptOpen(false)} transaction={transaction} />
    </div>
  );
}
