# CC Dashboard

Personal finance dashboard for tracking credit card payments, installments, and loans. Built with Vite + React + TypeScript + shadcn/ui + Supabase, deployed via AWS Amplify.

## Features

- Monthly payment tracking across all accounts
- Real vs demo mode (Google OAuth gating)
- Alerts for late payments and expiring promo rates
- "Pay now" quick links to each card portal
- Upcoming due dates panel
- Full history across months

## Stack

| Layer | Tech |
|---|---|
| UI | React 18 + TypeScript + Tailwind + shadcn/ui |
| Charts | Recharts |
| Auth | Supabase Auth (Google OAuth) |
| Database | Supabase (Postgres) |
| Hosting | AWS Amplify (autodeploy on push to main) |

## Setup

### 1. Clone and install

```bash
git clone <your-repo>
cd cc-dashboard
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase-schema.sql` in the SQL editor
3. Enable Google OAuth under Authentication > Providers
4. Copy your Project URL and anon key

### 3. Environment variables

```bash
cp .env.example .env
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_OWNER_EMAIL
```

### 4. Run locally

```bash
npm run dev
```

### 5. Amplify deploy

1. Push to GitHub
2. Connect repo in AWS Amplify console
3. Add environment variables in Amplify > Environment variables
4. `amplify.yml` handles the build — autodeploy on push to `main`

## Demo mode

Any visitor who isn't signed in as `VITE_OWNER_EMAIL` sees anonymized demo data. The demo banner is shown at the top. No separate accounts or data needed.

## Project structure

```
src/
  components/
    dashboard/     SummaryCards, AlertStrip, PaidVsDueChart, UpcomingDue
    payments/      PaymentTable, AddPaymentDialog
    layout/        Layout (nav, header, demo banner)
  data/
    accounts.real.ts   Your actual account config
    accounts.demo.ts   Anonymized demo accounts
    payments.seed.ts   Historical CSV data (one-time seed)
  hooks/
    useAuth.ts     Google OAuth + owner detection
    useData.ts     Supabase queries (accounts, payments)
  lib/
    supabase.ts    Supabase client
    utils.ts       Formatting, date math, derived data
  pages/
    DashboardPage  Main view
    AccountsPage   Account management (phase 2)
    HistoryPage    Full history (phase 2)
    MortgagePage   Mortgage tracker (phase 2)
  types/index.ts   All TypeScript types
```
