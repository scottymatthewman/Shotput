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

/** Per-plan nav chrome (sidebar row icon + tint). */
export type PlanNavGlyph = {
  iconId: string
  color: string
}

export const DEFAULT_PLAN_NAV_ICON_ID = 'calendar'

/** Default tint for new / unset glyphs — matches primary accent in `@theme`. */
export const DEFAULT_PLAN_NAV_COLOR = 'var(--color-primary)'

export const PLAN_NAV_ICON_MAP = {
  calendar: Calendar,
  'layout-dashboard': LayoutDashboard,
  'party-popper': PartyPopper,
  music: Music,
  utensils: Utensils,
  camera: Camera,
  plane: Plane,
  briefcase: Briefcase,
} as const satisfies Record<string, LucideIcon>

export type PlanNavIconId = keyof typeof PLAN_NAV_ICON_MAP

export function planNavIconForId(iconId: string): LucideIcon | undefined {
  return PLAN_NAV_ICON_MAP[iconId as PlanNavIconId]
}

/** @deprecated Use PlanNavGlyph */
export type EventNavGlyph = PlanNavGlyph

/** @deprecated Use DEFAULT_PLAN_NAV_ICON_ID */
export const DEFAULT_EVENT_NAV_ICON_ID = DEFAULT_PLAN_NAV_ICON_ID

/** @deprecated Use DEFAULT_PLAN_NAV_COLOR */
export const DEFAULT_EVENT_NAV_COLOR = DEFAULT_PLAN_NAV_COLOR

/** @deprecated Use PLAN_NAV_ICON_MAP */
export const EVENT_NAV_ICON_MAP = PLAN_NAV_ICON_MAP

/** @deprecated Use planNavIconForId */
export const eventNavIconForId = planNavIconForId
