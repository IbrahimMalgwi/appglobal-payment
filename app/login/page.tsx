"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function LoginPage() {
  const { setUserType } = useApp();

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-navy-900 p-8 shadow-panel">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 font-display text-sm font-bold text-white">
            AG
          </div>
          <span className="font-display text-lg font-bold text-white">AppGlobal Payment</span>
        </div>
        <h1 className="mb-1 font-display text-xl font-bold text-white">Welcome back</h1>
        <p className="mb-6 text-sm text-navy-300">Choose a demo profile to continue.</p>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            onClick={() => setUserType("personal")}
            className="block rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white hover:border-brand-400"
          >
            Continue as Personal user
          </Link>
          <Link
            href="/select-account"
            onClick={() => setUserType("business")}
            className="block rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Continue as Business user
          </Link>
        </div>
      </div>
    </div>
  );
}
