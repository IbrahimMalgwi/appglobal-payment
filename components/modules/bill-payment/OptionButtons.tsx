"use client";

import { clsx } from "clsx";

export interface SelectableOption {
  id: string;
  label: string;
}

// Reused for every plain "pick one of these" selector (Electricity/Cable TV/Internet
// provider, Education service type) — same selected/unselected styling as the category
// picker and network selector above it on the page.
export function OptionButtons({
  options,
  selectedId,
  onSelect,
  columns = 3,
}: {
  options: SelectableOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  columns?: 2 | 3 | 4;
}) {
  return (
    <div
      className={clsx(
        "grid gap-2",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-3",
        columns === 4 && "grid-cols-4"
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onSelect(opt.id)}
          className={clsx(
            "rounded-lg border px-2 py-2.5 text-xs font-semibold transition-colors",
            selectedId === opt.id
              ? "border-brand-500 bg-brand-50 text-brand-600"
              : "border-surface-border text-ink-600 hover:border-brand-200"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// Small helper for the common case of a provider list that's just an array of names.
export function toOptions(names: readonly string[]): SelectableOption[] {
  return names.map((name) => ({ id: name, label: name }));
}
