import {
  navEventsIcon,
  navHomeIcon,
  navInboxIcon,
  navPlansIcon,
  navReportsIcon,
  navSettingsIcon,
  type SidebarNavIcon,
} from '@/components/nav/navIcons'
import { SidebarNavItem } from '@/components/nav/SidebarNavItem'
import { sidebarNavDensity } from '@/components/nav/sidebarNavStyles'
import { ScrollArea } from '@/components/ui/scroll-area'
import { features } from '@/config/features'
import { SHELL_SIDEBAR_NAV_TOP_PADDING_CLASS } from '@/layouts/shellLayout'
import { cn } from '@/lib/utils'
import { CURRENT_USER_ID, usePlansStore } from '@/state/store'

export {
  SidebarNavDropdownItem,
  SidebarNavNestedItem,
  SidebarNavStandardItem,
  SidebarNavStubItem,
  SidebarNavItem,
} from '@/components/nav/SidebarNavItem'

function userInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return '—'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase()
}

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

/** Primary nav column — workspace chrome lives in `ShellWorkspaceHeader`. */
export function SidebarNav({ className }: { className?: string }) {
  const me = usePlansStore((s) => s.workspace.users[CURRENT_USER_ID])

  return (
    <aside
      className={cn(
        'flex h-full min-h-0 w-full flex-col overflow-hidden overscroll-contain bg-background',
        sidebarNavDensity.gutter,
        cn('pb-3', SHELL_SIDEBAR_NAV_TOP_PADDING_CLASS),
        className,
      )}
    >
      <div className={cn('flex min-h-0 flex-1 flex-col', sidebarNavDensity.sectionGap)}>
        <nav className={cn('flex flex-col', sidebarNavDensity.blockGap)} aria-label="Sidebar">
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
        className={cn('mt-auto flex shrink-0 flex-col pt-6', sidebarNavDensity.listGap)}
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
    </aside>
  )
}
