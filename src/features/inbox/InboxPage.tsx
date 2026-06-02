import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  InboxCreateTaskDialog,
  InboxDeleteDialog,
  InboxLinkDialog,
} from '@/features/inbox/InboxDialogs'
import { INBOX_MOCK_MESSAGES } from '@/features/inbox/inboxMockData'
import { InboxPagination } from '@/features/inbox/InboxPagination'
import { InboxSourceIcon } from '@/features/inbox/InboxSourceIcon'
import {
  filterInboxMessages,
  inboxPageCount,
  inboxSourceOpenLabel,
  paginateInboxMessages,
  type InboxMessage,
  type InboxTab,
  INBOX_PAGE_SIZE,
} from '@/features/inbox/inboxTypes'
import { pageHeaderTitleClass } from '@/layouts/pageHeaderStyles'
import { PageShell } from '@/layouts/PageShell'
import { cn } from '@/lib/utils'
import { usePlansStore } from '@/state/store'
import {
  Archive,
  ArchiveRestore,
  CheckCircle2,
  Circle,
  ExternalLink,
  Link2,
  ListPlus,
  Mail,
  MailOpen,
  Trash2,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const INBOX_TABS: { id: InboxTab; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'archived', label: 'Archived' },
]

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
        'relative flex w-full flex-col gap-3 inset-edge-ring inset-edge-ring-b py-3 pr-3 pl-6 text-left',
        'transition-surface duration-150 ease-hover hover:bg-fill-hover',
        selected ? 'opacity-100' : 'opacity-70',
        !message.read && !selected && 'opacity-100',
      )}
    >
      {selected ? (
        <span
          className="absolute top-1/2 left-0 h-[98px] w-[3px] -translate-y-1/2 bg-foreground"
          aria-hidden
        />
      ) : null}
      <div className="flex min-w-0 items-center gap-2.5">
        {!message.read ? (
          <Circle className="size-2 shrink-0 fill-foreground text-foreground" aria-label="Unread" />
        ) : (
          <span className="size-2 shrink-0" aria-hidden />
        )}
        <InboxSourceIcon source={message.source} />
        <span
          className={cn(
            'truncate text-base text-foreground',
            message.read ? 'font-medium' : 'font-semibold',
          )}
        >
          {message.senderName}
        </span>
        {message.resolved ? (
          <Badge variant="secondary" className="ml-auto shrink-0 text-[10px]">
            Resolved
          </Badge>
        ) : null}
      </div>
      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{message.preview}</p>
    </button>
  )
}

