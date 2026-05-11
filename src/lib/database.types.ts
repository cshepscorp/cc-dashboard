/**
 * Generated types for Supabase tables.
 * Run `supabase gen types typescript` to regenerate after schema changes.
 * For now this is manually maintained to match our schema.
 */
export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string
          name: string
          type: string
          last4: string | null
          issuer: string | null
          due_day: number
          credit_limit: number | null
          current_balance: number | null
          apr: number | null
          promo_apr: number | null
          promo_ends: string | null
          portal_url: string | null
          is_personal: boolean
          is_active: boolean
          monthly_payment: number | null
          payoff_date: string | null
          original_balance: number | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['accounts']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['accounts']['Insert']>
      }
      payments: {
        Row: {
          id: string
          account_id: string
          month: string
          amt_due: number | null
          amt_paid: number | null
          date_paid: string | null
          status: string
          confirmation: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
    }
  }
}
