import {
  LayoutGrid,
  Wallet,
  CreditCard,
  Repeat,
  ShoppingBag,
  Smartphone,
  Wifi,
  Receipt,
  Landmark,
  ShieldAlert,
  Tv,
  Activity,
  Gift,
  Users,
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

export const navSections: NavSection[] = [
  {
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutGrid }],
  },
  {
    items: [
      {
        label: "Accounts",
        icon: Wallet,
        children: [
          { label: "All Transactions", href: "/accounts/all-transactions" },
          { label: "Daily Summary", href: "/accounts/daily-summary" },
        ],
      },
      { label: "Card", href: "/card", icon: CreditCard, businessOnly: true },
    ],
  },
  {
    heading: "Payments",
    items: [
      {
        label: "Payments",
        icon: Receipt,
        children: [
          { label: "All Transactions", href: "/payments/all-transactions" },
          { label: "Top 5 Transactions", href: "/payments/top-five" },
        ],
      },
      {
        label: "Transfers",
        icon: Repeat,
        children: [
          { label: "Instant Transfer", href: "/transfers/instant" },
          { label: "Recurring Transfer", href: "/transfers/recurring" },
          { label: "Bulk Transfer", href: "/transfers/bulk" },
        ],
      },
      { label: "Purchases", href: "/purchases", icon: ShoppingBag },
      { label: "Airtime", href: "/airtime", icon: Smartphone },
      { label: "Data", href: "/data", icon: Wifi },
      { label: "Bill Payment", href: "/bill-payment", icon: Landmark },
      { label: "POS Transfer", href: "/pos-transfer", icon: Tv, businessOnly: true },
      {
        label: "Disputes",
        icon: ShieldAlert,
        children: [
          { label: "POS Disputes", href: "/disputes/pos" },
          { label: "Front Office Disputes", href: "/disputes/front-office" },
          { label: "Card Disputes", href: "/disputes/card" },
        ],
      },
    ],
  },
  {
    heading: "Channels",
    items: [
      { label: "POS", href: "/channels/pos", icon: Tv },
      { label: "Network", href: "/channels/network", icon: Activity },
    ],
  },
  {
    heading: "Earn Money",
    items: [
      { label: "Cashback", href: "/earn/cashback", icon: Gift },
      { label: "Referrals", href: "/earn/referrals", icon: Users },
    ],
  },
];

export function getNavForUserType(userType: UserType): NavSection[] {
  return navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.businessOnly || userType === "business"),
    }))
    .filter((section) => section.items.length > 0);
}
