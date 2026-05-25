import { init } from '@instantdb/react'
import schema from '@/instant.schema'

const appId = import.meta.env.VITE_INSTANT_APP_ID as string | undefined

if (!appId) {
  console.warn(
    '[Dance] VITE_INSTANT_APP_ID is missing — set it in .env.local (see .env.example)',
  )
}

export const db = init({
  appId: appId ?? '00000000-0000-0000-0000-000000000000',
  schema,
  devtool: false,
})

export const hasInstantConfig = Boolean(appId)
