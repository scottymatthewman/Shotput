import { PageHeader } from '@/components/dance/PageHeader'
import { PageShell } from '@/components/dance/PageShell'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { navigationDebug } from '@/lib/navigationDebug'
import { useDanceStore } from '@/state/store'
import { Send } from 'lucide-react'
import { useEffect, useState } from 'react'

export function WorkspaceChatPage() {
  const workspaceName = useDanceStore((s) => s.workspace.name)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    navigationDebug('page/chat', { workspaceName })
  }, [workspaceName])

  return (
    <PageShell>
      <PageHeader
        title="Workspace chat"
        description="Chat with your workspace assistant. Responses are placeholder until AI is plugged in."
      />
      <div className="flex min-h-0 flex-1 flex-col gap-0 p-4">
        <div
          className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-hidden rounded-lg border border-border bg-background"
          role="log"
          aria-label="Chat messages"
        >
          <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
            <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Dance</span> — Connected to{' '}
              <span className="text-foreground">{workspaceName}</span>. Ask about timelines, staffing, or next steps—this
              pane is ready for your model.
            </div>
          </div>
          <form
            className="flex gap-2 border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault()
              setDraft('')
            }}
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Message your workspace…"
              className={cn(
                'min-h-10 flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none',
                'ring-offset-background placeholder:text-muted-foreground',
                'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2',
              )}
              aria-label="Message input"
            />
            <Button type="submit" size="icon" className="shrink-0 transition-surface pressable duration-150" aria-label="Send message">
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </PageShell>
  )
}
