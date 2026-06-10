import { init } from '@instantdb/react'
import schema from '@/instant.schema'

const appId = (import.meta.env.VITE_INSTANT_APP_ID as string | undefined)?.trim()

/**
 * Guest mode — when `VITE_INSTANT_APP_ID` is unset the app runs without a
 * backend: auth is bypassed and queries return nothing. Set the env var
 * (see .env.example) to enable sync + magic-code sign-in.
 */
export const hasInstantConfig = Boolean(appId)

function useLocalQuery() {
  return { isLoading: false, error: undefined, data: undefined }
}

function useLocalAuth() {
  return { isLoading: false, user: null, error: undefined }
}

const localAuth = {
  sendMagicCode: async () => {
    throw new Error('Auth requires VITE_INSTANT_APP_ID (see .env.example)')
  },
  signInWithMagicCode: async () => {
    throw new Error('Auth requires VITE_INSTANT_APP_ID (see .env.example)')
  },
  signOut: async () => {},
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

if (!hasInstantConfig) {
  console.warn(
    '[webapp-template] VITE_INSTANT_APP_ID is missing — running in guest mode (see .env.example)',
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
  useAuth: instantDb?.useAuth ?? useLocalAuth,
  auth: instantDb?.auth ?? localAuth,
  transact: instantDb?.transact ?? (() => undefined),
  queryOnce: instantDb?.queryOnce ?? (async () => ({ data: {} })),
  tx: instantDb?.tx ?? createTxStub(),
} as unknown as NonNullable<ReturnType<typeof init<typeof schema>>>
