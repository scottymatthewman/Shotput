import { PLAN_TEMPLATE_RECIPES } from '@/config/planTemplates'
import type {
  Phase,
  PhaseProperties,
  PhasePropertyGroup,
  PlanType,
} from '@/types/domain'

export function parsePhaseProperties(raw: string | undefined): PhaseProperties | undefined {
  if (!raw) return undefined
  try {
    const parsed = JSON.parse(raw) as PhaseProperties
    if (parsed && typeof parsed === 'object') return parsed
  } catch {
    /* ignore */
  }
  return undefined
}

export function serializePhaseProperties(props: PhaseProperties | undefined): string | undefined {
  if (!props || Object.keys(props).length === 0) return undefined
  return JSON.stringify(props)
}

/** Union of plan-level defaults and phase-specific groups from template seed. */
export function getVisiblePropertyGroups(
  planType: PlanType | undefined,
  phase: Pick<Phase, 'properties'>,
): PhasePropertyGroup[] {
  const fromPlan = planType ? PLAN_TEMPLATE_RECIPES[planType].defaultPropertyGroups : []
  const fromPhase = new Set<PhasePropertyGroup>(fromPlan)

  const props = phase.properties
  if (props?.procurement && Object.keys(props.procurement).length) fromPhase.add('procurement')
  if (props?.logistics && Object.keys(props.logistics).length) fromPhase.add('logistics')
  if (props?.counterparty && Object.keys(props.counterparty).length) fromPhase.add('counterparty')
  if (props?.audience && Object.keys(props.audience).length) fromPhase.add('audience')

  return [...fromPhase]
}

export function mergePhaseProperties(
  current: PhaseProperties | undefined,
  patch: PhaseProperties,
): PhaseProperties {
  return {
    procurement: { ...current?.procurement, ...patch.procurement },
    logistics: { ...current?.logistics, ...patch.logistics },
    counterparty: { ...current?.counterparty, ...patch.counterparty },
    audience: { ...current?.audience, ...patch.audience },
  }
}
