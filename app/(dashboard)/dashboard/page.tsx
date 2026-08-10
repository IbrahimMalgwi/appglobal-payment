"use client";

import Link from "next/link";
import { Eye, ArrowLeftRight, Smartphone, Landmark, Gift, Users, MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { useApp } from "@/context/AppContext";
import { cashbackBalance, referralBalance, transactions } from "@/lib/mock-data";
import { formatNaira, formatDate } from "@/lib/format";

const quickActions = [
  { label: "Transfers", sub: "Send fast transfers", icon: ArrowLeftRight, href: "/transfers/instant" },
  { label: "Buy Airtime", sub: "Instant top-up", icon: Smartphone, href: "/airtime" },
  { label: "Pay Bills", sub: "Pay your bills", icon: Landmark, href: "/bill-payment" },
];

export default function DashboardPage() {
  const { userType, selectedAccount, userName } = useApp();
  const recent = transactions.slice(0, 5);

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${userName.split(" ")[0]}`}
        description={
          userType === "business" && selectedAccount
            ? `Viewing ${selectedAccount.businessName}`
            : "Here's what's happening with your account"
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Balance card */}
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-md bg-brand-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-brand-600">
              {userType === "business" ? "Business Account" : "Personal Account"}
            </span>
            <MoreVertical size={18} className="text-ink-300" />
          </div>
          <div className="mb-1 flex items-center gap-2">
            <span className="font-display text-3xl font-extrabold text-ink-900">
              {formatNaira(userType === "business" ? selectedAccount?.balance ?? 0 : 128_450.75)}
            </span>
            <Eye size={18} className="text-ink-400" />
          </div>
          <p className="text-sm text-ink-400">Available balance</p>
          <div className="mt-5 flex items-center gap-8 border-t border-surface-border pt-4">
            <div>
              <p className="text-xs text-ink-400">Account number</p>
              <p className="text-sm font-semibold text-ink-900">
                {userType === "business" ? selectedAccount?.accountNumber : "5888494452"}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink-400">Account name</p>
              <p className="text-sm font-semibold text-ink-900">
                {userType === "business" ? selectedAccount?.businessName : userName}
              </p>
            </div>
          </div>
        </Card>

        {/* Cashback / referral */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1">
          <Card className="p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15">
              <Gift size={18} className="text-accent-500" />
            </div>
            <p className="text-sm text-ink-400">Cashback balance</p>
            <p className="mt-1 font-display text-xl font-bold text-ink-900">{formatNaira(cashbackBalance)}</p>
          </Card>
          <Card className="p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
              <Users size={18} className="text-brand-500" />
            </div>
            <p className="text-sm text-ink-400">Referral balance</p>
            <p className="mt-1 font-display text-xl font-bold text-ink-900">{formatNaira(referralBalance)}</p>
          </Card>
        </div>
      </div>

      {/* Quick actions */}
      <h2 className="mb-3 mt-8 font-display text-base font-bold text-ink-900">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:max-w-xl">
        {quickActions.map((qa) => (
          <Link
            key={qa.label}
            href={qa.href}
            className="flex flex-col items-center gap-2 rounded-2xl border border-surface-border bg-surface-card p-5 text-center shadow-card hover:border-brand-300"
          >
            <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-600">
              <qa.icon size={20} />
            </span>
            <span className="text-sm font-semibold text-ink-900">{qa.label}</span>
            <span className="text-xs text-ink-400">{qa.sub}</span>
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      <h2 className="mb-3 mt-8 font-display text-base font-bold text-ink-900">Recent Activity</h2>
      <Card>
        <ul>
          {recent.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between border-b border-surface-border/70 px-5 py-4 last:border-0"
            >
              <div>
                <p className="text-sm font-semibold text-ink-900">{t.description}</p>
                <p className="text-xs text-ink-400">{formatDate(t.date)}</p>
              </div>
              <span className={`text-sm font-semibold ${t.direction === "CREDIT" ? "text-success" : "text-ink-900"}`}>
                {t.direction === "CREDIT" ? "+" : "-"}
                {formatNaira(t.amount)}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
