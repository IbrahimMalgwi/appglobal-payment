"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";
import { NETWORK_OPTIONS } from "@/lib/smart-lookup";
import { OptionButtons, toOptions } from "./OptionButtons";
import { billInputClass, billLabelClass, resolveNetwork } from "./shared";

// Shared by Airtime and Data — phone number input with auto network detection, plus a
// manual-override network selector for when detection fails.
export function NetworkPhoneInput({
  phoneNumber,
  onPhoneNumberChange,
  manualNetwork,
  onManualNetworkChange,
}: {
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  manualNetwork: string | null;
  onManualNetworkChange: (value: string) => void;
}) {
  const { network, autoDetected } = resolveNetwork(phoneNumber, manualNetwork);

  return (
    <>
      <div>
        <label className={billLabelClass}>Phone number</label>
        <input
          value={phoneNumber}
          onChange={(e) => onPhoneNumberChange(e.target.value.replace(/[^0-9]/g, "").slice(0, 11))}
          placeholder="08012345678"
          inputMode="numeric"
          className={billInputClass}
        />
      </div>

      {network && autoDetected && (
        <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2.5 text-sm text-success">
          <CheckCircle2 size={16} className="shrink-0" />
          <span className="flex-1">
            Detected network: <span className="font-semibold">{network}</span>
          </span>
          <span className="text-xs text-success/70">Pick a different network below to change it.</span>
        </div>
      )}
      {phoneNumber.length === 11 && !network && (
        <p className="flex items-center gap-1.5 text-xs text-ink-400">
          <AlertCircle size={13} /> We couldn&apos;t detect a network — please select one below.
        </p>
      )}

      <div>
        <label className={billLabelClass}>Network</label>
        <OptionButtons
          options={toOptions(NETWORK_OPTIONS)}
          selectedId={network}
          onSelect={onManualNetworkChange}
          columns={4}
        />
      </div>
    </>
  );
}
