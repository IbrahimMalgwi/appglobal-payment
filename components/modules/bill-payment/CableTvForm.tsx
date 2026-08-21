"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { cableProviders, cablePackages, CableProvider } from "@/lib/mock-data";
import { formatNaira } from "@/lib/format";
import { OptionButtons, toOptions } from "./OptionButtons";
import { PricedOptionPicker } from "./PricedOptionPicker";
import { billInputClass, billLabelClass, billButtonClass } from "./shared";
import { BillFormProps } from "./types";

export function CableTvForm({ submitting, onSubmit }: BillFormProps) {
  const { showToast } = useToast();
  const [provider, setProvider] = useState<CableProvider>(cableProviders[0]);
  const [packageId, setPackageId] = useState<string | null>(null);
  const [smartCardNumber, setSmartCardNumber] = useState("");
  const packages = cablePackages[provider];
  const selectedPackage = packages.find((p) => p.id === packageId) ?? null;

  // A package picked under one provider doesn't carry over when the provider changes.
  const [prevProvider, setPrevProvider] = useState(provider);
  if (provider !== prevProvider) {
    setPrevProvider(provider);
    setPackageId(null);
  }

  async function handleSubmit() {
    if (!smartCardNumber.trim()) {
      showToast("Enter your Smart Card / IUC number.", "error");
      return;
    }
    if (!selectedPackage) {
      showToast("Select a package.", "error");
      return;
    }
    const ok = await onSubmit({ identifier: smartCardNumber, amount: selectedPackage.price });
    if (ok) {
      setSmartCardNumber("");
      setPackageId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className={billLabelClass}>Provider</label>
        <OptionButtons
          options={toOptions(cableProviders)}
          selectedId={provider}
          onSelect={(id) => setProvider(id as CableProvider)}
          columns={3}
        />
      </div>
      <div>
        <label className={billLabelClass}>Package</label>
        <PricedOptionPicker options={packages} selectedId={packageId} onSelect={(o) => setPackageId(o.id)} columns={3} />
      </div>
      <div>
        <label className={billLabelClass}>Smart Card / IUC Number</label>
        <input
          value={smartCardNumber}
          onChange={(e) => setSmartCardNumber(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="Enter Smart Card / IUC number"
          inputMode="numeric"
          className={billInputClass}
        />
      </div>
      <button onClick={handleSubmit} disabled={submitting} className={billButtonClass}>
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {submitting ? "Processing..." : selectedPackage ? `Pay ${formatNaira(selectedPackage.price)}` : "Pay Cable TV"}
      </button>
    </div>
  );
}
