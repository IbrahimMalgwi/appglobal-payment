// Shared date-range resolution used by every filterable ARO/BDO dashboard page (Overview,
// Agent Performance, POS Performance, Commissions, Referrals, ...). Keeps "what does
// 'This month' mean" defined in exactly one place.

export type DateRangeKey =
  | "allTime"
  | "today"
  | "yesterday"
  | "thisWeek"
  | "thisMonth"
  | "previousMonth"
  | "thisQuarter"
  | "custom";

export interface DateRangeOption {
  key: DateRangeKey;
  label: string;
}

export const dateRangeOptions: DateRangeOption[] = [
  { key: "allTime", label: "All Time" },
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "thisWeek", label: "This week" },
  { key: "thisMonth", label: "This month" },
  { key: "previousMonth", label: "Previous month" },
  { key: "thisQuarter", label: "This quarter" },
  { key: "custom", label: "Custom" },
];

export function dateRangeLabel(key: DateRangeKey): string {
  return dateRangeOptions.find((o) => o.key === key)?.label ?? key;
}

export interface ResolvedDateRange {
  start: Date;
  end: Date;
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

/**
 * Resolves a DateRangeKey (plus optional custom bounds) to a concrete { start, end } window,
 * or `undefined` for "All Time" — genuinely unconstrained, not a huge synthetic range. Every
 * aggregation function in lib/aro-analytics.ts already treats an absent dateRange as "don't
 * filter by date", so `undefined` is the correct "no constraint" value throughout this app.
 * "custom" with no bounds picked yet falls back to the last 30 days, so callers never have to
 * null-check the result while the user is still choosing dates.
 */
export function resolveDateRange(key: DateRangeKey, custom?: { start: Date; end: Date }): ResolvedDateRange | undefined {
  const now = new Date();

  if (key === "allTime") {
    return undefined;
  }

  if (key === "custom" && custom) {
    return { start: startOfDay(custom.start), end: endOfDay(custom.end) };
  }

  if (key === "today") {
    return { start: startOfDay(now), end: endOfDay(now) };
  }

  if (key === "yesterday") {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    return { start: startOfDay(y), end: endOfDay(y) };
  }

  if (key === "thisWeek") {
    const start = new Date(now);
    const day = start.getDay(); // 0 = Sunday
    const diffToMonday = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - diffToMonday);
    return { start: startOfDay(start), end: endOfDay(now) };
  }

  if (key === "thisMonth") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start: startOfDay(start), end: endOfDay(now) };
  }

  if (key === "previousMonth") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { start: startOfDay(start), end: endOfDay(end) };
  }

  if (key === "thisQuarter") {
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
    const start = new Date(now.getFullYear(), quarterStartMonth, 1);
    return { start: startOfDay(start), end: endOfDay(now) };
  }

  // "custom" with no bounds supplied yet — default to a sensible last-30-days window.
  const fallbackStart = new Date(now);
  fallbackStart.setDate(fallbackStart.getDate() - 30);
  return { start: startOfDay(fallbackStart), end: endOfDay(now) };
}

export function isWithinRange(iso: string, range: ResolvedDateRange | undefined | null): boolean {
  if (!range) return true; // All Time / no constraint
  const t = new Date(iso).getTime();
  return t >= range.start.getTime() && t <= range.end.getTime();
}
