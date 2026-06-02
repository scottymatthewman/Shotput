import type { InboxMessage } from '@/features/inbox/inboxTypes'

const PREVIEW =
  'Message is here. they’re askign for a new thing and tagged you'

const SOURCES: InboxMessage['source'][] = ['slack', 'slack', 'gmail', 'generic', 'gmail']

function sourceUrl(source: InboxMessage['source'], index: number): string {
  switch (source) {
    case 'slack':
      return `https://app.slack.com/client/T00000000/C00000000/p${index}`
    case 'gmail':
      return `https://mail.google.com/mail/u/0/#inbox/${index}`
    default:
      return '#'
  }
}

function buildMessage(index: number): InboxMessage {
  const source = SOURCES[index % SOURCES.length]!
  const day = String(Math.max(1, 28 - (index % 28))).padStart(2, '0')
  return {
    id: String(index + 1),
    source,
    senderName: 'Firstname Lastname',
    preview: PREVIEW,
    body: PREVIEW,
    receivedAt: `2026-05-${day}T${String(9 + (index % 10)).padStart(2, '0')}:00:00.000Z`,
    read: index > 0,
    archived: false,
    resolved: index === 4,
    sourceUrl: sourceUrl(source, index),
    ...(index === 2 ? { linkedPlanId: undefined } : {}),
  }
}

/** Seed list long enough to exercise pagination (25 per page). */
export const INBOX_MOCK_MESSAGES: InboxMessage[] = Array.from({ length: 32 }, (_, i) =>
  buildMessage(i),
)
