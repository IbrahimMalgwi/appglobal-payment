export type UserType = "personal" | "business" | "aro" | "bdo";

// --- Sign-up onboarding wizard ---

export type SignupStep = "role" | "identity" | "business-info" | "security";
export type IdType = "BVN" | "NIN";

export interface DirectorInfo {
  name: string;
  designation: string;
}

export interface BusinessInfo {
  businessName: string;
  registeredAddress: string;
  cacNumber: string;
  directors: DirectorInfo[];
  certificateOfIncorporation: File | null;
  boardResolution: File | null;
}

export interface SignupFormState {
  role: UserType | null;
  idType: IdType | null;
  idNumber: string;
  businessInfo: BusinessInfo;
  passcode: string;
  transactionPin: string;
}

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
export type TransactionStatus = "COMPLETED" | "PENDING" | "FAILED" | "REVERSED" | "CANCELLED" | "DISPUTED";

export interface TransactionBeneficiary {
  name: string;
  accountNumber?: string;
  bankName?: string;
  bankCode?: string;
}

export interface TransactionBiller {
  billerName: string;
  customerNumber: string;
  serviceType: string;
}

export interface Transaction {
  id: string;
  date: string; // ISO string
  kind: TransactionKind;
  description: string;
  reference: string;
  amount: number;
  fee?: number;
  balanceBefore?: number;
  balanceAfter?: number;
  direction: TransactionDirection;
  status: TransactionStatus;
  // Populated for TRANSFER transactions — who the money went to.
  beneficiary?: TransactionBeneficiary;
  // Populated for BILL/AIRTIME/DATA transactions — what was paid for.
  biller?: TransactionBiller;
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

// "pos"/"withdrawal"/"card" are raised manually via the type picker on the Dispute page
// (business accounts only, for the three POS-terminal/card issue types they can hit).
// "transaction" is never manually picked — it's the category every dispute gets when raised
// from the "Raise Dispute" action on a specific Transaction Details page, for any user type.
export type DisputeCategory = "pos" | "withdrawal" | "card" | "transaction";

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
  // Extended details surfaced on Settings → Account Details. Optional because not every
  // account (e.g. a personal account) carries business registration fields.
  tierLevel?: number;
  tierStatus?: string;
  cacNumber?: string;
  tinNumber?: string;
  phone?: string;
  businessAddress?: string;
  businessEmail?: string;
  businessWebsite?: string;
}

// Account tiers shown on Settings → Account Limit (current tier + upgrade targets).
export interface AccountTier {
  level: number;
  name: string;
  dailyTransactionLimit: number;
  maxAccountBalance: number;
}

// --- Settings → Help & Support ---

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SupportInfo {
  phone: string;
  hours: string;
  email: string;
}

