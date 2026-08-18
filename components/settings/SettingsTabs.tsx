"use client";

import { RouteTabs } from "@/components/ui/RouteTabs";
import { useApp } from "@/context/AppContext";
import { canAccess, FeatureKey } from "@/lib/access-control";

// Shared sub-navigation across the Settings section. Account Details/Account Limit are
// feature-gated (ARO/BDO aren't account holders); Security and Help & Support stay available
// to every role.
export const settingsTabs: { href: string; label: string; feature?: FeatureKey }[] = [
  { href: "/settings", label: "Account Details", feature: "accountDetails" },
  { href: "/settings/account-limit", label: "Account Limit", feature: "accountLimit" },
  { href: "/settings/security", label: "Security" },
  { href: "/settings/help", label: "Help & Support" },
];

export function SettingsTabs() {
  const { userType } = useApp();
  const visibleTabs = settingsTabs.filter((t) => !t.feature || canAccess(userType, t.feature));

  return (
    <div className="mb-5 overflow-x-auto">
      <RouteTabs tabs={visibleTabs} />
    </div>
  );
}
