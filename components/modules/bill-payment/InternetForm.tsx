"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { internetProviders } from "@/lib/mock-data";
import { OptionButtons, toOptions } from "./OptionButtons";
import { billInputClass, billLabelClass, billButtonClass } from "./shared";
import { BillFormProps } from "./types";

export function InternetForm({ submitting, onSubmit }: BillFormProps) {
  const { showToast } = useToast();
  const [provider, setProvider] = useState<string | null>(internetProviders[0]);
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");

  async function handleSubmit() {
    if (!provider) {
      showToast("Select a provider.", "error");
      return;
    }
    if (!customerId.trim()) {
      showToast("Enter your customer/account ID.", "error");
      return;
    }
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      showToast("Enter a valid amount.", "error");
      return;
    }
    const ok = await onSubmit({ identifier: customerId, amount: parsedAmount });
    if (ok) {
      setCustomerId("");
      setAmount("");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className={billLabelClass}>Provider</label>
        <OptionButtons options={toOptions(internetProviders)} selectedId={provider} onSelect={setProvider} columns={3} />
      </div>
      <div>
        <label className={billLabelClass}>Customer / Account ID</label>
        <input
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          placeholder="Enter customer or account ID"
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
        {submitting ? "Processing..." : "Pay Internet"}
      </button>
    </div>
  );
}
