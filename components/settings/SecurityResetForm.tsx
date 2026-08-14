"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/context/ToastContext";
import { useApp } from "@/context/AppContext";
import { apiPost } from "@/lib/api-client";
import { getAccountDetailsForUser } from "@/lib/mock-data";
import { sendMockOtp, maskDestination } from "@/lib/mock-otp";
import { OtpVerification } from "@/components/auth/OtpVerification";

const inputClass =
  "w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none";

/**
 * Shared Current / New / Confirm reset form used by both the Reset Transaction PIN and
 * Reset Passcode flows. The form is gated behind an OTP step: on submit we validate, "send"
 * a mock OTP, and only run the actual reset once the code is verified.
 */
export function SecurityResetForm({
  kind,
  title,
  fieldLabel,
  numeric = true,
  maxLength,
}: {
  kind: "pin" | "passcode";
  title: string;
  fieldLabel: string;
  numeric?: boolean;
  maxLength?: number;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const { userType } = useApp();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");

  const destination = maskDestination(getAccountDetailsForUser(userType)[0]?.phone ?? "");

  function clean(v: string) {
    return numeric ? v.replace(/[^0-9]/g, "") : v;
  }

  function issueOtp() {
    const code = sendMockOtp(destination);
    setOtp(code);
    showToast(`Demo OTP for testing: ${code}`, "success");
  }

  function handleContinue() {
    if (!current.trim() || !next.trim() || !confirm.trim()) {
      showToast("Fill in all fields to continue.", "error");
      return;
    }
    if (next !== confirm) {
      showToast("New entry and confirmation don't match.", "error");
      return;
    }
    // Gate the reset behind OTP — the actual reset runs only after the code is verified.
    issueOtp();
    setStep("otp");
  }

  async function handleVerifiedReset(code: string) {
    if (code !== otp) {
      showToast("Incorrect code, try again.", "error");
      throw new Error("incorrect-otp");
    }
    try {
      await apiPost("/api/security/reset", { kind, current, next, confirm });
      showToast(`${title} successful.`);
      router.push("/settings/security");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Couldn't update. Please try again.", "error");
      throw e; // keep the user on the OTP step so they can retry
    }
  }

  return (
    <div>
      <PageHeader title={title} description="Keep your account secure with a strong, private code." />

      <button
        onClick={() => (step === "otp" ? setStep("form") : router.push("/settings/security"))}
        className="mb-4 flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        <ChevronLeft size={15} /> {step === "otp" ? "Back" : "Back to Security"}
      </button>

      <Card className="max-w-md p-6">
        {step === "otp" ? (
          <>
            <h2 className="mb-1 font-display text-lg font-bold text-ink-900">Verify it&apos;s you</h2>
            <p className="mb-5 text-sm text-ink-500">
              Confirm the one-time code to finish resetting your {fieldLabel.toLowerCase()}.
            </p>
            <OtpVerification
              length={4}
              destination={destination}
              onVerify={handleVerifiedReset}
              onResend={issueOtp}
            />
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-700">Current {fieldLabel}</label>
              <input
                type="password"
                inputMode={numeric ? "numeric" : "text"}
                maxLength={maxLength}
                value={current}
                onChange={(e) => setCurrent(clean(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-700">New {fieldLabel}</label>
              <input
                type="password"
                inputMode={numeric ? "numeric" : "text"}
                maxLength={maxLength}
                value={next}
                onChange={(e) => setNext(clean(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-700">Confirm new {fieldLabel}</label>
              <input
                type="password"
                inputMode={numeric ? "numeric" : "text"}
                maxLength={maxLength}
                value={confirm}
                onChange={(e) => setConfirm(clean(e.target.value))}
                className={inputClass}
              />
            </div>
            <button
              onClick={handleContinue}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Continue
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
