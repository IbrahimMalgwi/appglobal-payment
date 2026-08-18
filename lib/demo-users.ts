import { UserType } from "./types";

// Fixed demo accounts — this app has no real backend/auth, so login validates against this
// list instead of accepting any non-empty input. Same password for all, kept simple on purpose.
export interface DemoUser {
  email: string;
  password: string;
  role: UserType;
  label: string;
}

export const DEMO_USERS: DemoUser[] = [
  { email: "user@appglobal.com", password: "123456", role: "personal", label: "Personal user" },
  { email: "agent@appglobal.com", password: "123456", role: "business", label: "Agent" },
  { email: "aro@appglobal.com", password: "123456", role: "aro", label: "Agent Relationship Officer" },
  { email: "bdo@appglobal.com", password: "123456", role: "bdo", label: "Business Development Officer" },
];

export function findDemoUser(identifier: string): DemoUser | undefined {
  const normalized = identifier.trim().toLowerCase();
  return DEMO_USERS.find((u) => u.email === normalized);
}
