// Every aggregation used by the ARO/BDO dashboards lives here as a named pure function over
// the in-memory mock arrays (see AGENTS.md task note: this is what makes it swappable for a
// real API call later — the day a backend exists, only the function bodies change).
//
// RBAC note: every function below takes an explicit `aroId: string | null` as its first
// scoping argument. `null` means "no ARO scope" (BDO, org-wide). Pages for the ARO role must
// always pass the *current* ARO's id from AppContext — never a value read from a URL param,
// which a malicious ARO user could tamper with to see another ARO's portfolio. Pages for the
// BDO role are the one place in this app allowed to let the user pick which aroId to pass.

import {
  agents,
  aroTransactions,
  aros,
  commissions,
  getAgentById,
  getAgentsForAro,
  posTerminals,
  referralBonuses,
} from "./mock-data";
import {
  AgentPerformanceRow,
  AgentRecord,
  AgentStatus,
  AroOfficerStatus,
  AroTransactionRecord,
  AroTransactionType,
  BillCategoryType,
  CommissionRecord,
  PosPerformanceRow,
  PosTerminalRecord,
  TerminalCounts,
} from "./types";
import { isWithinRange, ResolvedDateRange } from "./date-range";

export interface AroAnalyticsFilters {
  dateRange?: ResolvedDateRange;
  agentId?: string;
  transactionType?: AroTransactionType;
  accountId?: string;
  posTerminalId?: string;
  agentStatus?: AgentStatus;
}

const billCategoryTypesList: BillCategoryType[] = ["Airtime", "Data", "Hospital", "Utility", "CableTV"];

function sumAmount(rows: { amount: number }[]): number {
  return Math.round(rows.reduce((s, r) => s + r.amount, 0) * 100) / 100;
}

function scopedAgents(aroId: string | null): AgentRecord[] {
  return aroId ? getAgentsForAro(aroId) : agents;
}

function filterTransactions(aroId: string | null, filters: AroAnalyticsFilters = {}): AroTransactionRecord[] {
  return aroTransactions.filter((t) => {
    if (aroId && t.aroId !== aroId) return false;
    if (filters.agentId && t.agentId !== filters.agentId) return false;
    if (filters.transactionType && t.type !== filters.transactionType) return false;
    if (filters.accountId && t.accountId !== filters.accountId) return false;
    if (filters.posTerminalId && t.posTerminalId !== filters.posTerminalId) return false;
    if (filters.agentStatus) {
      const agent = getAgentById(t.agentId);
      if (!agent || agent.status !== filters.agentStatus) return false;
    }
    if (filters.dateRange && !isWithinRange(t.date, filters.dateRange)) return false;
    return true;
  });
}

function filterCommissions(aroId: string | null, filters: AroAnalyticsFilters = {}): CommissionRecord[] {
  return commissions.filter((c) => {
    if (aroId && c.aroId !== aroId) return false;
    if (filters.agentId && c.agentId !== filters.agentId) return false;
    if (filters.transactionType && c.transactionType !== filters.transactionType) return false;
    if (filters.posTerminalId && c.posTerminalId !== filters.posTerminalId) return false;
    if (filters.dateRange && !isWithinRange(c.date, filters.dateRange)) return false;
    return true;
  });
}

// --- Terminal counts (derived — replaces the old stored { total, active, inactive }) ---

export function getTerminalCounts(agentId: string): TerminalCounts {
  const terminals = posTerminals.filter((p) => p.agentId === agentId);
  return {
    total: terminals.length,
    active: terminals.filter((p) => p.status === "active").length,
    inactive: terminals.filter((p) => p.status === "inactive").length,
  };
}

export function getTerminalsForAgent(agentId: string): PosTerminalRecord[] {
  return posTerminals.filter((p) => p.agentId === agentId);
}

export function getTerminalsForAccount(accountId: string): PosTerminalRecord[] {
  return posTerminals.filter((p) => p.accountId === accountId);
}

export function getTransactionsForTerminal(terminalId: string): AroTransactionRecord[] {
  return aroTransactions.filter((t) => t.posTerminalId === terminalId);
}

// --- Raw transaction list (Transaction Monitoring pages) ---

