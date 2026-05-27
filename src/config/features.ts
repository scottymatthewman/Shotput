export const features = {
  home: false,
  inbox: false,
  plans: true,
  reports: false,
  settings: true,
} as const

export type FeatureKey = keyof typeof features

export function isFeatureEnabled(key: FeatureKey): boolean {
  return features[key]
}
