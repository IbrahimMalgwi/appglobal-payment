"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { educationServices } from "@/lib/mock-data";
import { OptionButtons } from "./OptionButtons";
import { billInputClass, billLabelClass, billButtonClass } from "./shared";
import { BillFormProps } from "./types";

export function EducationForm({ submitting, onSubmit }: BillFormProps) {
  const { showToast } = useToast();
  const [serviceId, setServiceId] = useState(educationServices[0].id);
  const service = educationServices.find((s) => s.id === serviceId) ?? educationServices[0];
  const [identifier, setIdentifier] = useState("");
  const [amount, setAmount] = useState(String(service.suggestedAmount));

  // Switching service type resets the identifier and re-suggests the amount for that service —
  // the identifier field's label also changes to match (e.g. "JAMB Registration Number").
  const [prevServiceId, setPrevServiceId] = useState(serviceId);
  if (serviceId !== prevServiceId) {
    setPrevServiceId(serviceId);
    setIdentifier("");
    setAmount(String(service.suggestedAmount));
  }

  async function handleSubmit() {
    if (!identifier.trim()) {
      showToast(`Enter the ${service.identifierLabel.toLowerCase()}.`, "error");
      return;
    }
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      showToast("Enter a valid amount.", "error");
      return;
    }
    const ok = await onSubmit({ identifier, amount: parsedAmount });
    if (ok) {
      setIdentifier("");
      setAmount(String(service.suggestedAmount));
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className={billLabelClass}>Service type</label>
        <OptionButtons
          options={educationServices.map((s) => ({ id: s.id, label: s.label }))}
          selectedId={serviceId}
          onSelect={setServiceId}
          columns={2}
        />
      </div>
      <div>
        <label className={billLabelClass}>{service.identifierLabel}</label>
        <input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder={`Enter ${service.identifierLabel.toLowerCase()}`}
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