export interface SupportMessage {
  id: string;
  text: string;
  date: string;
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

// A single priced choice in a "pick from priced options" picker — the shared shape behind
// both the Data bundle picker and the Cable TV package picker.
export interface PricedOption {
  id: string;
  label: string;
  price: number;
}

// An Education service type — the identifier field's label and the suggested amount both
// depend on which service is selected.
export interface EducationServiceOption {
  id: string;
  label: string;
  identifierLabel: string;
  suggestedAmount: number;
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

// --- Topbar notifications ---

export type NotificationTone = "info" | "success" | "warning";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string; // ISO string
  tone: NotificationTone;
  read: boolean;
}

// --- Agent Relationship Officer (ARO) + Business Development Officer (BDO) dashboards ---
//
// Hierarchy: BDO -> ARO -> Agent -> Business Account(s) -> POS Terminal(s) -> Transactions.
// An ARO can only ever query data for their own aroId (enforced in lib/aro-analytics.ts,
// not just hidden in the UI); a BDO can pass any aroId since they view across the org.

export type AroOfficerStatus = "active" | "inactive";

export interface AroOfficerRecord {
  id: string;
  name: string;
  email: string;
  status: AroOfficerStatus;
  cluster: string;
  manager: string;
  onboardingDate: string; // ISO
}

export interface BdoOfficerRecord {
  name: string;
  email: string;
}

export type AgentStatus = "active" | "inactive" | "pending" | "removed";

export interface AgentRecord {
  id: string;
  aroId: string;
  name: string;
  businessName: string;
  phone: string;
  email: string;
  address: string;
  status: AgentStatus;
  onboardingDate: string; // ISO — drives "newly onboarded" / referral metrics
  businessAccounts: AccountRecord[];
  bankName: string;
  accountNumber: string;
  transactionVolumeToday: number; // Naira
  transactionCountToday: number;
  terminalWithdrawalsToday: number;
  commissionBalance: number;
  assignment?: {
    businessOrMerchant: string;
    task?: string;
  };
}

export interface PosTerminalRecord {
  id: string;
  agentId: string;
  accountId: string;
  serial: string;
  status: "active" | "inactive";
  transactionCount: number;
  transactionVolume: number;
  transferInCount: number;
  transferInVolume: number;
  cardWithdrawalCount: number;
  cardWithdrawalVolume: number;
  billPaymentCount: number;
  billPaymentVolume: number;
  lastTransactionDate: string | null; // ISO
  commissionGenerated: number;
}

// Derived (not stored) — replaces the old fixed { total, active, inactive } summary.
export interface TerminalCounts {
  total: number;
  active: number;
  inactive: number;
}

export type AroTransactionType = "TransferIn" | "CardWithdrawal" | "BillPayment";
export type BillCategoryType = "Airtime" | "Data" | "Hospital" | "Utility" | "CableTV";

export interface AroTransactionRecord {
  id: string;
  date: string;
  aroId: string;
  agentId: string;
  agentName: string;
  accountId: string;
  posTerminalId: string;
  reference: string;
  type: AroTransactionType;
  billCategory?: BillCategoryType; // set only when type === "BillPayment"
  amount: number;
  direction: TransactionDirection;
  status: TransactionStatus;
}

// Aggregated per-agent performance metrics, derived from aroTransactions/commissions.
export interface AgentPerformanceRow {
  agentId: string;
  agentName: string;
  businessName: string;
  aroId: string;
  status: AgentStatus;
  totalTransactionCount: number;
  totalTransactionVolume: number; // sum of all transaction amounts
  transferInCount: number;
  transferInVolume: number;
  cardWithdrawalCount: number;
  cardWithdrawalVolume: number;
  billPaymentCount: number;
  billPaymentVolume: number;
  posTerminalCount: number;
  activeTerminalCount: number;
  commissionTotal: number;
  commissionPending: number;
  commissionPaid: number;
  lastActivity: string | null; // ISO date of most recent transaction, or null
}

// Aggregated per-POS-terminal performance, derived from aroTransactions.
export interface PosPerformanceRow {
  terminalId: string;
  serial: string;
  status: PosTerminalRecord["status"];
  agentId: string;
  agentName: string;
  accountId: string;
  accountName: string;
  transactionCount: number;
  transactionVolume: number;
  lastTransactionDate: string | null;
  commissionGenerated: number;
}

// --- Commissions ---

export type CommissionStatus = "paid" | "pending";

export interface CommissionRecord {
  id: string;
  aroId: string;
  agentId: string;
  agentName: string;
  posTerminalId: string;
  transactionId: string;
  transactionType: AroTransactionType;
  amount: number;
  status: CommissionStatus;
  date: string; // ISO
  paidDate?: string; // ISO
}

// Single place commission rates live, so no component hardcodes a rate — see FRD note
// on aggregation logic. Expressed as a fraction of transaction amount.
export const commissionRates: Record<AroTransactionType, number> = {
  TransferIn: 0.005,
  CardWithdrawal: 0.01,
  BillPayment: 0.015,
};

// --- Referral / onboarding bonuses ---

export type ReferralBonusStatus = "pending" | "paid";

export interface ReferralBonusRecord {
  id: string;
  aroId: string;
  referredAgentId: string;
  referredAgentName: string;
  onboardingDate: string; // ISO
  status: AgentStatus; // current status of the referred agent
  bonusAmount: number;
  bonusStatus: ReferralBonusStatus;
  paymentDate?: string; // ISO, set once bonusStatus === "paid"
}

// --- ARO/BDO notifications (distinct from the customer-facing NotificationItem above) ---

export type AroNotificationType =
  | "agent-inactive"
  | "milestone"
  | "new-agent"
  | "commission-generated"
  | "pos-inactive"
  | "referral-bonus";

export interface NotificationRecord {
  id: string;
  // Present -> targets that one ARO. Absent -> org-wide, surfaced on the BDO's feed too.
  aroId?: string;
  type: AroNotificationType;
  message: string;
  relatedAgentId?: string;
  timestamp: string; // ISO
  read: boolean;
  actionLink?: string; // route to navigate to on click
}

// --- Audit log ---

export interface AuditLogRecord {
  id: string;
  user: string; // who performed the action, e.g. the ARO's name
  action: string;
  recordType: string;
  recordId: string;
  timestamp: string; // ISO
  previousValue: string;
  newValue: string;
}

