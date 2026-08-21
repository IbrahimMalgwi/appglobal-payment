import {
  AccountRecord,
  AccountTier,
  AgentRecord,
  AgentStatus,
  AroInfo,
  AroOfficerRecord,
  AroTransactionRecord,
  AroTransactionType,
  AuditLogRecord,
  BdoOfficerRecord,
  BillCategory,
  BillCategoryType,
  BusinessAccount,
  CommissionRecord,
  CommissionStatus,
  commissionRates,
  CurrentUser,
  DisputeRecord,
  EducationServiceOption,
  FaqItem,
  NotificationItem,
  NotificationRecord,
  PosDevice,
  PosTerminalRecord,
  PosTransferRecord,
  PosWithdrawalRecord,
  PricedOption,
  ReferralBonusRecord,
  ReferralBonusStatus,
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
  if (userType === "aro" || userType === "bdo") return [];
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
  { id: "txn_1", date: daysAgo(0, 17, 26), kind: "TRANSFER", description: "Transfer to Ada Okafor", reference: ref("TRX", 1), amount: 1950, fee: 0, balanceBefore: 2006.05, balanceAfter: 36.05, direction: "DEBIT", status: "COMPLETED", beneficiary: { name: "Ada Okafor", bankName: "AppPay Wallet" } },
  { id: "txn_2", date: daysAgo(0, 17, 26), kind: "VAT", description: "VAT on transfer", reference: ref("TRX", 2), amount: 1.5, direction: "DEBIT", status: "COMPLETED" },
  { id: "txn_3", date: daysAgo(0, 7, 26), kind: "TRANSFER", description: "Transfer to Musa Bello", reference: ref("TRX", 3), amount: 2000, fee: 52.5, balanceBefore: 4006.05, balanceAfter: 2006.05, direction: "DEBIT", status: "COMPLETED", beneficiary: { name: "Musa Bello", bankName: "Access Bank", bankCode: "044", accountNumber: "0123456789" } },
  { id: "txn_4", date: daysAgo(1, 19, 17), kind: "TRANSFER", description: "Transfer to Chika Eze", reference: ref("TRX", 4), amount: 3500, fee: 52.5, balanceBefore: 7506.05, balanceAfter: 4006.05, direction: "DEBIT", status: "COMPLETED", beneficiary: { name: "Chika Eze", bankName: "Zenith Bank", bankCode: "057", accountNumber: "0234567890" } },
  { id: "txn_5", date: daysAgo(1, 17, 53), kind: "TRANSFER", description: "Transfer to Femi Alade", reference: ref("TRX", 5), amount: 6020, fee: 52.5, balanceBefore: 13547.55, balanceAfter: 7507.55, direction: "DEBIT", status: "COMPLETED", beneficiary: { name: "Femi Alade", bankName: "GTBank", bankCode: "058", accountNumber: "0345678901" } },
  { id: "txn_6", date: daysAgo(2, 8, 42), kind: "TRANSFER", description: "Wallet top-up", reference: ref("TRX", 6), amount: 25600, balanceBefore: 4711.37, balanceAfter: 30311.37, direction: "CREDIT", status: "COMPLETED" },
  { id: "txn_7", date: daysAgo(2, 8, 41), kind: "TRANSFER", description: "Inbound transfer — Doe Logistics Ltd", reference: ref("TRX", 7), amount: 4700, balanceBefore: 11.37, balanceAfter: 4711.37, direction: "CREDIT", status: "COMPLETED", beneficiary: { name: "Doe Logistics Ltd", bankName: "AppPay Wallet" } },
  { id: "txn_8", date: daysAgo(3, 15, 28), kind: "BILL", description: "Electricity bill payment — Ikeja Electric", reference: ref("BIL", 1), amount: 4351.03, fee: 0, direction: "DEBIT", status: "COMPLETED", biller: { billerName: "Ikeja Electric", customerNumber: "1234567890", serviceType: "Electricity" } },
  { id: "txn_9", date: daysAgo(4, 12, 5), kind: "AIRTIME", description: "Airtime purchase — 08012345678", reference: ref("AIR", 1), amount: 1000, fee: 0, direction: "DEBIT", status: "COMPLETED", biller: { billerName: "MTN", customerNumber: "08012345678", serviceType: "Airtime" } },
  { id: "txn_10", date: daysAgo(5, 10, 15), kind: "DATA", description: "Data bundle — 5GB", reference: ref("DAT", 1), amount: 2500, fee: 0, direction: "DEBIT", status: "COMPLETED", biller: { billerName: "MTN", customerNumber: "08012345678", serviceType: "Data" } },
  { id: "txn_11", date: daysAgo(6, 14, 0), kind: "WITHDRAWAL", description: "POS withdrawal — Doe Retail Store", reference: ref("WDL", 1), amount: 8200, direction: "DEBIT", status: "DISPUTED" },
  { id: "txn_12", date: daysAgo(7, 9, 30), kind: "CARD", description: "Card payment — Online checkout", reference: ref("CRD", 1), amount: 15000, direction: "DEBIT", status: "PENDING" },
  { id: "txn_13", date: daysAgo(2, 11, 0), kind: "BILL", description: "Cable TV subscription — DStv Compact", reference: ref("BIL", 2), amount: 9000, fee: 0, direction: "DEBIT", status: "COMPLETED", biller: { billerName: "DStv", customerNumber: "1122334455", serviceType: "Cable TV" } },
  { id: "txn_14", date: daysAgo(9, 16, 20), kind: "BILL", description: "Hospital bill — Reddington Clinic", reference: ref("BIL", 3), amount: 22000, fee: 0, direction: "DEBIT", status: "COMPLETED", biller: { billerName: "Reddington Clinic", customerNumber: "H-2291", serviceType: "Hospital" } },
  { id: "txn_15", date: daysAgo(10, 13, 5), kind: "BILL", description: "Internet subscription — Spectranet", reference: ref("BIL", 4), amount: 18000, fee: 0, direction: "DEBIT", status: "COMPLETED", biller: { billerName: "Spectranet", customerNumber: "9988776655", serviceType: "Internet" } },
  { id: "txn_16", date: daysAgo(12, 9, 40), kind: "BILL", description: "School fees — WAEC registration", reference: ref("BIL", 5), amount: 32000, fee: 0, direction: "DEBIT", status: "COMPLETED", biller: { billerName: "WAEC", customerNumber: "WAEC-58211", serviceType: "Education" } },
  { id: "txn_17", date: daysAgo(8, 15, 0), kind: "BILL", description: "Water bill payment — Lagos Water Corp", reference: ref("BIL", 6), amount: 3200, fee: 0, direction: "DEBIT", status: "COMPLETED", biller: { billerName: "Lagos Water Corp", customerNumber: "LWC-33221", serviceType: "Utility" } },
  { id: "txn_18", date: daysAgo(11, 10, 0), kind: "TRANSFER", description: "Transfer to Bola Ige (reversed)", reference: ref("TRX", 8), amount: 5000, fee: 52.5, direction: "DEBIT", status: "REVERSED", beneficiary: { name: "Bola Ige", bankName: "UBA", bankCode: "033", accountNumber: "0456789012" } },
  { id: "txn_19", date: daysAgo(13, 9, 0), kind: "BILL", description: "Cable TV subscription — GOtv (cancelled)", reference: ref("BIL", 7), amount: 4500, fee: 0, direction: "DEBIT", status: "CANCELLED", biller: { billerName: "GOtv", customerNumber: "5544332211", serviceType: "Cable TV" } },
];

