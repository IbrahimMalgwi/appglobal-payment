"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { clsx } from "clsx";
import { ChatMessage } from "@/lib/types";
import { apiPost } from "@/lib/api-client";

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m0",
    from: "bot",
    text: "Hi! I'm the AppGlobal Payment assistant. Ask me about transfers, bills, disputes, or your account.",
    timestamp: new Date().toISOString(),
  },
];

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    const userMessage: ChatMessage = {
      id: `u_${Date.now()}`,
      from: "user",
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    let replyText: string;
    try {
      const data = await apiPost<{ reply: string }>("/api/chat", { message: text });
      replyText = data.reply;
    } catch {
      replyText = "Sorry, I couldn't reach the assistant just now. Please try again.";
    }
    setMessages((prev) => [
      ...prev,
      { id: `b_${Date.now()}`, from: "bot", text: replyText, timestamp: new Date().toISOString() },
    ]);
    setSending(false);
  }

  return (
    <>
      {/* Floating toggle button — fixed bottom-right, safe-area aware for mobile */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-panel transition-transform hover:scale-105 hover:bg-brand-600"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Panel */}
      {open && (
        <div
          className={clsx(
            "fixed z-40 flex flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface-card shadow-panel",
            "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-5",
            "h-[70vh] max-h-[520px] w-[calc(100vw-2.5rem)] max-w-[360px]"
          )}
        >
          <div className="flex items-center justify-between bg-navy-950 px-4 py-3.5">
            <div>
              <p className="text-sm font-semibold text-white">AppGlobal Assistant</p>
              <p className="text-xs text-navy-300">Usually replies instantly</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-navy-300 hover:text-white">
              <X size={18} />
            </button>
          </div>

          <div ref={scrollRef} className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m) => (
              <div key={m.id} className={clsx("flex", m.from === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={clsx(
                    "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    m.from === "user"
                      ? "rounded-br-sm bg-brand-500 text-white"
                      : "rounded-bl-sm bg-surface text-ink-700"
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-surface px-3.5 py-2.5 text-sm text-ink-400">
                  Typing…
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-surface-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 rounded-full border border-surface-border px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
