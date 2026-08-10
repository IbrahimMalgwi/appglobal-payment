"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { businessAccounts, currentUser } from "@/lib/mock-data";
import { BusinessAccount, UserType } from "@/lib/types";

interface AppContextValue {
  userType: UserType;
  setUserType: (type: UserType) => void;
  accounts: BusinessAccount[];
  selectedAccount: BusinessAccount | null;
  selectAccount: (id: string) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  userName: string;
  userEmail: string;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userType, setUserType] = useState<UserType>(currentUser.userType);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(businessAccounts[0]?.id ?? "");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const selectedAccount = useMemo(
    () => businessAccounts.find((a) => a.id === selectedAccountId) ?? null,
    [selectedAccountId]
  );

  const value: AppContextValue = {
    userType,
    setUserType,
    accounts: businessAccounts,
    selectedAccount,
    selectAccount: setSelectedAccountId,
    sidebarCollapsed,
    toggleSidebar: () => setSidebarCollapsed((v) => !v),
    userName: currentUser.name,
    userEmail: currentUser.email,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
