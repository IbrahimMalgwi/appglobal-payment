"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { clsx } from "clsx";

export interface TabDef {
  key: string;
  label: string;
  badge?: string | number;
}

export function Tabs({
  tabs,
  paramKey = "tab",
  defaultTab,
}: {
  tabs: TabDef[];
  paramKey?: string;
  defaultTab?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get(paramKey) ?? defaultTab ?? tabs[0]?.key;

  function setTab(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramKey, key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-1 border-b border-surface-border">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            onClick={() => setTab(tab.key)}
            className={clsx(
              "relative flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors",
              isActive ? "text-brand-600" : "text-ink-500 hover:text-ink-700"
            )}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={clsx(
                  "rounded-full px-1.5 py-0.5 text-[11px] font-bold",
                  isActive ? "bg-brand-500 text-white" : "bg-ink-400/10 text-ink-500"
                )}
              >
                {tab.badge}
              </span>
            )}
            {isActive && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function useActiveTab(paramKey = "tab", defaultTab?: string) {
  const searchParams = useSearchParams();
  return searchParams.get(paramKey) ?? defaultTab;
}
