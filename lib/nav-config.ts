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
  PieChart,
  type LucideIcon,
} from "lucide-react";
import { UserType } from "./types";

export interface NavLeaf {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  children?: NavLeaf[];
  businessOnly?: boolean;
  badge?: string;
}

export interface NavSection {
  heading?: string;
  items: NavItem[];
}

// --- Personal / Business customer nav ---

const customerNavSections: NavSection[] = [
  {
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutGrid }],
  },
  {
    items: [
      { label: "Accounts", href: "/accounts", icon: Wallet },
      { label: "Card", href: "/card", icon: CreditCard, businessOnly: true },
      { label: "Transactions", href: "/transactions", icon: Receipt },
    ],
  },
  {
    items: [
      {
        label: "Transfers",
        icon: Repeat,
        children: [
          { label: "AppPay Transfer", href: "/transfers/apppay" },
          { label: "Interbank Transfer", href: "/transfers/interbank" },
        ],
      },
      {
        label: "POS",
        icon: Tv,
        businessOnly: true,
        children: [
          { label: "POS Transfer", href: "/pos/transfer" },
          { label: "POS Withdrawal", href: "/pos/withdrawal" },
        ],
      },
      { label: "Bill Payment", href: "/bill-payment", icon: Landmark },
      { label: "Dispute", href: "/dispute", icon: ShieldAlert },
    ],
  },
  {
    items: [{ label: "Earn Money", href: "/earn", icon: Gift }],
  },
];

// --- Agent Relationship Officer (ARO) nav ---

const aroNavSections: NavSection[] = [
  {
    items: [{ label: "Overview", href: "/aro/overview", icon: LayoutGrid }],
  },
  {
    items: [
      { label: "Agent Management", href: "/aro/agents", icon: Users },
      { label: "Transaction Monitoring", href: "/aro/transactions", icon: ListChecks },
      { label: "Commission Breakdown", href: "/aro/commission", icon: PieChart },
    ],
  },
];

export function getNavForUserType(userType: UserType): NavSection[] {
  const source = userType === "aro" ? aroNavSections : customerNavSections;
  return source
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.businessOnly || userType === "business"),
    }))
    .filter((section) => section.items.length > 0);
}
