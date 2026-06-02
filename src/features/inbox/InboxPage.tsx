import { InboxSourceIcon } from '@/features/inbox/InboxSourceIcon'
import { INBOX_MOCK_MESSAGES, type InboxMessage } from '@/features/inbox/inboxMockData'
import { pageHeaderTitleClass } from '@/layouts/pageHeaderStyles'
import { PageShell } from '@/layouts/PageShell'
import { cn } from '@/lib/utils'
import { useState } from 'react'

function InboxMessageRow({
  message,
  selected,
  onSelect,
}: {
  message: InboxMessage
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? 'true' : undefined}
      className={cn(
        'relative flex w-full flex-col gap-3 border-b border-border/40 py-3 pr-3 pl-6 text-left',
        'transition-surface duration-150 ease-hover hover:bg-fill-hover',
        selected ? 'opacity-100' : 'opacity-70',
      )}
    >
      {selected ? (
        <span
          className="absolute top-1/2 left-0 h-[98px] w-[3px] -translate-y-1/2 bg-foreground"
          aria-hidden
        />
      ) : null}
      <div className="flex min-w-0 items-center gap-2.5">
        <InboxSourceIcon source={message.source} />
        <span className="truncate text-base font-semibold text-foreground">{message.senderName}</span>
      </div>
      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{message.preview}</p>
    </button>
  )
}

function InboxMessageDetail({ message }: { message: InboxMessage }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-3 px-6 py-20 md:px-16">
      <div className="flex min-w-0 items-center gap-2.5">
        <InboxSourceIcon source={message.source} />
        <span className="truncate text-base font-semibold text-foreground">{message.senderName}</span>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{message.body}</p>
    </div>
  )
}

export function InboxPage() {
  const [selectedId, setSelectedId] = useState(INBOX_MOCK_MESSAGES[0]?.id ?? '')
  const selectedMessage = INBOX_MOCK_MESSAGES.find((m) => m.id === selectedId)

  return (
    <PageShell className="min-h-0">
      <header className="shrink-0 inset-edge-ring inset-edge-ring-b px-6 py-3">
        <h1 className={pageHeaderTitleClass}>Inbox</h1>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[300px] shrink-0 flex-col overflow-y-auto inset-edge-ring inset-edge-ring-r">
          {INBOX_MOCK_MESSAGES.length === 0 ? (
            <p className="px-6 py-4 text-sm text-muted-foreground">Nothing here yet.</p>
          ) : (
            INBOX_MOCK_MESSAGES.map((message) => (
              <InboxMessageRow
                key={message.id}
                message={message}
                selected={message.id === selectedId}
                onSelect={() => setSelectedId(message.id)}
              />
            ))
          )}
        </aside>

        <section className="min-w-0 flex-1 overflow-y-auto">
          {selectedMessage ? (
            <InboxMessageDetail message={selectedMessage} />
          ) : (
            <div className="flex h-full items-center justify-center px-6 py-20">
              <p className="text-sm text-muted-foreground">Select a message to read it.</p>
            </div>
          )}
        </section>
      </div>
    </PageShell>
  )
}
