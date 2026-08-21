"use client";

import { clsx } from "clsx";
import { PricedOption } from "@/lib/types";
import { formatNaira } from "@/lib/format";

// The shared "pick from priced options" pattern behind both the Data bundle picker and the
// Cable TV package picker — selecting an option sets the amount, there's no manual amount
// field alongside it.
export function PricedOptionPicker({
  options,
  selectedId,
  onSelect,
  columns = 2,
}: {
  options: PricedOption[];
  selectedId: string | null;
  onSelect: (option: PricedOption) => void;
  columns?: 2 | 3;
}) {
  return (
    <div className={clsx("grid gap-2", columns === 3 ? "grid-cols-3" : "grid-cols-2")}>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onSelect(opt)}
          className={clsx(
            "flex flex-col items-center gap-1 rounded-xl border px-3 py-3 text-xs font-semibold transition-colors",
            selectedId === opt.id
              ? "border-brand-500 bg-brand-50 text-brand-600"
              : "border-surface-border text-ink-600 hover:border-brand-200"
          )}
        >
          <span>{opt.label}</span>
          <span className="text-[11px] font-normal text-ink-400">{formatNaira(opt.price)}</span>
        </button>
      ))}
    </div>
  );
}
