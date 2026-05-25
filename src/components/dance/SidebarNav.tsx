import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { Plan } from '@/types/domain'
import {
  Calendar,
  Compass,
  LayoutDashboard,
  Rows3,
  LogOut,
  MessageSquare,
  PanelLeft,
  PanelRight,
  Search,
  Settings,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const sidebarNavRow = {
  standard: {
    root: 'group flex h-6 items-center gap-3 rounded-md px-1 text-xs transition-surface duration-150 ease-hover',
    active: 'font-medium text-foreground hover:text-white',
    inactive:
      'font-medium text-muted-foreground hover:text-white',
    icon: 'size-3 shrink-0 text-muted-foreground transition-surface motion-reduce:transition-none group-hover:text-white',
  },
  nested: {
    root: 'group flex h-6 items-center gap-1 rounded-md px-1 text-xs transition-surface duration-150 ease-hover',
    active: 'font-medium text-foreground hover:text-white',
    inactive:
      'font-medium text-muted-foreground hover:text-white',
    icon: 'size-3 shrink-0 text-muted-foreground transition-surface motion-reduce:transition-none group-hover:text-white',
  },
} as const

export type SidebarNavRowVariant = keyof typeof sidebarNavRow

export type SidebarNavLinkRowProps = {
  to: string
  end?: boolean
  label: string
  icon?: LucideIcon
  /** Merged with `NavLink` `isActive` (e.g. highlight event while its planner is open). */
  activeWhen?: boolean
  variant: SidebarNavRowVariant
  trailing?: ReactNode
  className?: string
}

function SidebarNavLinkRow({
  to,
  end,
  label,
  icon: Icon,
  activeWhen,
  variant,
  trailing,
  className,
}: SidebarNavLinkRowProps) {
  const cfg = sidebarNavRow[variant]
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          cfg.root,
          isActive || activeWhen ? cfg.active : cfg.inactive,
          className,
        )
      }
    >
      {({ isActive }) => {
        const active = isActive || activeWhen
        return (
          <>
            {Icon ? (
              <Icon className={cn(cfg.icon, active && 'text-white')} />
            ) : null}
            <span className="min-w-0 flex-1 truncate">{label}</span>
            {trailing}
          </>
        )
      }}
    </NavLink>
  )
}

export type SidebarNavStandardItemProps = Omit<
  SidebarNavLinkRowProps,
  'variant' | 'trailing'
> & {
  icon: LucideIcon
}

/** Primary sidebar row with leading icon + label. */
export function SidebarNavStandardItem({
  icon,
  ...props
}: SidebarNavStandardItemProps) {
  return (
    <SidebarNavLinkRow variant="standard" icon={icon} {...props} />
  )
}

export type SidebarNavDropdownItemProps = Omit<
  SidebarNavStandardItemProps,
  'trailing'
> & {
  /** Defaults to disclosure chevron; replace when wiring real menus. */
  trailing?: ReactNode
}

/** Same chrome as SidebarNavStandardItem with a trailing affordance for expand / menu. */
export function SidebarNavDropdownItem({
  trailing,
  ...props
}: SidebarNavDropdownItemProps) {
  return (
    <SidebarNavLinkRow
      variant="standard"
      trailing={
        trailing ?? (
          <ChevronDown
            className="size-4 shrink-0 text-muted-foreground transition-surface motion-reduce:transition-none group-hover:text-white"
            aria-hidden
          />
        )
      }
      {...props}
    />
  )
}

export type SidebarNavNestedItemProps = Omit<
  SidebarNavLinkRowProps,
  'variant'
>

/** Indented timeline / child route row; optional icon uses nested scale. */
export function SidebarNavNestedItem(props: SidebarNavNestedItemProps) {
  return <SidebarNavLinkRow variant="nested" {...props} />
}

