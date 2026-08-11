"use client";

import { Bell, Settings, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { AccountSwitcher } from "./AccountSwitcher";
import { useApp } from "@/context/AppContext";
import { initials, userTypeLabel } from "@/lib/format";

export function Topbar() {
  const { userName, userType, openMobileNav } = useApp();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-surface-border bg-surface-card/90 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={openMobileNav}
          aria-label="Open menu"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-500 hover:bg-surface lg:hidden"
        >
          <Menu size={20} />
        </button>
        <AccountSwitcher />
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-4">
        <button
          aria-label="Notifications"
          className="grid h-9 w-9 place-items-center rounded-full text-ink-500 hover:bg-surface"
        >
          <Bell size={18} />
        </button>
        <button
          aria-label="Settings"
          className="hidden h-9 w-9 place-items-center rounded-full text-ink-500 hover:bg-surface sm:grid"
        >
          <Settings size={18} />
        </button>
        <Link
          href="/login"
          aria-label="Log out"
          className="grid h-9 w-9 place-items-center rounded-full text-ink-500 hover:bg-surface"
        >
          <LogOut size={18} />
        </Link>
        <div className="ml-1 hidden items-center gap-2.5 border-l border-surface-border pl-4 md:flex">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-navy-900 text-xs font-bold text-white">
            {initials(userName)}
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-ink-900">{userName}</span>
            <span className="block text-xs text-ink-400">{userTypeLabel(userType)} user</span>
          </span>
        </div>
      </div>
    </header>
  );
}
