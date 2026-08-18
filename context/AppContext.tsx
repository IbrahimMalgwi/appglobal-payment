"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { businessAccounts, currentUser, selfAro, bdoOfficer } from "@/lib/mock-data";
import { BusinessAccount, UserType } from "@/lib/types";

interface AppContextValue {
  userType: UserType;
  setUserType: (type: UserType) => void;
  // Role captured when a user completes the sign-up wizard this session.
  // null until they sign up — the login screen uses this to decide between the
  // real login form and the demo quick-access shortcuts.
  signedUpRole: UserType | null;
  setSignedUpRole: (role: UserType | null) => void;
  accounts: BusinessAccount[];
  selectedAccount: BusinessAccount | null;
  selectAccount: (id: string) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  mobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  userName: string;
  userEmail: string;
  // The id of the ARO record backing this session when userType === "aro". Every ARO-scoped
  // data-access call (getAgentPerformanceRows, getAroPortfolioSummary, ...) must read this
  // from context rather than a URL param, so an ARO can never view another ARO's data by
  // tampering with the address bar.
  currentAroId: string;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userType, setUserType] = useState<UserType>(currentUser.userType);
  const [signedUpRole, setSignedUpRole] = useState<UserType | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(businessAccounts[0]?.id ?? "");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const selectedAccount = useMemo(
    () => businessAccounts.find((a) => a.id === selectedAccountId) ?? null,
    [selectedAccountId]
  );

  const value: AppContextValue = {
    userType,
    setUserType,
    signedUpRole,
    setSignedUpRole,
    accounts: businessAccounts,
    selectedAccount,
    selectAccount: setSelectedAccountId,
    sidebarCollapsed,
    toggleSidebar: () => setSidebarCollapsed((v) => !v),
    mobileNavOpen,
    openMobileNav: () => setMobileNavOpen(true),
    closeMobileNav: () => setMobileNavOpen(false),
    userName: userType === "aro" ? selfAro.name : userType === "bdo" ? bdoOfficer.name : currentUser.name,
    userEmail: userType === "aro" ? selfAro.email : userType === "bdo" ? bdoOfficer.email : currentUser.email,
    currentAroId: selfAro.id,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
