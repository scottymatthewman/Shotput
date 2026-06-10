import {
  navChatActiveIcon,
  navChatInactiveIcon,
  navHistoryIcon,
} from '@/components/nav/navIcons'
import { sidebarNavDensity } from '@/components/nav/sidebarNavStyles'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  SHELL_TOP_CHROME_PADDING_CLASS,
  SHELL_TOP_HEIGHT_PX,
  SHELL_TOP_PADDING_CLASS,
} from '@/layouts/shellLayout'

const shellIconButtonClass = cn(
  'size-7 shrink-0 border-0 bg-transparent shadow-none',
  'transition-surface pressable duration-150 ease-hover',
  'hover:!bg-transparent active:!bg-transparent',
)

export function ShellAgentControls({
  agentChatOpen,
  onToggleAgentChat,
}: {
  agentChatOpen: boolean
  onToggleAgentChat: () => void
}) {
  return (
    <div
      className={cn(
        'flex w-full min-w-0 items-center justify-end overflow-hidden',
        SHELL_TOP_PADDING_CLASS,
        SHELL_TOP_CHROME_PADDING_CLASS,
      )}
      style={{ height: SHELL_TOP_HEIGHT_PX }}
    >
      <div
        aria-hidden={!agentChatOpen}
        className={cn('shrink-0 overflow-hidden', agentChatOpen ? 'mr-2 w-7' : 'w-0')}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            shellIconButtonClass,
            'text-foreground',
            !agentChatOpen && 'pointer-events-none',
          )}
          tabIndex={agentChatOpen ? 0 : -1}
          aria-label="Chat history"
          title="Chat history (coming soon)"
          disabled={!agentChatOpen}
        >
          {navHistoryIcon({ className: sidebarNavDensity.icon, 'aria-hidden': true })}
        </Button>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(shellIconButtonClass, 'shrink-0 text-foreground')}
        onClick={onToggleAgentChat}
        aria-label={agentChatOpen ? 'Hide agent chat' : 'Show agent chat'}
        aria-pressed={agentChatOpen}
        title={agentChatOpen ? 'Hide agent chat (⌘/)' : 'Show agent chat (⌘/)'}
      >
        {(agentChatOpen ? navChatActiveIcon : navChatInactiveIcon)({
          className: sidebarNavDensity.icon,
          'aria-hidden': true,
        })}
      </Button>
    </div>
  )
}
