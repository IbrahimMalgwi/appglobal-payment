"use client";

// Shared filter-state hook: keeps every filter field (plus the date range) in the URL's
// search params instead of component state, so navigating from a filtered list to a detail
// view and back (e.g. ARO agent-performance table -> agent profile -> back) doesn't reset the
// filters — the state lives in the URL, not in a useState that unmounts with the page.
// Must be called from a component rendered under a <Suspense> boundary (same requirement as
// any other useSearchParams() call in this app — see DisputeContent/AgentProfileContent).

import { useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { DateRangeFilterValue } from "@/components/modules/DateRangeFilter";
import { DateRangeKey } from "./date-range";

export interface UseFilterParamsResult<K extends string> {
  values: Record<K, string>;
  setValue: (key: K, value: string) => void;
  /**
   * Set several fields at once in a single navigation — required for cascading resets (e.g.
   * picking a new agent also resets the account/POS-terminal fields). Calling setValue multiple
   * times in the same handler would race: each call reads the search-param string from the
   * current render's closure, so several calls in one tick all read the same stale string and
   * only the last router.push sticks. This applies them all against one snapshot instead.
   */
  setValues: (patch: Partial<Record<K, string>>) => void;
  dateRange: DateRangeFilterValue;
  setDateRange: (value: DateRangeFilterValue) => void;
  clearAll: () => void;
  clearOne: (key: K | "dateRange") => void;
}

const ALL = "ALL";

export function useFilterParams<K extends string>(
  fieldKeys: readonly K[],
  dateRangeDefault: DateRangeKey = "allTime"
): UseFilterParamsResult<K> {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const values = useMemo(() => {
    const out = {} as Record<K, string>;
    fieldKeys.forEach((k) => {
      out[k] = searchParams.get(k) ?? ALL;
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsString, fieldKeys]);

  const dateRange = useMemo<DateRangeFilterValue>(() => {
    const key = (searchParams.get("dateRange") as DateRangeKey | null) ?? dateRangeDefault;
    const start = searchParams.get("dateStart");
    const end = searchParams.get("dateEnd");
    if (key === "custom" && start && end) {
      return { key, custom: { start: new Date(start), end: new Date(end) } };
    }
    return { key };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsString, dateRangeDefault]);

  const updateParams = useCallback(
    (mutator: (p: URLSearchParams) => void) => {
      const p = new URLSearchParams(searchParamsString);
      mutator(p);
      const qs = p.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParamsString]
  );

  const setValue = useCallback(
    (key: K, value: string) => {
      updateParams((p) => {
        if (!value || value === ALL) p.delete(key);
        else p.set(key, value);
      });
    },
    [updateParams]
  );

  const setValues = useCallback(
    (patch: Partial<Record<K, string>>) => {
      updateParams((p) => {
        Object.entries(patch).forEach(([key, value]) => {
          if (!value || value === ALL) p.delete(key);
          else p.set(key, value as string);
        });
      });
    },
    [updateParams]
  );

  const setDateRange = useCallback(
    (value: DateRangeFilterValue) => {
      updateParams((p) => {
        if (value.key === dateRangeDefault) p.delete("dateRange");
        else p.set("dateRange", value.key);
        if (value.key === "custom" && value.custom) {
          p.set("dateStart", value.custom.start.toISOString().slice(0, 10));
          p.set("dateEnd", value.custom.end.toISOString().slice(0, 10));
        } else {
          p.delete("dateStart");
          p.delete("dateEnd");
        }
      });
    },
    [updateParams, dateRangeDefault]
  );

  const clearOne = useCallback(
    (key: K | "dateRange") => {
      if (key === "dateRange") {
        setDateRange({ key: dateRangeDefault });
      } else {
        setValue(key, ALL);
      }
    },
    [setDateRange, setValue, dateRangeDefault]
  );

  const clearAll = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  return { values, setValue, setValues, dateRange, setDateRange, clearAll, clearOne };
}
