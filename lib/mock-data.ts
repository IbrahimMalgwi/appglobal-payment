import {
  BusinessAccount,
  CurrentUser,
  DisputeRecord,
  NetworkSuccessRate,
  PosDevice,
  PosTransferRecord,
  Transaction,
  TransferRecord,
} from "./types";

export const currentUser: CurrentUser = {
  name: "Jane Doe",
  email: "jane.doe@example.com",
  userType: "business",
};

export const businessAccounts: BusinessAccount[] = [
  {
    id: "biz_1",
    businessName: "Doe Retail Ventures",
    category: "MERCHANT",
    accountNumber: "0123456789",
    balance: 482_310.5,
    address: "14 Marina Road, Lagos Island, Lagos",
  },
  {
    id: "biz_2",
    businessName: "Doe Logistics Ltd",
    category: "MERCHANT",
    accountNumber: "0198765432",
    balance: 96_004.15,
    address: "8 Allen Avenue, Ikeja, Lagos",
  },
];

function daysAgo(n: number, hour = 9, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const transactions: Transaction[] = [
  { id: "txn_1", date: daysAgo(0, 17, 26), kind: "TRANSFER", description: "Transfer to Ada Okafor", amount: 1950, balanceBefore: 2006.05, balanceAfter: 36.05, direction: "DEBIT", status: "COMPLETED" },
  { id: "txn_2", date: daysAgo(0, 17, 26), kind: "VAT", description: "VAT on transfer", amount: 1.5, direction: "DEBIT", status: "COMPLETED" },
  { id: "txn_3", date: daysAgo(0, 7, 26), kind: "TRANSFER", description: "Transfer to Musa Bello", amount: 2000, balanceBefore: 4006.05, balanceAfter: 2006.05, direction: "DEBIT", status: "COMPLETED" },
  { id: "txn_4", date: daysAgo(1, 19, 17), kind: "TRANSFER", description: "Transfer to Chika Eze", amount: 3500, balanceBefore: 7506.05, balanceAfter: 4006.05, direction: "DEBIT", status: "COMPLETED" },
  { id: "txn_5", date: daysAgo(1, 17, 53), kind: "TRANSFER", description: "Transfer to Femi Alade", amount: 6020, balanceBefore: 13547.55, balanceAfter: 7507.55, direction: "DEBIT", status: "COMPLETED" },
  { id: "txn_6", date: daysAgo(2, 8, 42), kind: "TRANSFER", description: "Wallet top-up", amount: 25600, balanceBefore: 4711.37, balanceAfter: 30311.37, direction: "CREDIT", status: "COMPLETED" },
  { id: "txn_7", date: daysAgo(2, 8, 41), kind: "TRANSFER", description: "Inbound transfer — Doe Logistics Ltd", amount: 4700, balanceBefore: 11.37, balanceAfter: 4711.37, direction: "CREDIT", status: "COMPLETED" },
  { id: "txn_8", date: daysAgo(3, 15, 28), kind: "BILL", description: "Electricity bill payment", amount: 4351.03, direction: "DEBIT", status: "COMPLETED" },
  { id: "txn_9", date: daysAgo(4, 12, 5), kind: "AIRTIME", description: "Airtime purchase — 08012345678", amount: 1000, direction: "DEBIT", status: "COMPLETED" },
  { id: "txn_10", date: daysAgo(5, 10, 15), kind: "DATA", description: "Data bundle — 5GB", amount: 2500, direction: "DEBIT", status: "COMPLETED" },
  { id: "txn_11", date: daysAgo(6, 14, 0), kind: "PURCHASE", description: "POS purchase — Doe Retail Store", amount: 8200, direction: "DEBIT", status: "COMPLETED" },
  { id: "txn_12", date: daysAgo(7, 9, 30), kind: "CARD", description: "Card payment — Online checkout", amount: 15000, direction: "DEBIT", status: "PENDING" },
];

export const topFiveTransactions = transactions.slice(0, 5);

export const instantTransfers: TransferRecord[] = [
  { id: "it_1", recipient: "Ada Okafor", bank: "GTBank", amount: 1950, date: daysAgo(0, 17, 26), status: "COMPLETED" },
  { id: "it_2", recipient: "Musa Bello", bank: "Access Bank", amount: 2000, date: daysAgo(0, 7, 26), status: "COMPLETED" },
  { id: "it_3", recipient: "Chika Eze", bank: "Zenith Bank", amount: 3500, date: daysAgo(1, 19, 17), status: "COMPLETED" },
];

export const recurringTransfers: TransferRecord[] = [
  { id: "rt_1", recipient: "Landlord — Office rent", bank: "UBA", amount: 150000, date: daysAgo(30, 9, 0), status: "COMPLETED" },
  { id: "rt_2", recipient: "Staff salary — Tunde A.", bank: "First Bank", amount: 120000, date: daysAgo(30, 9, 0), status: "COMPLETED" },
];

export const bulkTransfers: TransferRecord[] = [
  { id: "bt_1", recipient: "Payroll batch — 12 staff", bank: "Multiple", amount: 1_240_000, date: daysAgo(14, 10, 0), status: "COMPLETED" },
  { id: "bt_2", recipient: "Vendor payout batch", bank: "Multiple", amount: 340_000, date: daysAgo(3, 11, 0), status: "PENDING" },
];

export const posTransfers: PosTransferRecord[] = [
  { id: "pt_1", terminalId: "POS-2291", amount: 45000, date: daysAgo(0, 13, 10), state: "pending" },
  { id: "pt_2", terminalId: "POS-2291", amount: 12000, date: daysAgo(1, 16, 40), state: "accepted" },
  { id: "pt_3", terminalId: "POS-4410", amount: 8000, date: daysAgo(2, 9, 0), state: "declined" },
];

export const disputes = {
  pos: [
    { id: "d_pos_1", reference: "POS-DSP-001", amount: 12000, date: daysAgo(4, 12, 0), reason: "Terminal charged twice", status: "open" },
  ] as DisputeRecord[],
  frontOffice: [
    { id: "d_fo_1", reference: "FO-DSP-014", amount: 3000, date: daysAgo(6, 10, 0), reason: "Escalated to customer care", status: "resolved" },
  ] as DisputeRecord[],
  card: [
    { id: "d_card_1", reference: "CARD-DSP-009", amount: 15000, date: daysAgo(7, 15, 0), reason: "Unrecognized card charge", status: "rejected" },
  ] as DisputeRecord[],
};

export const posDevices: PosDevice[] = [
  { id: "dev_1", serial: "POS-2291", location: "Doe Retail — Marina Rd", status: "active", lastTransactionDate: daysAgo(0, 13, 10) },
  { id: "dev_2", serial: "POS-4410", location: "Doe Retail — Allen Ave", status: "active", lastTransactionDate: daysAgo(2, 9, 0) },
  { id: "dev_3", serial: "POS-1188", location: "Warehouse — Ikeja", status: "inactive", lastTransactionDate: daysAgo(21, 8, 0) },
];

export const networkSuccessRates: NetworkSuccessRate[] = [
  { label: "Bank Success Rate", successRate: 98.4, totalRequests: 1240 },
  { label: "Billers Success Rate", successRate: 95.1, totalRequests: 512 },
  { label: "Airtime Success Rate", successRate: 99.2, totalRequests: 803 },
];

export const cashbackBalance = 71.0;
export const referralBalance = 0.0;
