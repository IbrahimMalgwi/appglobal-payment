import {
  LayoutGrid,
  Wallet,
  CreditCard,
  Repeat,
  Receipt,
  Landmark,
  ShieldAlert,
  Tv,
  Gift,
  Users,
  ListChecks,
  LineChart,
  Settings,
  Percent,
  Award,
  Bell,
  Building2,
  type LucideIcon,
} from "lucide-react";
import { UserType } from "./types";
import { canAccess, FeatureKey } from "./access-control";

export interface NavLeaf {
  label: string;
  href: string;
  feature?: FeatureKey;
}

export interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  children?: NavLeaf[];
  feature?: FeatureKey;
  badge?: string;
}

export interface NavSection {
  heading?: string;
  items: NavItem[];
}

// Settings + Dispute are available to every role (see access matrix), so they're shared
// across the customer and ARO nav trees rather than duplicated with divergent wording.
const settingsSection: NavSection = {
  heading: "Settings",
  items: [
    {
      label: "Settings",
      icon: Settings,
      children: [
        { label: "Account Details", href: "/settings", feature: "accountDetails" },
        { label: "Account Limit", href: "/settings/account-limit", feature: "accountLimit" },
        { label: "Security", href: "/settings/security" },
        { label: "Help & Support", href: "/settings/help" },
      ],
    },
  ],
};

// --- Personal / Business customer nav ---

const customerNavSections: NavSection[] = [
  {
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutGrid }],
  },
  {
    items: [
      { label: "Accounts", href: "/accounts", icon: Wallet, feature: "accounts" },
      { label: "Card", href: "/card", icon: CreditCard, feature: "card" },
      { label: "Transactions", href: "/transactions", icon: Receipt, feature: "transactions" },
    ],
  },
  {
    items: [
      {
        label: "Transfers",
        icon: Repeat,
        feature: "transfers",
        children: [
          { label: "AppPay Transfer", href: "/transfers/apppay" },
          { label: "Interbank Transfer", href: "/transfers/interbank" },
        ],
      },
      {
        label: "POS",
        icon: Tv,
        feature: "pos",
        children: [
          { label: "POS Transfer", href: "/pos/transfer" },
          { label: "POS Withdrawal", href: "/pos/withdrawal" },
          { label: "Request for POS", href: "/pos/terminal-request" },
        ],
      },
      { label: "Bill Payment", href: "/bill-payment", icon: Landmark, feature: "billPayment" },
      { label: "Dispute", href: "/dispute", icon: ShieldAlert },
    ],
  },
  {
    items: [{ label: "Earn Money", href: "/earn", icon: Gift, feature: "earnMoney" }],
  },
  settingsSection,
];

// --- Agent Relationship Officer (ARO) nav ---

const aroNavSections: NavSection[] = [
  {
    items: [
      { label: "Overview", href: "/aro/overview", icon: LayoutGrid },
      { label: "Settlement Account", href: "/aro/settlement", icon: Wallet },
    ],
  },
  {
    items: [
      { label: "Agent Management", href: "/aro/agents", icon: Users },
      { label: "Agent Performance", href: "/aro/performance", icon: LineChart },
      { label: "POS Performance", href: "/aro/pos", icon: Tv },
      { label: "Transaction Monitoring", href: "/aro/transactions", icon: ListChecks },
      { label: "Commissions", href: "/aro/commission", icon: Percent },
      { label: "Referral Bonuses", href: "/aro/referrals", icon: Award },
      { label: "Notifications", href: "/aro/notifications", icon: Bell },
      { label: "Dispute", href: "/dispute", icon: ShieldAlert },
    ],
  },
  settingsSection,
];

// --- Business Development Officer (BDO) nav ---

const bdoNavSections: NavSection[] = [
  {
    items: [{ label: "Overview", href: "/bdo/overview", icon: LayoutGrid }],
  },
  {
    heading: "ARO Management",
    items: [{ label: "All AROs & Comparison", href: "/bdo/aros", icon: Building2 }],
  },
  {
    heading: "Network performance",
    items: [
      { label: "Agent Performance", href: "/bdo/agents", icon: LineChart },
      { label: "POS Performance", href: "/bdo/pos", icon: Tv },
      { label: "Transactions", href: "/bdo/transactions", icon: ListChecks },
      { label: "Commission Performance", href: "/bdo/commission", icon: Percent },
      { label: "Notifications & Alerts", href: "/bdo/notifications", icon: Bell },
    ],
  },
  settingsSection,
];

function navSectionsForUserType(userType: UserType): NavSection[] {
  if (userType === "aro") return aroNavSections;
  if (userType === "bdo") return bdoNavSections;
  return customerNavSections;
}

export function getNavForUserType(userType: UserType): NavSection[] {
  const source = navSectionsForUserType(userType);
  return source
    .map((section) => ({
      ...section,
      items: section.items
        // Drop items the user's role can't access, per the single access matrix.
        .filter((item) => !item.feature || canAccess(userType, item.feature))
        // Drop child links the role can't access, and any group left with no children.
        .map((item) =>
          item.children
            ? { ...item, children: item.children.filter((c) => !c.feature || canAccess(userType, c.feature)) }
            : item
        )
        .filter((item) => !item.children || item.children.length > 0),
    }))
    .filter((section) => section.items.length > 0);
}
