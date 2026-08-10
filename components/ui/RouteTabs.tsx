"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

export interface RouteTabDef {
  href: string;
  label: string;
  badge?: string | number;
}

export function RouteTabs({ tabs }: { tabs: RouteTabDef[] }) {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 border-b border-surface-border">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
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
            {isActive && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-500" />}
          </Link>
        );
      })}
    </div>
  );
}
