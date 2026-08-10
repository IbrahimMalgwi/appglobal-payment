"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Search, LogOut } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatNaira, initials } from "@/lib/format";
import Image from "next/image";

export default function SelectAccountPage() {
  const { accounts, selectAccount, userName, userEmail } = useApp();
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filtered = accounts.filter((a) =>
    a.businessName.toLowerCase().includes(query.toLowerCase())
  );

  function handleSelect(id: string) {
    selectAccount(id);
    router.push("/dashboard");
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-navy-950 lg:grid-cols-[1.3fr_1fr]">
      {/* Left: business list */}
      <div className="flex flex-col px-6 py-10 lg:px-16">
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="AppGlobal Payment" width={32} height={32} className="rounded-lg" />
            <span className="font-display text-base font-bold text-white">AppGlobal Payment</span>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-1.5 text-sm text-navy-300 hover:text-white"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>

        <div className="mb-6 flex items-center gap-2">
          <h1 className="font-display text-2xl font-bold text-white">All Businesses</h1>
          <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-bold text-navy-950">
            {accounts.length}
          </span>
        </div>

        <div className="relative mb-6 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-300" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for business"
            className="w-full rounded-xl border border-white/10 bg-white/[0.06] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-navy-300 focus:border-brand-400 focus:outline-none"
          />
        </div>

        <div className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((acc) => (
            <button
              key={acc.id}
              onClick={() => handleSelect(acc.id)}
              className="group rounded-2xl bg-white p-5 text-left shadow-panel transition-transform hover:-translate-y-0.5"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-surface-border text-sm font-bold text-ink-700">
                  {initials(acc.businessName)}
                </span>
                <ChevronRight size={18} className="text-ink-400 group-hover:text-brand-500" />
              </div>
              <p className="font-display text-sm font-bold text-ink-900">{acc.businessName}</p>
              <span className="mt-1 inline-block rounded-md bg-success/10 px-2 py-0.5 text-[11px] font-bold text-success">
                {acc.category}
              </span>
              <p className="mt-2 text-xs leading-relaxed text-ink-400">{acc.address}</p>
              <p className="mt-2 text-xs font-semibold text-ink-500">{formatNaira(acc.balance)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Right: owner profile */}
      <div className="hidden flex-col items-center justify-center border-l border-white/5 bg-navy-900 px-10 py-10 text-center lg:flex">
        <span className="mb-5 grid h-20 w-20 place-items-center rounded-full bg-white/10 text-2xl font-bold text-white">
          {initials(userName)}
        </span>
        <p className="text-xs font-semibold uppercase tracking-wide text-navy-300">Business Owner</p>
        <h2 className="mt-1 font-display text-2xl font-bold text-white">{userName}</h2>
        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-navy-300">Email</p>
        <p className="mt-1 text-sm text-navy-100">{userEmail}</p>
        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-navy-300">Number of businesses</p>
        <p className="mt-1 font-display text-lg font-bold text-white">{accounts.length} Businesses</p>
      </div>
    </div>
  );
}
