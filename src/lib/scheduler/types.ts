export type Platform = 'x' | 'linkedin'

export type AccountStatus = 'connected' | 'needs_reauth'

export type TargetStatus = 'queued' | 'publishing' | 'published' | 'failed'

/** One default posting slot — `dayOfWeek` 0 (Sun) – 6 (Sat), `time` as 'HH:mm'. */
export type ScheduleSlot = {
  dayOfWeek: number
  time: string
}

export type SocialAccount = {
  id: string
  platform: Platform
  handle: string
  displayName: string
  timezone: string
  status: AccountStatus
  scheduleSlots: ScheduleSlot[]
  createdAt: string
}

export type PostMedia = {
  id: string
  url: string
  name: string
}

export type Post = {
  id: string
  title: string
  body: string
  createdAt: string
  updatedAt: string
  media: PostMedia[]
}

/** Per-account instance of a post — owns its schedule, status, and result. */
export type PostTarget = {
  id: string
  postId: string
  accountId: string
  status: TargetStatus
  scheduledAt?: string
  publishedAt?: string
  overrideBody?: string
  resultUrl?: string
  error?: string
  createdAt: string
}
