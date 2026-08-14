"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { PinInput } from "./PinInput";

const PASSCODE_LENGTH = 6;
const PIN_LENGTH = 4;

interface SecurityValue {
  passcode: string;
  transactionPin: string;
}

interface SecurityStepProps {
  value: SecurityValue;
  onChange: (value: Partial<SecurityValue>) => void;
  onComplete: () => void;
  onBack: () => void;
  submitting: boolean;
}

export function SecurityStep({ value, onChange, onComplete, onBack, submitting }: SecurityStepProps) {
  // Confirmation values are transient — they never leave this step.
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const passcodeComplete = value.passcode.length === PASSCODE_LENGTH;
  const passcodeMatches = passcodeComplete && value.passcode === confirmPasscode;
  const pinComplete = value.transactionPin.length === PIN_LENGTH;
  const pinMatches = pinComplete && value.transactionPin === confirmPin;
  const canComplete = passcodeMatches && pinMatches;

  const passcodeMismatch = confirmPasscode.length === PASSCODE_LENGTH && !passcodeMatches;
  const pinMismatch = confirmPin.length === PIN_LENGTH && !pinMatches;

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-ink-900">Secure your account</h2>
      <p className="mt-1 text-sm text-ink-500">
        Set a login passcode and a transaction PIN. You&apos;ll use these to sign in and authorize payments.
      </p>

      <div className="mt-6 space-y-6">
        <div className="space-y-4 rounded-2xl border border-surface-border p-4 sm:p-5">
          <p className="text-sm font-semibold text-ink-700">Login passcode</p>
          <div>
            <span className="mb-2 block text-xs font-medium text-ink-500">
              Enter a {PASSCODE_LENGTH}-digit passcode
            </span>
            <PinInput
              value={value.passcode}
              onChange={(v) => onChange({ passcode: v })}
              length={PASSCODE_LENGTH}
              ariaLabel="Passcode digit"
            />
          </div>
          <div>
            <span className="mb-2 block text-xs font-medium text-ink-500">Confirm passcode</span>
            <PinInput
              value={confirmPasscode}
              onChange={setConfirmPasscode}
              length={PASSCODE_LENGTH}
              ariaLabel="Confirm passcode digit"
            />
            {passcodeMismatch && (
              <p className="mt-2 text-xs font-medium text-danger">Passcodes don&apos;t match.</p>
            )}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-surface-border p-4 sm:p-5">
          <p className="text-sm font-semibold text-ink-700">Transaction PIN</p>
          <div>
            <span className="mb-2 block text-xs font-medium text-ink-500">
              Enter a {PIN_LENGTH}-digit PIN
            </span>
            <PinInput
              value={value.transactionPin}
              onChange={(v) => onChange({ transactionPin: v })}
              length={PIN_LENGTH}
              ariaLabel="Transaction PIN digit"
            />
          </div>
          <div>
            <span className="mb-2 block text-xs font-medium text-ink-500">Confirm PIN</span>
            <PinInput
              value={confirmPin}
              onChange={setConfirmPin}
              length={PIN_LENGTH}
              ariaLabel="Confirm transaction PIN digit"
            />
            {pinMismatch && <p className="mt-2 text-xs font-medium text-danger">PINs don&apos;t match.</p>}
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="rounded-xl border border-surface-border px-5 py-3 text-sm font-semibold text-ink-700 hover:bg-surface-alt disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onComplete}
          disabled={!canComplete || submitting}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Creating your account..." : "Complete Sign Up"}
        </button>
      </div>
    </div>
  );
}
