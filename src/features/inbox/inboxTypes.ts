export type InboxSource = 'slack' | 'gmail' | 'generic'

export type InboxTab = 'active' | 'archived'

export interface InboxMessage {
  id: string
  source: InboxSource
  senderName: string
  preview: string
  body: string
  receivedAt: string
  read: boolean
  archived: boolean
  resolved: boolean
  sourceUrl: string
  linkedPlanId?: string
  linkedPhaseId?: string
  /** Mock-only — set after “Create task” until real sync exists. */
  createdTaskTitle?: string
}

export const INBOX_PAGE_SIZE = 25

export function inboxSourceOpenLabel(source: InboxSource): string {
  switch (source) {
    case 'slack':
      return 'Open in Slack'
    case 'gmail':
      return 'Open in Gmail'
    default:
      return 'Open in source'
  }
}

export function filterInboxMessages(messages: InboxMessage[], tab: InboxTab): InboxMessage[] {
  return messages
    .filter((m) => (tab === 'archived' ? m.archived : !m.archived))
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt))
}

export function paginateInboxMessages<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}

export function inboxPageCount(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize))
}
