-- ============================================================
-- CC Dashboard — Supabase Schema
-- Run this in the Supabase SQL editor (once)
-- ============================================================

-- Accounts table
create table if not exists accounts (
  id               text primary key,
  name             text not null,
  type             text not null check (type in ('credit_card','installment','personal','mortgage','auto_loan')),
  last4            text,
  issuer           text,
  due_day          integer not null check (due_day between 1 and 31),
  credit_limit     numeric(12,2),
  current_balance  numeric(12,2),
  apr              numeric(5,2),
  promo_apr        numeric(5,2),
  promo_ends       date,
  portal_url       text,
  is_personal      boolean not null default false,
  is_active        boolean not null default true,
  monthly_payment  numeric(12,2),
  payoff_date      date,
  original_balance numeric(12,2),
  notes            text,
  created_at       timestamptz not null default now()
);

-- Payments table
create table if not exists payments (
  id           uuid primary key default gen_random_uuid(),
  account_id   text not null references accounts(id) on delete cascade,
  month        text not null,           -- 'YYYY-MM'
  amt_due      numeric(12,2),
  amt_paid     numeric(12,2),
  date_paid    text,
  status       text not null default 'unpaid'
               check (status in ('paid','partial','unpaid','late','autopay','na')),
  confirmation text,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (account_id, month)            -- one entry per account per month
);

-- Auto-update updated_at on payments
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger payments_updated_at
  before update on payments
  for each row execute function update_updated_at();

-- Row Level Security
alter table accounts enable row level security;
alter table payments enable row level security;

-- Public read access for demo mode (anon can read)
create policy "Public read accounts"
  on accounts for select using (true);

create policy "Public read payments"
  on payments for select using (true);

-- Only authenticated owner can write
create policy "Owner insert/update accounts"
  on accounts for all
  using (auth.jwt() ->> 'email' = current_setting('app.owner_email', true))
  with check (auth.jwt() ->> 'email' = current_setting('app.owner_email', true));

create policy "Owner insert/update payments"
  on payments for all
  using (auth.jwt() ->> 'email' = current_setting('app.owner_email', true))
  with check (auth.jwt() ->> 'email' = current_setting('app.owner_email', true));

-- ============================================================
-- After running the schema, seed your accounts:
-- (copy from accounts.real.ts and run as INSERT statements,
--  or use the seed script below)
-- ============================================================
