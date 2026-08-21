"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { dateRangeOptions, DateRangeKey, resolveDateRange, ResolvedDateRange } from "@/lib/date-range";

export interface DateRangeFilterValue {
  key: DateRangeKey;
  custom?: { start: Date; end: Date };
}

/**
 * Single reusable date-range control used across every ARO/BDO dashboard page. Resolves to
 * a concrete { start, end } window via lib/date-range.ts — callers pass that into their
 * aggregation function (getAgentPerformanceRows, getAroPortfolioSummary, etc.) rather than
 * reimplementing range logic per page.
 */
export function DateRangeFilter({
  value,
  onChange,
}: {
  value: DateRangeFilterValue;
  onChange: (value: DateRangeFilterValue) => void;
}) {
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  function handleKeyChange(key: DateRangeKey) {
    if (key === "custom" && customStart && customEnd) {
      onChange({ key, custom: { start: new Date(customStart), end: new Date(customEnd) } });
    } else {
      onChange({ key });
    }
  }

  function applyCustom() {
    if (!customStart || !customEnd) return;
    onChange({ key: "custom", custom: { start: new Date(customStart), end: new Date(customEnd) } });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Calendar size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <select
          value={value.key}
          onChange={(e) => handleKeyChange(e.target.value as DateRangeKey)}
          className="rounded-lg border border-surface-border bg-surface-card py-2.5 pl-9 pr-3 text-sm focus:border-brand-400 focus:outline-none"
        >
          {dateRangeOptions.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {value.key === "custom" && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="rounded-lg border border-surface-border bg-surface-card px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
          />
          <span className="text-xs text-ink-400">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="rounded-lg border border-surface-border bg-surface-card px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
          />
          <button
            onClick={applyCustom}
            className="rounded-lg bg-brand-500 px-3 py-2.5 text-xs font-semibold text-white hover:bg-brand-600"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

export function useResolvedDateRange(value: DateRangeFilterValue): ResolvedDateRange | undefined {
  return resolveDateRange(value.key, value.custom);
}
