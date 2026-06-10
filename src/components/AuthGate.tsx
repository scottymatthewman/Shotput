import { AppBootSkeleton } from '@/components/AppBootSkeleton'
import { db, hasInstantConfig } from '@/lib/instant/db'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

/**
 * Protects the app shell. Signed-out users are redirected to /sign-in.
 * In guest mode (no VITE_INSTANT_APP_ID) everything renders unauthenticated.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { isLoading, user } = db.useAuth()
  const location = useLocation()

  if (!hasInstantConfig) return children

  if (isLoading) return <AppBootSkeleton />

  if (!user) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />
  }

  return children
}
