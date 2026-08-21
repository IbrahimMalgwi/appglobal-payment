"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { electricityProviders, electricityRatePerUnit } from "@/lib/mock-data";
import { formatNaira } from "@/lib/format";
import { OptionButtons, toOptions } from "./OptionButtons";
import { billInputClass, billLabelClass, billButtonClass } from "./shared";
import { BillFormProps } from "./types";

export function ElectricityForm({ submitting, onSubmit }: BillFormProps) {
  const { showToast } = useToast();
  const [provider, setProvider] = useState<string | null>(electricityProviders[0]);
  const [meterNumber, setMeterNumber] = useState("");
  const [units, setUnits] = useState("");
  const parsedUnits = Number(units) || 0;
  const estimatedAmount = parsedUnits * electricityRatePerUnit;

  async function handleSubmit() {
    if (!provider) {
      showToast("Select a provider.", "error");
      return;
    }
    if (!meterNumber.trim()) {
      showToast("Enter your meter number.", "error");
      return;
    }
    if (!parsedUnits || parsedUnits <= 0) {
      showToast("Enter the number of units to buy.", "error");
      return;
    }
    const ok = await onSubmit({ identifier: meterNumber, amount: estimatedAmount });
    if (ok) {
      setMeterNumber("");
      setUnits("");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className={billLabelClass}>Provider</label>
        <OptionButtons options={toOptions(electricityProviders)} selectedId={provider} onSelect={setProvider} columns={3} />
      </div>
      <div>
        <label className={billLabelClass}>Meter number</label>
        <input
          value={meterNumber}
          onChange={(e) => setMeterNumber(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="Enter meter number"
          inputMode="numeric"
          className={billInputClass}
        />
      </div>
      <div>
        <label className={billLabelClass}>Units (kWh)</label>
        <input
          value={units}
          onChange={(e) => setUnits(e.target.value.replace(/[^0-9.]/g, ""))}
          placeholder="e.g. 20"
          inputMode="decimal"
          className={billInputClass}
        />
        <p className="mt-1.5 text-xs text-ink-400">
          Estimated amount: <span className="font-semibold text-ink-600">{formatNaira(estimatedAmount)}</span> (
          {formatNaira(electricityRatePerUnit)}/unit)
        </p>
      </div>
      <button onClick={handleSubmit} disabled={submitting} className={billButtonClass}>
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {submitting ? "Processing..." : "Pay Electricity"}
      </button>
    </div>
  );
}
