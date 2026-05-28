import { Button } from '@/components/ui/button'
import { resolveActivePlanId } from '@/lib/planRoute'
import { cn } from '@/lib/utils'
import { SHELL_TOP_HEIGHT_PX, SHELL_TOP_PADDING_CLASS } from '@/layouts/shellLayout'
import { usePlansStore } from '@/state/store'
import { navAddIcon, navCloseIcon } from '@/components/nav/navIcons'
import { useLocation } from 'react-router-dom'

const tabChipClass = cn(
  'flex h-8 max-w-[200px] min-w-0 items-center gap-2.5 rounded-sm pl-3 pr-2',
  'inset-edge-ring inset-edge-ring-full bg-surface-1',
  'text-[13px] font-medium text-foreground',
)

const tabAddClass = cn(
  'flex size-8 shrink-0 items-center justify-center rounded-sm px-0',
  'inset-edge-ring inset-edge-ring-full bg-surface-2',
  'text-muted-foreground transition-surface pressable duration-150 ease-hover',
  'hover:text-foreground',
)

export function ShellTabBar() {
  const location = useLocation()
  const workspace = usePlansStore((s) => s.workspace)
  const planId = resolveActivePlanId(location.pathname, workspace)
  const plan = planId ? workspace.plans[planId] : undefined

  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-2.5 overflow-hidden px-2',
        SHELL_TOP_PADDING_CLASS,
      )}
      style={{ height: SHELL_TOP_HEIGHT_PX }}
    >
      {plan ? (
        <div className={tabChipClass}>
          <span className="min-w-0 flex-1 truncate">{plan.name}</span>
          <button
            type="button"
            className={cn(
              'pressable shrink-0 rounded-sm text-muted-foreground transition-surface duration-150 ease-hover',
              'hover:text-foreground dance-focus-ring outline-none',
            )}
            aria-label={`Close ${plan.name} tab`}
            title="Close tab (coming soon)"
            disabled
          >
            {navCloseIcon({ className: 'size-[18px]', 'aria-hidden': true })}
          </button>
        </div>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={tabAddClass}
        aria-label="Open plan tab"
        title="Open plan tab (coming soon)"
        disabled
      >
        {navAddIcon({ className: 'size-[18px]', 'aria-hidden': true })}
      </Button>
    </div>
  )
}
