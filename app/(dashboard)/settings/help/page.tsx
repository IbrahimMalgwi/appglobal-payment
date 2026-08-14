"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, MessageCircle, HelpCircle, ShieldAlert, ChevronDown, ChevronRight, Loader2, Send, Inbox } from "lucide-react";
import { clsx } from "clsx";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { SettingsTabs } from "@/components/settings/SettingsTabs";
import { faqs, supportInfo } from "@/lib/mock-data";
import { SupportMessage } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { useToast } from "@/context/ToastContext";
import { apiPost } from "@/lib/api-client";

export default function HelpSupportPage() {
  const { showToast } = useToast();

  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  async function handleSend() {
    if (!draft.trim()) {
      showToast("Type a message before sending.", "error");
      return;
    }
    setSending(true);
    try {
      const message = await apiPost<SupportMessage>("/api/support/messages", { text: draft });
      setMessages((prev) => [message, ...prev]);
      setChatOpen(false);
      setDraft("");
      showToast("Message sent — our support team will reply shortly.");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Couldn't send your message. Please try again.", "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <PageHeader title="Settings" description="Your account details, limits, security, and support." />
      <SettingsTabs />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Call Us */}
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <Phone size={18} />
            </span>
            <h2 className="font-display text-base font-bold text-ink-900">Call Us</h2>
          </div>
          <p className="text-sm text-ink-500">Speak to our support team directly.</p>
          <a
            href={`tel:${supportInfo.phone.replace(/\s/g, "")}`}
            className="mt-3 block font-display text-lg font-bold text-ink-900"
          >
            {supportInfo.phone}
          </a>
          <p className="mt-1 text-xs text-ink-400">{supportInfo.hours}</p>
          <p className="mt-1 text-xs text-ink-400">{supportInfo.email}</p>
        </Card>

        {/* Chat With Us */}
        <Card className="flex flex-col p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <MessageCircle size={18} />
            </span>
            <h2 className="font-display text-base font-bold text-ink-900">Chat With Us</h2>
          </div>

          <div className="flex-1">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1.5 py-8 text-center">
                <Inbox size={26} className="text-ink-300" />
                <p className="text-sm font-semibold text-ink-700">No Messages</p>
                <p className="text-xs text-ink-400">Start a conversation with our support team.</p>
              </div>
            ) : (
              <ul className="space-y-2 py-2">
                {messages.map((m) => (
                  <li key={m.id} className="rounded-lg bg-surface p-3">
                    <p className="text-sm text-ink-800">{m.text}</p>
                    <p className="mt-1 text-xs text-ink-400">{formatDate(m.date)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={() => setChatOpen(true)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            <Send size={15} /> Send Us A Message
          </button>
        </Card>

        {/* FAQs */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <HelpCircle size={18} />
            </span>
            <h2 className="font-display text-base font-bold text-ink-900">FAQs</h2>
          </div>
          <div className="divide-y divide-surface-border">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={faq.question} className="py-1">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-3 py-3 text-left"
                  >
                    <span className="text-sm font-semibold text-ink-900">{faq.question}</span>
                    <ChevronDown
                      size={16}
                      className={clsx("shrink-0 text-ink-400 transition-transform", isOpen && "rotate-180")}
                    />
                  </button>
                  {isOpen && <p className="pb-3 text-sm text-ink-500">{faq.answer}</p>}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Dispute */}
        <Link href="/dispute" className="lg:col-span-2">
          <Card className="flex items-center gap-4 p-5 hover:border-brand-300">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <ShieldAlert size={18} />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-ink-900">Dispute a transaction</span>
              <span className="block text-xs text-ink-400">Raise an issue with a POS transaction or withdrawal.</span>
            </span>
            <ChevronRight size={18} className="text-ink-300" />
          </Card>
        </Link>
      </div>

      <Modal open={chatOpen} onClose={() => setChatOpen(false)} title="Send Us A Message">
        <div className="space-y-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="How can we help?"
            rows={4}
            className="w-full resize-none rounded-lg border border-surface-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
          />
          <button
            onClick={handleSend}
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
