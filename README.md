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
Settlement Account        — the ARO's own balance + settlement history, with a Withdraw action
                            (their only money-out path; ARO users cannot transfer)
Agent Management          — searchable agent list; "Add Agent" routes to the account sign-up
                            page (/signup) rather than an in-page form; click a row for a profile
  └── Agent Profile       — /aro/agents/[id], tabs: Overview / Terminals / Transactions
Performance               — aggregated per-agent performance (cumulative + individual views)
Transaction Monitoring    — agent + type + date-range filters, Credit/Debit/Net/Volume summary
```

All ARO data lives in `lib/mock-data.ts` (`agents`, `aroTransactions`, `getAgentPerformanceRows()`,
`aroSettlementAccount`, `aroSettlementTransactions`, `getAroSummary()`) — same mock-data pattern
as the rest of the app.

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
  ├── POS Transfer      — pending/accepted/declined tabs
  ├── POS Withdrawal    — cash withdrawals through attached POS devices
  └── Request for POS   — mock-provisions a demo terminal to the business
Bill Payment        — 4 categories shown, "Show more" reveals the rest; history filters by category
Dispute             — POS / Withdrawal history tabs + a "New Dispute" flow (type picker → form → submit)
Earn Money          — one page, Referral / Cashback (Coming Soon) tabs
Settings (all roles)
  ├── Account Details   — read-only account/registration info; business users page between accounts
  ├── Account Limit     — current tier + upgrade targets (Upgrade action gated: not for ARO)
  ├── Security          — Reset Transaction PIN, Reset Passcode, Set Biometrics (mobile-only, disabled)
  └── Help & Support    — Call Us, Chat With Us, FAQs, Dispute link
```

## Access control

`lib/access-control.ts` is the single source of truth for role permissions: an
`ACCESS_MATRIX` keyed by `FeatureKey`, read through `canAccess(userType, feature)`. It drives
three things so a hidden nav item can't be reached by URL:

- **Nav visibility** — `lib/nav-config.ts` filters items/children by `canAccess`.
- **Route guards** — every gated page calls `useRequireAccess(feature)`
  (`components/access/RequireAccess.tsx`), which redirects denied users to their home route
  with a toast.
- **Button-level gates** — e.g. the Account Limit "Upgrade" button checks
  `canAccess(userType, "accountLimitUpgrade")` so ARO users can view the page but not upgrade.

ARO users cannot transfer money — their only money-out path is withdrawing their settlement
balance on `/aro/settlement`.

Plus: a floating chatbot (bottom-right, mock replies) on every authenticated page, and an
"Agent Relationship Officer" card on the dashboard.

## What's mocked vs. real

Seed data lives in `lib/mock-data.ts`, and all mutations go through **mock Route Handlers**
under `app/api/**` (transfers, disputes, POS terminals, settlement withdrawal, bill payment,
security reset, account-limit upgrade, support/ARO messages, chat). Each handler
validates the request, simulates latency, and returns the canonical server-shaped record —
there's no persistence, so pages update their own local state from the response.

- **Client side** — pages call the typed `apiGet` / `apiPost` helpers in `lib/api-client.ts`
  (which throw an `ApiError` carrying the handler's message, surfaced as a toast on failure).
- **Server side** — handlers share `lib/api-server.ts` (`delay`, `genId`, `genRef`, `ok`,
  `badRequest`) and import the same `lib/mock-data.ts` seed, keeping one source of truth.

To make it real, replace the body of each Route Handler with a real DB/API call — the client
contract stays the same.

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
- `lib/nav-config.ts` — the sidebar definition; add a route here and it appears automatically.
  Per-item/child visibility is driven by an optional `feature` key resolved through
  `lib/access-control.ts` (see the Access control section above), not a boolean flag.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS · lucide-react
