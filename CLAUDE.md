# CC Dashboard — Claude Context

## Project overview

This is a personal finance dashboard for tracking credit card payments, installment plans, personal loans, and auto/mortgage payments. Built by Christy Sheppard as both a personal tool and a portfolio piece demonstrating real-world React + Supabase integration.

The app has two modes:
- **Real mode** — signed in as the owner (sheppard.christy@gmail.com), reads/writes live data from Supabase
- **Demo mode** — any other visitor sees anonymized accounts and seed payment data, no auth required

## Stack

| Layer | Tech |
|---|---|
| UI | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui design tokens |
| Charts | Recharts |
| Auth | Supabase Auth (Google OAuth) |
| Database | Supabase (Postgres) |
| Hosting | AWS Amplify (autodeploy on push to `main`) |

## Project structure

```
src/
  components/
    dashboard/       SummaryCards, AlertStrip, PaidVsDueChart, UpcomingDue
    payments/        PaymentTable, AddPaymentDialog
    layout/          Layout (nav, header, demo banner)
  data/
    accounts.real.ts   Real account definitions (stable config, not secrets)
    accounts.demo.ts   Anonymized demo accounts for portfolio visitors
    payments.seed.ts   Historical CSV data used as one-time Supabase seed
  hooks/
    useAuth.ts       Google OAuth + owner detection via VITE_OWNER_EMAIL
    useData.ts       Supabase queries — useAccounts, usePayments, useUpsertPayment, etc.
  lib/
    supabase.ts      Supabase client (reads from .env)
    utils.ts         Formatting, date math, derived data helpers
    cn.ts            Tailwind className merge utility
  pages/
    DashboardPage    Main view — month navigator, summary, alerts, chart, table
    AccountsPage     Account management (stub — phase 2)
    HistoryPage      Full payment history (stub — phase 2)
    MortgagePage     Mortgage tracker (stub — phase 2)
  types/index.ts     All TypeScript types (Account, Payment, PaymentStatus, etc.)
```

## Data model

### Account (stable config — defined once)
```ts
{
  id: string              // kebab-case slug e.g. 'delta-amex'
  name: string
  type: 'credit_card' | 'installment' | 'personal' | 'mortgage' | 'auto_loan'
  last4?: string
  issuer?: string
  due_day: number         // day of month, used to auto-generate due dates
  apr?: number
  promo_apr?: number      // set to 0 for 0% promos
  promo_ends?: string     // ISO date — triggers warning alert when within 90 days
  portal_url?: string     // "Pay now" link in the payment table
  is_personal: boolean    // true = purple personal badge (e.g. family loan)
  is_active: boolean
  monthly_payment?: number
  notes?: string
}
```

### Payment (one row per account per month)
```ts
{
  id: string
  account_id: string      // references accounts.id
  month: string           // 'YYYY-MM' e.g. '2026-05'
  amt_due?: number
  amt_paid?: number
  date_paid?: string
  status: 'paid' | 'partial' | 'unpaid' | 'late' | 'autopay' | 'na'
  confirmation?: string
  notes?: string
}
```

The `unique(account_id, month)` constraint means upsert is safe — logging a payment twice updates rather than duplicates.

## Environment variables

```
VITE_SUPABASE_URL        Supabase project URL
VITE_SUPABASE_ANON_KEY   Supabase anon/publishable key
VITE_OWNER_EMAIL         Owner's Google email — gates real vs demo mode
```

Never commit `.env`. Use `.env.example` as the template.

## Auth and data gating

- `useAuth.ts` checks `user.email === VITE_OWNER_EMAIL` to set `isOwner`
- `DashboardPage` passes `isOwner` to decide which accounts/payments to load
- Demo mode uses `accounts.demo.ts` + `payments.seed.ts` (local, no DB needed)
- Real mode uses live Supabase queries via `useData.ts`
- Supabase RLS policies allow public read, owner-only write

## Current status

### Done
- Full type system
- Layout with nav, demo banner, auth header
- Dashboard page: month navigator, summary cards, alert strip, paid vs due chart, upcoming dues, payment table with pay-now links
- Add payment dialog (writes to Supabase when authenticated)
- All real accounts defined in `accounts.real.ts`
- All demo accounts defined in `accounts.demo.ts`
- Jan–May 2026 historical seed data in `payments.seed.ts`
- Supabase schema + RLS in `supabase-schema.sql`
- Amplify build config in `amplify.yml`

### Phase 2 — next up
- [ ] Google OAuth setup in Supabase + Google Cloud Console
- [ ] Seed real accounts into Supabase (run once from `accounts.real.ts`)
- [ ] Accounts page — add, edit, deactivate accounts from the UI
- [ ] History page — full payment history, filterable by account/month/status
- [ ] Mortgage page — separate tracker for principal, equity, escrow
- [ ] AlertStrip bug fixes — account name display, month scoping

## Accounts tracked

| Account | Type | Due day | Notes |
|---|---|---|---|
| Capital One Quicksilver (6290) | Credit card | 4th | |
| Delta Rewards Amex | Credit card | 8th | |
| Verizon Visa (1241) | Credit card | 10th | |
| Amazon Chase (7743) | Credit card | 10th | |
| Lowe's | Credit card | 12th | Promo ends Aug 2026 |
| American Airlines Citi (4932) | Credit card | 13th | |
| Kitchen Reno — Parents | Personal | 18th | $650/mo autopay, is_personal: true |
| Capital One Venture (6625) | Credit card | 18th | 0% ends July 2026 |
| Chase (7026) | Credit card | 17th | |
| Discover (7694) | Credit card | 18th | |
| Southwest Chase (3518) | Credit card | 18th | |
| Costco Citi (5544) | Credit card | 24th | |
| MacBook Installment | Installment | 1st | Apple financing |
| iPhone Installment | Installment | 1st | |
| Auto Loan — Wells Fargo | Auto loan | 1st | New car payment |
| Mortgage | Mortgage | 1st | Tracked separately |

## Conventions

- Use `cn()` from `@/lib/cn` for all className merging
- Use `formatCurrency()` from `@/lib/utils` for all money display
- Use `getDueDate(account, month)` to compute due dates — never hardcode them
- Account IDs are kebab-case slugs and must match between `accounts.real.ts` and Supabase
- All new pages go in `src/pages/`, all reusable UI in `src/components/`
- Tailwind only — no inline style objects except where Tailwind can't reach
- TypeScript strict mode is on — no `any` unless absolutely necessary
