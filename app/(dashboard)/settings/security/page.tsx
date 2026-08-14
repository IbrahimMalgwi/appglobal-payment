"use client";

import Link from "next/link";
import { KeyRound, Lock, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { SettingsTabs } from "@/components/settings/SettingsTabs";

export default function SecurityPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Your account details, limits, security, and support." />
      <SettingsTabs />

      <Card className="max-w-2xl divide-y divide-surface-border">
        <Link
          href="/settings/security/pin"
          className="flex items-center gap-4 px-5 py-4 hover:bg-surface/60"
        >
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600">
            <KeyRound size={18} />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-semibold text-ink-900">Reset Transaction PIN</span>
            <span className="block text-xs text-ink-400">Change the 4-digit PIN used to authorize payments.</span>
          </span>
          <ChevronRight size={18} className="text-ink-300" />
        </Link>

        <Link
          href="/settings/security/passcode"
          className="flex items-center gap-4 px-5 py-4 hover:bg-surface/60"
        >
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600">
            <Lock size={18} />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-semibold text-ink-900">Reset Passcode</span>
            <span className="block text-xs text-ink-400">Change the passcode you use to log in.</span>
          </span>
          <ChevronRight size={18} className="text-ink-300" />
        </Link>
      </Card>
    </div>
  );
}
