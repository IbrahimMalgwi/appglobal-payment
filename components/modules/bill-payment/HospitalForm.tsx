"use client";

import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { lookupHospitalAccount } from "@/lib/smart-lookup";
import { billInputClass, billLabelClass, billButtonClass } from "./shared";
import { BillFormProps } from "./types";

export function HospitalForm({ submitting, onSubmit }: BillFormProps) {
  const { showToast } = useToast();
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const lookup = useMemo(
    () => (accountNumber.length === 10 ? lookupHospitalAccount(accountNumber) : null),
    [accountNumber]
  );

  async function handleSubmit() {
    if (!accountNumber.trim()) {
      showToast("Enter the hospital account number.", "error");
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
        <label className={billLabelClass}>Hospital Account Number</label>
        <input
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
          placeholder="10-digit account number"
          inputMode="numeric"
          className={billInputClass}
        />
        {accountNumber.length === 10 && (
          <p className={clsx("mt-1.5 flex items-center gap-1.5 text-xs", lookup ? "text-success" : "text-ink-400")}>
            {lookup ? (
              <>
                <CheckCircle2 size={13} /> Resolved: {lookup.hospitalName}
              </>
            ) : (
              <>
                <AlertCircle size={13} /> Hospital not found, please verify the number.
              </>
            )}
          </p>
        )}
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
        {submitting ? "Processing..." : "Pay Hospital"}
      </button>
    </div>
  );
}
