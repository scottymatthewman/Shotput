import type { PhaseKind } from '@/types/domain'

const PHASE_KINDS: PhaseKind[] = [
  'outreach',
  'design',
  'logistics',
  'activation',
  'procurement',
  'custom',
]

export function normalizePhaseKind(raw: unknown): PhaseKind | undefined {
  if (typeof raw === 'string' && (PHASE_KINDS as string[]).includes(raw)) {
    return raw as PhaseKind
  }
  return undefined
}
