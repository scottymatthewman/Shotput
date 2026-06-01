/** Workflow status for a phase (Gantt bar). */
export type PhaseStatus =
  | 'backlog'
  | 'todo'
  | 'in_progress'
  | 'in_review'
  | 'blocked'
  | 'done'

/** Program archetype — drives default phases and property UI emphasis. */
export type PlanType =
  | 'trade_show_booth'
  | 'trade_show_meetings'
  | 'company_offsite'
  | 'customer_happy_hour'
  | 'sponsor_event'
  | 'speaker_event'

/** Functional category of work on a phase (distinct from Gantt `section` swimlane). */
export type PhaseKind =
  | 'outreach'
  | 'design'
  | 'logistics'
  | 'activation'
  | 'procurement'
  | 'custom'

export type PhasePropertyGroup = 'procurement' | 'logistics' | 'counterparty' | 'audience'

export type PhasePaymentStatus =
  | 'none'
  | 'invoice_received'
  | 'deposit_paid'
  | 'cleared'

export interface PhaseProcurementProperties {
  paymentStatus?: PhasePaymentStatus
}

export interface PhaseLogisticsProperties {
  locationOrVenue?: string
  trackingNumbers?: string[]
}

export interface PhaseCounterpartyProperties {
  vendorName?: string
  pointOfContact?: string
  associatedEmails?: string[]
}

export interface PhaseAudienceProperties {
  targetCount?: number
  currentRsvpCount?: number
  leadGoal?: number
}

/** Optional metadata groups stored as JSON on the phase entity. */
export interface PhaseProperties {
  procurement?: PhaseProcurementProperties
  logistics?: PhaseLogisticsProperties
  counterparty?: PhaseCounterpartyProperties
  audience?: PhaseAudienceProperties
}

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
  phaseKind?: PhaseKind
  section: string
  start: string
  end: string
  /** Real-world immovable deadline (ISO date), separate from Gantt bar end. */
  hardStop?: string
  /** Phase IDs that must complete before this phase can start. */
  dependencyIds?: string[]
  assigneeUserIds: string[]
  assigneeAgentIds: string[]
  tasks: Task[]
  properties?: PhaseProperties
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
  /** Event program template (trade show, offsite, etc.). */
  planType?: PlanType
}

export interface PlanOverviewPatch {
  name?: string
  description?: string
  location?: string
  start?: string
  end?: string
  status?: Plan['status']
  externalRecord?: ExternalCrmRecord | null
  teamMemberUserIds?: string[]
  budgetCents?: number | null
  budgetCurrency?: string | null
  planType?: PlanType
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
