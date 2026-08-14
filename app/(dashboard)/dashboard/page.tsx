"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, ArrowLeftRight, Landmark, Gift, Users, MoreVertical, Phone, MessageCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { useApp } from "@/context/AppContext";
import { assignedAro, cashbackBalance, personalAccount, referralBalance, transactions } from "@/lib/mock-data";
import { formatNaira, formatDate, initials } from "@/lib/format";
import { useRequireAccess } from "@/components/access/RequireAccess";
import { useToast } from "@/context/ToastContext";
import { apiPost } from "@/lib/api-client";

const quickActions = [
  { label: "Transfers", sub: "Send fast transfers", icon: ArrowLeftRight, href: "/transfers/apppay" },
  { label: "Pay Bills", sub: "Airtime, data & bills", icon: Landmark, href: "/bill-payment" },
];

export default function DashboardPage() {
  const allowed = useRequireAccess("dashboard");
  const { userType, selectedAccount, userName } = useApp();
  const { showToast } = useToast();
  const recent = transactions.slice(0, 5);

  const [messageOpen, setMessageOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSendMessage() {
    if (!message.trim()) {
      showToast("Type a message before sending.", "error");
      return;
    }
    setSending(true);
    try {
      await apiPost("/api/messages/aro", { text: message });
      setMessageOpen(false);
      setMessage("");
      showToast(`Message sent to ${assignedAro.name}.`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Couldn't send your message. Please try again.", "error");
    } finally {
      setSending(false);
    }
  }

  if (!allowed) return null;

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
              {formatNaira(userType === "business" ? selectedAccount?.balance ?? 0 : personalAccount.availableBalance)}
            </span>
            <Eye size={18} className="text-ink-400" />
          </div>
          <p className="text-sm text-ink-400">Available balance</p>
          <div className="mt-5 flex items-center gap-8 border-t border-surface-border pt-4">
            <div>
              <p className="text-xs text-ink-400">Account number</p>
              <p className="text-sm font-semibold text-ink-900">
                {userType === "business" ? selectedAccount?.accountNumber : personalAccount.accountNumber}
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
          <Link href="/earn?tab=cashback">
            <Card className="p-5 hover:border-brand-300">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15">
                <Gift size={18} className="text-accent-500" />
              </div>
              <p className="text-sm text-ink-400">Cashback balance</p>
              <p className="mt-1 font-display text-xl font-bold text-ink-900">{formatNaira(cashbackBalance)}</p>
            </Card>
          </Link>
          <Link href="/earn?tab=referral">
            <Card className="p-5 hover:border-brand-300">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
                <Users size={18} className="text-brand-500" />
              </div>
              <p className="text-sm text-ink-400">Referral balance</p>
              <p className="mt-1 font-display text-xl font-bold text-ink-900">{formatNaira(referralBalance)}</p>
            </Card>
          </Link>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Quick actions */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 font-display text-base font-bold text-ink-900">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4 sm:max-w-md">
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
        </div>

        {/* ARO card */}
        <div>
          <h2 className="mb-3 font-display text-base font-bold text-ink-900">
            Your Agent Relationship Officer
          </h2>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-navy-900 text-sm font-bold text-white">
                {initials(assignedAro.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-900">{assignedAro.name}</p>
                <p className="text-xs text-ink-400">{assignedAro.phone}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a
                href={`tel:${assignedAro.phone.replace(/\s/g, "")}`}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-surface-border py-2 text-xs font-semibold text-ink-700 hover:bg-surface"
              >
                <Phone size={14} /> Call
              </a>
              <button
                onClick={() => setMessageOpen(true)}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-brand-500 py-2 text-xs font-semibold text-white hover:bg-brand-600"
              >
                <MessageCircle size={14} /> Message
              </button>
            </div>
          </Card>
        </div>
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

      <Modal open={messageOpen} onClose={() => setMessageOpen(false)} title={`Message ${assignedAro.name}`}>
        <div className="space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a message to your Agent Relationship Officer"
            rows={4}
            className="w-full resize-none rounded-lg border border-surface-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={sending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-70"
          >
            {sending && <Loader2 size={16} className="animate-spin" />}
            {sending ? "Sending..." : "Send Message"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