export const topFiveTransactions = transactions.slice(0, 5);

export function getTransactionById(id: string): Transaction | undefined {
  return transactions.find((t) => t.id === id);
}

// A transaction is only disputable while it's still in a state a dispute could act on —
// already-disputed/reversed/cancelled/failed transactions have nothing left to contest.
export function isDisputable(t: Transaction): boolean {
  return t.status === "COMPLETED" || t.status === "PENDING";
}

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

// --- Disputes: POS + Withdrawal + Card (manually raised by business accounts) ---
// "transaction"-category disputes are intentionally not seeded here — that category only
// ever gets created via the "Raise Dispute" action on a real Transaction Details page.

export const disputes: DisputeRecord[] = [
  { id: "d_1", category: "pos", reference: "POS-DSP-001", amount: 12000, date: daysAgo(4, 12, 0), reason: "Terminal charged twice", status: "open" },
  { id: "d_2", category: "pos", reference: "POS-DSP-002", amount: 4000, date: daysAgo(11, 9, 0), reason: "Failed transfer, amount debited", status: "resolved" },
  { id: "d_3", category: "withdrawal", reference: "WDL-DSP-001", amount: 8200, date: daysAgo(6, 15, 0), reason: "Cash not dispensed", status: "open" },
  { id: "d_4", category: "withdrawal", reference: "WDL-DSP-002", amount: 5000, date: daysAgo(9, 10, 0), reason: "Incorrect amount dispensed", status: "rejected" },
  { id: "d_5", category: "card", reference: "CRD-DSP-001", amount: 15000, date: daysAgo(5, 10, 0), reason: "Unauthorized card charge", status: "open" },
  { id: "d_6", category: "card", reference: "CRD-DSP-002", amount: 8000, date: daysAgo(13, 14, 0), reason: "Card declined but amount deducted", status: "resolved" },
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

// --- Bill Payment: per-category configs, kept out of the components so no form hardcodes
// its own option list. ---

// Data bundles — shared across networks rather than priced per-network, since a real catalog
// would come from a biller integration either way and this keeps the mock config simple.
export const dataBundles: PricedOption[] = [
  { id: "1gb", label: "1GB - 1 Day", price: 300 },
  { id: "2gb", label: "2GB - 2 Days", price: 500 },
  { id: "5gb", label: "5GB - 7 Days", price: 1500 },
  { id: "10gb", label: "10GB - 30 Days", price: 3000 },
];

// Electricity — same naming precedent already used in the transactions mock data
// ("Electricity bill payment — Ikeja Electric").
export const electricityProviders = ["Ikeja Electric", "Eko Electric", "Abuja Electric"] as const;
export const electricityRatePerUnit = 209.5; // ₦ per kWh (mock)

// Cable TV — provider then package, same "priced options" shape as the Data bundle picker.
export const cableProviders = ["DSTV", "GOtv", "StarTimes"] as const;
export type CableProvider = (typeof cableProviders)[number];

export const cablePackages: Record<CableProvider, PricedOption[]> = {
  DSTV: [
    { id: "padi", label: "Padi", price: 4400 },
    { id: "yanga", label: "Yanga", price: 6000 },
    { id: "confam", label: "Confam", price: 9300 },
    { id: "compact", label: "Compact", price: 19000 },
    { id: "compact-plus", label: "Compact Plus", price: 30000 },
    { id: "premium", label: "Premium", price: 44500 },
  ],
  GOtv: [
    { id: "smallie", label: "Smallie", price: 1900 },
    { id: "jinja", label: "Jinja", price: 3900 },
    { id: "jolli", label: "Jolli", price: 5800 },
    { id: "max", label: "Max", price: 8500 },
  ],
  StarTimes: [
    { id: "nova", label: "Nova", price: 1700 },
    { id: "basic", label: "Basic", price: 3200 },
    { id: "smart", label: "Smart", price: 4200 },
    { id: "classic", label: "Classic", price: 5000 },
  ],
};

export const internetProviders = ["Spectranet", "Starlink", "ipNX", "MainOne", "MTN FibreX", "Airtel"] as const;

export const educationServices: EducationServiceOption[] = [
  { id: "waec", label: "WAEC Result Checker PIN", identifierLabel: "Registration Number", suggestedAmount: 3400 },
  { id: "neco", label: "NECO", identifierLabel: "Registration Number", suggestedAmount: 1300 },
  { id: "jamb", label: "JAMB", identifierLabel: "JAMB Registration Number", suggestedAmount: 6200 },
  { id: "school-fees", label: "School Fees", identifierLabel: "Student ID", suggestedAmount: 50000 },
];

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

// --- ARO / BDO hierarchy: BDO -> ARO -> Agent -> Business Account(s) -> POS Terminal(s) -> Transactions ---
//
// Deterministic pseudo-random helper so mock amounts/dates vary without using Math.random()
// (which would produce a different value on the server render vs. the client hydration pass
// and throw a hydration mismatch). Pure function of an integer seed.
function pseudo(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export const bdoOfficer: BdoOfficerRecord = {
  name: "Ngozi Chukwu",
  email: "ngozi.chukwu@appglobalpay.ng",
};

export const aros: AroOfficerRecord[] = [
  {
    id: "aro_1",
    name: "Tunde Bakare",
    email: "tunde.bakare@example.com",
    status: "active",
    cluster: "Lagos Mainland Cluster",
    manager: bdoOfficer.name,
    onboardingDate: daysAgo(420, 9, 0),
  },
  {
    id: "aro_2",
    name: "Amina Bello",
    email: "amina.bello@example.com",
    status: "active",
    cluster: "Abuja Central Cluster",
    manager: bdoOfficer.name,
    onboardingDate: daysAgo(365, 9, 0),
  },
  {
    id: "aro_3",
    name: "Chukwuemeka Obi",
    email: "chukwuemeka.obi@example.com",
    status: "active",
    cluster: "Port Harcourt Cluster",
    manager: bdoOfficer.name,
    onboardingDate: daysAgo(280, 9, 0),
  },
  {
    id: "aro_4",
    name: "Halima Sani",
    email: "halima.sani@example.com",
    status: "active",
    cluster: "Kano Cluster",
    manager: bdoOfficer.name,
    onboardingDate: daysAgo(190, 9, 0),
  },
];

export function getAroById(id: string): AroOfficerRecord | undefined {
  return aros.find((a) => a.id === id);
}

// The currently-logged-in ARO for this demo session — same convention as businessAccounts[0]
// being treated as the active business account elsewhere in this app.
export const selfAro = aros[0];

interface AgentSeed {
  id: string;
  aroId: string;
  name: string;
  businessName: string;
  phone: string;
  email: string;
  address: string;
  status: AgentStatus;
  onboardingDaysAgo: number;
  bankName: string;
  accountNumber: string;
  assignment?: { businessOrMerchant: string; task?: string };
  accountCount: 1 | 2;
  terminalsPerAccount: number[]; // one entry per account
}

const agentSeeds: AgentSeed[] = [
  {
    id: "agt_1",
    aroId: "aro_1",
    name: "Ibrahim Suleiman",
    businessName: "Suleiman Mini Mart",
    phone: "+234 801 111 2222",
    email: "ibrahim.suleiman@example.com",
    address: "12 Adeniran Ogunsanya St, Surulere, Lagos",
    status: "active",
    onboardingDaysAgo: 260,
    bankName: "AppGlobal MFB",
    accountNumber: "7011223344",
    assignment: { businessOrMerchant: "Doe Retail Ventures", task: "POS terminal support & reconciliation" },
    accountCount: 2,
    terminalsPerAccount: [2, 1],
  },
  {
    id: "agt_2",
    aroId: "aro_1",
    name: "Blessing Nwachukwu",
    businessName: "Blessing Stores",
    phone: "+234 802 222 3333",
    email: "blessing.nwachukwu@example.com",
    address: "45 Ikorodu Road, Maryland, Lagos",
    status: "active",
    onboardingDaysAgo: 205,
    bankName: "AppGlobal MFB",
    accountNumber: "7022334455",
    assignment: { businessOrMerchant: "Doe Logistics Ltd", task: "Merchant onboarding" },
    accountCount: 1,
    terminalsPerAccount: [2],
  },
  {
    id: "agt_3",
    aroId: "aro_1",
    name: "Emeka Obi",
    businessName: "Obi Electronics & POS",
    phone: "+234 803 333 4444",
    email: "emeka.obi@example.com",
    address: "3 Opebi Link Road, Ikeja, Lagos",
    status: "active",
    onboardingDaysAgo: 340,
    bankName: "GTBank",
    accountNumber: "0033445566",
    assignment: { businessOrMerchant: "Ikeja City Mall Hub" },
    accountCount: 2,
    terminalsPerAccount: [3, 2],
  },
  {
    id: "agt_4",
    aroId: "aro_1",
    name: "Fatima Yusuf",
    businessName: "Yusuf Provisions",
    phone: "+234 804 444 5555",
    email: "fatima.yusuf@example.com",
    address: "21 Herbert Macaulay Way, Yaba, Lagos",
    status: "pending",
    onboardingDaysAgo: 4,
    bankName: "AppGlobal MFB",
    accountNumber: "7044556677",
    accountCount: 1,
    terminalsPerAccount: [1],
  },
  {
    id: "agt_5",
    aroId: "aro_1",
    name: "Chinedu Umeh",
    businessName: "Umeh Fashion Hub",
    phone: "+234 805 555 6666",
    email: "chinedu.umeh@example.com",
    address: "9 Awolowo Road, Ikoyi, Lagos",
    status: "inactive",
    onboardingDaysAgo: 300,
    bankName: "Zenith Bank",
    accountNumber: "2011223344",
    accountCount: 1,
    terminalsPerAccount: [2],
  },
  {
    id: "agt_6",
    aroId: "aro_1",
    name: "Amaka Eze",
    businessName: "Eze Pharmacy & Store",
    phone: "+234 806 666 7777",
    email: "amaka.eze@example.com",
    address: "18 Toyin Street, Ikeja, Lagos",
    status: "active",
    onboardingDaysAgo: 95,
    bankName: "AppGlobal MFB",
    accountNumber: "7066778899",
    accountCount: 1,
    terminalsPerAccount: [3],
  },
  {
    id: "agt_7",
    aroId: "aro_2",
    name: "Yusuf Danladi",
    businessName: "Danladi Electronics",
    phone: "+234 807 111 2233",
    email: "yusuf.danladi@example.com",
    address: "Ademola Adetokunbo Crescent, Wuse II, Abuja",
    status: "active",
    onboardingDaysAgo: 250,
    bankName: "AppGlobal MFB",
    accountNumber: "7077889900",
    accountCount: 2,
    terminalsPerAccount: [2, 2],
  },
  {
    id: "agt_8",
    aroId: "aro_2",
    name: "Grace Adeyemi",
    businessName: "Adeyemi Foods",
    phone: "+234 808 222 3344",
    email: "grace.adeyemi@example.com",
    address: "Aminu Kano Crescent, Wuse II, Abuja",
    status: "active",
    onboardingDaysAgo: 140,
    bankName: "GTBank",
    accountNumber: "0044556677",
    accountCount: 1,
    terminalsPerAccount: [3],
  },
  {
    id: "agt_9",
    aroId: "aro_2",
    name: "Kabir Musa",
    businessName: "Musa Fashion House",
    phone: "+234 809 333 4455",
    email: "kabir.musa@example.com",
    address: "Gimbiya Street, Area 11, Garki, Abuja",
    status: "inactive",
    onboardingDaysAgo: 310,
    bankName: "Zenith Bank",
    accountNumber: "2022334455",
    accountCount: 1,
    terminalsPerAccount: [1],
  },
  {
    id: "agt_10",
    aroId: "aro_3",
    name: "Chiamaka Nwosu",
    businessName: "Nwosu Pharmacy",
    phone: "+234 810 444 5566",
    email: "chiamaka.nwosu@example.com",
    address: "Aba Road, GRA Phase 2, Port Harcourt",
    status: "active",
    onboardingDaysAgo: 220,
    bankName: "AppGlobal MFB",
    accountNumber: "7088990011",
    accountCount: 2,
    terminalsPerAccount: [2, 1],
  },
  {
    id: "agt_11",
    aroId: "aro_3",
    name: "Segun Afolabi",
    businessName: "Afolabi Auto Parts",
    phone: "+234 811 555 6677",
    email: "segun.afolabi@example.com",
    address: "Ikwerre Road, Mile 3, Port Harcourt",
    status: "active",
    onboardingDaysAgo: 60,
    bankName: "AppGlobal MFB",
    accountNumber: "7099001122",
    accountCount: 1,
    terminalsPerAccount: [2],
  },
  {
    id: "agt_12",
    aroId: "aro_3",
    name: "Halima Yakubu",
    businessName: "Yakubu General Store",
    phone: "+234 812 666 7788",
    email: "halima.yakubu@example.com",
    address: "Trans Amadi Industrial Layout, Port Harcourt",
    status: "pending",
    onboardingDaysAgo: 2,
    bankName: "GTBank",
    accountNumber: "0055667788",
    accountCount: 1,
    terminalsPerAccount: [1],
  },
  {
    id: "agt_13",
    aroId: "aro_4",
    name: "Peter Okon",
    businessName: "Okon Mini Mart",
    phone: "+234 813 777 8899",
    email: "peter.okon@example.com",
    address: "Zoo Road, Sabon Gari, Kano",
    status: "active",
    onboardingDaysAgo: 180,
    bankName: "AppGlobal MFB",
    accountNumber: "7100112233",
    accountCount: 2,
    terminalsPerAccount: [3, 1],
  },
  {
    id: "agt_14",
    aroId: "aro_4",
    name: "Ifeoma Nnamdi",
    businessName: "Nnamdi Provisions",
    phone: "+234 814 888 9900",
    email: "ifeoma.nnamdi@example.com",
    address: "Ibrahim Taiwo Road, Kano",
    status: "active",
    onboardingDaysAgo: 75,
    bankName: "Zenith Bank",
    accountNumber: "2033445566",
    accountCount: 1,
    terminalsPerAccount: [2],
  },
  {
    id: "agt_15",
    aroId: "aro_4",
    name: "Suleiman Garba",
    businessName: "Garba Textiles",
    phone: "+234 815 999 0011",
    email: "suleiman.garba@example.com",
    address: "Murtala Mohammed Way, Kano",
    status: "inactive",
    onboardingDaysAgo: 330,
    bankName: "AppGlobal MFB",
    accountNumber: "7111223344",
    accountCount: 1,
    terminalsPerAccount: [1],
  },
];

const billCategoryTypes: BillCategoryType[] = ["Airtime", "Data", "Hospital", "Utility", "CableTV"];
const aroTxnKinds: AroTransactionType[] = ["TransferIn", "CardWithdrawal", "BillPayment"];

const agents: AgentRecord[] = [];
export const posTerminals: PosTerminalRecord[] = [];
const generatedAroTransactions: AroTransactionRecord[] = [];
let txnCounter = 1;

agentSeeds.forEach((seed, agentIdx) => {
  const businessAccounts: AccountRecord[] = [];
  for (let a = 0; a < seed.accountCount; a++) {
    const accountId = `${seed.id}_acct_${a + 1}`;
    const accountSeed = agentIdx * 7 + a * 3 + 1;
    businessAccounts.push({
      id: accountId,
      accountName: seed.accountCount > 1 ? `${seed.businessName} — Branch ${a + 1}` : seed.businessName,
      accountNumber: `70${String(1000000 + agentIdx * 137 + a * 41).slice(0, 8)}`,
      accountType: "Business",
      availableBalance: Math.round(50_000 + pseudo(accountSeed) * 450_000),
      currentBalance: Math.round(55_000 + pseudo(accountSeed + 0.5) * 460_000),
      status: seed.status === "removed" ? "inactive" : "active",
      currency: "NGN",
    });

    const terminalCount = seed.terminalsPerAccount[a] ?? 1;
    for (let t = 0; t < terminalCount; t++) {
      const terminalId = `${accountId}_pos_${t + 1}`;
      const terminalSeed = agentIdx * 31 + a * 11 + t * 5 + 1;
      // A minority of terminals are inactive, and every "inactive" agent's terminals are inactive too.
      const terminalActive = seed.status !== "inactive" && pseudo(terminalSeed) > 0.15;

      let terminalTxnCount = 0;
      let terminalTxnVolume = 0;
      let terminalTransferInCount = 0;
      let terminalTransferInVolume = 0;
      let terminalCardWithdrawalCount = 0;
      let terminalCardWithdrawalVolume = 0;
      let terminalBillPaymentCount = 0;
      let terminalBillPaymentVolume = 0;
      let terminalCommission = 0;
      let terminalLastTxnDate: string | null = null;

      const txnBatch = terminalActive ? 9 : 2;
      for (let i = 0; i < txnBatch; i++) {
        const s = terminalSeed * 97 + i * 13;
        const kind = aroTxnKinds[Math.floor(pseudo(s) * aroTxnKinds.length) % aroTxnKinds.length];
        const daysBack = Math.floor(pseudo(s + 0.25) * 45);
        const hour = 8 + Math.floor(pseudo(s + 0.5) * 11);
        const minute = Math.floor(pseudo(s + 0.75) * 60);
        const date = daysAgo(daysBack, hour, minute);
        const amount = Math.round(2000 + pseudo(s + 0.1) * 148_000);
        const billCategory =
          kind === "BillPayment" ? billCategoryTypes[Math.floor(pseudo(s + 0.6) * billCategoryTypes.length) % billCategoryTypes.length] : undefined;

        const txn: AroTransactionRecord = {
          id: `atx_${txnCounter}`,
          date,
          aroId: seed.aroId,
          agentId: seed.id,
          agentName: seed.name,
          accountId,
          posTerminalId: terminalId,
          reference: ref("ATX", txnCounter),
          type: kind,
          billCategory,
          amount,
          direction: kind === "CardWithdrawal" ? "DEBIT" : "CREDIT",
          status: pseudo(s + 0.9) > 0.93 ? "PENDING" : "COMPLETED",
        };
        txnCounter++;
        generatedAroTransactions.push(txn);

        terminalTxnCount++;
        terminalTxnVolume += amount;
        if (kind === "TransferIn") {
          terminalTransferInCount++;
          terminalTransferInVolume += amount;
        } else if (kind === "CardWithdrawal") {
          terminalCardWithdrawalCount++;
          terminalCardWithdrawalVolume += amount;
        } else {
          terminalBillPaymentCount++;
          terminalBillPaymentVolume += amount;
        }
        terminalCommission += amount * commissionRates[kind];
        if (!terminalLastTxnDate || new Date(date) > new Date(terminalLastTxnDate)) {
          terminalLastTxnDate = date;
        }
      }

      posTerminals.push({
        id: terminalId,
        agentId: seed.id,
        accountId,
        serial: `POS-${1000 + agentIdx * 17 + a * 4 + t}`,
        status: terminalActive ? "active" : "inactive",
        transactionCount: terminalTxnCount,
        transactionVolume: terminalTxnVolume,
        transferInCount: terminalTransferInCount,
        transferInVolume: terminalTransferInVolume,
        cardWithdrawalCount: terminalCardWithdrawalCount,
        cardWithdrawalVolume: terminalCardWithdrawalVolume,
        billPaymentCount: terminalBillPaymentCount,
        billPaymentVolume: terminalBillPaymentVolume,
        lastTransactionDate: terminalLastTxnDate,
        commissionGenerated: Math.round(terminalCommission * 100) / 100,
      });
    }
  }

  const agentTxns = generatedAroTransactions.filter((t) => t.agentId === seed.id);
  const todayTxns = agentTxns.filter((t) => t.date.slice(0, 10) === daysAgo(0).slice(0, 10));
  const agentTerminals = posTerminals.filter((p) => p.agentId === seed.id);

  agents.push({
    id: seed.id,
    aroId: seed.aroId,
    name: seed.name,
    businessName: seed.businessName,
    phone: seed.phone,
    email: seed.email,
    address: seed.address,
    status: seed.status,
    onboardingDate: daysAgo(seed.onboardingDaysAgo, 10, 0),
    businessAccounts,
    bankName: seed.bankName,
    accountNumber: seed.accountNumber,
    transactionVolumeToday: todayTxns.reduce((sum, t) => sum + t.amount, 0),
    transactionCountToday: todayTxns.length,
    terminalWithdrawalsToday: todayTxns.filter((t) => t.type === "CardWithdrawal").length,
    commissionBalance: Math.round(agentTerminals.reduce((sum, p) => sum + p.commissionGenerated, 0) * 100) / 100,
    assignment: seed.assignment,
  });
});

export { agents };

export function getAgentById(id: string): AgentRecord | undefined {
  return agents.find((a) => a.id === id);
}

export function getAgentsForAro(aroId: string): AgentRecord[] {
  return agents.filter((a) => a.aroId === aroId);
}

export const aroTransactions: AroTransactionRecord[] = generatedAroTransactions.sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

// --- Commissions: one record per transaction, using the single commissionRates config above ---

export const commissions: CommissionRecord[] = aroTransactions.map((t, i) => {
  const daysOld = (Date.now() - new Date(t.date).getTime()) / (1000 * 60 * 60 * 24);
  const status: CommissionStatus = daysOld > 7 ? "paid" : "pending";
  const amount = Math.round(t.amount * commissionRates[t.type] * 100) / 100;
  return {
    id: `cmn_${i + 1}`,
    aroId: t.aroId,
    agentId: t.agentId,
    agentName: t.agentName,
    posTerminalId: t.posTerminalId,
    transactionId: t.id,
    transactionType: t.type,
    amount,
    status,
    date: t.date,
    paidDate: status === "paid" ? daysAgo(Math.max(0, Math.round(daysOld) - 2), 9, 0) : undefined,
  };
});

// --- Referral / onboarding bonuses: one per agent, earned by the ARO who onboarded them ---

export const referralBonuses: ReferralBonusRecord[] = agentSeeds.map((seed, i) => {
  const bonusAmount = 5_000 + (i % 4) * 2_500;
  const bonusStatus: ReferralBonusStatus = seed.onboardingDaysAgo > 30 ? "paid" : "pending";
  return {
    id: `rfb_${i + 1}`,
    aroId: seed.aroId,
    referredAgentId: seed.id,
    referredAgentName: seed.name,
    onboardingDate: daysAgo(seed.onboardingDaysAgo, 10, 0),
    status: seed.status,
    bonusAmount,
    bonusStatus,
    paymentDate: bonusStatus === "paid" ? daysAgo(seed.onboardingDaysAgo - 5, 9, 0) : undefined,
  };
});

// --- ARO/BDO notifications ---

export const aroNotifications: NotificationRecord[] = [
  {
    id: "arn_1",
    aroId: "aro_1",
    type: "agent-inactive",
    message: "Chinedu Umeh (Umeh Fashion Hub) has had no transactions in over 14 days.",
    relatedAgentId: "agt_5",
    timestamp: daysAgo(0, 8, 15),
    read: false,
    actionLink: "/aro/agents/agt_5",
  },
  {
    id: "arn_2",
    aroId: "aro_1",
    type: "new-agent",
    message: "Fatima Yusuf (Yusuf Provisions) was onboarded and is pending activation.",
    relatedAgentId: "agt_4",
    timestamp: daysAgo(4, 11, 0),
    read: false,
    actionLink: "/aro/agents/agt_4",
  },
  {
    id: "arn_3",
    aroId: "aro_1",
    type: "commission-generated",
    message: "New commission generated from Emeka Obi's terminal — Obi Electronics & POS.",
    relatedAgentId: "agt_3",
    timestamp: daysAgo(1, 14, 30),
    read: true,
    actionLink: "/aro/commission",
  },
  {
    id: "arn_4",
    aroId: "aro_1",
    type: "milestone",
    message: "Ibrahim Suleiman crossed ₦800,000 in transaction volume this month.",
    relatedAgentId: "agt_1",
    timestamp: daysAgo(2, 9, 45),
    read: true,
    actionLink: "/aro/agents/agt_1",
  },
  {
    id: "arn_5",
    aroId: "aro_1",
    type: "pos-inactive",
    message: "A POS terminal on Umeh Fashion Hub's account has gone inactive.",
    relatedAgentId: "agt_5",
    timestamp: daysAgo(3, 16, 10),
    read: true,
    actionLink: "/aro/pos",
  },
  {
    id: "arn_6",
    aroId: "aro_1",
    type: "referral-bonus",
    message: "Your referral bonus for onboarding Amaka Eze has been paid out.",
    relatedAgentId: "agt_6",
    timestamp: daysAgo(6, 9, 0),
    read: true,
    actionLink: "/aro/referrals",
  },
  {
    id: "arn_7",
    type: "milestone",
    message: "Lagos Mainland Cluster (Tunde Bakare) is the top-performing cluster this month.",
    timestamp: daysAgo(1, 8, 0),
    read: false,
    actionLink: "/bdo/aros",
  },
  {
    id: "arn_8",
    type: "new-agent",
    message: "3 new agents were onboarded across the network this week.",
    timestamp: daysAgo(2, 10, 0),
    read: true,
    actionLink: "/bdo/agents",
  },
];

export function getNotificationsForAro(aroId: string): NotificationRecord[] {
  return aroNotifications
    .filter((n) => n.aroId === aroId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getNotificationsForBdo(): NotificationRecord[] {
  return [...aroNotifications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// --- Audit log: written whenever an agent is removed/deactivated from a portfolio ---

export const auditLog: AuditLogRecord[] = [
  {
    id: "aud_1",
    user: selfAro.name,
    action: "Deactivated agent",
    recordType: "Agent",
    recordId: "agt_5",
    timestamp: daysAgo(20, 15, 0),
    previousValue: "active",
    newValue: "inactive",
  },
];

// Removing an agent from a portfolio doesn't delete their record — historical transactions,
// commissions, and referral records must stay intact and queryable — it only flips status and
// writes an audit trail entry. Mutates the shared `agents`/`auditLog` arrays in place (this app
// has no backend/global store yet, so this is how a change stays visible across pages/routes
// that each read fresh from lib/mock-data — same convention as everywhere else in this app that
// treats these arrays as the single source of truth).
export function removeAgentFromPortfolio(agentId: string, performedBy: string): AgentRecord | undefined {
  const agent = agents.find((a) => a.id === agentId);
  if (!agent) return undefined;
  const previousValue = agent.status;
  agent.status = "removed";
  auditLog.unshift({
    id: `aud_${auditLog.length + 1}`,
    user: performedBy,
    action: "Removed agent from portfolio",
    recordType: "Agent",
    recordId: agentId,
    timestamp: new Date().toISOString(),
    previousValue,
    newValue: "removed",
  });
  return agent;
}

// Assigns a newly-issued POS terminal to an existing agent's business account. New terminals
// start inactive with zeroed metrics — they only start contributing to performance/commission
// numbers once real transactions run through them. Mutates the shared `posTerminals` array in
// place for the same reason removeAgentFromPortfolio does (no backend/global store yet).
export function addPosTerminal(agentId: string, accountId: string, serial: string): PosTerminalRecord {
  const terminal: PosTerminalRecord = {
    id: `${accountId}_pos_${Date.now()}`,
    agentId,
    accountId,
    serial,
    status: "inactive",
    transactionCount: 0,
    transactionVolume: 0,
    transferInCount: 0,
    transferInVolume: 0,
    cardWithdrawalCount: 0,
    cardWithdrawalVolume: 0,
    billPaymentCount: 0,
    billPaymentVolume: 0,
    lastTransactionDate: null,
    commissionGenerated: 0,
  };
  posTerminals.push(terminal);
  return terminal;
}

// --- ARO settlement account: the officer's own earnings/commissions/payouts ---

export const aroSettlementAccount: AccountRecord = {
  id: "acct_aro_settlement",
  accountName: `${selfAro.name} — Settlement`,
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
  accountName: selfAro.name,
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
  if (userType === "bdo") {
    // BDOs have no personal settlement/payout account — oversight-only role.
    return [];
  }
  if (userType === "aro") {
    return [
      {
        ...aroSettlementAccount,
        tierLevel: 2,
        tierStatus: "Verified",
        phone: "+234 803 555 0199",
        businessEmail: selfAro.email,
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

// Aggregation helpers (agent performance, POS performance, ARO/BDO summaries, commission
// and referral rollups) live in lib/aro-analytics.ts, not here — see that file.
