import type { PlanType } from '@/types/domain'

const PLAN_TYPES: PlanType[] = [
  'trade_show_booth',
  'trade_show_meetings',
  'company_offsite',
  'customer_happy_hour',
  'sponsor_event',
  'speaker_event',
]

export function normalizePlanType(raw: unknown): PlanType | undefined {
  if (typeof raw === 'string' && (PLAN_TYPES as string[]).includes(raw)) {
    return raw as PlanType
  }
  return undefined
}
