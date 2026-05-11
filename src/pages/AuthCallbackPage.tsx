import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(() => {
      navigate('/dashboard', { replace: true })
    })
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Signing in…</p>
    </div>
  )
}
