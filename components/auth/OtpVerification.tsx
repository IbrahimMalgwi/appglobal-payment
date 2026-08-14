"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { PinInput } from "@/components/signup/PinInput";

interface OtpVerificationProps {
  length?: number;
  destination: string;
  onVerify: (code: string) => void | Promise<void>;
  onResend: () => void;
  resendCooldownSeconds?: number;
  /** "light" for on-card use (Settings); "dark" for the navy login screen. */
  tone?: "light" | "dark";
}

function mmss(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * Reusable OTP step: boxed digit entry + resend cooldown + verify button. Used by the login,
 * reset-passcode, and reset-PIN flows. The caller owns the expected code and compares it inside
 * onVerify — a rejected/thrown onVerify means "wrong code", which clears the boxes here.
 */
export function OtpVerification({
  length = 6,
  destination,
  onVerify,
  onResend,
  resendCooldownSeconds = 60,
  tone = "light",
}: OtpVerificationProps) {
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(resendCooldownSeconds);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const filled = code.length === length;
  const dark = tone === "dark";

  async function handleVerify() {
    if (!filled || verifying) return;
    setVerifying(true);
    try {
      await onVerify(code);
      // Success: the caller navigates/advances (this component usually unmounts).
    } catch {
      setCode(""); // Wrong code — clear the boxes and let the user try again.
    } finally {
      setVerifying(false);
    }
  }

  function handleResend() {
    onResend();
    setCode("");
    setCooldown(resendCooldownSeconds);
  }

  return (
    <div className="w-full">
      <p className={clsx("text-sm", dark ? "text-navy-300" : "text-ink-500")}>Enter the code sent to</p>
      <p className={clsx("mb-4 text-sm font-semibold", dark ? "text-white" : "text-ink-900")}>{destination}</p>

      <PinInput value={code} onChange={setCode} length={length} masked={false} ariaLabel="OTP digit" />

      <div className={clsx("mt-4 text-sm", dark ? "text-navy-300" : "text-ink-500")}>
        {cooldown > 0 ? (
          <span>Didn&apos;t get a code? Resend OTP in {mmss(cooldown)}</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className={clsx(
              "font-semibold",
              dark ? "text-brand-400 hover:text-brand-300" : "text-brand-600 hover:text-brand-700"
            )}
          >
            Resend OTP
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={handleVerify}
        disabled={!filled || verifying}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
      >
        {verifying && <Loader2 size={16} className="animate-spin" />}
        {verifying ? "Verifying..." : "Verify"}
      </button>
    </div>
  );
}
