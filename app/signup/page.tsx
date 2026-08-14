"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import {
  createInitialSignupState,
  dashboardPathForRole,
  mockFetchIdentityDetails,
  stepsForRole,
} from "@/lib/onboarding";
import { BusinessInfo, SignupFormState, SignupStep } from "@/lib/types";
import { RoleStep } from "@/components/signup/RoleStep";
import { IdentityStep } from "@/components/signup/IdentityStep";
import { BusinessInfoStep } from "@/components/signup/BusinessInfoStep";
import { SecurityStep } from "@/components/signup/SecurityStep";

const stepLabels: Record<SignupStep, string> = {
  role: "Role",
  identity: "Identity",
  "business-info": "Business Info",
  security: "Security",
};

export default function SignupPage() {
  const router = useRouter();
  const { setUserType, setSignedUpRole } = useApp();
  const { showToast } = useToast();

  const [form, setForm] = useState<SignupFormState>(createInitialSignupState);
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Step list is recomputed from the selected role: Personal skips Business Info.
  const steps = useMemo(() => stepsForRole(form.role), [form.role]);
  const currentStep = steps[Math.min(stepIndex, steps.length - 1)];
  const total = steps.length;

  function updateForm(patch: Partial<SignupFormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function updateBusinessInfo(patch: Partial<BusinessInfo>) {
    setForm((prev) => ({ ...prev, businessInfo: { ...prev.businessInfo, ...patch } }));
  }

  function goNext() {
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }

  function goBack() {
    if (stepIndex === 0) {
      router.push("/welcome");
      return;
    }
    setStepIndex((i) => i - 1);
  }

  async function handleIdentityNext() {
    if (!form.idType) return;
    setSubmitting(true);
    // Mock KYC lookup — resolves with canned details after a short delay.
    await mockFetchIdentityDetails(form.idType, form.idNumber);
    setSubmitting(false);
    goNext();
  }

  function handleComplete() {
    if (!form.role) return;
    const role = form.role;
    setSubmitting(true);
    // Mock account creation — no real backend call.
    setTimeout(() => {
      setSignedUpRole(role);
      setUserType(role);
      setSubmitting(false);
      showToast("Account created — welcome to AppGlobal Payment!");
      router.push(dashboardPathForRole(role));
    }, 900);
  }

  return (
    <div className="min-h-screen bg-navy-950 px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/welcome" className="flex items-center gap-2">
            <Image src="/logo.png" alt="AppGlobal Payment" width={32} height={32} className="rounded-lg" />
            <span className="font-display text-base font-bold text-white">AppGlobal Payment</span>
          </Link>
          <Link href="/login" className="text-sm text-navy-300 hover:text-white">
            Already have an account?
          </Link>
        </div>

        <div className="rounded-2xl bg-surface-card p-6 shadow-panel sm:p-8">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-ink-700">
                Step {stepIndex + 1} of {total}
              </p>
              <p className="text-xs font-medium text-ink-400">{stepLabels[currentStep]}</p>
            </div>
            <div className="flex gap-1.5">
              {steps.map((step, i) => (
                <div
                  key={step}
                  className={clsx(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    i <= stepIndex ? "bg-brand-500" : "bg-surface-border"
                  )}
                />
              ))}
            </div>
          </div>

          {currentStep === "role" && (
            <RoleStep
              value={form.role}
              onChange={(role) => updateForm({ role })}
              onNext={goNext}
              onBack={goBack}
            />
          )}

          {currentStep === "identity" && (
            <IdentityStep
              value={{ idType: form.idType, idNumber: form.idNumber }}
              onChange={(patch) => updateForm(patch)}
              onNext={handleIdentityNext}
              onBack={goBack}
              submitting={submitting}
            />
          )}

          {/*
            Personal users never reach a Business Info OR a standalone "Personal
            Information" screen: stepsForRole() omits "business-info" for them, so
            "identity" advances straight to "security". Personal details come from the
            KYC lookup and are backend-managed — there's nothing for the user to fill in
            here, so no such screen is rendered.
          */}
          {currentStep === "business-info" && (
            <BusinessInfoStep
              value={form.businessInfo}
              onChange={updateBusinessInfo}
              onNext={goNext}
              onBack={goBack}
            />
          )}

          {currentStep === "security" && (
            <SecurityStep
              value={{ passcode: form.passcode, transactionPin: form.transactionPin }}
              onChange={(patch) => updateForm(patch)}
              onComplete={handleComplete}
              onBack={goBack}
              submitting={submitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}
