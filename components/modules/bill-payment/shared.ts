import { detectNetwork } from "@/lib/smart-lookup";

export const billInputClass =
  "w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none";

export const billLabelClass = "mb-1.5 block text-sm font-semibold text-ink-700";

export const billButtonClass =
  "flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-70";

// Shared by NetworkPhoneInput and every form that needs the resolved network at submit time —
// a pure function of the same two inputs, so there's nothing to lift into shared state.
export function resolveNetwork(phoneNumber: string, manualNetwork: string | null) {
  const detectedNetwork = phoneNumber.length === 11 ? detectNetwork(phoneNumber) : null;
  const network = manualNetwork ?? detectedNetwork;
  const autoDetected = !manualNetwork && !!detectedNetwork;
  return { network, autoDetected };
}
