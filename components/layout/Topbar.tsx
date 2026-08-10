"use client";

import { Bell, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { AccountSwitcher } from "./AccountSwitcher";
import { useApp } from "@/context/AppContext";
import { initials } from "@/lib/format";

export function Topbar() {
  const { userName, userEmail, userType } = useApp();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-surface-border bg-surface-card/90 px-6 backdrop-blur">
      <div className="flex items-center gap-4">
        <AccountSwitcher />
      </div>

      <div className="flex items-center gap-4">
        <button
          aria-label="Notifications"
          className="grid h-9 w-9 place-items-center rounded-full text-ink-500 hover:bg-surface"
        >
          <Bell size={18} />
        </button>
        <button
          aria-label="Settings"
          className="grid h-9 w-9 place-items-center rounded-full text-ink-500 hover:bg-surface"
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
            <span className="block text-xs capitalize text-ink-400">{userType} user</span>
          </span>
        </div>
      </div>
    </header>
  );
}
