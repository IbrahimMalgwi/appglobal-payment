export type UserType = "personal" | "business";

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

export type TransactionKind = "TRANSFER" | "VAT" | "PURCHASE" | "AIRTIME" | "DATA" | "BILL" | "CARD";
export type TransactionDirection = "DEBIT" | "CREDIT";
export type TransactionStatus = "COMPLETED" | "PENDING" | "FAILED";

export interface Transaction {
  id: string;
  date: string; // ISO string
  kind: TransactionKind;
  description: string;
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

export interface DisputeRecord {
  id: string;
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
