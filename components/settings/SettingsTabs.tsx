"use client";

import { RouteTabs } from "@/components/ui/RouteTabs";

// Shared sub-navigation across the Settings section, available to every role.
export const settingsTabs = [
  { href: "/settings", label: "Account Details" },
  { href: "/settings/account-limit", label: "Account Limit" },
  { href: "/settings/security", label: "Security" },
  { href: "/settings/help", label: "Help & Support" },
];

export function SettingsTabs() {
  return (
    <div className="mb-5 overflow-x-auto">
      <RouteTabs tabs={settingsTabs} />
    </div>
  );
}
