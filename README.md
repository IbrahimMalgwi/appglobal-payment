# AppGlobal Payment

A Next.js 16 (App Router) app for the AppGlobal Payment platform — personal & business
dashboards, multi-account switching, and the following modules.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000 — it redirects to `/dashboard`.

Go to `/login` to switch between the Personal, Business, and Agent Relationship Officer (ARO)
demo profiles.

## Agent Relationship Officer (ARO)

A third user type with its own dedicated dashboard, reusing the same Sidebar/Topbar shell and
UI primitives but with a completely different nav (see `lib/nav-config.ts`, branches on
`userType === "aro"`):

```
Overview                 — summary cards + a "highest performing agents" bar chart
                            (toggle: volume / count / terminal activity / commission)
Agent Management          — searchable agent list, click through to an Agent Profile
  └── Agent Profile       — /aro/agents/[id], tabs: Overview / Terminals / Transactions / Commission
Transaction Monitoring    — agent + type + date-range filters, Credit/Debit/Net/Volume summary
Commission Breakdown      — ARO's own commission by source, plus a per-agent filterable breakdown
```

All ARO data lives in `lib/mock-data.ts` (`agents`, `aroTransactions`, `agentCommissions`,
`aroCommissionSummary`, `getAroSummary()`) — same mock-data pattern as the rest of the app.

**Before running:** drop your logo at `public/logo.png` and your favicon at `app/favicon.ico`
(see `public/README.txt`).

## Navigation

```
Dashboard
Accounts            — list of the user's account(s): name, number, type, balances, status, currency
Card                — Coming Soon
Transactions        — Top 5 by default, "View All Transactions" adds search/date/type/status filters
Transfers
  ├── AppPay Transfer     — in-network, instant
  └── Interbank Transfer  — to any other bank
POS (business only)
  ├── POS Transfer    — pending/accepted/declined tabs
  └── POS Withdrawal  — cash withdrawals through attached POS devices
Bill Payment        — 4 categories shown, "Show more" reveals the rest; history filters by category
Dispute             — one page, POS / Withdrawal tabs
Earn Money          — one page, Referral / Cashback (Coming Soon) tabs
```

Plus: a floating chatbot (bottom-right, mock replies) on every authenticated page, and an
"Agent Relationship Officer" card on the dashboard.

## What's mocked vs. real

Everything is mocked client-side in `lib/mock-data.ts` — no backend. Forms "submit" via a
`setTimeout`, mutate local React state, and show a toast. Swap the `setTimeout` blocks for
real API calls when a backend exists; the chatbot's `getMockBotReply` in
`components/chatbot/ChatbotWidget.tsx` is similarly a placeholder for a real `/api/chat` call.

## Mobile responsiveness

- **Sidebar** becomes an off-canvas drawer below the `lg` breakpoint (hamburger button in the
  topbar opens it, backdrop click or nav click closes it). On desktop it's the original
  sticky/collapsible sidebar.
- **Tables** (`components/ui/Table.tsx`) scroll horizontally and support a `hideOnMobile` flag
  per column to drop non-essential columns (Reference, Type, etc.) on small screens.
- **Dashboard, forms, modals** use responsive grid/flex classes throughout
  (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`-style patterns).
- **Chatbot** respects `env(safe-area-inset-bottom)` so it doesn't sit under mobile browser
  chrome, and sizes itself to `calc(100vw - 2.5rem)` on narrow screens so it never overflows.

## Shared building blocks

- `components/ui/Table.tsx`, `Tabs.tsx` (query-param tabs), `RouteTabs.tsx` (sibling-route
  tabs), `Card.tsx`, `Badge.tsx`, `Modal.tsx`, `ComingSoon.tsx`
- `components/modules/TransactionsTable.tsx`, `TransfersTable.tsx`, `DisputesTable.tsx`
- `lib/mock-data.ts` — all data + a couple of small pure helpers (`getAccountsForUser`,
  `getBillHistory`) so pages don't hardcode filtering logic
- `lib/nav-config.ts` — single source of truth for the sidebar; add a route here and it
  appears automatically (`businessOnly: true` hides it from personal users)

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS · lucide-react
