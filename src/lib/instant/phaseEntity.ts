import type { Phase } from '@/types/domain'
import { serializePhaseProperties } from '@/lib/phaseProperties'

export function phaseToInstantUpdate(phase: Phase): Record<string, unknown> {
  const row: Record<string, unknown> = {
    title: phase.title,
    description: phase.description,
    status: phase.status,
    statusIsManual: phase.statusIsManual ?? true,
    priority: phase.priority,
    section: phase.section,
    start: phase.start,
    end: phase.end,
    assigneeUserIdsJson: JSON.stringify(phase.assigneeUserIds),
    assigneeAgentIdsJson: JSON.stringify(phase.assigneeAgentIds),
    tasksJson: JSON.stringify(phase.tasks),
  }

  if (phase.phaseKind) row.phaseKind = phase.phaseKind
  if (phase.hardStop) row.hardStop = phase.hardStop
  if (phase.dependencyIds?.length) {
    row.dependencyIdsJson = JSON.stringify(phase.dependencyIds)
  }
  const propertiesJson = serializePhaseProperties(phase.properties)
  if (propertiesJson) row.propertiesJson = propertiesJson
  if (phase.budgetAllocatedCents != null) {
    row.budgetAllocatedCents = phase.budgetAllocatedCents
  }
  if (phase.budgetActualCents != null) row.budgetActualCents = phase.budgetActualCents

  return row
}
