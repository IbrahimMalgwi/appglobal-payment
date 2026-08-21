// Deterministic mock "smart lookup" functions. This app has no backend/database, so every
// lookup here is a pure function over its input — same input always produces the same
// output, so both the success and failure paths are actually reachable and testable, not a
// theoretical branch that only fires for real external data.

export interface BankLookupResult {
  bankName: string;
  bankCode: string;
  accountName: string;
}

// Reused for the manual bank-selection fallback too, so the two paths (auto-resolved vs.
// manually picked) draw from the same registry rather than two different bank lists.
export const MOCK_BANK_REGISTRY: { bankName: string; bankCode: string }[] = [
  { bankName: "Access Bank", bankCode: "044" },
  { bankName: "GTBank", bankCode: "058" },
  { bankName: "Zenith Bank", bankCode: "057" },
  { bankName: "UBA", bankCode: "033" },
  { bankName: "Wema Bank", bankCode: "035" },
  { bankName: "First Bank", bankCode: "011" },
  { bankName: "Fidelity Bank", bankCode: "070" },
  { bankName: "Sterling Bank", bankCode: "232" },
];

/**
 * Deterministic mock bank lookup — the account number's last digit picks a bank from the
 * registry. Odd last digits intentionally fail lookup (return null) so the manual-fallback UI
 * has a real, reachable trigger during testing instead of being dead code.
 */
export function lookupBankAccount(accountNumber: string): BankLookupResult | null {
  if (accountNumber.length !== 10 || !/^\d{10}$/.test(accountNumber)) return null;
  const lastDigit = Number(accountNumber[accountNumber.length - 1]);
  if (lastDigit % 2 !== 0) return null; // odd last digit = mock "lookup failed"
  const bank = MOCK_BANK_REGISTRY[lastDigit % MOCK_BANK_REGISTRY.length];
  return { ...bank, accountName: "JANE DOE" }; // reuses this app's existing mock user name
}

// Deterministic mock network detection from a Nigerian phone number prefix.
const PREFIX_MAP: Record<string, string> = {
  "0803": "MTN", "0806": "MTN", "0813": "MTN", "0810": "MTN", "0814": "MTN", "0903": "MTN",
  "0802": "Airtel", "0808": "Airtel", "0812": "Airtel", "0902": "Airtel", "0901": "Airtel",
  "0805": "Glo", "0807": "Glo", "0815": "Glo", "0811": "Glo", "0905": "Glo",
  "0809": "9mobile", "0817": "9mobile", "0818": "9mobile", "0908": "9mobile", "0909": "9mobile",
};

export const NETWORK_OPTIONS = ["MTN", "Airtel", "Glo", "9mobile"] as const;

/** Prefixes not in PREFIX_MAP (e.g. "0700") intentionally fall through to null — the
 * manual network-selection buttons are how that's reached during testing. */
export function detectNetwork(phoneNumber: string): string | null {
  if (phoneNumber.length !== 11 || !/^\d{11}$/.test(phoneNumber)) return null;
  const prefix = phoneNumber.slice(0, 4);
  return PREFIX_MAP[prefix] ?? null;
}

export interface HospitalLookupResult {
  hospitalName: string;
}

// Reused for both the lookup and, if ever needed, a manual-selection fallback — same
// convention as MOCK_BANK_REGISTRY above.
export const MOCK_HOSPITAL_REGISTRY: string[] = [
  "LASUTH",
  "General Hospital, Lagos",
  "Reddington Clinic",
  "Lagoon Hospital",
  "St. Nicholas Hospital",
  "National Hospital, Abuja",
];

/**
 * Deterministic mock hospital-account lookup — same pattern as lookupBankAccount(): a
 * 10-digit account number is required, and an odd last digit intentionally fails lookup so
 * the "Hospital not found" fallback has a real, reachable trigger during testing.
 */
export function lookupHospitalAccount(accountNumber: string): HospitalLookupResult | null {
  if (accountNumber.length !== 10 || !/^\d{10}$/.test(accountNumber)) return null;
  const lastDigit = Number(accountNumber[accountNumber.length - 1]);
  if (lastDigit % 2 !== 0) return null; // odd last digit = mock "lookup failed"
  return { hospitalName: MOCK_HOSPITAL_REGISTRY[lastDigit % MOCK_HOSPITAL_REGISTRY.length] };
}
