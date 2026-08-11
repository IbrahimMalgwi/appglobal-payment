export type UserType = "personal" | "business" | "aro";

export interface BusinessAccount {
  id: string;
  businessName: string;
  category: string;
  accountNumber: string;
  balance: number;
  address: string;
}

export interface CurrentUser {
  name: string;
  email: string;
  userType: UserType;
}

export type TransactionKind =
  | "TRANSFER"
  | "VAT"
  | "WITHDRAWAL"
  | "AIRTIME"
  | "DATA"
  | "BILL"
  | "CARD";
export type TransactionDirection = "DEBIT" | "CREDIT";
export type TransactionStatus = "COMPLETED" | "PENDING" | "FAILED";

export interface Transaction {
  id: string;
  date: string; // ISO string
  kind: TransactionKind;
  description: string;
  reference: string;
  amount: number;
  balanceBefore?: number;
  balanceAfter?: number;
  direction: TransactionDirection;
  status: TransactionStatus;
}

export interface TransferRecord {
  id: string;
  recipient: string;
  bank: string;
  amount: number;
  date: string;
  status: TransactionStatus;
}

export interface PosTransferRecord {
  id: string;
  terminalId: string;
  amount: number;
  date: string;
  state: "pending" | "accepted" | "declined";
}

export interface PosWithdrawalRecord {
  id: string;
  terminalId: string;
  location: string;
  reference: string;
  amount: number;
  date: string;
  status: TransactionStatus;
}

export type DisputeCategory = "pos" | "withdrawal";

export interface DisputeRecord {
  id: string;
  category: DisputeCategory;
  reference: string;
  amount: number;
  date: string;
  reason: string;
  status: "open" | "resolved" | "rejected";
}

export interface PosDevice {
  id: string;
  serial: string;
  location: string;
  status: "active" | "inactive";
  lastTransactionDate: string;
}

export interface NetworkSuccessRate {
  label: string;
  successRate: number; // 0-100
  totalRequests: number;
}

// --- New for this update ---

export type AccountType = "Personal" | "Business" | "Savings" | "Current";
export type AccountStatus = "active" | "inactive" | "restricted";

export interface AccountRecord {
  id: string;
  accountName: string;
  accountNumber: string;
  accountType: AccountType;
  availableBalance: number;
  currentBalance: number;
  status: AccountStatus;
  currency: string;
}

export type BillCategoryId =
  | "airtime"
  | "data"
  | "electricity"
  | "cable-tv"
  | "hospital"
  | "internet"
  | "education"
  | "other";

export interface BillCategory {
  id: BillCategoryId;
  label: string;
  primary: boolean; // shown before "Show More" is clicked
}

export interface AroInfo {
  name: string;
  phone: string;
  photoInitials: string;
}

export interface ChatMessage {
  id: string;
  from: "user" | "bot";
  text: string;
  timestamp: string;
}

// --- Agent Relationship Officer (ARO) dashboard ---

export type AgentStatus = "active" | "inactive" | "pending";

export interface AgentRecord {
  id: string;
  name: string;
  businessName: string;
  phone: string;
  email: string;
  address: string;
  status: AgentStatus;
  terminals: {
    total: number;
    active: number;
    inactive: number;
  };
  bankName: string;
  accountNumber: string;
  transactionVolumeToday: number; // Naira
  transactionCountToday: number;
  terminalWithdrawalsToday: number;
  commissionBalance: number;
}

export type AroTransactionType = "Payment" | "Transfer" | "Cashout";

export interface AroTransactionRecord {
  id: string;
  date: string;
  agentId: string;
  agentName: string;
  type: AroTransactionType;
  amount: number;
  direction: TransactionDirection;
  status: TransactionStatus;
}

export interface CommissionBySource {
  payments: number;
  transfer: number;
  cashout: number;
}

export interface AgentCommission {
  agentId: string;
  agentName: string;
  transactionVolume: number;
  totalCommission: number;
  breakdown: CommissionBySource;
}

