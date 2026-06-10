import { navAddIcon, navCloseIcon } from '@/components/nav/navIcons'
import { Button } from '@/components/ui/button'
import { SHELL_TOP_HEIGHT_PX, SHELL_TOP_PADDING_CLASS } from '@/layouts/shellLayout'
import { cn } from '@/lib/utils'

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

/**
 * Top-strip tab bar — render a chip per open document/record once your
 * product has tabbable entities (the original design opened one per plan).
 */
export function ShellTabBar({ activeTabLabel }: { activeTabLabel?: string }) {
  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-2.5 overflow-hidden px-2',
        SHELL_TOP_PADDING_CLASS,
      )}
      style={{ height: SHELL_TOP_HEIGHT_PX }}
    >
      {activeTabLabel ? (
        <div className={tabChipClass}>
          <span className="min-w-0 flex-1 truncate">{activeTabLabel}</span>
          <button
            type="button"
            className={cn(
              'pressable shrink-0 rounded-sm text-muted-foreground transition-surface duration-150 ease-hover',
              'hover:text-foreground app-focus-ring outline-none',
            )}
            aria-label={`Close ${activeTabLabel} tab`}
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
        aria-label="Open tab"
        title="Open tab (coming soon)"
        disabled
      >
        {navAddIcon({ className: 'size-[18px]', 'aria-hidden': true })}
      </Button>
    </div>
  )
}
