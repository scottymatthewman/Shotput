import type { Platform } from '@/lib/scheduler/types'

/** Any URL counts as 23 characters on X regardless of its actual length. */
const X_URL_WEIGHT = 23
const URL_PATTERN = /https?:\/\/\S+/g

function codePointLength(text: string): number {
  return Array.from(text).length
}

function xWeightedLength(text: string): number {
  let length = 0
  let lastIndex = 0
  for (const match of text.matchAll(URL_PATTERN)) {
    length += codePointLength(text.slice(lastIndex, match.index)) + X_URL_WEIGHT
    lastIndex = match.index + match[0].length
  }
  return length + codePointLength(text.slice(lastIndex))
}

export type PlatformConfig = {
  id: Platform
  label: string
  charLimit: number
  maxImages: number
  /** Platform-weighted character count for composer counters/validation. */
  countText: (text: string) => number
}

export const PLATFORMS: Record<Platform, PlatformConfig> = {
  x: {
    id: 'x',
    label: 'X',
    charLimit: 280,
    maxImages: 4,
    countText: xWeightedLength,
  },
  linkedin: {
    id: 'linkedin',
    label: 'LinkedIn',
    charLimit: 3000,
    maxImages: 9,
    countText: codePointLength,
  },
}

export const PLATFORM_IDS: Platform[] = ['x', 'linkedin']
