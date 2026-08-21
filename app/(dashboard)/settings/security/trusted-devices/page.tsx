"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, MonitorSmartphone, ScanFace } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/context/ToastContext";
import {
  forgetThisDevice,
  getTrustedDevice,
  REQUIRE_FACE_VERIFICATION_EVERY_LOGIN,
  TrustedDevice,
} from "@/lib/device-trust";

export default function TrustedDevicesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [device, setDevice] = useState<TrustedDevice | null>(null);

  // localStorage is only available client-side, so the trusted-device record can't be read
  // during render — it has to be read after mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDevice(getTrustedDevice());
  }, []);

  function handleForget() {
    forgetThisDevice();
    setDevice(null);
    showToast("Device forgotten. You'll need to verify your face again at next login.");
  }

  return (
    <div>
      <PageHeader
        title="Trusted Devices"
        description="Devices that can skip face verification because you've already confirmed them."
      />

      <button
        onClick={() => router.push("/settings/security")}
        className="mb-4 flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        <ChevronLeft size={15} /> Back to Security
      </button>

      <Card className="max-w-md p-6">
        {device ? (
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <MonitorSmartphone size={20} />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink-900">{device.label}</p>
              <p className="mt-0.5 text-xs text-ink-400">
                Trusted since {new Date(device.trustedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="mt-1 text-xs text-ink-400">
                {REQUIRE_FACE_VERIFICATION_EVERY_LOGIN
                  ? "This device — recognized, but not currently used to skip verification."
                  : "This device — logins here skip face verification."}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-surface-alt text-ink-400">
              <ScanFace size={20} />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink-900">No trusted device</p>
              <p className="mt-0.5 text-xs text-ink-400">
                You&apos;ll be asked to verify your face the next time you log in on this device.
              </p>
            </div>
          </div>
        )}

        {REQUIRE_FACE_VERIFICATION_EVERY_LOGIN && (
          <p className="mt-4 text-xs text-ink-400">
            Face verification currently runs on every login while this feature is being tested.
          </p>
        )}

        {device && (
          <button
            onClick={handleForget}
            className="mt-5 w-full rounded-lg border border-danger/30 py-2.5 text-sm font-semibold text-danger hover:bg-danger/5"
          >
            Forget this device
          </button>
        )}
      </Card>
    </div>
  );
}
