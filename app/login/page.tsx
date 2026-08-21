"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { dashboardPathForRole } from "@/lib/onboarding";
import { sendMockOtp, maskDestination } from "@/lib/mock-otp";
import { DEMO_USERS, findDemoUser } from "@/lib/demo-users";
import { OtpVerification } from "@/components/auth/OtpVerification";
import { FaceVerification } from "@/components/auth/FaceVerification";
import { getTrustedDevice, trustThisDevice, REQUIRE_FACE_VERIFICATION_EVERY_LOGIN } from "@/lib/device-trust";
import { UserType } from "@/lib/types";

export default function LoginPage() {
  const { setUserType, signedUpRole } = useApp();
  const { showToast } = useToast();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [passcode, setPasscode] = useState("");

  // In-page steps (no separate routes — there's no backend to persist a partial login).
  // "otp" is the standard post-credentials code. "face" is the new-device check that runs
  // after OTP succeeds, unless this browser already has a trusted-device record. "otp-fallback"
  // reruns the OTP step as an alternate proof of identity if the camera can't be used.
  const [step, setStep] = useState<"credentials" | "otp" | "face" | "otp-fallback">("credentials");
  const [otp, setOtp] = useState("");
  const [pendingRole, setPendingRole] = useState<UserType>("personal");

  function issueOtp() {
    const code = sendMockOtp(identifier);
    setOtp(code);
    showToast(`Demo OTP for testing: ${code}`, "success");
  }

  function finishLogin(role: UserType) {
    setUserType(role);
    router.push(dashboardPathForRole(role));
  }

  function quickFillDemo(email: string) {
    setIdentifier(email);
    setPasscode("123456");
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim() || !passcode.trim()) {
      showToast("Enter your email and password to continue.", "error");
      return;
    }

    // No real backend: validate against the fixed demo accounts. A user who just came
    // through the sign-up wizard (signedUpRole set, no matching demo account) can still
    // log back in with whatever they set up.
    const demo = findDemoUser(identifier);
    let role: UserType;
    if (demo) {
      if (passcode !== demo.password) {
        showToast("Incorrect email or password.", "error");
        return;
      }
      role = demo.role;
    } else if (signedUpRole) {
      role = signedUpRole;
    } else {
      showToast("We couldn't find an account with those details. Try one of the demo accounts below.", "error");
      return;
    }

    setPendingRole(role);
    issueOtp();
    setStep("otp");
  }

  function completeOtp(code: string) {
    if (code !== otp) {
      showToast("Incorrect code, try again.", "error");
      throw new Error("incorrect-otp");
    }
    // Known device: OTP alone is enough, same as before this feature existed.
    // (Temporarily disabled while REQUIRE_FACE_VERIFICATION_EVERY_LOGIN is on — see lib/device-trust.ts.)
    if (!REQUIRE_FACE_VERIFICATION_EVERY_LOGIN && getTrustedDevice()) {
      finishLogin(pendingRole);
      return;
    }
    // New/unrecognized device (or every-login testing mode): a face-verification check before
    // we let them in.
    setStep("face");
  }

  function completeOtpFallback(code: string) {
    if (code !== otp) {
      showToast("Incorrect code, try again.", "error");
      throw new Error("incorrect-otp");
    }
    trustThisDevice();
    finishLogin(pendingRole);
  }

  function handleFaceSuccess() {
    trustThisDevice();
    finishLogin(pendingRole);
  }

  function handleFaceFallback() {
    issueOtp();
    setStep("otp-fallback");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-navy-900 p-8 shadow-panel">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg">
            <Image src="/logo.png" alt="AppGlobal Payment" width={36} height={36} className="rounded-lg" />
          </div>
          <span className="font-display text-lg font-bold text-white">AppGlobal Payment</span>
        </div>

        {step === "otp" || step === "otp-fallback" ? (
          <>
            <button
              onClick={() => setStep(step === "otp-fallback" ? "face" : "credentials")}
              className="mb-4 flex items-center gap-1 text-sm font-semibold text-brand-400 hover:text-brand-300"
            >
              <ChevronLeft size={15} /> Back
            </button>
            <h1 className="mb-1 font-display text-xl font-bold text-white">Verify it&apos;s you</h1>
            <p className="mb-6 text-sm text-navy-300">
              {step === "otp-fallback"
                ? "Enter the code to verify this device without your camera."
                : "We sent a one-time code to keep your account secure."}
            </p>
            <OtpVerification
              length={4}
              destination={maskDestination(identifier)}
              onVerify={step === "otp-fallback" ? completeOtpFallback : completeOtp}
              onResend={issueOtp}
              tone="dark"
            />
          </>
        ) : step === "face" ? (
          <>
            <h1 className="mb-1 text-center font-display text-xl font-bold text-white">Verify it&apos;s you</h1>
            <p className="mb-6 text-center text-sm text-navy-300">
              We don&apos;t recognize this device. Confirm it&apos;s you with a quick face check.
            </p>
            <FaceVerification onSuccess={handleFaceSuccess} onFallback={handleFaceFallback} />
          </>
        ) : (
          <>
            <h1 className="mb-1 font-display text-xl font-bold text-white">Welcome back</h1>
            <p className="mb-6 text-sm text-navy-300">Log in to continue to your dashboard.</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy-100">Email</label>
                <input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-sm text-white placeholder:text-navy-300 focus:border-brand-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy-100">Passcode</label>
                <input
                  type="password"
                  inputMode="numeric"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-sm text-white placeholder:text-navy-300 focus:border-brand-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="block w-full rounded-xl bg-brand-500 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-600"
              >
                Login
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-navy-300">
              New here?{" "}
              <Link href="/signup" className="font-semibold text-brand-400 hover:text-brand-300">
                Create an account
              </Link>
            </p>

            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-navy-300">
                Demo accounts
              </p>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.email}
                    type="button"
                    onClick={() => quickFillDemo(u.email)}
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-xs text-navy-100 hover:border-brand-400/50 hover:bg-white/[0.08]"
                  >
                    <span className="block font-semibold text-white">{u.label}</span>
                    <span className="block text-navy-300">{u.email}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
