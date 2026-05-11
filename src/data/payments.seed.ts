import type { Payment } from '@/types'

/**
 * Seed data from the 2026 Google Sheet export.
 * This will be migrated to Supabase — this file is the one-time seed source.
 * Once in the DB, this file is no longer used at runtime.
 */
export const SEED_PAYMENTS: Omit<Payment, 'id' | 'created_at' | 'updated_at'>[] = [
  // ── January 2026 ──────────────────────────────────────────────────────────
  { account_id: 'cap-one-quicksilver', month: '2026-01', amt_paid: 0, amt_due: 0, status: 'na' },
  { account_id: 'delta-amex', month: '2026-01', amt_paid: 514.62, amt_due: 1029.24, status: 'partial' },
  { account_id: 'verizon-visa', month: '2026-01', amt_paid: 0, amt_due: 0, status: 'na' },
  { account_id: 'amazon-chase', month: '2026-01', amt_paid: 1424.80, amt_due: 1424.80, status: 'paid' },
  { account_id: 'lowes', month: '2026-01', amt_paid: 100, status: 'paid', notes: 'Paid off $226 reg + $151 promo spend' },
  { account_id: 'aa-citi', month: '2026-01', amt_paid: 0, amt_due: 0, status: 'na' },
  { account_id: 'kitchen-reno', month: '2026-01', amt_due: 650, status: 'autopay', date_paid: '2026-01-18', notes: 'Autopay 18th' },
  { account_id: 'cap-one-venture', month: '2026-01', amt_paid: 500, date_paid: '2026-01-18', status: 'paid' },
  { account_id: 'chase-7026', month: '2026-01', amt_paid: 221.30, amt_due: 442.59, status: 'partial' },
  { account_id: 'discover', month: '2026-01', amt_paid: 0, amt_due: 0, status: 'na' },
  { account_id: 'southwest-chase', month: '2026-01', amt_paid: 30.24, date_paid: '2026-01-18', status: 'paid' },
  { account_id: 'costco-citi', month: '2026-01', amt_paid: 0, amt_due: 0, status: 'na' },

  // ── February 2026 ─────────────────────────────────────────────────────────
  { account_id: 'cap-one-quicksilver', month: '2026-02', amt_paid: 0, amt_due: 0, status: 'na' },
  { account_id: 'delta-amex', month: '2026-02', amt_paid: 1671, amt_due: 3342.96, date_paid: '2026-02-08', status: 'partial', notes: 'Woodfin oil, Brooklyn flights' },
  { account_id: 'verizon-visa', month: '2026-02', amt_paid: 0, amt_due: 0, status: 'na' },
  { account_id: 'amazon-chase', month: '2026-02', amt_paid: 1362.17, amt_due: 1362.17, date_paid: '2026-02-10', status: 'paid' },
  { account_id: 'lowes', month: '2026-02', amt_paid: 50, amt_due: 387, date_paid: '2026-02-12', status: 'partial' },
  { account_id: 'aa-citi', month: '2026-02', amt_paid: 99, status: 'paid' },
  { account_id: 'kitchen-reno', month: '2026-02', amt_due: 650, status: 'autopay', date_paid: '2026-02-18' },
  { account_id: 'cap-one-venture', month: '2026-02', amt_paid: 500, status: 'paid', notes: '0% ends July 24' },
  { account_id: 'chase-7026', month: '2026-02', amt_paid: 320.19, amt_due: 640.38, status: 'partial' },
  { account_id: 'discover', month: '2026-02', amt_paid: 0, amt_due: 0, status: 'na' },
  { account_id: 'southwest-chase', month: '2026-02', amt_paid: 0, amt_due: 0, status: 'na' },
  { account_id: 'costco-citi', month: '2026-02', amt_paid: 0, amt_due: 0, status: 'na' },

  // ── March 2026 ────────────────────────────────────────────────────────────
  { account_id: 'cap-one-quicksilver', month: '2026-03', amt_paid: 0, amt_due: 0, status: 'na' },
  { account_id: 'delta-amex', month: '2026-03', amt_paid: 1027, amt_due: 2054.72, date_paid: '2026-03-08', status: 'partial' },
  { account_id: 'verizon-visa', month: '2026-03', amt_paid: 0, amt_due: 0, status: 'na' },
  { account_id: 'amazon-chase', month: '2026-03', amt_paid: 1097.42, amt_due: 1097.42, date_paid: '2026-03-10', status: 'paid' },
  { account_id: 'lowes', month: '2026-03', amt_paid: 57, amt_due: 25, date_paid: '2026-03-02', status: 'paid', notes: '$346.07 remaining; pref int ends 8/20' },
  { account_id: 'aa-citi', month: '2026-03', amt_paid: 0, amt_due: 0, status: 'na' },
  { account_id: 'kitchen-reno', month: '2026-03', amt_due: 650, status: 'autopay', date_paid: '2026-03-18' },
  { account_id: 'cap-one-venture', month: '2026-03', amt_paid: 500, date_paid: '2026-03-18', status: 'paid', notes: '~$2k left, 0% ends July' },
  { account_id: 'chase-7026', month: '2026-03', amt_paid: 728, amt_due: 1455.71, status: 'partial', notes: 'RAV4 downpayment on here' },
  { account_id: 'discover', month: '2026-03', amt_paid: 0, amt_due: 0, status: 'na' },
  { account_id: 'southwest-chase', month: '2026-03', amt_paid: 0, amt_due: 0, status: 'na' },
  { account_id: 'costco-citi', month: '2026-03', amt_paid: 0, amt_due: 0, status: 'na' },

  // ── April 2026 ────────────────────────────────────────────────────────────
  { account_id: 'delta-amex', month: '2026-04', amt_paid: 2240.66, amt_due: 4481.33, date_paid: '2026-04-08', status: 'partial' },
  { account_id: 'verizon-visa', month: '2026-04', amt_paid: 0, amt_due: 0, status: 'na' },
  { account_id: 'amazon-chase', month: '2026-04', amt_paid: 463.85, amt_due: 463.85, date_paid: '2026-04-10', status: 'paid' },
  { account_id: 'lowes', month: '2026-04', amt_paid: 57, status: 'paid' },
  { account_id: 'aa-citi', month: '2026-04', amt_paid: 0, amt_due: 0, status: 'na' },
  { account_id: 'kitchen-reno', month: '2026-04', amt_due: 650, status: 'autopay', date_paid: '2026-04-18' },
  { account_id: 'cap-one-venture', month: '2026-04', amt_paid: 500, date_paid: '2026-04-17', status: 'paid' },
  { account_id: 'chase-7026', month: '2026-04', amt_paid: 176.39, amt_due: 326.39, status: 'partial' },
  { account_id: 'discover', month: '2026-04', amt_paid: 5.98, date_paid: '2026-04-18', status: 'late', notes: 'Late payment!' },
  { account_id: 'southwest-chase', month: '2026-04', amt_paid: 0, amt_due: 0, status: 'na' },
  { account_id: 'costco-citi', month: '2026-04', amt_paid: 0, amt_due: 0, status: 'na' },

  // ── May 2026 ──────────────────────────────────────────────────────────────
  { account_id: 'delta-amex', month: '2026-05', amt_paid: 735.97, amt_due: 1471.94, date_paid: '2026-05-08', status: 'partial' },
  { account_id: 'verizon-visa', month: '2026-05', amt_paid: 0, amt_due: 0, status: 'na' },
  { account_id: 'amazon-chase', month: '2026-05', amt_paid: 1092, amt_due: 1092, date_paid: '2026-05-10', status: 'paid' },
  { account_id: 'lowes', month: '2026-05', amt_paid: 57, amt_due: 30, date_paid: '2026-05-12', status: 'partial' },
  { account_id: 'aa-citi', month: '2026-05', amt_paid: 0, amt_due: 0, status: 'na' },
  { account_id: 'kitchen-reno', month: '2026-05', amt_due: 650, status: 'autopay', date_paid: '2026-05-18' },
  { account_id: 'cap-one-venture', month: '2026-05', amt_paid: 500, amt_due: 35, date_paid: '2026-05-18', status: 'partial' },
  { account_id: 'chase-7026', month: '2026-05', amt_paid: 120.09, amt_due: 240.09, date_paid: '2026-05-17', status: 'partial' },
  { account_id: 'discover', month: '2026-05', amt_paid: 0, amt_due: 0, status: 'na' },
  { account_id: 'southwest-chase', month: '2026-05', amt_paid: 99, amt_due: 99, date_paid: '2026-05-18', status: 'paid', notes: 'Annual fee' },
  { account_id: 'costco-citi', month: '2026-05', amt_paid: 129.56, amt_due: 387.56, date_paid: '2026-05-24', status: 'partial' },
]
