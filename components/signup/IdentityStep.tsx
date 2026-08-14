"use client";

import { Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { IdType } from "@/lib/types";

interface IdentityValue {
  idType: IdType | null;
  idNumber: string;
}

interface IdentityStepProps {
  value: IdentityValue;
  onChange: (value: Partial<IdentityValue>) => void;
  onNext: () => void;
  onBack: () => void;
  submitting: boolean;
}

const options: IdType[] = ["BVN", "NIN"];

export function IdentityStep({ value, onChange, onNext, onBack, submitting }: IdentityStepProps) {
  const valid = !!value.idType && value.idNumber.length === 11;

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-ink-900">Verify your identity</h2>
      <p className="mt-1 text-sm text-ink-500">
        Enter your BVN or NIN. We use it to confirm your details — nothing is shared without your consent.
      </p>

      <div className="mt-6">
        <span className="mb-1.5 block text-sm font-semibold text-ink-700">Identification type</span>
        <div className="grid grid-cols-2 gap-2">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange({ idType: opt })}
              className={clsx(
                "rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors",
                value.idType === opt
                  ? "border-brand-500 bg-brand-50 text-brand-600"
                  : "border-surface-border text-ink-600 hover:border-brand-200"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-semibold text-ink-700">
          {value.idType ?? "BVN / NIN"} number
        </label>
        <input
          value={value.idNumber}
          onChange={(e) => onChange({ idNumber: e.target.value.replace(/[^0-9]/g, "").slice(0, 11) })}
          placeholder="11-digit number"
          inputMode="numeric"
          className="w-full rounded-xl border border-surface-border px-3.5 py-2.5 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
        />
        <p className="mt-1.5 text-xs text-ink-400">{value.idNumber.length}/11 digits</p>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="rounded-xl border border-surface-border px-5 py-3 text-sm font-semibold text-ink-700 hover:bg-surface-alt disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!valid || submitting}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Verifying..." : "Next"}
        </button>
      </div>
    </div>
  );
}
