"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { NetworkPhoneInput } from "./NetworkPhoneInput";
import { billInputClass, billLabelClass, billButtonClass, resolveNetwork } from "./shared";
import { BillFormProps } from "./types";

export function AirtimeForm({ submitting, onSubmit }: BillFormProps) {
  const { showToast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [manualNetwork, setManualNetwork] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const { network } = resolveNetwork(phoneNumber, manualNetwork);

  async function handleSubmit() {
    if (!phoneNumber.trim()) {
      showToast("Enter a phone number.", "error");
      return;
    }
    if (!network) {
      showToast("Select a network to continue.", "error");
      return;
    }
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      showToast("Enter a valid amount.", "error");
      return;
    }
    const ok = await onSubmit({ identifier: phoneNumber, amount: parsedAmount, network });
    if (ok) {
      setPhoneNumber("");
      setManualNetwork(null);
      setAmount("");
    }
  }

  return (
    <div className="space-y-4">
      <NetworkPhoneInput
        phoneNumber={phoneNumber}
        onPhoneNumberChange={setPhoneNumber}
        manualNetwork={manualNetwork}
        onManualNetworkChange={setManualNetwork}
      />
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
        {submitting ? "Processing..." : "Pay Airtime"}
      </button>
    </div>
  );
}
