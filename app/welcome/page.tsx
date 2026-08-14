"use client";

import Image from "next/image";
import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-navy-900 p-8 shadow-panel">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg">
            <Image src="/logo.png" alt="AppGlobal Payment" width={36} height={36} className="rounded-lg" />
          </div>
          <span className="font-display text-lg font-bold text-white">AppGlobal Payment</span>
        </div>
        <h1 className="mb-1 font-display text-xl font-bold text-white">Welcome</h1>
        <p className="mb-6 text-sm text-navy-300">
          Personal and business payments, transfers, and account management — all in one place.
        </p>

        <div className="space-y-3">
          <Link
            href="/signup"
            className="block rounded-xl bg-brand-500 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-600"
          >
            Sign Up
          </Link>
          <Link
            href="/login"
            className="block rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm font-semibold text-white hover:border-brand-400"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
