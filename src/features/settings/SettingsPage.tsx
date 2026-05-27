import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CenteredPageScroll } from '@/layouts/CenteredPageScroll'
import { PageHeader } from '@/layouts/PageHeader'
import { PageShell } from '@/layouts/PageShell'
import { cn } from '@/lib/utils'
import { CURRENT_USER_ID, usePlansStore } from '@/state/store'
import { useUiStore } from '@/state/uiStore'
import type { ReactNode } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/** Prototype gate — swap for real workspace-role / IAM when available. */
const CAN_MANAGE_WORKSPACE = true

const settingsSectionShell = cn(
  'flex flex-col gap-3 rounded-lg inset-edge-ring inset-edge-ring-full inset-edge-soft bg-muted p-6',
)

/** White outline control (overview-adjacent); edge strengthens on hover. */
const settingsConnectorConnectButtonClass = cn(
  'inset-edge-ring inset-edge-ring-full inset-edge-chrome inset-edge-chrome-hover transition-surface duration-150 ease-hover motion-reduce:transition-none',
  'bg-transparent text-chrome-fg hover:bg-gantt-canvas',
)

type ConnectorScope = 'workspace' | 'user' | 'both'

function settingsSectionSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const CONNECTORS: {
  name: string
  description: string
  scope: ConnectorScope
  /** Demo UX only — OAuth not wired. */
  connected: boolean
}[] = [
  {
    name: 'Attio',
    description: 'Sync events to CRM records (used on event Overview).',
    scope: 'workspace',
    connected: false,
  },
  {
    name: 'Slack',
    description: 'Post timeline updates and reminders to channels.',
    scope: 'workspace',
    connected: false,
  },
  {
    name: 'Google Calendar',
    description: 'Mirror milestones for stakeholders.',
    scope: 'workspace',
    connected: false,
  },
  {
    name: 'Gmail',
    description: 'Capture deadlines from threads in your inbox.',
    scope: 'user',
    connected: false,
  },
  {
    name: 'Webhooks',
    description: 'Workspace-wide automation plus optional personal endpoints.',
    scope: 'both',
    connected: false,
  },
]

function ScopeBadges({ scope }: { scope: ConnectorScope }) {
  if (scope === 'both') {
    return (
      <span className="flex flex-wrap gap-1">
        <Badge variant="outline" className="text-[10px] font-medium">
          Workspace
        </Badge>
        <Badge variant="outline" className="text-[10px] font-medium">
          Personal
        </Badge>
      </span>
    )
  }
  return (
    <Badge variant="outline" className="text-[10px] font-medium">
      {scope === 'workspace' ? 'Workspace' : 'Personal'}
    </Badge>
  )
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

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return '—'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  const a = parts[0]!.charAt(0)
  const b = parts[parts.length - 1]!.charAt(0)
  return `${a}${b}`.toUpperCase()
}

export function SettingsPage() {
  const navigate = useNavigate()
  const workspaceName = usePlansStore((s) => s.workspace.name)
  const me = usePlansStore((s) => s.workspace.users[CURRENT_USER_ID])
  const theme = useUiStore((s) => s.theme)
  const toggleTheme = useUiStore((s) => s.toggleTheme)

  return (
    <PageShell>
      <PageHeader
        title="Settings"
        description={workspaceName}
        descriptionInline
      />
      <CenteredPageScroll>
        <SettingsSection title="Your account" description="Profile and preferences for how Dance behaves for you.">
          <div className="flex flex-col gap-4">
            <Avatar className="size-14 shrink-0 rounded-lg">
              {me?.avatarUrl ? <AvatarImage src={me.avatarUrl} alt="" /> : null}
              <AvatarFallback className="rounded-lg bg-secondary text-xs font-medium text-muted-foreground">
                {me?.name ? initialsFor(me.name) : '—'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-3">
              <div className="flex min-w-0 flex-row flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Name
                </span>
                <span className="min-w-0 truncate text-right text-sm text-foreground">{me?.name ?? '—'}</span>
              </div>
              <div className="flex min-w-0 flex-row flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Email
                </span>
                <span className="min-w-0 truncate text-right text-sm text-foreground">{me?.email ?? '—'}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  settingsConnectorConnectButtonClass,
                  'w-fit cursor-pointer whitespace-nowrap disabled:pointer-events-none disabled:opacity-50',
                )}
                disabled
              >
                Manage password
              </Button>
              <p className="text-xs text-muted-foreground">
                Additional fields like locale and notifications will attach here.
              </p>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title="Appearance" description="How Dance looks on your device.">
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

        {CAN_MANAGE_WORKSPACE ? (
          <SettingsSection
            title="Workspace"
            description={`${workspaceName} — members, roles, and billing (prototype).`}
          >
            <p className="text-sm text-foreground">
              Manage who can edit timelines, integrations, and shared connectors.
            </p>
            <Button type="button" variant="outline" size="sm" className="w-fit cursor-pointer transition-surface duration-150 ease-hover" disabled>
              Open workspace settings
            </Button>
          </SettingsSection>
        ) : (
          <SettingsSection title="Workspace" description="Restricted to workspace admins in production.">
            <p className="text-sm text-muted-foreground">Ask a workspace owner to invite you as an admin to change integrations or roles.</p>
          </SettingsSection>
        )}

        <SettingsSection
          title="Connectors"
          description="Some integrations are scoped to your account; others apply to everyone in this workspace."
        >
          <ul className="flex flex-col gap-3">
            {CONNECTORS.map((c) => (
              <li
                key={c.name}
                className="flex flex-col gap-2 rounded-md inset-edge-ring inset-edge-ring-full inset-edge-softer bg-background/40 px-3 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 gap-y-1">
                    <span className="text-sm font-medium text-foreground">{c.name}</span>
                    <ScopeBadges scope={c.scope} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                  <Badge variant={c.connected ? 'default' : 'muted'} className="w-fit shrink-0 text-[10px]">
                    {c.connected ? 'Connected' : 'Not connected'}
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      settingsConnectorConnectButtonClass,
                      'w-full whitespace-nowrap sm:w-auto disabled:pointer-events-none disabled:opacity-50',
                    )}
                    disabled
                  >
                    Connect (demo)
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </SettingsSection>

        <SettingsSection
          title="Time & region"
          description="How dates and deadlines appear across your workspace views."
        >
          <div className="flex max-w-[min(100%,320px)] flex-col gap-2">
            <Label htmlFor="settings-timezone" className="text-xs text-muted-foreground">
              Workspace timezone (demo)
            </Label>
            <Input
              id="settings-timezone"
              readOnly
              disabled
              value="America/Los_Angeles"
              aria-readonly="true"
              className="font-mono text-sm text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">Per-event overrides can live beside timeline dates once scheduling ships.</p>
          </div>
        </SettingsSection>

        <SettingsSection title="Security" description="Sessions, authentication providers, and sign-in policy.">
          <p className="text-sm text-muted-foreground">This prototype trusts a single persisted workspace. SSO and SAML would wire in here.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="inset-edge-chrome inset-edge-chrome-hover w-fit cursor-pointer transition-surface duration-150 ease-out hover:bg-gantt-canvas hover:text-foreground motion-reduce:transition-none"
            onClick={() => navigate('/')}
          >
            Sign out (demo)
          </Button>
        </SettingsSection>
      </CenteredPageScroll>
    </PageShell>
  )
}