export function SidebarNav({
  workspaceName,
  plans,
  currentEventId,
  collapsed,
  onToggleCollapsed,
  className,
}: {
  workspaceName: string
  plans: Plan[]
  currentEventId?: string
  collapsed: boolean
  onToggleCollapsed: () => void
  className?: string
}) {
  const navigate = useNavigate()

  return (
    <aside
      className={cn(
        'relative hidden h-full shrink-0 overflow-hidden bg-transparent transition-[width] duration-300 ease-out motion-reduce:transition-none md:flex',
        collapsed ? 'w-14' : 'w-[260px]',
        className,
      )}
    >
      <div
        className={cn(
          'absolute inset-0 z-[1] flex flex-col items-center py-3 transition-opacity duration-300 ease-out motion-reduce:transition-none',
          collapsed ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden={!collapsed}
        inert={collapsed ? undefined : true}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 shrink-0"
          onClick={onToggleCollapsed}
          aria-label="Expand sidebar"
          title="Expand sidebar (⌘.)"
        >
          <PanelRight className="size-5 text-muted-foreground" />
        </Button>
        <div className="mt-4 flex size-9 items-center justify-center rounded-md bg-primary/20 text-xs font-bold text-primary">
          F
        </div>
      </div>

      <div
        className={cn(
          'flex h-full min-h-0 w-[260px] flex-col transition-opacity duration-300 ease-out motion-reduce:transition-none',
          collapsed ? 'pointer-events-none opacity-0' : 'opacity-100',
        )}
        aria-hidden={collapsed}
        inert={collapsed}
      >
        <div className="flex items-center gap-2 px-3 pt-4 pb-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/20 text-sm font-bold text-primary">
              F
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">Dance</p>
              <p className="truncate text-xs text-muted-foreground">{workspaceName}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 text-muted-foreground"
            onClick={onToggleCollapsed}
            aria-label="Collapse sidebar"
            title="Collapse sidebar (⌘.)"
          >
            <PanelLeft className="size-5" />
          </Button>
        </div>

        <div className="mt-2 mb-4 px-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              readOnly
              placeholder="Search"
              className="h-9 cursor-pointer bg-background pr-10 pl-9 text-sm"
              onClick={() => {
                /* Command palette opened from AppShell */
              }}
              data-search-trigger
            />
            <kbd className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
              /
            </kbd>
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="px-4 pb-4">
            <nav className="flex flex-col gap-1" aria-label="Primary">
              <SidebarNavStandardItem to="/" end label="Dashboard" icon={LayoutDashboard} />
              <SidebarNavStandardItem to="/chat" label="Chat" icon={MessageSquare} />
            </nav>
            <p className="mb-2 mt-4 px-0 text-[11px] font-medium tracking-wide text-muted-foreground">
              Find
            </p>
            <nav className="flex flex-col gap-1" aria-label="Find">
              <SidebarNavStandardItem to="/find" label="Industry events" icon={Compass} />
            </nav>
            <p className="mb-2 mt-4 px-0 text-[11px] font-medium tracking-wide text-muted-foreground">
              Plan
            </p>
            <nav className="flex flex-col gap-1" aria-label="Plan">
              <SidebarNavStandardItem to="/plan" end label="All plans" icon={Rows3} />
              {plans.map((p) => (
                <SidebarNavStandardItem
                  key={p.id}
                  to={`/plan/${p.id}`}
                  icon={Calendar}
                  label={p.name}
                  activeWhen={p.id === currentEventId}
                />
              ))}
            </nav>
          </div>
        </ScrollArea>
        
        <div className="mt-auto shrink-0 px-4 pt-2 pb-4 gap-1 flex flex-col">
          <button
              type="button"
              className={cn(
                sidebarNavRow.standard.root,
                sidebarNavRow.standard.inactive,
                'dance-focus-ring cursor-pointer rounded-md px-0 text-left outline-none transition-surface motion-reduce:transition-none duration-150',
              )}
              onClick={() => navigate('/')}
            >
              <LogOut className={cn(sidebarNavRow.standard.icon)} aria-hidden />
              <span className="min-w-0 flex-1 truncate">Log out</span>
            </button>
          <nav className="flex flex-col gap-1" aria-label="Workspace">
            <SidebarNavStandardItem to="/settings" label="Settings" icon={Settings} className="px-0" />
            <div className="px-0 py-1">
              <p className="text-[10px] tabular-nums text-muted-foreground">v{__APP_VERSION__}</p>
            </div>

          </nav>
        </div>
      </div>
    </aside>
  )
}
