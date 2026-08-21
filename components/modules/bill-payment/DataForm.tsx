"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { dataBundles } from "@/lib/mock-data";
import { formatNaira } from "@/lib/format";
import { NetworkPhoneInput } from "./NetworkPhoneInput";
import { PricedOptionPicker } from "./PricedOptionPicker";
import { billLabelClass, billButtonClass, resolveNetwork } from "./shared";
import { BillFormProps } from "./types";

export function DataForm({ submitting, onSubmit }: BillFormProps) {
  const { showToast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [manualNetwork, setManualNetwork] = useState<string | null>(null);
  const [bundleId, setBundleId] = useState<string | null>(null);
  const { network } = resolveNetwork(phoneNumber, manualNetwork);
  const selectedBundle = dataBundles.find((b) => b.id === bundleId) ?? null;

  async function handleSubmit() {
    if (!phoneNumber.trim()) {
      showToast("Enter a phone number.", "error");
      return;
    }
    if (!network) {
      showToast("Select a network to continue.", "error");
      return;
    }
    if (!selectedBundle) {
      showToast("Select a data bundle.", "error");
      return;
    }
    const ok = await onSubmit({ identifier: phoneNumber, amount: selectedBundle.price, network });
    if (ok) {
      setPhoneNumber("");
      setManualNetwork(null);
      setBundleId(null);
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
        <label className={billLabelClass}>Data bundle</label>
        <PricedOptionPicker options={dataBundles} selectedId={bundleId} onSelect={(o) => setBundleId(o.id)} />
      </div>
      <button onClick={handleSubmit} disabled={submitting} className={billButtonClass}>
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {submitting ? "Processing..." : selectedBundle ? `Pay ${formatNaira(selectedBundle.price)}` : "Pay Data"}
      </button>
    </div>
  );
}
