import { AppBootSkeleton } from '@/components/AppBootSkeleton'
import { AuthGate } from '@/components/AuthGate'
import { AgentationDevTools } from '@/components/dev/AgentationDevTools'
import { DialKitDevTools } from '@/components/dev/DialKitDevTools'
import { AppShell } from '@/layouts/AppShell'
import { Suspense, lazy, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

const HomePage = lazy(() =>
  import('@/features/home/HomePage').then((m) => ({ default: m.HomePage })),
)
const ComposerPage = lazy(() =>
  import('@/features/composer/ComposerPage').then((m) => ({ default: m.ComposerPage })),
)
const QueuePage = lazy(() =>
  import('@/features/queue/QueuePage').then((m) => ({ default: m.QueuePage })),
)
const AccountsPage = lazy(() =>
  import('@/features/accounts/AccountsPage').then((m) => ({ default: m.AccountsPage })),
)
const SettingsPage = lazy(() =>
  import('@/features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)
const SignInPage = lazy(() =>
  import('@/features/auth/SignInPage').then((m) => ({ default: m.SignInPage })),
)

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<AppBootSkeleton />}>{children}</Suspense>
}

export default function App() {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <BrowserRouter>
        <Routes>
          <Route
            path="/sign-in"
            element={
              <LazyPage>
                <SignInPage />
              </LazyPage>
            }
          />
          <Route
            element={
              <AuthGate>
                <AppShell />
              </AuthGate>
            }
          >
            <Route
              path="/"
              element={
                <LazyPage>
                  <HomePage />
                </LazyPage>
              }
            />
            <Route
              path="/new"
              element={
                <LazyPage>
                  <ComposerPage />
                </LazyPage>
              }
            />
            <Route
              path="/queue"
              element={
                <LazyPage>
                  <QueuePage />
                </LazyPage>
              }
            />
            <Route
              path="/accounts"
              element={
                <LazyPage>
                  <AccountsPage />
                </LazyPage>
              }
            />
            <Route
              path="/settings"
              element={
                <LazyPage>
                  <SettingsPage />
                </LazyPage>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      {import.meta.env.DEV ? (
        <>
          <AgentationDevTools />
          <DialKitDevTools />
        </>
      ) : null}
    </div>
  )
}
