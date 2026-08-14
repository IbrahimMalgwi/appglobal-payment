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
  | "accountLimitUpgrade"
  | "settlementWithdraw"
  | "aro";

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
  // Account Limit page is viewable by all; only the Upgrade action is gated.
  accountLimitUpgrade: ["personal", "business"],
  // The only way an ARO moves money out is withdrawing their settlement balance.
  settlementWithdraw: ["aro"],
  // ARO-specific network pages (Agents, Performance, Transaction Monitoring, Settlement).
  aro: ["aro"],
};

export function canAccess(userType: UserType, feature: FeatureKey): boolean {
  return ACCESS_MATRIX[feature].includes(userType);
}
