// Device-trust record for skipping face verification on a device we've already seen.
//
// This is the one deliberate exception to this app's "no localStorage" convention: with no
// backend, "recognize this device on a later visit" only works if something survives a page
// reload/new session. Scoped to exactly this one key — don't reach for localStorage elsewhere.

export interface TrustedDevice {
  deviceId: string;
  label: string;
  trustedAt: string;
}

const STORAGE_KEY = "aro_trusted_device";

// TEMPORARY (testing phase): require face verification on every login, ignoring device trust.
// Flip this back to false once new-device-only verification is ready to re-enable — the login
// flow gates its "skip if trusted" branch behind `!REQUIRE_FACE_VERIFICATION_EVERY_LOGIN`, so
// this one constant fully restores the previous behavior with no other code changes needed.
export const REQUIRE_FACE_VERIFICATION_EVERY_LOGIN = true;

/** Best-effort guess at "Browser on OS" from the user agent, for display only. */
function guessDeviceLabel(): string {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";

  let browser = "Unknown browser";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua)) browser = "Safari";

  let os = "Unknown OS";
  if (/Windows/.test(ua)) os = "Windows";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iOS/.test(ua)) os = "iOS";
  else if (/Linux/.test(ua)) os = "Linux";

  return `${browser} on ${os}`;
}

export function getTrustedDevice(): TrustedDevice | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TrustedDevice;
    if (!parsed?.deviceId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function trustThisDevice(): TrustedDevice {
  const record: TrustedDevice = {
    deviceId: crypto.randomUUID(),
    label: guessDeviceLabel(),
    trustedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage unavailable (private browsing, quota, etc.) — the user just gets re-prompted
    // for face verification next time, which is a safe fallback.
  }
  return record;
}

export function forgetThisDevice(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // No-op if storage isn't available.
  }
}
