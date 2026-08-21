"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { billInputClass, billLabelClass, billButtonClass } from "./shared";
import { BillFormProps } from "./types";

// Fallback for the "Other" category — no dedicated flow was requested for it, so it keeps
// the original generic account/meter number + amount shape.
export function OtherForm({ submitting, onSubmit }: BillFormProps) {
  const { showToast } = useToast();
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");

  async function handleSubmit() {
    if (!accountNumber.trim()) {
      showToast("Enter an account or meter number.", "error");
      return;
    }
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      showToast("Enter a valid amount.", "error");
      return;
    }
    const ok = await onSubmit({ identifier: accountNumber, amount: parsedAmount });
    if (ok) {
      setAccountNumber("");
      setAmount("");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className={billLabelClass}>Account / meter number</label>
        <input
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder="Enter number"
          className={billInputClass}
        />
      </div>
      <div>
        <label className={billLabelClass}>Amount</label>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          placeholder="0.00"
          inputMode="decimal"
          className={billInputClass}
        />
      </div>
      <button onClick={handleSubmit} disabled={submitting} className={billButtonClass}>
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {submitting ? "Processing..." : "Pay"}
      </button>
    </div>
  );
}
