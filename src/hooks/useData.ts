import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import type { Account, Payment } from '@/types'

type AccountInsert = Database['public']['Tables']['accounts']['Insert']
type PaymentInsert = Database['public']['Tables']['payments']['Insert']

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
