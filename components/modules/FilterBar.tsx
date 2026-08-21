"use client";

import { X } from "lucide-react";
import { DateRangeFilter, DateRangeFilterValue } from "./DateRangeFilter";
import { dateRangeLabel } from "@/lib/date-range";

export interface FilterFieldOption {
  value: string;
  label: string;
}

export interface FilterFieldDef {
  key: string;
  /** Chip prefix and the "All ..." placeholder text, e.g. "Agent" -> "All agents". */
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterFieldOption[];
}

export interface FilterBarProps {
  dateRange: { value: DateRangeFilterValue; onChange: (v: DateRangeFilterValue) => void };
  fields: FilterFieldDef[];
  /**
   * The single "reset everything" action. Callers own this rather than FilterBar looping each
   * field's onChange itself — for lib/filter-state.ts's URL-backed pages, every onChange is its
   * own router.push, so firing several in a row in the same tick would race (each reads the
   * same stale search-param string, so only the last one sticks). Pass useFilterParams()'s
   * clearAll for those pages; for plain useState-backed filters, a function that resets each
   * piece of state directly is fine since setState calls batch safely.
   */
  onClearAll: () => void;
}

const ALL = "ALL";

/**
 * One filter bar used across personal/business transaction history and every ARO/BDO
 * reporting page: a date-range control (with "All Time"), any number of select fields, active
 * filters rendered as removable chips, and a single "Clear all". Callers own where the values
 * come from — pass lib/filter-state.ts's useFilterParams() output for URL-persisted filters, or
 * plain useState for a page that doesn't need persistence.
 */
export function FilterBar({ dateRange, fields, onClearAll }: FilterBarProps) {
  const activeFields = fields.filter((f) => f.value !== ALL && f.value !== "");
  const hasActiveFilters = activeFields.length > 0 || dateRange.value.key !== "allTime";

  return (
    <div className="mb-5 rounded-2xl border border-surface-border bg-surface-card p-4">
      <div className="flex flex-wrap items-center gap-3">
        <DateRangeFilter value={dateRange.value} onChange={dateRange.onChange} />
        {fields.map((f) => (
          <select
            key={f.key}
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            className="rounded-lg border border-surface-border bg-surface-card px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
          >
            <option value={ALL}>All {f.label.toLowerCase()}s</option>
            {f.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-surface-border pt-3">
        <Chip label={`Date: ${dateRangeLabel(dateRange.value.key)}`} onClear={() => dateRange.onChange({ key: "allTime" })} />
        {activeFields.map((f) => (
          <Chip
            key={f.key}
            label={`${f.label}: ${f.options.find((o) => o.value === f.value)?.label ?? f.value}`}
            onClear={() => f.onChange(ALL)}
          />
        ))}
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="ml-auto text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-brand-50 py-1 pl-3 pr-1.5 text-xs font-semibold text-brand-600">
      {label}
      <button
        onClick={onClear}
        aria-label={`Clear ${label}`}
        className="grid h-4 w-4 place-items-center rounded-full hover:bg-brand-100"
      >
        <X size={11} />
      </button>
    </span>
  );
}
