import { init } from '@instantdb/react'
import schema from '@/instant.schema'

const appId = (import.meta.env.VITE_INSTANT_APP_ID as string | undefined)?.trim()

export const hasInstantConfig = Boolean(appId)

function useLocalQuery() {
  return { isLoading: false, error: undefined, data: undefined }
}

function createTxStub(): ReturnType<typeof init>['tx'] {
  const entity = new Proxy(
    {},
    {
      get: () => ({
        update: () => ({}),
        delete: () => ({}),
        link: () => ({}),
      }),
    },
  )

  return new Proxy(
    {},
    {
      get: () => entity,
    },
  ) as ReturnType<typeof init>['tx']
}

const txStub = createTxStub()

if (!hasInstantConfig) {
  console.warn(
    '[Dance] VITE_INSTANT_APP_ID is missing — using local workspace only (see .env.example)',
  )
}

const instantDb = hasInstantConfig
  ? init({
      appId: appId!,
      schema,
      devtool: false,
    })
  : null

export const db = {
  useQuery: instantDb?.useQuery ?? useLocalQuery,
  transact: instantDb?.transact ?? (() => undefined),
  queryOnce: instantDb?.queryOnce ?? (async () => ({ data: {} })),
  tx: instantDb?.tx ?? txStub,
} as unknown as ReturnType<typeof init>