function InboxDetailActions({
  message,
  tab,
  onOpenSource,
  onToggleRead,
  onToggleResolved,
  onLink,
  onCreateTask,
  onArchive,
  onRestore,
  onDelete,
}: {
  message: InboxMessage
  tab: InboxTab
  onOpenSource: () => void
  onToggleRead: () => void
  onToggleResolved: () => void
  onLink: () => void
  onCreateTask: () => void
  onArchive: () => void
  onRestore: () => void
  onDelete: () => void
}) {
  const actionClass =
    'h-8 gap-1.5 px-2.5 text-xs transition-surface duration-150 pressable'

  return (
    <div className="flex flex-wrap items-center gap-1 inset-edge-ring inset-edge-ring-b px-6 py-2">
      <Button type="button" variant="ghost" size="sm" className={actionClass} onClick={onOpenSource}>
        <ExternalLink className="size-3.5" aria-hidden />
        {inboxSourceOpenLabel(message.source)}
      </Button>
      <Button type="button" variant="ghost" size="sm" className={actionClass} onClick={onToggleRead}>
        {message.read ? (
          <>
            <Mail className="size-3.5" aria-hidden />
            Mark unread
          </>
        ) : (
          <>
            <MailOpen className="size-3.5" aria-hidden />
            Mark read
          </>
        )}
      </Button>
      {tab === 'active' ? (
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={actionClass}
            onClick={onToggleResolved}
          >
            <CheckCircle2 className="size-3.5" aria-hidden />
            {message.resolved ? 'Mark unresolved' : 'Mark resolved'}
          </Button>
          <Button type="button" variant="ghost" size="sm" className={actionClass} onClick={onLink}>
            <Link2 className="size-3.5" aria-hidden />
            Link to plan
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={actionClass}
            onClick={onCreateTask}
          >
            <ListPlus className="size-3.5" aria-hidden />
            Create task
          </Button>
          <Button type="button" variant="ghost" size="sm" className={actionClass} onClick={onArchive}>
            <Archive className="size-3.5" aria-hidden />
            Archive
          </Button>
        </>
      ) : (
        <Button type="button" variant="ghost" size="sm" className={actionClass} onClick={onRestore}>
          <ArchiveRestore className="size-3.5" aria-hidden />
          Restore
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(actionClass, 'text-destructive hover:text-destructive')}
        onClick={onDelete}
      >
        <Trash2 className="size-3.5" aria-hidden />
        Delete
      </Button>
    </div>
  )
}

function InboxMessageDetail({
  message,
  tab,
  planName,
  phaseTitle,
  onOpenSource,
  onToggleRead,
  onToggleResolved,
  onLink,
  onCreateTask,
  onArchive,
  onRestore,
  onDelete,
}: {
  message: InboxMessage
  tab: InboxTab
  planName?: string
  phaseTitle?: string
  onOpenSource: () => void
  onToggleRead: () => void
  onToggleResolved: () => void
  onLink: () => void
  onCreateTask: () => void
  onArchive: () => void
  onRestore: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex min-h-full flex-col">
      <InboxDetailActions
        message={message}
        tab={tab}
        onOpenSource={onOpenSource}
        onToggleRead={onToggleRead}
        onToggleResolved={onToggleResolved}
        onLink={onLink}
        onCreateTask={onCreateTask}
        onArchive={onArchive}
        onRestore={onRestore}
        onDelete={onDelete}
      />
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-6 py-16 md:px-16">
        <div className="flex min-w-0 items-center gap-2.5">
          <InboxSourceIcon source={message.source} />
          <span className="truncate text-base font-semibold text-foreground">{message.senderName}</span>
        </div>
        {planName ? (
          <p className="text-sm text-muted-foreground">
            Linked to{' '}
            {message.linkedPhaseId && phaseTitle ? (
              <>
                <Link
                  to={`/plans/${message.linkedPlanId}/phases/${message.linkedPhaseId}`}
                  className="text-foreground transition-surface duration-150 ease-hover hover:underline"
                >
                  {phaseTitle}
                </Link>
                <span aria-hidden> · </span>
              </>
            ) : null}
            <Link
              to={`/plans/${message.linkedPlanId}`}
              className="text-foreground transition-surface duration-150 ease-hover hover:underline"
            >
              {planName}
            </Link>
          </p>
        ) : null}
        {message.createdTaskTitle ? (
          <p className="text-sm text-muted-foreground">
            Task created: <span className="text-foreground">{message.createdTaskTitle}</span>
          </p>
        ) : null}
        <p className="text-sm leading-relaxed text-muted-foreground">{message.body}</p>
      </div>
    </div>
  )
}

function pickSelectionAfterRemoval(
  visibleIds: string[],
  removedId: string,
  currentId: string | null,
): string | null {
  if (currentId !== removedId) return currentId
  if (visibleIds.length === 0) return null
  const index = visibleIds.indexOf(removedId)
  const next = visibleIds[index] ?? visibleIds[index - 1] ?? visibleIds[0]
  return next ?? null
}

export function InboxPage() {
  const workspace = usePlansStore((s) => s.workspace)
  const [messages, setMessages] = useState<InboxMessage[]>(() => [...INBOX_MOCK_MESSAGES])
  const [tab, setTab] = useState<InboxTab>('active')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(INBOX_MOCK_MESSAGES[0]?.id ?? null)
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const plans = useMemo(
    () => Object.values(workspace.plans).sort((a, b) => a.name.localeCompare(b.name)),
    [workspace.plans],
  )
  const phases = useMemo(() => Object.values(workspace.phases), [workspace.phases])

  const filtered = useMemo(() => filterInboxMessages(messages, tab), [messages, tab])
  const pageCount = inboxPageCount(filtered.length, INBOX_PAGE_SIZE)
  const pageItems = useMemo(
    () => paginateInboxMessages(filtered, page, INBOX_PAGE_SIZE),
    [filtered, page],
  )
  const unreadActiveCount = useMemo(
    () => messages.filter((m) => !m.archived && !m.read).length,
    [messages],
  )

  const selectedMessage = selectedId ? messages.find((m) => m.id === selectedId) : undefined
  const linkedPlan = selectedMessage?.linkedPlanId
    ? workspace.plans[selectedMessage.linkedPlanId]
    : undefined
  const linkedPhase = selectedMessage?.linkedPhaseId
    ? workspace.phases[selectedMessage.linkedPhaseId]
    : undefined

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount))
  }, [pageCount])

  useEffect(() => {
    if (!selectedId) return
    if (filtered.some((m) => m.id === selectedId)) return
    setSelectedId(pageItems[0]?.id ?? null)
  }, [filtered, pageItems, selectedId])

  const updateMessage = useCallback((id: string, patch: Partial<InboxMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  }, [])

  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => {
      const nextVisible = filterInboxMessages(
        prev.filter((m) => m.id !== id),
        tab,
      ).map((m) => m.id)
      setSelectedId((current) => pickSelectionAfterRemoval(nextVisible, id, current))
      return prev.filter((m) => m.id !== id)
    })
  }, [tab])

  function handleTabChange(next: InboxTab) {
    setTab(next)
    setPage(1)
    setSelectedId(null)
  }

  function handleSelect(id: string) {
    setSelectedId(id)
    updateMessage(id, { read: true })
  }

  function handleOpenSource(message: InboxMessage) {
    window.open(message.sourceUrl, '_blank', 'noopener,noreferrer')
  }

  function handleArchive(id: string) {
    updateMessage(id, { archived: true })
    const nextVisible = filterInboxMessages(
      messages.map((m) => (m.id === id ? { ...m, archived: true } : m)),
      tab,
    ).map((m) => m.id)
    setSelectedId((current) => pickSelectionAfterRemoval(nextVisible, id, current))
  }

  function handleRestore(id: string) {
    updateMessage(id, { archived: false })
    if (tab === 'archived') {
      setSelectedId((current) => (current === id ? null : current))
    }
  }

  function handleLinkConfirm(planId: string, phaseId?: string) {
    if (!selectedId) return
    updateMessage(selectedId, { linkedPlanId: planId, linkedPhaseId: phaseId })
  }

  function handleCreateTaskConfirm(planId: string, phaseId: string, title: string) {
    if (!selectedId) return
    updateMessage(selectedId, {
      linkedPlanId: planId,
      linkedPhaseId: phaseId,
      createdTaskTitle: title,
    })
  }

  return (
    <PageShell className="min-h-0">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 inset-edge-ring inset-edge-ring-b px-6 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className={pageHeaderTitleClass}>Inbox</h1>
          {unreadActiveCount > 0 ? (
            <Badge variant="secondary" className="tabular-nums">
              {unreadActiveCount} unread
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-1" role="tablist" aria-label="Inbox collections">
          {INBOX_TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => handleTabChange(id)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium text-foreground transition-surface duration-150 ease-hover',
                tab === id ? 'bg-fill-selected' : 'hover:bg-fill-hover',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[300px] shrink-0 flex-col inset-edge-ring inset-edge-ring-r">
          <div className="min-h-0 flex-1 overflow-y-auto">
            {pageItems.length === 0 ? (
              <p className="px-6 py-4 text-sm text-muted-foreground">
                {tab === 'archived' ? 'No archived messages.' : 'Nothing here yet.'}
              </p>
            ) : (
              pageItems.map((message) => (
                <InboxMessageRow
                  key={message.id}
                  message={message}
                  selected={message.id === selectedId}
                  onSelect={() => handleSelect(message.id)}
                />
              ))
            )}
          </div>
          <InboxPagination
            page={page}
            pageCount={pageCount}
            total={filtered.length}
            pageSize={INBOX_PAGE_SIZE}
            onPageChange={setPage}
          />
        </aside>

        <section className="min-w-0 flex-1 overflow-y-auto">
          {selectedMessage ? (
            <InboxMessageDetail
              message={selectedMessage}
              tab={tab}
              planName={linkedPlan?.name}
              phaseTitle={linkedPhase?.title}
              onOpenSource={() => handleOpenSource(selectedMessage)}
              onToggleRead={() =>
                updateMessage(selectedMessage.id, { read: !selectedMessage.read })
              }
              onToggleResolved={() =>
                updateMessage(selectedMessage.id, { resolved: !selectedMessage.resolved })
              }
              onLink={() => setLinkDialogOpen(true)}
              onCreateTask={() => setTaskDialogOpen(true)}
              onArchive={() => handleArchive(selectedMessage.id)}
              onRestore={() => handleRestore(selectedMessage.id)}
              onDelete={() => setDeleteDialogOpen(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 py-20">
              <p className="text-sm text-muted-foreground">
                {filtered.length === 0
                  ? tab === 'archived'
                    ? 'Archived messages appear here.'
                    : 'Messages from your plans will appear here.'
                  : 'Select a message to read it.'}
              </p>
            </div>
          )}
        </section>
      </div>

      <InboxLinkDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        message={selectedMessage}
        plans={plans}
        phases={phases}
        onConfirm={handleLinkConfirm}
      />
      <InboxCreateTaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        message={selectedMessage}
        plans={plans}
        phases={phases}
        onConfirm={handleCreateTaskConfirm}
      />
      <InboxDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => {
          if (selectedId) removeMessage(selectedId)
        }}
      />
    </PageShell>
  )
}
