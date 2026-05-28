import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { SHELL_MAIN_TOP_PADDING_CLASS } from '@/layouts/shellLayout'
import { cn } from '@/lib/utils'
import { navAgentIcon, navSendIcon, navSuggestedSendIcon } from '@/components/nav/navIcons'

const SUGGESTED_PROMPTS = [
  'Follow up with the chair vendors',
  'What is the next most impactful task for me to do?',
  'How our team uses agents',
] as const

function SuggestedPromptRow({ children }: { children: string }) {
  return (
    <button
      type="button"
      disabled
      className={cn(
        'flex w-full items-start justify-between gap-2 rounded-xl py-1.5 pl-3 pr-1.5',
        'text-left text-[13px] text-muted-foreground opacity-60',
        'transition-surface duration-150 ease-hover',
        'hover:bg-fill-hover hover:opacity-80',
        'dance-focus-ring outline-none',
      )}
      title="Coming soon"
    >
      <span className="min-h-6 min-w-0 flex-1 leading-normal">{children}</span>
      {navSuggestedSendIcon({ className: 'mt-0.5 size-6 shrink-0 opacity-70', 'aria-hidden': true })}
    </button>
  )
}

export function AgentChatPanel() {
  return (
    <aside
      className={cn(
        'flex h-full w-full min-h-0 min-w-0 flex-col overflow-hidden pb-2 pl-2 pr-4',
        SHELL_MAIN_TOP_PADDING_CLASS,
      )}
      aria-label="Agent chat"
    >
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-2">
        {navAgentIcon({ className: 'size-8 text-muted-foreground', 'aria-hidden': true })}
        <p className="max-w-[200px] text-center text-sm leading-snug text-muted-foreground">
          Chat with agents to get updates, assign tasks, organize your workspace, and more.
        </p>
      </div>

      <div className="flex shrink-0 flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <SuggestedPromptRow key={prompt}>{prompt}</SuggestedPromptRow>
          ))}
        </div>
        <div
          className={cn(
            'flex items-end gap-1 rounded-xl py-2 pl-3 pr-2',
            'inset-edge-ring inset-edge-ring-full bg-surface-1',
          )}
        >
          <Textarea
            placeholder="Type here…"
            disabled
            rows={1}
            className={cn(
              'min-h-6 flex-1 resize-none border-0 bg-transparent p-0 shadow-none',
              'text-sm text-foreground placeholder:text-muted-foreground',
              'focus-visible:ring-0 focus-visible:ring-offset-0',
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-foreground"
            disabled
            aria-label="Send message"
          >
            {navSendIcon({ className: 'size-7', 'aria-hidden': true })}
          </Button>
        </div>
      </div>
    </aside>
  )
}
