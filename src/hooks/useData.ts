import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import type { Account, Payment, MortgagePayment } from '@/types'
import { currentMonth } from '@/lib/utils'

type AccountInsert = Database['public']['Tables']['accounts']['Insert']
type PaymentInsert = Database['public']['Tables']['payments']['Insert']
type MortgagePaymentInsert = Database['public']['Tables']['mortgage_payments']['Insert']

// ─── Accounts ─────────────────────────────────────────────────────────────────

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async (): Promise<Account[]> => {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('is_active', true)
        .order('due_day', { ascending: true })
      if (error) throw error
      return data as Account[]
    },
  })
}

export function useUpsertAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (account: Partial<Account> & { id: string }) => {
      const { data, error } = await supabase
        .from('accounts')
        .upsert(account as AccountInsert, { onConflict: 'id' })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  })
}

export function useDeactivateAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('accounts')
        .update({ is_active: false })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  })
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export function usePayments(month?: string) {
  return useQuery({
    queryKey: ['payments', month],
    queryFn: async (): Promise<Payment[]> => {
      let query = supabase
        .from('payments')
        .select('*')
        .order('month', { ascending: false })
      if (month) {
        query = query.eq('month', month)
      }
      const { data, error } = await query
      if (error) throw error
      return data as Payment[]
    },
  })
}

export function useAllPayments() {
  return useQuery({
    queryKey: ['payments', 'all'],
    queryFn: async (): Promise<Payment[]> => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('month', { ascending: false })
      if (error) throw error
      return data as Payment[]
    },
  })
}

export function useDeletePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('payments').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
  })
}

export function useAutoCreateAutopayPayments(
  accounts: Account[],
  payments: Payment[],
  month: string,
  isOwner: boolean
) {
  const qc = useQueryClient()

  useEffect(() => {
    if (!isOwner || accounts.length === 0 || month !== currentMonth()) return

    const todayDay = new Date().getDate()

    const missing = accounts.filter(
      a => a.is_autopay === true && a.is_active &&
        !payments.some(p => p.account_id === a.id && p.month === month)
    )
    if (missing.length === 0) return

    const rows: PaymentInsert[] = missing.map(a => {
      const paid = todayDay >= a.due_day
      return {
        account_id: a.id,
        month,
        status: 'autopay',
        amt_due: a.monthly_payment ?? null,
        amt_paid: paid ? (a.monthly_payment ?? null) : null,
        date_paid: paid ? `${month}-${String(a.due_day).padStart(2, '0')}` : null,
        confirmation: null,
        notes: null,
      }
    })

    supabase
      .from('payments')
      .upsert(rows, { onConflict: 'account_id,month' })
      .then(({ error }) => {
        if (!error) qc.invalidateQueries({ queryKey: ['payments'] })
      })
  }, [accounts, payments, month, isOwner, qc])
}


// ─── Mortgage Payments ────────────────────────────────────────────────────────

export function useMortgagePayments(accountId?: string) {
  return useQuery({
    queryKey: ['mortgage_payments', accountId],
    queryFn: async (): Promise<MortgagePayment[]> => {
      let query = supabase
        .from('mortgage_payments')
        .select('*')
        .order('month', { ascending: false })
      if (accountId) query = query.eq('account_id', accountId)
      const { data, error } = await query
      if (error) throw error
      return data as MortgagePayment[]
    },
  })
}

export function useAutoCreateMortgagePayments(
  accounts: Account[],
  payments: MortgagePayment[],
  isOwner: boolean
) {
  const qc = useQueryClient()
  const month = currentMonth()

  useEffect(() => {
    if (!isOwner || accounts.length === 0) return

    const mortgageAccounts = accounts.filter(a => a.type === 'mortgage' && a.is_active)
    const missing = mortgageAccounts.filter(
      a => !payments.some(p => p.account_id === a.id && p.month === month)
    )
    if (missing.length === 0) return

    const rows = missing.flatMap(a => {
      const lastPayment = payments
        .filter(p => p.account_id === a.id && p.month < month)
        .sort((x, y) => y.month.localeCompare(x.month))[0]
      if (!lastPayment) return []
      return [{
        account_id: a.id,
        month,
        principal: lastPayment.principal ?? null,
        extra_principal: null,
        interest: lastPayment.interest ?? null,
        escrow: lastPayment.escrow ?? null,
        total_paid: (lastPayment.principal ?? 0) + (lastPayment.interest ?? 0) + (lastPayment.escrow ?? 0) || null,
        date_paid: `${month}-${String(a.due_day).padStart(2, '0')}`,
        notes: null,
      }]
    })
    if (rows.length === 0) return

    supabase
      .from('mortgage_payments')
      .upsert(rows as MortgagePaymentInsert[], { onConflict: 'account_id,month' })
      .then(({ error }) => {
        if (!error) qc.invalidateQueries({ queryKey: ['mortgage_payments'] })
      })
  }, [accounts, payments, isOwner, month, qc])
}

export function useUpsertMortgagePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payment: Partial<MortgagePayment> & { account_id: string; month: string }) => {
      const { data, error } = await supabase
        .from('mortgage_payments')
        .upsert(payment as MortgagePaymentInsert, { onConflict: 'account_id,month' })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mortgage_payments'] })
    },
  })
}

export function useDeleteMortgagePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, accountId }: { id: string; accountId: string }) => {
      const { error } = await supabase.from('mortgage_payments').delete().eq('id', id)
      if (error) throw error
      return accountId
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mortgage_payments'] })
    },
  })
}

export function useUpsertPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payment: Partial<Payment> & { account_id: string; month: string }) => {
      // Upsert on (account_id, month) — update if exists, insert if not
      const { data, error } = await supabase
        .from('payments')
        .upsert(payment as PaymentInsert, { onConflict: 'account_id,month' })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['payments', vars.month] })
      qc.invalidateQueries({ queryKey: ['payments', 'all'] })
    },
  })
}
