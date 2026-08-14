import {
  AccountRecord,
  AccountTier,
  AgentPerformanceRow,
  AgentRecord,
  AroInfo,
  AroTransactionRecord,
  BillCategory,
  BusinessAccount,
  CurrentUser,
  DisputeRecord,
  FaqItem,
  NotificationItem,
  PosDevice,
  PosTransferRecord,
  PosWithdrawalRecord,
  SupportInfo,
  Transaction,
  TransferRecord,
  UserType,
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

function ref(prefix: string, n: number) {
  return `${prefix}-${String(n).padStart(6, "0")}`;
}

// --- Accounts (replaces the old Accounts > All Transactions / Daily Summary) ---

// Single source of truth for the personal user's account, reused by the Accounts page,
// Settings → Account Details, and the dashboard balance card so the numbers can't drift.
export const personalAccount: AccountRecord = {
  id: "acct_personal",
  accountName: currentUser.name,
  accountNumber: "5888494452",
  accountType: "Personal",
  availableBalance: 128_450.75,
  currentBalance: 128_450.75,
  status: "active",
  currency: "NGN",
};

export function getAccountsForUser(userType: UserType): AccountRecord[] {
  if (userType === "aro") return [];
  if (userType === "personal") {
    return [personalAccount];
  }
  return businessAccounts.map((b, i) => ({
    id: b.id,
    accountName: b.businessName,
    accountNumber: b.accountNumber,
    accountType: "Business",
    availableBalance: b.balance,
    currentBalance: b.balance + (i === 0 ? 1250 : 0), // small pending-credit example
    status: "active",
    currency: "NGN",
  }));
}

// --- Transactions (single source for the Transactions page, Bill Payment history, POS Withdrawal, etc.) ---

export const transactions: Transaction[] = [
  { id: "txn_1", date: daysAgo(0, 17, 26), kind: "TRANSFER", description: "Transfer to Ada Okafor", reference: ref("TRX", 1), amount: 1950, balanceBefore: 2006.05, balanceAfter: 36.05, direction: "DEBIT", status: "COMPLETED" },
  { id: "txn_2", date: daysAgo(0, 17, 26), kind: "VAT", description: "VAT on transfer", reference: ref("TRX", 2), amount: 1.5, direction: "DEBIT", status: "COMPLETED" },
  { id: "txn_3", date: daysAgo(0, 7, 26), kind: "TRANSFER", description: "Transfer to Musa Bello", reference: ref("TRX", 3), amount: 2000, balanceBefore: 4006.05, balanceAfter: 2006.05, direction: "DEBIT", status: "COMPLETED" },
  { id: "txn_4", date: daysAgo(1, 19, 17), kind: "TRANSFER", description: "Transfer to Chika Eze", reference: ref("TRX", 4), amount: 3500, balanceBefore: 7506.05, balanceAfter: 4006.05, direction: "DEBIT", status: "COMPLETED" },
  { id: "txn_5", date: daysAgo(1, 17, 53), kind: "TRANSFER", description: "Transfer to Femi Alade", reference: ref("TRX", 5), amount: 6020, balanceBefore: 13547.55, balanceAfter: 7507.55, direction: "DEBIT", status: "COMPLETED" },
  { id: "txn_6", date: daysAgo(2, 8, 42), kind: "TRANSFER", description: "Wallet top-up", reference: ref("TRX", 6), amount: 25600, balanceBefore: 4711.37, balanceAfter: 30311.37, direction: "CREDIT", status: "COMPLETED" },
  { id: "txn_7", date: daysAgo(2, 8, 41), kind: "TRANSFER", description: "Inbound transfer — Doe Logistics Ltd", reference: ref("TRX", 7), amount: 4700, balanceBefore: 11.37, balanceAfter: 4711.37, direction: "CREDIT", status: "COMPLETED" },
  { id: "txn_8", date: daysAgo(3, 15, 28), kind: "BILL", description: "Electricity bill payment — Ikeja Electric", reference: ref("BIL", 1), amount: 4351.03, direction: "DEBIT", status: "COMPLETED" },
  { id: "txn_9", date: daysAgo(4, 12, 5), kind: "AIRTIME", description: "Airtime purchase — 08012345678", reference: ref("AIR", 1), amount: 1000, direction: "DEBIT", status: "COMPLETED" },
  { id: "txn_10", date: daysAgo(5, 10, 15), kind: "DATA", description: "Data bundle — 5GB", reference: ref("DAT", 1), amount: 2500, direction: "DEBIT", status: "COMPLETED" },
  { id: "txn_11", date: daysAgo(6, 14, 0), kind: "WITHDRAWAL", description: "POS withdrawal — Doe Retail Store", reference: ref("WDL", 1), amount: 8200, direction: "DEBIT", status: "COMPLETED" },
  { id: "txn_12", date: daysAgo(7, 9, 30), kind: "CARD", description: "Card payment — Online checkout", reference: ref("CRD", 1), amount: 15000, direction: "DEBIT", status: "PENDING" },
  { id: "txn_13", date: daysAgo(2, 11, 0), kind: "BILL", description: "Cable TV subscription — DStv Compact", reference: ref("BIL", 2), amount: 9000, direction: "DEBIT", status: "COMPLETED" },
  { id: "txn_14", date: daysAgo(9, 16, 20), kind: "BILL", description: "Hospital bill — Reddington Clinic", reference: ref("BIL", 3), amount: 22000, direction: "DEBIT", status: "COMPLETED" },
  { id: "txn_15", date: daysAgo(10, 13, 5), kind: "BILL", description: "Internet subscription — Spectranet", reference: ref("BIL", 4), amount: 18000, direction: "DEBIT", status: "COMPLETED" },
  { id: "txn_16", date: daysAgo(12, 9, 40), kind: "BILL", description: "School fees — WAEC registration", reference: ref("BIL", 5), amount: 32000, direction: "DEBIT", status: "COMPLETED" },
  { id: "txn_17", date: daysAgo(8, 15, 0), kind: "BILL", description: "Water bill payment — Lagos Water Corp", reference: ref("BIL", 6), amount: 3200, direction: "DEBIT", status: "COMPLETED" },
];

export const topFiveTransactions = transactions.slice(0, 5);

// --- Transfers: AppPay (in-network) + Interbank (other banks) ---

export const appPayTransfers: TransferRecord[] = [
  { id: "ap_1", recipient: "Ada Okafor (AppPay)", bank: "AppPay Wallet", amount: 1950, date: daysAgo(0, 17, 26), status: "COMPLETED" },
  { id: "ap_2", recipient: "Doe Logistics Ltd (AppPay)", bank: "AppPay Wallet", amount: 4700, date: daysAgo(2, 8, 41), status: "COMPLETED" },
];

export const interbankTransfers: TransferRecord[] = [
  { id: "ib_1", recipient: "Musa Bello", bank: "Access Bank", amount: 2000, date: daysAgo(0, 7, 26), status: "COMPLETED" },
  { id: "ib_2", recipient: "Chika Eze", bank: "Zenith Bank", amount: 3500, date: daysAgo(1, 19, 17), status: "COMPLETED" },
  { id: "ib_3", recipient: "Femi Alade", bank: "GTBank", amount: 6020, date: daysAgo(1, 17, 53), status: "COMPLETED" },
];

// --- POS: Transfer (existing) + Withdrawal (was "Purchases") ---

export const posTransfers: PosTransferRecord[] = [
  { id: "pt_1", terminalId: "POS-2291", amount: 45000, date: daysAgo(0, 13, 10), state: "pending" },
  { id: "pt_2", terminalId: "POS-2291", amount: 12000, date: daysAgo(1, 16, 40), state: "accepted" },
  { id: "pt_3", terminalId: "POS-4410", amount: 8000, date: daysAgo(2, 9, 0), state: "declined" },
];

export const posWithdrawals: PosWithdrawalRecord[] = [
  { id: "pw_1", terminalId: "POS-2291", location: "Doe Retail — Marina Rd", reference: ref("WDL", 1), amount: 8200, date: daysAgo(6, 14, 0), status: "COMPLETED" },
  { id: "pw_2", terminalId: "POS-4410", location: "Doe Retail — Allen Ave", reference: ref("WDL", 2), amount: 5000, date: daysAgo(3, 10, 30), status: "COMPLETED" },
  { id: "pw_3", terminalId: "POS-1188", location: "Warehouse — Ikeja", reference: ref("WDL", 3), amount: 15000, date: daysAgo(1, 8, 15), status: "PENDING" },
];

// --- Disputes: POS + Withdrawal only ---

export const disputes: DisputeRecord[] = [
  { id: "d_1", category: "pos", reference: "POS-DSP-001", amount: 12000, date: daysAgo(4, 12, 0), reason: "Terminal charged twice", status: "open" },
  { id: "d_2", category: "pos", reference: "POS-DSP-002", amount: 4000, date: daysAgo(11, 9, 0), reason: "Failed transfer, amount debited", status: "resolved" },
  { id: "d_3", category: "withdrawal", reference: "WDL-DSP-001", amount: 8200, date: daysAgo(6, 15, 0), reason: "Cash not dispensed", status: "open" },
  { id: "d_4", category: "withdrawal", reference: "WDL-DSP-002", amount: 5000, date: daysAgo(9, 10, 0), reason: "Incorrect amount dispensed", status: "rejected" },
];

// --- Bill Payment categories (reusable config, not hardcoded per-category) ---

export const billCategories: BillCategory[] = [
  { id: "airtime", label: "Airtime", primary: true },
  { id: "data", label: "Data", primary: true },
  { id: "electricity", label: "Electricity", primary: true },
  { id: "cable-tv", label: "Cable TV", primary: true },
  { id: "hospital", label: "Hospital", primary: false },
  { id: "internet", label: "Internet", primary: false },
  { id: "education", label: "Education", primary: false },
  { id: "other", label: "Other", primary: false },
];

// Maps a bill category to the keyword used to match it against transaction descriptions.
// Keeps history filtering data-driven instead of one branch per category.
export const billCategoryMatch: Record<string, { kind?: Transaction["kind"]; keyword?: string }> = {
  airtime: { kind: "AIRTIME" },
  data: { kind: "DATA" },
  electricity: { kind: "BILL", keyword: "Electricity" },
  "cable-tv": { kind: "BILL", keyword: "Cable TV" },
  hospital: { kind: "BILL", keyword: "Hospital" },
  internet: { kind: "BILL", keyword: "Internet" },
  education: { kind: "BILL", keyword: "School fees" },
  other: { kind: "BILL", keyword: "Water" },
};

export function getBillHistory(categoryId: string): Transaction[] {
  const match = billCategoryMatch[categoryId];
  if (!match) return [];
  return transactions.filter((t) => {
    if (match.kind && t.kind !== match.kind) return false;
    if (match.keyword && !t.description.includes(match.keyword)) return false;
    return true;
  });
}

// --- Assigned Agent Relationship Officer, shown on the customer dashboard ---

export const assignedAro: AroInfo = {
  name: "Chikwudi Chiroma Adekunle",
  phone: "+234 801 234 5678",
  photoInitials: "MF",
};

export const cashbackBalance = 71.0;
export const referralBalance = 0.0;
export const referralCode = "REF-JDOE-2026";
export const referralStats = {
  successfulReferrals: 3,
  totalEarnings: 4500,
};

// --- ARO dashboard: the officer's own profile, their agents, agent transactions, commissions ---

export const aroOfficer = {
  name: "Tunde Bakare",
  email: "tunde.bakare@example.com",
  cluster: "Lagos Mainland Cluster",
  manager: "Ngozi Chukwu",
};

export const agents: AgentRecord[] = [
  {
    id: "agt_1",
    name: "Ibrahim Suleiman",
    businessName: "Suleiman Mini Mart",
    phone: "+234 801 111 2222",
    email: "ibrahim.suleiman@example.com",
    address: "12 Adeniran Ogunsanya St, Surulere, Lagos",
    status: "active",
    terminals: { total: 3, active: 3, inactive: 0 },
    bankName: "AppGlobal MFB",
    accountNumber: "7011223344",
    transactionVolumeToday: 842_500,
    transactionCountToday: 64,
    terminalWithdrawalsToday: 12,
    commissionBalance: 6_240.5,
    assignment: { businessOrMerchant: "Doe Retail Ventures", task: "POS terminal support & reconciliation" },
  },
  {
    id: "agt_2",
    name: "Blessing Nwachukwu",
    businessName: "Blessing Stores",
    phone: "+234 802 222 3333",
    email: "blessing.nwachukwu@example.com",
    address: "45 Ikorodu Road, Maryland, Lagos",
    status: "active",
    terminals: { total: 2, active: 2, inactive: 0 },
    bankName: "AppGlobal MFB",
    accountNumber: "7022334455",
    transactionVolumeToday: 615_200,
    transactionCountToday: 51,
    terminalWithdrawalsToday: 9,
    commissionBalance: 4_890.0,
    assignment: { businessOrMerchant: "Doe Logistics Ltd", task: "Merchant onboarding" },
  },
  {
    id: "agt_3",
    name: "Emeka Obi",
    businessName: "Obi Electronics & POS",
    phone: "+234 803 333 4444",
    email: "emeka.obi@example.com",
    address: "3 Opebi Link Road, Ikeja, Lagos",
    status: "active",
    terminals: { total: 5, active: 4, inactive: 1 },
    bankName: "GTBank",
    accountNumber: "0033445566",
    transactionVolumeToday: 1_204_800,
    transactionCountToday: 97,
    terminalWithdrawalsToday: 20,
    commissionBalance: 9_120.75,
    assignment: { businessOrMerchant: "Ikeja City Mall Hub" },
  },
  {
    id: "agt_4",
    name: "Fatima Yusuf",
    businessName: "Yusuf Provisions",
    phone: "+234 804 444 5555",
    email: "fatima.yusuf@example.com",
    address: "21 Herbert Macaulay Way, Yaba, Lagos",
    status: "pending",
    terminals: { total: 1, active: 0, inactive: 1 },
    bankName: "AppGlobal MFB",
    accountNumber: "7044556677",
    transactionVolumeToday: 0,
    transactionCountToday: 0,
    terminalWithdrawalsToday: 0,
    commissionBalance: 0,
  },
  {
    id: "agt_5",
    name: "Chinedu Umeh",
    businessName: "Umeh Fashion Hub",
    phone: "+234 805 555 6666",
    email: "chinedu.umeh@example.com",
    address: "9 Awolowo Road, Ikoyi, Lagos",
    status: "inactive",
    terminals: { total: 2, active: 0, inactive: 2 },
    bankName: "Zenith Bank",
    accountNumber: "2011223344",
    transactionVolumeToday: 0,
    transactionCountToday: 0,
    terminalWithdrawalsToday: 0,
    commissionBalance: 1_150.25,
  },
  {
    id: "agt_6",
    name: "Amaka Eze",
    businessName: "Eze Pharmacy & Store",
    phone: "+234 806 666 7777",
    email: "amaka.eze@example.com",
    address: "18 Toyin Street, Ikeja, Lagos",
    status: "active",
    terminals: { total: 3, active: 3, inactive: 0 },
    bankName: "AppGlobal MFB",
    accountNumber: "7066778899",
    transactionVolumeToday: 498_300,
    transactionCountToday: 38,
    terminalWithdrawalsToday: 7,
    commissionBalance: 3_675.4,
  },
];

export function getAgentById(id: string): AgentRecord | undefined {
  return agents.find((a) => a.id === id);
}

const aroTxnTypes: AroTransactionRecord["type"][] = ["Payment", "Transfer", "Cashout"];

function buildAroTransactions(): AroTransactionRecord[] {
  const records: AroTransactionRecord[] = [];
  let counter = 1;
  agents.forEach((agent, agentIdx) => {
    const count = agent.status === "active" ? 6 : 2;
    for (let i = 0; i < count; i++) {
      const type = aroTxnTypes[(agentIdx + i) % aroTxnTypes.length];
      const isCredit = type !== "Cashout";
      records.push({
        id: `atx_${counter}`,
        date: daysAgo(i, 8 + ((agentIdx + i) % 10), (i * 7) % 60),
        agentId: agent.id,
        agentName: agent.name,
        type,
        amount: Math.round(5000 + ((agentIdx + 1) * (i + 1) * 3173) % 95000),
        direction: isCredit ? "CREDIT" : "DEBIT",
        status: i === 0 && agentIdx === 2 ? "PENDING" : "COMPLETED",
      });
      counter++;
    }
  });
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const aroTransactions: AroTransactionRecord[] = buildAroTransactions();

export function getAroSummary() {
  const activeAgents = agents.filter((a) => a.status === "active").length;
  const totalVolumeToday = agents.reduce((sum, a) => sum + a.transactionVolumeToday, 0);
  const totalCommissionToday = agents.reduce((sum, a) => sum + a.commissionBalance * 0.15, 0);
  const agentsWhoTransacted = agents.filter((a) => a.transactionCountToday > 0).length;
  const activityRate = agents.length ? Math.round((agentsWhoTransacted / agents.length) * 100) : 0;
  return { activeAgents, totalVolumeToday, totalCommissionToday, activityRate };
}

// --- ARO settlement account: the officer's own earnings/commissions/payouts ---

export const aroSettlementAccount: AccountRecord = {
  id: "acct_aro_settlement",
  accountName: `${aroOfficer.name} — Settlement`,
  accountNumber: "9022110045",
  accountType: "Current",
  availableBalance: 348_920.35,
  currentBalance: 361_420.35,
  status: "active",
  currency: "NGN",
};

// The bank account an ARO withdraws (pays out) their settlement balance to.
export const aroPayoutBank = {
  bankName: "GTBank",
  accountNumber: "0123456789",
  accountName: aroOfficer.name,
};

export const aroSettlementTransactions: Transaction[] = [
  { id: "set_1", date: daysAgo(0, 9, 12), kind: "TRANSFER", description: "Commission payout — daily settlement", reference: ref("STL", 1), amount: 18_420.5, direction: "CREDIT", status: "COMPLETED" },
  { id: "set_2", date: daysAgo(1, 9, 12), kind: "TRANSFER", description: "Commission payout — daily settlement", reference: ref("STL", 2), amount: 21_050.0, direction: "CREDIT", status: "COMPLETED" },
  { id: "set_3", date: daysAgo(2, 14, 40), kind: "WITHDRAWAL", description: "Payout to bank — GTBank", reference: ref("STL", 3), amount: 150_000.0, direction: "DEBIT", status: "COMPLETED" },
  { id: "set_4", date: daysAgo(3, 9, 12), kind: "TRANSFER", description: "Commission payout — daily settlement", reference: ref("STL", 4), amount: 16_980.75, direction: "CREDIT", status: "COMPLETED" },
  { id: "set_5", date: daysAgo(4, 11, 5), kind: "VAT", description: "Service fee adjustment", reference: ref("STL", 5), amount: 1_250.0, direction: "DEBIT", status: "COMPLETED" },
  { id: "set_6", date: daysAgo(5, 9, 12), kind: "TRANSFER", description: "Commission payout — daily settlement", reference: ref("STL", 6), amount: 19_640.2, direction: "CREDIT", status: "COMPLETED" },
  { id: "set_7", date: daysAgo(6, 16, 30), kind: "TRANSFER", description: "Bonus — network activity incentive", reference: ref("STL", 7), amount: 12_500.0, direction: "CREDIT", status: "PENDING" },
  { id: "set_8", date: daysAgo(7, 9, 12), kind: "TRANSFER", description: "Commission payout — daily settlement", reference: ref("STL", 8), amount: 17_310.45, direction: "CREDIT", status: "COMPLETED" },
];

// --- Settings: account tiers (limits + upgrade targets) ---

export const accountTiers: AccountTier[] = [
  { level: 1, name: "Tier 1", dailyTransactionLimit: 50_000, maxAccountBalance: 300_000 },
  { level: 2, name: "Tier 2", dailyTransactionLimit: 200_000, maxAccountBalance: 500_000 },
  { level: 3, name: "Tier 3", dailyTransactionLimit: 5_000_000, maxAccountBalance: 50_000_000 },
];

export function getTierByLevel(level: number): AccountTier | undefined {
  return accountTiers.find((t) => t.level === level);
}

// --- Settings: Account Details ---
// Reuses the existing account records and layers the registration/contact fields shown on
// the mobile Account Details screen. Business users get one entry per linked account so the
// page can page between them; personal/ARO get a single record.

const personalAccountDetails: AccountRecord = {
  ...personalAccount,
  tierLevel: 1,
  tierStatus: "Verified",
  phone: "+234 802 555 0110",
  businessEmail: currentUser.email,
};

export function getAccountDetailsForUser(userType: UserType): AccountRecord[] {
  if (userType === "aro") {
    return [
      {
        ...aroSettlementAccount,
        tierLevel: 2,
        tierStatus: "Verified",
        phone: "+234 803 555 0199",
        businessEmail: aroOfficer.email,
      },
    ];
  }
  if (userType === "personal") {
    return [personalAccountDetails];
  }
  return businessAccounts.map((b, i) => ({
    id: b.id,
    accountName: b.businessName,
    accountNumber: b.accountNumber,
    accountType: "Business",
    availableBalance: b.balance,
    currentBalance: b.balance,
    status: "active",
    currency: "NGN",
    tierLevel: 2,
    tierStatus: "Verified",
    cacNumber: i === 0 ? "RC-1029384" : "RC-2938475",
    tinNumber: i === 0 ? "TIN-22981045" : "TIN-30847712",
    phone: i === 0 ? "+234 803 111 2200" : "+234 803 111 3300",
    businessAddress: b.address,
    businessEmail: i === 0 ? "hello@doeretail.ng" : "ops@doelogistics.ng",
    businessWebsite: i === 0 ? "www.doeretail.ng" : "www.doelogistics.ng",
  }));
}

// --- POS: a business's own POS terminals (distinct from an ARO's agents' terminals) ---

export const businessPosDevices: PosDevice[] = [
  { id: "pd_1", serial: "POS-2291", location: "Doe Retail — Marina Rd", status: "active", lastTransactionDate: daysAgo(0, 13, 10) },
  { id: "pd_2", serial: "POS-4410", location: "Doe Retail — Allen Ave", status: "active", lastTransactionDate: daysAgo(1, 16, 40) },
  { id: "pd_3", serial: "POS-1188", location: "Warehouse — Ikeja", status: "inactive", lastTransactionDate: daysAgo(8, 9, 0) },
];

// --- Settings: Help & Support ---

export const supportInfo: SupportInfo = {
  phone: "+234 700 123 4567",
  hours: "Mon–Fri, 8:00 AM – 6:00 PM (WAT)",
  email: "support@appglobalpay.ng",
};

export const faqs: FaqItem[] = [
  {
    question: "How do I upgrade my account tier?",
    answer:
      "Go to Settings → Account Limit and tap the Upgrade button next to the tier you want. You'll be guided through the verification steps required for that tier.",
  },
  {
    question: "How long do transfers take?",
    answer:
      "AppPay transfers are instant with no fees. Interbank transfers usually settle within a few minutes, and never later than 24 hours.",
  },
  {
    question: "What do I do if a POS transaction fails but I was debited?",
    answer:
      "Open a dispute from the Dispute page. Pick the transaction type, enter the reference and amount, and our team will review and reverse it if confirmed.",
  },
  {
    question: "How is my daily transaction limit calculated?",
    answer:
      "Your limit is set by your current account tier and resets at midnight. You can see your exact limit under Settings → Account Limit.",
  },
];

// --- Topbar notifications ---

export const notifications: NotificationItem[] = [
  {
    id: "ntf_1",
    title: "Transfer successful",
    message: "₦1,950.00 sent to Ada Okafor via AppPay.",
    date: daysAgo(0, 17, 26),
    tone: "success",
    read: false,
  },
  {
    id: "ntf_2",
    title: "Dispute update",
    message: "Your POS dispute POS-DSP-001 is under review.",
    date: daysAgo(0, 11, 5),
    tone: "info",
    read: false,
  },
  {
    id: "ntf_3",
    title: "Low balance warning",
    message: "Your available balance is running low. Top up to avoid failed payments.",
    date: daysAgo(1, 9, 12),
    tone: "warning",
    read: false,
  },
  {
    id: "ntf_4",
    title: "Bill payment successful",
    message: "Electricity bill of ₦4,351.03 paid to Ikeja Electric.",
    date: daysAgo(3, 15, 28),
    tone: "success",
    read: true,
  },
  {
    id: "ntf_5",
    title: "New login detected",
    message: "A new sign-in to your account was detected. If this wasn't you, reset your passcode.",
    date: daysAgo(5, 8, 2),
    tone: "info",
    read: true,
  },
];

// --- Aggregated per-agent performance, derived from aroTransactions ---

export function getAgentPerformanceRows(): AgentPerformanceRow[] {
  return agents.map((agent) => {
    const txns = aroTransactions.filter((t) => t.agentId === agent.id);
    const lastActivity = txns.reduce<string | null>(
      (latest, t) => (!latest || new Date(t.date) > new Date(latest) ? t.date : latest),
      null
    );
    return {
      agentId: agent.id,
      agentName: agent.name,
      businessName: agent.businessName,
      totalTransactionCount: txns.length,
      totalTransactionVolume: txns.reduce((sum, t) => sum + t.amount, 0),
      totalWithdrawals: txns.filter((t) => t.type === "Cashout").length,
      totalTransfers: txns.filter((t) => t.type === "Transfer").length,
      lastActivity,
    };
  });
}
