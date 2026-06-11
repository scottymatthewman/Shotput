import { db, hasInstantConfig } from '@/lib/instant/db'
import { useGuestSchedulerStore } from '@/lib/scheduler/guestStore'
import type {
  Post,
  PostTarget,
  ScheduleSlot,
  SocialAccount,
  TargetStatus,
} from '@/lib/scheduler/types'
import { id } from '@instantdb/react'

/**
 * Unified data access — InstantDB when configured, the persisted guest store
 * otherwise. Pages only ever talk to `useScheduler()` and the actions below.
 */

export type SchedulerData = {
  accounts: SocialAccount[]
  posts: Post[]
  targets: PostTarget[]
  userId: string | null
  isLoading: boolean
}

export function useScheduler(): SchedulerData {
  const { user } = db.useAuth()
  const { data, isLoading } = db.useQuery(
    hasInstantConfig
      ? {
          socialAccounts: {},
          posts: { media: {} },
          postTargets: { post: {}, account: {} },
        }
      : null,
  )
  const guest = useGuestSchedulerStore()

  if (!hasInstantConfig) {
    return {
      accounts: guest.accounts,
      posts: guest.posts,
      targets: guest.targets,
      userId: null,
      isLoading: false,
    }
  }

  const accounts: SocialAccount[] = (data?.socialAccounts ?? []).map((row) => ({
    id: row.id,
    platform: row.platform as SocialAccount['platform'],
    handle: row.handle,
    displayName: row.displayName,
    timezone: row.timezone,
    status: row.status as SocialAccount['status'],
    scheduleSlots: (row.scheduleSlots ?? []) as ScheduleSlot[],
    createdAt: row.createdAt,
  }))

  const posts: Post[] = (data?.posts ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    media: (row.media ?? []).map((file) => ({
      id: file.id,
      url: file.url,
      name: file.path,
    })),
  }))

  const targets: PostTarget[] = (data?.postTargets ?? [])
    .filter((row) => row.post && row.account)
    .map((row) => ({
      id: row.id,
      postId: row.post!.id,
      accountId: row.account!.id,
      status: row.status as TargetStatus,
      scheduledAt: row.scheduledAt,
      publishedAt: row.publishedAt,
      overrideBody: row.overrideBody,
      resultUrl: row.resultUrl,
      error: row.error,
      createdAt: row.createdAt,
    }))

  return { accounts, posts, targets, userId: user?.id ?? null, isLoading }
}

// --- Accounts ---------------------------------------------------------------

export function connectAccount(
  input: Pick<SocialAccount, 'platform' | 'handle' | 'displayName' | 'scheduleSlots'>,
  ownerId: string | null,
): string {
  const accountId = id()
  const record = {
    platform: input.platform,
    handle: input.handle,
    displayName: input.displayName,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    status: 'connected' as const,
    scheduleSlots: input.scheduleSlots,
    createdAt: new Date().toISOString(),
  }
  if (hasInstantConfig) {
    const tx = db.tx.socialAccounts[accountId]!.update(record)
    db.transact(ownerId ? tx.link({ owner: ownerId }) : tx)
  } else {
    useGuestSchedulerStore.getState().addAccount({ id: accountId, ...record })
  }
  return accountId
}

export function updateAccount(
  accountId: string,
  patch: Partial<Pick<SocialAccount, 'handle' | 'displayName' | 'status' | 'scheduleSlots'>>,
) {
  if (hasInstantConfig) {
    db.transact(db.tx.socialAccounts[accountId]!.update(patch))
  } else {
    useGuestSchedulerStore.getState().updateAccount(accountId, patch)
  }
}

/** Removes the account and every target queued against it. */
export function disconnectAccount(accountId: string, targetIds: string[]) {
  if (hasInstantConfig) {
    db.transact([
      ...targetIds.map((targetId) => db.tx.postTargets[targetId]!.delete()),
      db.tx.socialAccounts[accountId]!.delete(),
    ])
  } else {
    useGuestSchedulerStore.getState().removeAccount(accountId)
  }
}

// --- Posts + targets ----------------------------------------------------------

export type TargetEntry = {
  accountId: string
  status: TargetStatus
  scheduledAt?: string
  publishedAt?: string
  /** Platform-specific caption — omitted when the shared body is used as-is. */
  overrideBody?: string
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export async function createPostWithTargets(
  input: { title: string; body: string; files: File[] },
  entries: TargetEntry[],
  ownerId: string | null,
): Promise<string> {
  const postId = id()
  const now = new Date().toISOString()
  const postRecord = { title: input.title, body: input.body, createdAt: now, updatedAt: now }

  if (hasInstantConfig) {
    const postTx = db.tx.posts[postId]!.update(postRecord)
    await db.transact([
      ownerId ? postTx.link({ owner: ownerId }) : postTx,
      ...entries.map((entry) =>
        db.tx.postTargets[id()]!.update({
          status: entry.status,
          scheduledAt: entry.scheduledAt,
          publishedAt: entry.publishedAt,
          overrideBody: entry.overrideBody,
          createdAt: now,
        }).link({ post: postId, account: entry.accountId }),
      ),
    ])
    for (const file of input.files) {
      const uploaded = await db.storage.uploadFile(
        `posts/${postId}/${Date.now()}-${file.name}`,
        file,
      )
      await db.transact(db.tx.posts[postId]!.link({ media: uploaded.data.id }))
    }
  } else {
    const media = await Promise.all(
      input.files.map(async (file) => ({
        id: crypto.randomUUID(),
        url: await fileToDataUrl(file),
        name: file.name,
      })),
    )
    const guest = useGuestSchedulerStore.getState()
    guest.addPost({ id: postId, ...postRecord, media })
    guest.addTargets(
      entries.map((entry) => ({
        id: crypto.randomUUID(),
        postId,
        accountId: entry.accountId,
        status: entry.status,
        scheduledAt: entry.scheduledAt,
        publishedAt: entry.publishedAt,
        overrideBody: entry.overrideBody,
        createdAt: now,
      })),
    )
  }
  return postId
}

export function updateTarget(
  targetId: string,
  patch: Partial<Pick<PostTarget, 'status' | 'scheduledAt' | 'publishedAt' | 'resultUrl' | 'error'>>,
) {
  if (hasInstantConfig) {
    db.transact(db.tx.postTargets[targetId]!.update(patch))
  } else {
    useGuestSchedulerStore.getState().updateTarget(targetId, patch)
  }
}

export function deleteTarget(targetId: string) {
  if (hasInstantConfig) {
    db.transact(db.tx.postTargets[targetId]!.delete())
  } else {
    useGuestSchedulerStore.getState().removeTarget(targetId)
  }
}

/** Phase 1 stand-in for the Phase 2 publishing worker. */
export function simulatePublish(targetId: string) {
  updateTarget(targetId, {
    status: 'published',
    publishedAt: new Date().toISOString(),
  })
}
