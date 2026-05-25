/** Workflow status for a phase (Gantt bar). */
export type PhaseStatus = 'todo' | 'in_progress' | 'in_review' | 'blocked' | 'done'

/** Health of a plan timeline. */
export type PlanStatus = 'healthy' | 'at_risk' | 'paused'

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

export interface Agent {
  id: string
  name: string
  description: string
}

/** Checklist item inside a phase — title + completed only. */
export interface Task {
  id: string
  title: string
  completed: boolean
}

/** A bar on the plan Gantt / row in the table. */
export interface Phase {
  id: string
  planId: string
  title: string
  description: string
  status: PhaseStatus
  /**
   * When `false`, todo vs missed (`blocked`) follows the phase `end` date vs today.
   * When `true` or omitted, `status` is taken as-is (omitted preserves older persisted data).
   */
  statusIsManual?: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  section: string
  start: string
  end: string
  assigneeUserIds: string[]
  assigneeAgentIds: string[]
  tasks: Task[]
  /** Planned budget allocation for this phase (cents). */
  budgetAllocatedCents?: number
  /** Actual spend to date for this phase (cents). */
  budgetActualCents?: number
}

export type ExternalCrmProvider = 'attio'

/** Linked CRM object (prototype: Attio-style company / deal row). */
export interface ExternalCrmRecord {
  provider: ExternalCrmProvider
  title: string
  url?: string
}

/** Workspace plan — Gantt/table timeline plus overview metadata. */
export interface Plan {
  id: string
  name: string
  description: string
  phaseIds: string[]
  status: PlanStatus
  ownerUserId: string
  start: string
  end: string
  /** Venue or city line for field marketing-style programs */
  location?: string
  externalRecord?: ExternalCrmRecord
  /** Explicit roster; when omitted, team is derived from plan owner + phase assignees. */
  teamMemberUserIds?: string[]
  /** Optional link to a catalog industry event (`/find/industry-events/...`). */
  industryEventId?: string
  /** Plan budget ceiling in cents (e.g. 5000000 = $50,000). */
  budgetCents?: number
  /** ISO 4217 currency code; defaults to USD when omitted. */
  budgetCurrency?: string
}

export interface Workspace {
  id: string
  name: string
  userIds: string[]
  agentIds: string[]
  users: Record<string, User>
  agents: Record<string, Agent>
  plans: Record<string, Plan>
  phases: Record<string, Phase>
}

export type ActivityVerb =
  | 'created'
  | 'updated'
  | 'moved'
  | 'assigned'
  | 'commented'
  | 'changed_status'
  | 'rescheduled'
  | 'deleted'
  | 'changed_budget'

export interface ActivityEvent {
  id: string
  timestamp: string
  actorId: string
  actorIsAgent: boolean
  verb: ActivityVerb
  objectType: 'phase' | 'plan'
  objectId: string
  objectLabel: string
  planId?: string
  payload?: Record<string, unknown>
}

/** @deprecated Use PhaseStatus */
export type TaskStatus = PhaseStatus

/** @deprecated Use PlanStatus */
export type TimelineStatus = PlanStatus
