import { cn } from '@/lib/utils'
import { usePlansStore } from '@/state/store'
import { Menu, useBloomContext } from 'bloom-menu'
import { EllipsisVertical, Trash2 } from 'lucide-react'

const menuItemClass = cn(
  'flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-foreground',
  'transition-surface duration-150 ease-hover hover:bg-fill-hover',
)

export function PhaseDetailHeaderMenu({ phaseId }: { phaseId: string }) {
  return (
    <Menu.Root direction="bottom" anchor="end">
      <PhaseDetailHeaderMenuBody phaseId={phaseId} />
    </Menu.Root>
  )
}

function PhaseDetailHeaderMenuBody({ phaseId }: { phaseId: string }) {
  const { open } = useBloomContext()
  const setPhaseQuickDialog = usePlansStore((s) => s.setPhaseQuickDialog)

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-visible',
        open ? 'z-50' : 'z-20',
        !open &&
          'size-8 rounded-lg bg-surface-1 inset-edge-ring inset-edge-ring-full inset-edge-chrome',
      )}
    >
      <Menu.Container
        buttonSize={32}
        menuWidth={196}
        menuRadius={12}
        buttonRadius={8}
        className={cn(
          '!shadow-none [box-shadow:none!important]',
          'bg-surface-1 text-chrome-fg',
          open && 'z-50 border border-border',
        )}
      >
        <Menu.Trigger className="text-chrome-fg transition-surface duration-150 ease-hover hover:text-chrome-fg-hover">
          <span className="sr-only">Phase actions</span>
          <EllipsisVertical className="size-5" aria-hidden />
        </Menu.Trigger>
        <Menu.Content className="bg-surface-1 p-1.5">
          <Menu.Item
            className={cn(
              menuItemClass,
              'text-destructive hover:bg-destructive/10 hover:text-destructive',
            )}
            onSelect={() => setPhaseQuickDialog({ kind: 'delete', phaseId })}
          >
            <Trash2 className="size-4 shrink-0" aria-hidden />
            Delete phase
          </Menu.Item>
        </Menu.Content>
      </Menu.Container>
    </div>
  )
}
