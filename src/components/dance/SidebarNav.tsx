import {
  navEventsIcon,
  navHomeIcon,
  navInboxIcon,
  navPlansIcon,
  navReportsIcon,
  navSettingsIcon,
  navSidebarIcon,
  type SidebarNavIcon,
} from '@/components/nav/navIcons'
import { SidebarNavItem } from '@/components/nav/SidebarNavItem'
import { sidebarNavDensity } from '@/components/nav/sidebarNavStyles'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { features } from '@/config/features'
import { cn } from '@/lib/utils'
import { CURRENT_USER_ID, usePlansStore } from '@/state/store'

export {
  SidebarNavDropdownItem,
  SidebarNavNestedItem,
  SidebarNavStandardItem,
  SidebarNavStubItem,
  SidebarNavItem,
} from '@/components/nav/SidebarNavItem'

function workspaceInitial(name: string) {
  const t = name.trim()
  return t ? t.charAt(0).toUpperCase() : '—'
}

function userInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return '—'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase()
}

function WorkspaceMark({ name, className }: { name: string; className?: string }) {
  return (
    <div
      className={cn(
        'flex size-[40px] shrink-0 items-center justify-center rounded-sm',
        'inset-edge-ring inset-edge-ring-full bg-surface-3',
        'text-sm font-semibold text-foreground',
        className,
      )}
      aria-hidden
    >
      {workspaceInitial(name)}
    </div>
  )
}

const collapseButtonClass = cn(
  'size-7 shrink-0 border-0 bg-transparent text-muted-foreground shadow-none',
  'transition-surface duration-150 ease-hover',
  'hover:!bg-transparent hover:!text-foreground active:!bg-transparent',
)

function featureNavItem(
  enabled: boolean,
  props: {
    to: string
    label: string
    icon: SidebarNavIcon
    end?: boolean
  },
) {
  if (enabled) {
    return (
      <SidebarNavItem
        variant="link"
        to={props.to}
        label={props.label}
        icon={props.icon}
        end={props.end}
      />
    )
  }
  return <SidebarNavItem variant="stub" label={props.label} icon={props.icon} />
}

export function SidebarNav({
  workspaceName,
  collapsed,
  onToggleCollapsed,
  className,
}: {
  workspaceName: string
  collapsed: boolean
  onToggleCollapsed: () => void
  className?: string
}) {
  const me = usePlansStore((s) => s.workspace.users[CURRENT_USER_ID])

  return (
    <aside
      className={cn(
        'relative hidden h-full shrink-0 overflow-hidden overscroll-contain bg-background transition-[width] duration-300 ease-out motion-reduce:transition-none md:flex',
        collapsed ? 'w-14' : 'w-[260px]',
        className,
      )}
    >
      <div
        className={cn(
          'absolute inset-0 z-[1] flex flex-col items-center',
          sidebarNavDensity.gutter,
          'transition-opacity duration-300 ease-out motion-reduce:transition-none',
          collapsed ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden={!collapsed}
        inert={collapsed ? undefined : true}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={collapseButtonClass}
          onClick={onToggleCollapsed}
          aria-label="Expand sidebar"
          title="Expand sidebar (⌘.)"
        >
          {navSidebarIcon({
            className: cn(sidebarNavDensity.icon, '-scale-x-100'),
            'aria-hidden': true,
          })}
        </Button>
        <WorkspaceMark name={workspaceName} className="mt-6" />
      </div>

      <div
        className={cn(
          'flex h-full min-h-0 w-[260px] flex-col',
          sidebarNavDensity.gutter,
          'transition-opacity duration-300 ease-out motion-reduce:transition-none',
          collapsed ? 'pointer-events-none opacity-0' : 'opacity-100',
        )}
        aria-hidden={collapsed}
        inert={collapsed}
      >
        <div className={cn('flex shrink-0 flex-col', sidebarNavDensity.sectionGap)}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <WorkspaceMark name={workspaceName} />
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                {workspaceName}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={collapseButtonClass}
              onClick={onToggleCollapsed}
              aria-label="Collapse sidebar"
              title="Collapse sidebar (⌘.)"
            >
              {navSidebarIcon({ className: sidebarNavDensity.icon, 'aria-hidden': true })}
            </Button>
          </div>

          <nav
            className={cn('flex flex-col', sidebarNavDensity.blockGap)}
            aria-label="Sidebar"
          >
            <SidebarNavItem variant="search" />

            <ScrollArea className="max-h-[min(60vh,28rem)] min-h-0 overscroll-contain">
              <div
                className={cn('flex flex-col', sidebarNavDensity.listGap)}
                role="group"
                aria-label="Primary"
              >
                {featureNavItem(features.home, {
                  to: '/',
                  label: 'Home',
                  icon: navHomeIcon,
                  end: true,
                })}
                {featureNavItem(features.inbox, {
                  to: '/inbox',
                  label: 'Inbox',
                  icon: navInboxIcon,
                })}
                {featureNavItem(features.events, {
                  to: '/events',
                  label: 'Events',
                  icon: navEventsIcon,
                })}
                {featureNavItem(features.plans, {
                  to: '/plans',
                  label: 'Plans',
                  icon: navPlansIcon,
                })}
                {featureNavItem(features.reports, {
                  to: '/reports',
                  label: 'Reports',
                  icon: navReportsIcon,
                })}
              </div>
            </ScrollArea>
          </nav>
        </div>

        <nav
          className={cn(
            'mt-auto flex shrink-0 flex-col pt-6',
            sidebarNavDensity.listGap,
          )}
          aria-label="Account"
        >
          <SidebarNavItem
            variant="user"
            to="/settings"
            label={me?.name ?? 'Account'}
            avatarUrl={me?.avatarUrl}
            initials={me?.name ? userInitials(me.name) : '—'}
          />
          {featureNavItem(features.settings, {
            to: '/settings',
            label: 'Settings',
            icon: navSettingsIcon,
          })}
          <SidebarNavItem variant="meta" label={`v${__APP_VERSION__}`} />
        </nav>
      </div>
    </aside>
  )
}
