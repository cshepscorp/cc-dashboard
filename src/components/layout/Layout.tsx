import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  LayoutDashboard,
  CreditCard,
  History,
  Home,
  LogIn,
  LogOut,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/cn'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/accounts', label: 'Accounts', icon: CreditCard },
  { to: '/history', label: 'History', icon: History },
  { to: '/mortgage', label: 'Mortgage', icon: Home },
]

export function Layout() {
  const { user, isDemoMode, isOwner, signInWithGoogle, signOut, loading } = useAuth()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Demo banner */}
      {isDemoMode && (
        <div className="bg-warning/10 border-b border-warning/20 px-4 py-2 flex items-center gap-2 text-sm text-warning-foreground">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <span>
            You're viewing <strong>demo data</strong>.{' '}
            {!user && (
              <button
                onClick={signInWithGoogle}
                className="underline font-medium hover:no-underline"
              >
                Sign in
              </button>
            )}{' '}
            {user && !isOwner && 'Sign in as the account owner to see real data.'}
            to view your real accounts.
          </span>
        </div>
      )}

      {/* Top nav */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-base tracking-tight">
              💳 CC Dashboard
            </span>
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors',
                      isActive
                        ? 'bg-secondary text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    )
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {user.email}
                    </span>
                    <button
                      onClick={signOut}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-secondary transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:block">Sign out</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={signInWithGoogle}
                    className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign in
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t safe-area-inset-bottom">
        <div className="flex">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex-1 flex flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
