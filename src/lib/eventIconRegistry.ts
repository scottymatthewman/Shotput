import {
  Briefcase,
  Calendar,
  Camera,
  LayoutDashboard,
  Music,
  PartyPopper,
  Plane,
  Utensils,
  type LucideIcon,
} from 'lucide-react'

/**
 * Per-event nav chrome (sidebar row icon + tint). `iconId` keys into {@link EVENT_NAV_ICON_MAP}.
 * Shapes persisted in zustand; keep ids stable when editing the map.
 */
export type EventNavGlyph = {
  iconId: string
  color: string
}

export const DEFAULT_EVENT_NAV_ICON_ID = 'calendar'

/** Default tint for new / unset glyphs — matches primary accent in `@theme`. */
export const DEFAULT_EVENT_NAV_COLOR = 'var(--color-primary)'

/** Stable ids → Lucide components for event nav rows and pickers. */
export const EVENT_NAV_ICON_MAP = {
  calendar: Calendar,
  'layout-dashboard': LayoutDashboard,
  'party-popper': PartyPopper,
  music: Music,
  utensils: Utensils,
  camera: Camera,
  plane: Plane,
  briefcase: Briefcase,
} as const satisfies Record<string, LucideIcon>

export type EventNavIconId = keyof typeof EVENT_NAV_ICON_MAP

export function eventNavIconForId(iconId: string): LucideIcon | undefined {
  return EVENT_NAV_ICON_MAP[iconId as EventNavIconId]
}
