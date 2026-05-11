import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import { REAL_ACCOUNTS } from '../src/data/accounts.real.js'
import { SEED_PAYMENTS } from '../src/data/payments.seed.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Parse .env without dotenv
const envPath = resolve(__dirname, '../.env')
const env: Record<string, string> = {}
readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return
  const idx = trimmed.indexOf('=')
  if (idx === -1) return
  env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim()
})

const supabaseUrl = env.VITE_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

async function seed() {
  console.log(`Seeding ${REAL_ACCOUNTS.length} accounts…`)
  const { error: accountsError } = await supabase
    .from('accounts')
    .upsert(REAL_ACCOUNTS, { onConflict: 'id' })
  if (accountsError) {
    console.error('Accounts seed failed:', accountsError.message)
    process.exit(1)
  }
  console.log('✓ Accounts done')

  console.log(`Seeding ${SEED_PAYMENTS.length} payments…`)
  const { error: paymentsError } = await supabase
    .from('payments')
    .upsert(SEED_PAYMENTS, { onConflict: 'account_id,month' })
  if (paymentsError) {
    console.error('Payments seed failed:', paymentsError.message)
    process.exit(1)
  }
  console.log('✓ Payments done')
}

seed()
