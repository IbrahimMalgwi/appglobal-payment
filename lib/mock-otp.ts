// Mock one-time-password helper. There is no SMS/email backend in this app, so the generated
// code can't actually be delivered — every caller surfaces it via a toast (clearly labelled a
// demo artifact) so the OTP step stays testable. Replace with a real send when a backend exists.

// Fixed placeholder code for now (no SMS/email provider to actually deliver a random one).
// Swap this back to a random Math.floor(1000 + Math.random() * 9000) (or 6-digit) generator
// once real delivery exists.
const PLACEHOLDER_OTP = "2244";

export function sendMockOtp(destination: string): string {
  // destination is forwarded to the SMS/email provider in production.
  void destination;
  return PLACEHOLDER_OTP;
}

/** Masks a raw phone/email into something safe to display, e.g. "j••••@example.com" or "••• ••• 0707". */
export function maskDestination(value: string): string {
  const v = value.trim();
  if (!v) return "your registered contact";

  if (v.includes("@")) {
    const [user, domain] = v.split("@");
    const head = user.slice(0, 1);
    return `${head}${"•".repeat(Math.max(3, user.length - 1))}@${domain}`;
  }

  const digits = v.replace(/\D/g, "");
  const last4 = digits.slice(-4) || digits;
  return `••• ••• ${last4}`;
}
