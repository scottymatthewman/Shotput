import { navSidebarIcon } from '@/components/nav/navIcons'
import { sidebarNavDensity } from '@/components/nav/sidebarNavStyles'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  SHELL_TOP_CHROME_PADDING_CLASS,
  SHELL_TOP_HEIGHT_PX,
  SHELL_TOP_PADDING_CLASS,
} from '@/layouts/shellLayout'

const shellIconButtonClass = cn(
  'size-7 shrink-0 border-0 bg-transparent text-muted-foreground shadow-none',
  'transition-surface pressable duration-150 ease-hover',
  'hover:!bg-transparent hover:!text-foreground active:!bg-transparent',
)

export function WorkspaceMark({ name, className }: { name: string; className?: string }) {
  return (
    <div
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-sm',
        'inset-edge-ring inset-edge-ring-full bg-surface-3',
        'text-sm font-semibold text-foreground',
        className,
      )}
      aria-hidden
    >
      {name.trim() ? name.trim().charAt(0).toUpperCase() : '—'}
    </div>
  )
}

export function ShellWorkspaceHeader({
  workspaceName,
  collapsed,
  onToggleCollapsed,
}: {
  workspaceName: string
  collapsed: boolean
  onToggleCollapsed: () => void
}) {
  if (collapsed) {
    return (
      <div
        className={cn(
          'flex items-center justify-center',
          SHELL_TOP_PADDING_CLASS,
          SHELL_TOP_CHROME_PADDING_CLASS,
        )}
        style={{ height: SHELL_TOP_HEIGHT_PX }}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={shellIconButtonClass}
          onClick={onToggleCollapsed}
          aria-label="Expand sidebar"
          title="Expand sidebar (⌘.)"
        >
          {navSidebarIcon({
            className: cn(sidebarNavDensity.icon, '-scale-x-100'),
            'aria-hidden': true,
          })}
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3',
        SHELL_TOP_PADDING_CLASS,
        SHELL_TOP_CHROME_PADDING_CLASS,
      )}
      style={{ height: SHELL_TOP_HEIGHT_PX }}
    >
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
        className={shellIconButtonClass}
        onClick={onToggleCollapsed}
        aria-label="Collapse sidebar"
        title="Collapse sidebar (⌘.)"
      >
        {navSidebarIcon({ className: sidebarNavDensity.icon, 'aria-hidden': true })}
      </Button>
    </div>
  )
}
