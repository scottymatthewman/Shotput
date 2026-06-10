import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { CenteredPageScroll } from '@/layouts/CenteredPageScroll'
import { PageHeader } from '@/layouts/PageHeader'
import { PageShell } from '@/layouts/PageShell'
import { APP_NAME } from '@/config/app'
import { db, hasInstantConfig } from '@/lib/instant/db'
import { useUiStore } from '@/state/uiStore'
import { cn } from '@/lib/utils'
import { Moon, Sun } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

const settingsSectionShell = cn(
  'flex flex-col gap-3 rounded-lg inset-edge-ring inset-edge-ring-full inset-edge-soft bg-surface-contrast p-6',
)

function settingsSectionSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  const slug = settingsSectionSlug(title)
  return (
    <section className={settingsSectionShell} aria-labelledby={`settings-heading-${slug}`}>
      <header>
        <h2 id={`settings-heading-${slug}`} className="text-sm font-semibold text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </header>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}

function authDebugStatus(userEmail: string | null): string {
  if (!hasInstantConfig) return 'Guest mode — VITE_INSTANT_APP_ID is not set'
  return userEmail
    ? `Signed in as ${userEmail}`
    : 'Instant configured — not signed in'
}

export function SettingsPage() {
  const { user } = db.useAuth()
  const theme = useUiStore((s) => s.theme)
  const toggleTheme = useUiStore((s) => s.toggleTheme)
  const navigate = useNavigate()

  const email = user?.email ?? null
  const initials = (email ?? 'G').charAt(0).toUpperCase()

  async function retryAuthFlow() {
    if (user) await db.auth.signOut()
    navigate('/sign-in', { state: { from: '/settings' } })
  }

  return (
    <PageShell>
      <PageHeader title="Settings" description={APP_NAME} layout="inline" />
      <CenteredPageScroll>
        <SettingsSection
          title="Your account"
          description={
            hasInstantConfig
              ? 'Signed in with a one-time email code via InstantDB.'
              : 'Guest mode — configure VITE_INSTANT_APP_ID to enable sign-in.'
          }
        >
          <div className="flex items-center gap-4">
            <Avatar className="size-10 shrink-0 rounded-lg">
              <AvatarFallback className="rounded-lg bg-secondary text-xs font-medium text-muted-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{email ?? 'Guest'}</p>
              <p className="text-xs text-muted-foreground">
                {email ? 'Email' : 'Not signed in'}
              </p>
            </div>
          </div>
          {user ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit cursor-pointer transition-surface duration-150 ease-hover"
              onClick={() => void db.auth.signOut()}
            >
              Sign out
            </Button>
          ) : null}
        </SettingsSection>

        <SettingsSection
          title="Appearance"
          description={`How ${APP_NAME} looks on your device.`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Theme</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {theme === 'dark' ? 'Dark mode is on.' : 'Light mode is on.'}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit cursor-pointer gap-2 transition-surface duration-150 ease-hover"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="size-4" aria-hidden />
                  Light mode
                </>
              ) : (
                <>
                  <Moon className="size-4" aria-hidden />
                  Dark mode
                </>
              )}
            </Button>
          </div>
        </SettingsSection>

        {import.meta.env.DEV ? (
          <SettingsSection
            title="Debug"
            description="Development helpers — not shown in production builds."
          >
            <p className="font-mono text-xs text-muted-foreground">{authDebugStatus(email)}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit transition-surface duration-150 ease-hover"
              onClick={() => void retryAuthFlow()}
            >
              {user ? 'Sign out and open sign-in' : 'Open sign-in flow'}
            </Button>
          </SettingsSection>
        ) : null}
      </CenteredPageScroll>
    </PageShell>
  )
}
