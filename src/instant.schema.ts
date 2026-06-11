import { i } from '@instantdb/react'

/**
 * Shotput data model — one `post` fans out to a `postTarget` per selected
 * `socialAccount`; each target owns its schedule, status, and publish result.
 *
 * Push changes with: npx instant-cli push schema
 */
const schema = i.schema({
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed(),
    }),
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    socialAccounts: i.entity({
      platform: i.string().indexed(), // 'x' | 'linkedin'
      handle: i.string(),
      displayName: i.string(),
      timezone: i.string(),
      status: i.string(), // 'connected' | 'needs_reauth'
      scheduleSlots: i.json(), // ScheduleSlot[] — { dayOfWeek: 0-6, time: 'HH:mm' }
      createdAt: i.string(),
    }),
    posts: i.entity({
      title: i.string(),
      body: i.string(),
      createdAt: i.string(),
      updatedAt: i.string(),
    }),
    postTargets: i.entity({
      status: i.string().indexed(), // 'queued' | 'publishing' | 'published' | 'failed'
      scheduledAt: i.string().optional().indexed(),
      publishedAt: i.string().optional(),
      overrideBody: i.string().optional(),
      resultUrl: i.string().optional(),
      error: i.string().optional(),
      createdAt: i.string(),
    }),
  },
  links: {
    accountOwner: {
      forward: { on: 'socialAccounts', has: 'one', label: 'owner' },
      reverse: { on: '$users', has: 'many', label: 'socialAccounts' },
    },
    postOwner: {
      forward: { on: 'posts', has: 'one', label: 'owner' },
      reverse: { on: '$users', has: 'many', label: 'posts' },
    },
    targetPost: {
      forward: { on: 'postTargets', has: 'one', label: 'post' },
      reverse: { on: 'posts', has: 'many', label: 'targets' },
    },
    targetAccount: {
      forward: { on: 'postTargets', has: 'one', label: 'account' },
      reverse: { on: 'socialAccounts', has: 'many', label: 'targets' },
    },
    postMedia: {
      forward: { on: 'posts', has: 'many', label: 'media' },
      reverse: { on: '$files', has: 'one', label: 'post' },
    },
  },
})

export type AppSchema = typeof schema
export default schema
