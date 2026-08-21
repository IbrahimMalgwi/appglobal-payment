"use client";

import { useEffect, useRef, useState } from "react";
import { Download, ImageIcon, Share2, X, Loader2 } from "lucide-react";
import { TransactionReceipt } from "./TransactionReceipt";
import { Transaction } from "@/lib/types";
import { shareFile } from "@/lib/share";
import { useToast } from "@/context/ToastContext";

// html2canvas/jspdf are only needed once a user actually requests a receipt, and touch the
// DOM/canvas APIs — dynamically imported inside the handlers below rather than statically at
// module load, so they never end up in the initial bundle or run during SSR.
async function captureCanvas(node: HTMLElement) {
  const { default: html2canvas } = await import("html2canvas");
  return html2canvas(node, { backgroundColor: "#ffffff", scale: 2 });
}

/**
 * Renders the one shared TransactionReceipt design and offers PDF/Image/Share actions, all
 * derived from the same captured canvas — see Phase 1.2 note: one receipt layout, two export
 * formats, not two separately-built templates.
 */
export function ReceiptModal({
  open,
  onClose,
  transaction,
}: {
  open: boolean;
  onClose: () => void;
  transaction: Transaction;
}) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const [busy, setBusy] = useState<"pdf" | "image" | "share" | null>(null);

  // Same Escape-to-close behavior as components/ui/Modal.tsx — this modal can't reuse that
  // component directly (it needs a wider, receipt-shaped body), but should still feel like
  // every other modal in this app.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function downloadImage() {
    if (!receiptRef.current) return;
    setBusy("image");
    try {
      const canvas = await captureCanvas(receiptRef.current);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `receipt-${transaction.reference}.png`;
      a.click();
      showToast("Receipt image downloaded.");
    } catch {
      showToast("Couldn't generate the receipt image. Please try again.", "error");
    } finally {
      setBusy(null);
    }
  }

  async function downloadPdf() {
    if (!receiptRef.current) return;
    setBusy("pdf");
    try {
      const canvas = await captureCanvas(receiptRef.current);
      const { default: jsPDF } = await import("jspdf");
      const imgData = canvas.toDataURL("image/png");
      const w = canvas.width / 2;
      const h = canvas.height / 2;
      const pdf = new jsPDF({ unit: "px", format: [w, h] });
      pdf.addImage(imgData, "PNG", 0, 0, w, h);
      pdf.save(`receipt-${transaction.reference}.pdf`);
      showToast("Receipt PDF downloaded.");
    } catch {
      showToast("Couldn't generate the receipt PDF. Please try again.", "error");
    } finally {
      setBusy(null);
    }
  }

  async function share() {
    if (!receiptRef.current) return;
    setBusy("share");
    try {
      const canvas = await captureCanvas(receiptRef.current);
      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Couldn't create image blob");
      const file = new File([blob], `receipt-${transaction.reference}.png`, { type: "image/png" });
      const result = await shareFile(file, "Transaction Receipt");
      showToast(result === "shared" ? "Receipt shared." : "Receipt downloaded.");
    } catch {
      showToast("Couldn't share the receipt. Please try again.", "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-navy-950/50 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-surface-card p-6 shadow-panel">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink-900">Receipt</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700">
            <X size={18} />
          </button>
        </div>

        <div className="mb-5 flex justify-center overflow-hidden rounded-xl border border-surface-border">
          <TransactionReceipt ref={receiptRef} transaction={transaction} />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={downloadPdf}
            disabled={!!busy}
            className="flex flex-col items-center gap-1.5 rounded-lg border border-surface-border py-3 text-xs font-semibold text-ink-700 hover:bg-surface disabled:opacity-60"
          >
            {busy === "pdf" ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            PDF
          </button>
          <button
            onClick={downloadImage}
            disabled={!!busy}
            className="flex flex-col items-center gap-1.5 rounded-lg border border-surface-border py-3 text-xs font-semibold text-ink-700 hover:bg-surface disabled:opacity-60"
          >
            {busy === "image" ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
            Image
          </button>
          <button
            onClick={share}
            disabled={!!busy}
            className="flex flex-col items-center gap-1.5 rounded-lg bg-brand-500 py-3 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {busy === "share" ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
