# AppGlobal Payment

A Next.js (App Router) scaffold for the AppGlobal Payment platform — personal & business
dashboards, multi-account switching, and the full module set from the spec.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000 — it redirects to `/dashboard`.

To see the business flow (account selection screen), go to `/login` and choose
**"Continue as Business user"**.

## What's fully wired

- **Theming**: custom navy/blue Tailwind palette, `Sora` (headings) + `Inter` (body) via
  `next/font/google` — see `tailwind.config.ts` and `app/globals.css`.
- **Layout shell**: `components/layout/Sidebar.tsx` (collapsible, data-driven from
  `lib/nav-config.ts`, auto-filters business-only items), `Topbar.tsx`, `AccountSwitcher.tsx`.
- **State**: `context/AppContext.tsx` — holds `userType` (personal/business), selected
  business account, sidebar collapsed state. Swap this for real auth/session state later.
- **Personal vs Business**: nav items and dashboard content adapt based on `userType`.
  Business users with multiple accounts see `/select-account` after login and can switch
  accounts anytime from the topbar.
- **Fully built pages**:
  - `/dashboard` — balance card, cashback/referral, quick actions, recent activity
  - `/accounts/all-transactions`, `/accounts/daily-summary` (date filter)
  - `/payments/all-transactions`, `/payments/top-five`
  - `/card`, `/purchases`
  - `/airtime`, `/data`, `/bill-payment` (mock purchase forms + history)
  - `/transfers/instant`, `/transfers/recurring`, `/transfers/bulk`
  - `/pos-transfer` (Pending / Accepted / Declined tabs, business-only)
  - `/disputes/pos`, `/disputes/front-office`, `/disputes/card`
  - `/channels/pos`, `/channels/network`
  - `/earn/cashback`, `/earn/referrals`
  - `/login`, `/select-account`

## Shared building blocks (reuse these for new pages/features)

- `components/ui/Table.tsx` — generic typed data table
- `components/ui/Tabs.tsx` — query-param-driven tabs (for states within one route, e.g.
  POS Transfer's pending/accepted/declined)
- `components/ui/RouteTabs.tsx` — link-driven tabs between sibling routes (e.g. Accounts'
  All Transactions / Daily Summary)
- `components/ui/Card.tsx`, `Badge.tsx`
- `components/modules/TransactionsTable.tsx`, `TransfersTable.tsx`, `DisputesTable.tsx`
- `lib/mock-data.ts` — all data is **synthetic**, swap for real API calls
- `lib/format.ts` — currency/date formatting helpers

## Not yet built (natural next steps)

- Real authentication (login page is a mock profile switcher)
- The "Performance" dashboard module (spec says it's coming later)
- Wiring up the "Buy Airtime / Buy Data / Pay Bill" forms and transfer forms to real actions
- Data fetching from an actual backend (currently all `lib/mock-data.ts`)
- Notifications panel, settings page

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · lucide-react icons
