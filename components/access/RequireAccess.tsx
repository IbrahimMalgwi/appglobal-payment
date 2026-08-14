"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { canAccess, FeatureKey } from "@/lib/access-control";
import { dashboardPathForRole } from "@/lib/onboarding";

/**
 * Route-level access guard. Checks the current user against the access matrix and,
 * if denied, redirects to their home route with a toast. Because a hidden nav item is
 * not access control (the URL is still reachable), every gated page wraps its content
 * in this so a non-permitted role can't reach it by typing the URL directly.
 */
export function useRequireAccess(feature: FeatureKey): boolean {
  const { userType } = useApp();
  const { showToast } = useToast();
  const router = useRouter();
  const allowed = canAccess(userType, feature);

  useEffect(() => {
    if (!allowed) {
      showToast("That's not available on your account.", "error");
      router.replace(dashboardPathForRole(userType));
    }
  }, [allowed, userType, router, showToast]);

  return allowed;
}

export function RequireAccess({ feature, children }: { feature: FeatureKey; children: ReactNode }) {
  const allowed = useRequireAccess(feature);
  if (!allowed) return null;
  return <>{children}</>;
}
