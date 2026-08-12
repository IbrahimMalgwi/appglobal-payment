"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { dashboardPathForRole } from "@/lib/onboarding";
import { UserType } from "@/lib/types";

export default function LoginPage() {
  const { setUserType, signedUpRole } = useApp();
  const { showToast } = useToast();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [passcode, setPasscode] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim() || !passcode.trim()) {
      showToast("Enter your email or phone and passcode to continue.", "error");
      return;
    }
    // No backend: route to the dashboard for the role captured during sign-up.
    const role = signedUpRole ?? "personal";
    setUserType(role);
    router.push(dashboardPathForRole(role));
  }

  // Quick-switch shortcut used for reviewing the app — demoted below the real form.
  function quickAccess(role: UserType) {
    setUserType(role);
    router.push(dashboardPathForRole(role));
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-navy-900 p-8 shadow-panel">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg">
            <Image src="/logo.png" alt="AppGlobal Payment" width={36} height={36} className="rounded-lg" />
          </div>
          <span className="font-display text-lg font-bold text-white">AppGlobal Payment</span>
        </div>
        <h1 className="mb-1 font-display text-xl font-bold text-white">Welcome back</h1>
        <p className="mb-6 text-sm text-navy-300">Log in to continue to your dashboard.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-100">Email or phone</label>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-sm text-white placeholder:text-navy-300 focus:border-brand-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-100">Passcode</label>
            <input
              type="password"
              inputMode="numeric"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="••••••"
              className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-sm text-white placeholder:text-navy-300 focus:border-brand-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="block w-full rounded-xl bg-brand-500 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-600"
          >
            Login
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-navy-300">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-brand-400 hover:text-brand-300">
            Create an account
          </Link>
        </p>

        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-navy-300">
            or jump straight into a demo profile
          </p>
          <div className="space-y-3">
            <button
              onClick={() => quickAccess("personal")}
              className="block w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-left text-sm font-semibold text-white hover:border-brand-400"
            >
              Continue as Personal user
            </button>
            <button
              onClick={() => quickAccess("business")}
              className="block w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-left text-sm font-semibold text-white hover:border-brand-400"
            >
              Continue as Business user
            </button>
            <button
              onClick={() => quickAccess("aro")}
              className="block w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-left text-sm font-semibold text-white hover:border-brand-400"
            >
              Continue as Agent Relationship Officer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
