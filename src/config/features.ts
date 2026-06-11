/** Feature flags — gate unfinished surfaces while shipping. */
export const features = {
  home: true,
  composer: true,
  queue: true,
  accounts: true,
  settings: true,
} as const

export type FeatureKey = keyof typeof features

export function isFeatureEnabled(key: FeatureKey): boolean {
  return features[key]
}
