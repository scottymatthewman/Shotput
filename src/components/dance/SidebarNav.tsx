import {
  SidebarNavStandardItem,
  SidebarNavStubItem,
} from '@/components/nav/SidebarNavItem'
import { sidebarNavRow } from '@/components/nav/sidebarNavStyles'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { features } from '@/config/features'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  Home,
  Inbox,
  LogOut,
  PanelLeft,
  PanelRight,
  Rows3,
  Search,
  Settings,
  Type,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export {
  SidebarNavDropdownItem,
  SidebarNavNestedItem,
  SidebarNavStandardItem,
  SidebarNavStubItem,
} from '@/components/nav/SidebarNavItem'

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
  const navigate = useNavigate()

  return (
    <aside
      className={cn(
        'relative hidden h-full shrink-0 overflow-hidden bg-background transition-[width] duration-300 ease-out motion-reduce:transition-none md:flex',
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

        <div className="mt-2 px-4">
          <button
            type="button"
            className={cn(
              sidebarNavRow.standard.root,
              sidebarNavRow.standard.inactive,
              'dance-focus-ring w-full cursor-pointer text-left outline-none',
            )}
            data-search-trigger
          >
            <Search className={sidebarNavRow.standard.icon} aria-hidden />
            <span className="min-w-0 flex-1 truncate">Search</span>
            <kbd className="pointer-events-none shrink-0 rounded inset-edge-ring inset-edge-ring-full bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              /
            </kbd>
          </button>
          <div className="my-4 inset-edge-ring inset-edge-ring-t" role="separator" />
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="px-4 pb-4">
            <nav className="flex flex-col gap-1" aria-label="Primary">
              {features.home ? (
                <SidebarNavStandardItem to="/" end label="Home" icon={Home} />
              ) : (
                <SidebarNavStubItem label="Home" icon={Home} />
              )}
              {features.inbox ? (
                <SidebarNavStandardItem to="/inbox" label="Inbox" icon={Inbox} />
              ) : (
                <SidebarNavStubItem label="Inbox" icon={Inbox} />
              )}
              {features.plans ? (
                <SidebarNavStandardItem to="/plans" label="Plans" icon={Rows3} />
              ) : (
                <SidebarNavStubItem label="Plans" icon={Rows3} />
              )}
              {features.reports ? (
                <SidebarNavStandardItem to="/reports" label="Reports" icon={BarChart3} />
              ) : (
                <SidebarNavStubItem label="Reports" icon={BarChart3} />
              )}
              {import.meta.env.DEV ? (
                <SidebarNavStandardItem
                  to="/dev/typography"
                  label="Font compare"
                  icon={Type}
                />
              ) : null}
            </nav>
          </div>
        </ScrollArea>

        <div className="mt-auto shrink-0 px-4 pt-2 pb-4">
          <div className="mb-2 inset-edge-ring inset-edge-ring-t" role="separator" />
          <nav className="flex flex-col gap-1" aria-label="Account">
            <button
              type="button"
              className={cn(
                sidebarNavRow.standard.root,
                sidebarNavRow.standard.inactive,
                'dance-focus-ring w-full cursor-pointer text-left outline-none',
              )}
              onClick={() => navigate('/')}
            >
              <LogOut className={cn(sidebarNavRow.standard.icon)} aria-hidden />
              <span className="min-w-0 flex-1 truncate">Log out</span>
            </button>
            {features.settings ? (
              <SidebarNavStandardItem to="/settings" label="Settings" icon={Settings} />
            ) : (
              <SidebarNavStubItem label="Settings" icon={Settings} />
            )}
            <div className="px-0 py-1">
              <p className="text-[10px] tabular-nums text-muted-foreground">v{__APP_VERSION__}</p>
            </div>
          </nav>
        </div>
      </div>
    </aside>
  )
}
