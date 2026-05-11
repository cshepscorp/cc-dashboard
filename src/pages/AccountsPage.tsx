import { useState } from 'react'
import type { Account } from '@/types'
import { useAccounts } from '@/hooks/useData'
import { useAuth } from '@/hooks/useAuth'
import { AddAccountDialog } from '@/components/accounts/AddAccountDialog'
import { AccountsTable } from '@/components/accounts/AccountsTable'

export function AccountsPage() {
  const { isOwner } = useAuth()
  const { data: accounts = [], isLoading, error } = useAccounts()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | undefined>()

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingAccount(undefined)
  }

  if (!isOwner) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-xl font-semibold">Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to manage your accounts.
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-xl font-semibold">Accounts</h1>
        </div>
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
          Loading accounts…
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-xl font-semibold">Accounts</h1>
        </div>
        <div className="rounded-xl border bg-card p-8 text-center text-destructive">
          Error loading accounts. Please try again.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your credit cards, installment plans, and loans.
          </p>
        </div>
        <button
          onClick={() => { setEditingAccount(undefined); setDialogOpen(true) }}
          className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Add account
        </button>
      </div>

      <AccountsTable accounts={accounts} onEdit={handleEdit} />

      <AddAccountDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        existingAccount={editingAccount}
      />
    </div>
  )
}
