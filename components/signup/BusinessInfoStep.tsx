"use client";

import { Plus, Trash2 } from "lucide-react";
import { BusinessInfo, DirectorInfo } from "@/lib/types";
import { FileUploadField } from "./FileUploadField";

interface BusinessInfoStepProps {
  value: BusinessInfo;
  onChange: (value: Partial<BusinessInfo>) => void;
  onNext: () => void;
  onBack: () => void;
}

function isValid(info: BusinessInfo): boolean {
  const textFilled =
    info.businessName.trim() !== "" &&
    info.registeredAddress.trim() !== "" &&
    info.cacNumber.trim() !== "";
  const hasCompleteDirector = info.directors.some(
    (d) => d.name.trim() !== "" && d.designation.trim() !== ""
  );
  const filesReady = !!info.certificateOfIncorporation && !!info.boardResolution;
  return textFilled && hasCompleteDirector && filesReady;
}

const inputClass =
  "w-full rounded-xl border border-surface-border px-3.5 py-2.5 text-sm text-ink-900 focus:border-brand-400 focus:outline-none";

export function BusinessInfoStep({ value, onChange, onNext, onBack }: BusinessInfoStepProps) {
  function updateDirector(index: number, patch: Partial<DirectorInfo>) {
    const directors = value.directors.map((d, i) => (i === index ? { ...d, ...patch } : d));
    onChange({ directors });
  }

  function addDirector() {
    onChange({ directors: [...value.directors, { name: "", designation: "" }] });
  }

  function removeDirector(index: number) {
    onChange({ directors: value.directors.filter((_, i) => i !== index) });
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-ink-900">Business information</h2>
      <p className="mt-1 text-sm text-ink-500">
        Tell us about your registered business so we can complete your KYB checks.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700">Business name</label>
          <input
            value={value.businessName}
            onChange={(e) => onChange({ businessName: e.target.value })}
            placeholder="e.g. Doe Retail Ventures"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700">
            Registered business address
          </label>
          <input
            value={value.registeredAddress}
            onChange={(e) => onChange({ registeredAddress: e.target.value })}
            placeholder="Street, city, state"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700">
            CAC registration number
          </label>
          <input
            value={value.cacNumber}
            onChange={(e) => onChange({ cacNumber: e.target.value })}
            placeholder="e.g. RC1234567"
            className={inputClass}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-ink-700">Board of Directors</span>
            <button
              type="button"
              onClick={addDirector}
              className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              <Plus size={14} /> Add director
            </button>
          </div>
          <div className="space-y-3">
            {value.directors.map((director, index) => (
              <div key={index} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  value={director.name}
                  onChange={(e) => updateDirector(index, { name: e.target.value })}
                  placeholder="Full name"
                  className={inputClass}
                />
                <input
                  value={director.designation}
                  onChange={(e) => updateDirector(index, { designation: e.target.value })}
                  placeholder="Designation"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => removeDirector(index)}
                  disabled={value.directors.length === 1}
                  aria-label="Remove director"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-surface-border text-ink-400 hover:text-danger disabled:opacity-40"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FileUploadField
            label="Certificate of Incorporation"
            file={value.certificateOfIncorporation}
            onChange={(file) => onChange({ certificateOfIncorporation: file })}
          />
          <FileUploadField
            label="Board Resolution"
            file={value.boardResolution}
            onChange={(file) => onChange({ boardResolution: file })}
          />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-surface-border px-5 py-3 text-sm font-semibold text-ink-700 hover:bg-surface-alt"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid(value)}
          className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
