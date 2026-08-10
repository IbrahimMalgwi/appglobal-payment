"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Briefcase } from "lucide-react";
import { clsx } from "clsx";
import { useApp } from "@/context/AppContext";
import { initials } from "@/lib/format";

export function AccountSwitcher() {
  const { accounts, selectedAccount, selectAccount, userType } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (userType !== "business" || accounts.length === 0) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 rounded-xl border border-surface-border bg-surface-card px-3 py-2 text-sm font-semibold text-ink-700 shadow-sm hover:border-brand-300"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-600">
          {selectedAccount ? initials(selectedAccount.businessName) : <Briefcase size={14} />}
        </span>
        <span className="hidden max-w-[160px] truncate sm:inline">
          {selectedAccount?.businessName ?? "Switch business"}
        </span>
        <ChevronDown size={16} className="text-ink-400" />
      </button>

      {open && (
        <div className="absolute left-0 z-30 mt-2 w-80 overflow-hidden rounded-2xl border border-surface-border bg-surface-card shadow-panel">
          <p className="px-4 pt-3.5 pb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
            Your businesses
          </p>
          <ul className="max-h-72 overflow-y-auto">
            {accounts.map((acc) => (
              <li key={acc.id}>
                <button
                  onClick={() => {
                    selectAccount(acc.id);
                    setOpen(false);
                  }}
                  className={clsx(
                    "flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-surface",
                    acc.id === selectedAccount?.id && "bg-brand-50/60"
                  )}
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">
                    {initials(acc.businessName)}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-ink-900">{acc.businessName}</span>
                      {acc.id === selectedAccount?.id && <Check size={14} className="shrink-0 text-brand-600" />}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-ink-400">
                      Acct. No {acc.accountNumber}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
