export type InboxSource = 'slack' | 'gmail' | 'generic'

export interface InboxMessage {
  id: string
  source: InboxSource
  senderName: string
  preview: string
  body: string
}

export const INBOX_MOCK_MESSAGES: InboxMessage[] = [
  {
    id: '1',
    source: 'slack',
    senderName: 'Firstname Lastname',
    preview: 'Message is here. they’re askign for a new thing and tagged you',
    body: 'Message is here. they’re askign for a new thing and tagged you',
  },
  {
    id: '2',
    source: 'slack',
    senderName: 'Firstname Lastname',
    preview: 'Message is here. they’re askign for a new thing and tagged you',
    body: 'Message is here. they’re askign for a new thing and tagged you',
  },
  {
    id: '3',
    source: 'gmail',
    senderName: 'Firstname Lastname',
    preview: 'Message is here. they’re askign for a new thing and tagged you',
    body: 'Message is here. they’re askign for a new thing and tagged you',
  },
  {
    id: '4',
    source: 'generic',
    senderName: 'Firstname Lastname',
    preview: 'Message is here. they’re askign for a new thing and tagged you',
    body: 'Message is here. they’re askign for a new thing and tagged you',
  },
  {
    id: '5',
    source: 'gmail',
    senderName: 'Firstname Lastname',
    preview: 'Message is here. they’re askign for a new thing and tagged you',
    body: 'Message is here. they’re askign for a new thing and tagged you',
  },
  {
    id: '6',
    source: 'gmail',
    senderName: 'Firstname Lastname',
    preview: 'Message is here. they’re askign for a new thing and tagged you',
    body: 'Message is here. they’re askign for a new thing and tagged you',
  },
  {
    id: '7',
    source: 'generic',
    senderName: 'Firstname Lastname',
    preview: 'Message is here. they’re askign for a new thing and tagged you',
    body: 'Message is here. they’re askign for a new thing and tagged you',
  },
  {
    id: '8',
    source: 'gmail',
    senderName: 'Firstname Lastname',
    preview: 'Message is here. they’re askign for a new thing and tagged you',
    body: 'Message is here. they’re askign for a new thing and tagged you',
  },
  {
    id: '9',
    source: 'generic',
    senderName: 'Firstname Lastname',
    preview: 'Message is here. they’re askign for a new thing and tagged you',
    body: 'Message is here. they’re askign for a new thing and tagged you',
  },
  {
    id: '10',
    source: 'gmail',
    senderName: 'Firstname Lastname',
    preview: 'Message is here. they’re askign for a new thing and tagged you',
    body: 'Message is here. they’re askign for a new thing and tagged you',
  },
  {
    id: '11',
    source: 'gmail',
    senderName: 'Firstname Lastname',
    preview: 'Message is here. they’re askign for a new thing and tagged you',
    body: 'Message is here. they’re askign for a new thing and tagged you',
  },
]