export function getAroTransactionRows(aroId: string | null, filters: AroAnalyticsFilters = {}): AroTransactionRecord[] {
  return filterTransactions(aroId, filters).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// --- Agent performance (FRD Section 4 table + Section 5 filters) ---

export function getAgentPerformanceRows(aroId: string | null, filters: AroAnalyticsFilters = {}): AgentPerformanceRow[] {
  let scope = scopedAgents(aroId);
  if (filters.agentId) scope = scope.filter((a) => a.id === filters.agentId);
  if (filters.agentStatus) scope = scope.filter((a) => a.status === filters.agentStatus);

  return scope.map((agent) => {
    const txns = filterTransactions(aroId, { ...filters, agentId: agent.id, agentStatus: undefined });
    const transferIn = txns.filter((t) => t.type === "TransferIn");
    const cardWithdrawal = txns.filter((t) => t.type === "CardWithdrawal");
    const billPayment = txns.filter((t) => t.type === "BillPayment");
    const terminals = getTerminalsForAgent(agent.id);
    const agentCommissions = filterCommissions(aroId, { ...filters, agentId: agent.id });
    const lastActivity = txns.reduce<string | null>(
      (latest, t) => (!latest || new Date(t.date) > new Date(latest) ? t.date : latest),
      null
    );

    return {
      agentId: agent.id,
      agentName: agent.name,
      businessName: agent.businessName,
      aroId: agent.aroId,
      status: agent.status,
      totalTransactionCount: txns.length,
      totalTransactionVolume: sumAmount(txns),
      transferInCount: transferIn.length,
      transferInVolume: sumAmount(transferIn),
      cardWithdrawalCount: cardWithdrawal.length,
      cardWithdrawalVolume: sumAmount(cardWithdrawal),
      billPaymentCount: billPayment.length,
      billPaymentVolume: sumAmount(billPayment),
      posTerminalCount: terminals.length,
      activeTerminalCount: terminals.filter((t) => t.status === "active").length,
      commissionTotal: sumAmount(agentCommissions),
      commissionPending: sumAmount(agentCommissions.filter((c) => c.status === "pending")),
      commissionPaid: sumAmount(agentCommissions.filter((c) => c.status === "paid")),
      lastActivity,
    };
  });
}

export type PerformanceMetric = "totalTransactionVolume" | "totalTransactionCount" | "commissionTotal";

export function getBestAndLeastPerformingAgents(
  aroId: string | null,
  metric: PerformanceMetric = "totalTransactionVolume",
  dateRange?: ResolvedDateRange
): { best: AgentPerformanceRow | null; least: AgentPerformanceRow | null } {
  const rows = getAgentPerformanceRows(aroId, { dateRange }).filter(
    (r) => r.status !== "removed" && r.totalTransactionCount > 0
  );
  if (rows.length === 0) return { best: null, least: null };
  const sorted = [...rows].sort((a, b) => b[metric] - a[metric]);
  return { best: sorted[0], least: sorted[sorted.length - 1] };
}

// --- Largest transaction (FRD Section 8) ---

export interface LargestTransactionInfo {
  transaction: AroTransactionRecord;
  agent: AgentRecord;
  accountName: string;
  terminalSerial: string;
}

export function getLargestTransaction(aroId: string | null, filters: AroAnalyticsFilters = {}): LargestTransactionInfo | null {
  const txns = filterTransactions(aroId, filters);
  if (!txns.length) return null;
  const largest = txns.reduce((max, t) => (t.amount > max.amount ? t : max), txns[0]);
  const agent = getAgentById(largest.agentId);
  if (!agent) return null;
  const account = agent.businessAccounts.find((a) => a.id === largest.accountId);
  const terminal = posTerminals.find((p) => p.id === largest.posTerminalId);
  return {
    transaction: largest,
    agent,
    accountName: account?.accountName ?? "—",
    terminalSerial: terminal?.serial ?? "—",
  };
}

// --- POS performance (FRD Section 10) ---

export function getPosPerformanceRows(aroId: string | null, filters: AroAnalyticsFilters = {}): PosPerformanceRow[] {
  let scope = scopedAgents(aroId);
  if (filters.agentId) scope = scope.filter((a) => a.id === filters.agentId);
  const scopeAgentIds = new Set(scope.map((a) => a.id));

  return posTerminals
    .filter((p) => scopeAgentIds.has(p.agentId))
    .filter((p) => !filters.accountId || p.accountId === filters.accountId)
    .filter((p) => !filters.posTerminalId || p.id === filters.posTerminalId)
    .map((p) => {
      const agent = getAgentById(p.agentId);
      const account = agent?.businessAccounts.find((a) => a.id === p.accountId);

      let count = p.transactionCount;
      let volume = p.transactionVolume;
      let lastDate = p.lastTransactionDate;
      let commissionGenerated = p.commissionGenerated;

      if (filters.dateRange || filters.transactionType) {
        const txns = aroTransactions.filter(
          (t) =>
            t.posTerminalId === p.id &&
            (!filters.transactionType || t.type === filters.transactionType) &&
            (!filters.dateRange || isWithinRange(t.date, filters.dateRange!))
        );
        count = txns.length;
        volume = sumAmount(txns);
        lastDate = txns.reduce<string | null>(
          (latest, t) => (!latest || new Date(t.date) > new Date(latest) ? t.date : latest),
          null
        );
        const txnIds = new Set(txns.map((t) => t.id));
        commissionGenerated = sumAmount(commissions.filter((c) => c.posTerminalId === p.id && txnIds.has(c.transactionId)));
      }

      return {
        terminalId: p.id,
        serial: p.serial,
        status: p.status,
        agentId: p.agentId,
        agentName: agent?.name ?? "—",
        accountId: p.accountId,
        accountName: account?.accountName ?? "—",
        transactionCount: count,
        transactionVolume: volume,
        lastTransactionDate: lastDate,
        commissionGenerated,
      };
    });
}

export function getBestLeastPos(rows: PosPerformanceRow[]): {
  best: PosPerformanceRow | null;
  least: PosPerformanceRow | null;
  inactive: PosPerformanceRow[];
} {
  const withActivity = rows.filter((r) => r.transactionCount > 0);
  const inactive = rows.filter((r) => r.status === "inactive");
  if (!withActivity.length) return { best: null, least: null, inactive };
  const sorted = [...withActivity].sort((a, b) => b.transactionVolume - a.transactionVolume);
  return { best: sorted[0], least: sorted[sorted.length - 1], inactive };
}

// --- Portfolio / org summaries (FRD Sections 3.1 + 18) ---

export interface BillBreakdownRow {
  category: BillCategoryType;
  count: number;
  volume: number;
}

export interface AroPortfolioSummary {
  agents: { total: number; active: number; inactive: number; newlyOnboarded: number; onboardedInPeriod: number };
  transactions: {
    totalCount: number;
    totalVolume: number;
    transferInCount: number;
    transferInVolume: number;
    cardWithdrawalCount: number;
    cardWithdrawalVolume: number;
    billPaymentCount: number;
    billPaymentVolume: number;
  };
  billBreakdown: BillBreakdownRow[];
  commission: { total: number; forPeriod: number; pending: number; paid: number };
  referral: { totalReferred: number; bonusesEarned: number; bonusesForPeriod: number; pendingBonuses: number };
}

export function getAroPortfolioSummary(aroId: string | null, dateRange?: ResolvedDateRange): AroPortfolioSummary {
  const scope = scopedAgents(aroId).filter((a) => a.status !== "removed");
  const active = scope.filter((a) => a.status === "active").length;
  const inactive = scope.filter((a) => a.status === "inactive").length;
  const newlyOnboarded = scope.filter(
    (a) => (Date.now() - new Date(a.onboardingDate).getTime()) / (1000 * 60 * 60 * 24) <= 30
  ).length;
  const onboardedInPeriod = dateRange ? scope.filter((a) => isWithinRange(a.onboardingDate, dateRange)).length : newlyOnboarded;

  const txns = filterTransactions(aroId, { dateRange });
  const transferIn = txns.filter((t) => t.type === "TransferIn");
  const cardWithdrawal = txns.filter((t) => t.type === "CardWithdrawal");
  const billPayment = txns.filter((t) => t.type === "BillPayment");
  const billBreakdown: BillBreakdownRow[] = billCategoryTypesList.map((category) => {
    const catTxns = billPayment.filter((t) => t.billCategory === category);
    return { category, count: catTxns.length, volume: sumAmount(catTxns) };
  });

  const scopeCommissions = aroId ? commissions.filter((c) => c.aroId === aroId) : commissions;
  const periodCommissions = dateRange ? scopeCommissions.filter((c) => isWithinRange(c.date, dateRange)) : scopeCommissions;

  const scopeReferrals = aroId ? referralBonuses.filter((r) => r.aroId === aroId) : referralBonuses;
  const periodReferrals = dateRange ? scopeReferrals.filter((r) => isWithinRange(r.onboardingDate, dateRange)) : scopeReferrals;

  return {
    agents: { total: scope.length, active, inactive, newlyOnboarded, onboardedInPeriod },
    transactions: {
      totalCount: txns.length,
      totalVolume: sumAmount(txns),
      transferInCount: transferIn.length,
      transferInVolume: sumAmount(transferIn),
      cardWithdrawalCount: cardWithdrawal.length,
      cardWithdrawalVolume: sumAmount(cardWithdrawal),
      billPaymentCount: billPayment.length,
      billPaymentVolume: sumAmount(billPayment),
    },
    billBreakdown,
    commission: {
      total: sumAmount(scopeCommissions),
      forPeriod: sumAmount(periodCommissions),
      pending: sumAmount(scopeCommissions.filter((c) => c.status === "pending")),
      paid: sumAmount(scopeCommissions.filter((c) => c.status === "paid")),
    },
    referral: {
      totalReferred: scopeReferrals.length,
      bonusesEarned: sumAmount(scopeReferrals.map((r) => ({ amount: r.bonusAmount }))),
      bonusesForPeriod: sumAmount(periodReferrals.map((r) => ({ amount: r.bonusAmount }))),
      pendingBonuses: sumAmount(
        scopeReferrals.filter((r) => r.bonusStatus === "pending").map((r) => ({ amount: r.bonusAmount }))
      ),
    },
  };
}

export interface BdoOrgSummary extends AroPortfolioSummary {
  aros: { total: number; active: number };
}

export function getBdoOrgSummary(dateRange?: ResolvedDateRange): BdoOrgSummary {
  return {
    ...getAroPortfolioSummary(null, dateRange),
    aros: { total: aros.length, active: aros.filter((a) => a.status === "active").length },
  };
}

// --- ARO comparison / ranking (FRD Sections 19, 22) ---

export interface AroComparisonRow {
  aroId: string;
  aroName: string;
  cluster: string;
  status: AroOfficerStatus;
  agentCount: number;
  activeAgentCount: number;
  transactionVolume: number;
  transactionCount: number;
  commissionTotal: number;
  commissionPending: number;
}

export function getAroComparisonRows(dateRange?: ResolvedDateRange, aroIds?: string[]): AroComparisonRow[] {
  const scope = aroIds && aroIds.length ? aros.filter((a) => aroIds.includes(a.id)) : aros;
  return scope
    .map((aro) => {
      const summary = getAroPortfolioSummary(aro.id, dateRange);
      return {
        aroId: aro.id,
        aroName: aro.name,
        cluster: aro.cluster,
        status: aro.status,
        agentCount: summary.agents.total,
        activeAgentCount: summary.agents.active,
        transactionVolume: summary.transactions.totalVolume,
        transactionCount: summary.transactions.totalCount,
        commissionTotal: summary.commission.total,
        commissionPending: summary.commission.pending,
      };
    })
    .sort((a, b) => b.transactionVolume - a.transactionVolume);
}

// --- Commission drilldown rows (FRD Section 13) ---

export interface CommissionRow extends CommissionRecord {
  posTerminalSerial: string;
}

export function getCommissionRows(aroId: string | null, filters: AroAnalyticsFilters = {}): CommissionRow[] {
  return filterCommissions(aroId, filters)
    .map((c) => ({ ...c, posTerminalSerial: posTerminals.find((p) => p.id === c.posTerminalId)?.serial ?? "—" }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// --- Referral rows (FRD referral/onboarding bonus section) ---

export function getReferralRows(aroId: string | null, dateRange?: ResolvedDateRange) {
  return referralBonuses
    .filter((r) => !aroId || r.aroId === aroId)
    .filter((r) => isWithinRange(r.onboardingDate, dateRange))
    .sort((a, b) => new Date(b.onboardingDate).getTime() - new Date(a.onboardingDate).getTime());
}
