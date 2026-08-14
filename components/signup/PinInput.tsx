"use client";

import { useRef } from "react";
import { clsx } from "clsx";

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  length: number;
  ariaLabel?: string;
  /** Masks digits (password dots). Defaults to true for PIN/passcode; OTP passes false. */
  masked?: boolean;
}

/**
 * Boxed OTP-style numeric input shared by the passcode, transaction-PIN, and OTP fields.
 * Auto-advances focus on entry, steps back on backspace when the box is empty, and supports
 * pasting a full code across all boxes.
 */
export function PinInput({ value, onChange, length, ariaLabel, masked = true }: PinInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    // Focus the next empty box, or the last box when the code is complete.
    inputs.current[Math.min(pasted.length, length - 1)]?.focus();
  }

  function setDigit(index: number, digit: string) {
    const chars = value.split("");
    chars[index] = digit;
    // Rebuild a clean string capped at `length`, no stray gaps.
    const next = chars.join("").replace(/[^0-9]/g, "").slice(0, length);
    onChange(next);
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/[^0-9]/g, "").slice(-1);
    if (!digit) return;
    setDigit(index, digit);
    if (index < length - 1) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[index]) {
        setDigit(index, "");
      } else if (index > 0) {
        inputs.current[index - 1]?.focus();
        setDigit(index - 1, "");
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  return (
    <div className="flex gap-2 sm:gap-3" role="group" aria-label={ariaLabel}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type={masked ? "password" : "text"}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          aria-label={`${ariaLabel ?? "Digit"} ${i + 1}`}
          className={clsx(
            "h-12 w-full max-w-[3.25rem] rounded-xl border text-center font-display text-lg font-bold text-ink-900 focus:outline-none",
            value[i]
              ? "border-brand-500 bg-brand-50"
              : "border-surface-border bg-white focus:border-brand-400"
          )}
        />
      ))}
    </div>
  );
}
