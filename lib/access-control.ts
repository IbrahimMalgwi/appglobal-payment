import { UserType } from "./types";

/**
 * Single source of truth for role-based access control.
 *
 * Every gated surface in the app — nav visibility, route guards, and button-level
 * actions — reads from ACCESS_MATRIX via canAccess(). A hidden nav item is not access
 * control on its own (the URL is still typeable), so route guards use the same matrix.
 *
 * Add a new FeatureKey here when you introduce another gated surface, rather than
 * scattering role checks (`userType === "business"`) through components.
 */
export type FeatureKey =
  | "dashboard"
  | "accounts"
  | "card"
  | "transactions"
  | "transfers"
  | "pos"
  | "billPayment"
  | "earnMoney"
  | "accountDetails"
  | "accountLimit"
  | "accountLimitUpgrade"
  | "settlementWithdraw"
  | "aro"
  | "bdo";

export const ACCESS_MATRIX: Record<FeatureKey, UserType[]> = {
  // Customer dashboard/home — ARO has their own Overview home instead.
  dashboard: ["personal", "business"],
  // Customer-style accounts list — ARO has a Settlement Account instead.
  accounts: ["personal", "business"],
  card: ["business"],
  // Customer transaction history — ARO has Transaction Monitoring instead.
  transactions: ["personal", "business"],
  transfers: ["personal", "business"],
  pos: ["business"],
  billPayment: ["personal", "business"],
  earnMoney: ["personal", "business"],
  // ARO/BDO aren't account holders — no personal/business balance to view or tier to
  // upgrade — so both settings pages are removed for them entirely, not just the button.
  accountDetails: ["personal", "business"],
  accountLimit: ["personal", "business"],
  // Redundant with accountLimit now excluding ARO/BDO, but kept as the narrower gate on the
  // Upgrade action itself for personal/business.
  accountLimitUpgrade: ["personal", "business"],
  // The only way an ARO moves money out is withdrawing their settlement balance.
  settlementWithdraw: ["aro"],
  // ARO-specific network pages (Agents, Performance, Transaction Monitoring, Settlement).
  aro: ["aro"],
  // BDO org-wide oversight pages.
  bdo: ["bdo"],
};

export function canAccess(userType: UserType, feature: FeatureKey): boolean {
  return ACCESS_MATRIX[feature].includes(userType);
}
