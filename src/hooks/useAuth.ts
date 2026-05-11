import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const OWNER_EMAIL = import.meta.env.VITE_OWNER_EMAIL ?? ''

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })

  const signOut = () => supabase.auth.signOut()

  /** True only when signed in as the owner email */
  const isOwner = !!user && user.email === OWNER_EMAIL

  /** Demo mode: either not logged in, or logged in but not as owner */
  const isDemoMode = !isOwner

  return { user, loading, isOwner, isDemoMode, signInWithGoogle, signOut }
}
