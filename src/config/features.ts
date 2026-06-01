export const features = {
  home: true,
  inbox: false,
  events: false,
  plans: true,
  reports: false,
  settings: true,
} as const

export type FeatureKey = keyof typeof features

export function isFeatureEnabled(key: FeatureKey): boolean {
  return features[key]
}
