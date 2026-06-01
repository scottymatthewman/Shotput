import type { PhaseKind, PhasePropertyGroup, PlanType } from '@/types/domain'

export interface PlanTemplatePhaseSeed {
  title: string
  phaseKind: PhaseKind
  section: string
  /** Days after plan start */
  startOffsetDays: number
  durationDays: number
  status?: 'backlog' | 'todo'
  propertyGroups?: PhasePropertyGroup[]
}

export interface PlanTemplateRecipe {
  label: string
  description: string
  /** Default property groups emphasized in phase detail for this program type */
  defaultPropertyGroups: PhasePropertyGroup[]
  defaultPhases: PlanTemplatePhaseSeed[]
}

export const PLAN_TYPE_LABELS: Record<PlanType, string> = {
  trade_show_booth: 'Trade show (booth)',
  trade_show_meetings: 'Trade show (meetings only)',
  company_offsite: 'Company offsite',
  customer_happy_hour: 'Customer happy hour',
  sponsor_event: 'Sponsor event',
  speaker_event: 'Speaker event',
}

export const PLAN_TEMPLATE_RECIPES: Record<PlanType, PlanTemplateRecipe> = {
  trade_show_booth: {
    label: PLAN_TYPE_LABELS.trade_show_booth,
    description: 'Physical booth footprint, freight, and on-site activation.',
    defaultPropertyGroups: ['procurement', 'logistics', 'counterparty'],
    defaultPhases: [
      {
        title: 'Booth design & branding',
        phaseKind: 'design',
        section: 'Creative',
        startOffsetDays: 0,
        durationDays: 21,
        propertyGroups: ['procurement'],
      },
      {
        title: 'Source booth furniture',
        phaseKind: 'procurement',
        section: 'Ops',
        startOffsetDays: 14,
        durationDays: 28,
        propertyGroups: ['procurement', 'counterparty'],
      },
      {
        title: 'Freight & install',
        phaseKind: 'logistics',
        section: 'Ops',
        startOffsetDays: 45,
        durationDays: 14,
        propertyGroups: ['logistics', 'counterparty'],
      },
      {
        title: 'Show floor activation',
        phaseKind: 'activation',
        section: 'Activation',
        startOffsetDays: 60,
        durationDays: 5,
        propertyGroups: ['audience'],
      },
    ],
  },
  trade_show_meetings: {
    label: PLAN_TYPE_LABELS.trade_show_meetings,
    description: 'No booth — 1:1 meetings and partner outreach on the show calendar.',
    defaultPropertyGroups: ['counterparty', 'audience'],
    defaultPhases: [
      {
        title: 'Target account outreach',
        phaseKind: 'outreach',
        section: 'Planning',
        startOffsetDays: 0,
        durationDays: 21,
        propertyGroups: ['counterparty', 'audience'],
      },
      {
        title: 'Meeting room & hospitality',
        phaseKind: 'logistics',
        section: 'Ops',
        startOffsetDays: 21,
        durationDays: 14,
        propertyGroups: ['logistics', 'counterparty'],
      },
      {
        title: 'On-site meetings',
        phaseKind: 'activation',
        section: 'Activation',
        startOffsetDays: 40,
        durationDays: 5,
        propertyGroups: ['audience'],
      },
    ],
  },
  company_offsite: {
    label: PLAN_TYPE_LABELS.company_offsite,
    description: 'Internal offsite — venue, travel, and agenda.',
    defaultPropertyGroups: ['logistics', 'audience'],
    defaultPhases: [
      {
        title: 'Venue search & contract',
        phaseKind: 'procurement',
        section: 'Planning',
        startOffsetDays: 0,
        durationDays: 28,
        propertyGroups: ['procurement', 'logistics', 'counterparty'],
      },
      {
        title: 'Travel & lodging',
        phaseKind: 'logistics',
        section: 'Ops',
        startOffsetDays: 21,
        durationDays: 21,
        propertyGroups: ['logistics'],
      },
      {
        title: 'Agenda & sessions',
        phaseKind: 'design',
        section: 'Creative',
        startOffsetDays: 14,
        durationDays: 35,
        propertyGroups: ['audience'],
      },
    ],
  },
  customer_happy_hour: {
    label: PLAN_TYPE_LABELS.customer_happy_hour,
    description: 'Hosted hospitality — RSVPs, venue, and vendor coordination.',
    defaultPropertyGroups: ['audience', 'counterparty', 'procurement'],
    defaultPhases: [
      {
        title: 'Guest list & invites',
        phaseKind: 'outreach',
        section: 'Planning',
        startOffsetDays: 0,
        durationDays: 14,
        propertyGroups: ['audience', 'counterparty'],
      },
      {
        title: 'Venue & catering',
        phaseKind: 'procurement',
        section: 'Ops',
        startOffsetDays: 7,
        durationDays: 21,
        propertyGroups: ['procurement', 'logistics', 'counterparty'],
      },
      {
        title: 'Event night',
        phaseKind: 'activation',
        section: 'Activation',
        startOffsetDays: 28,
        durationDays: 1,
        propertyGroups: ['audience'],
      },
    ],
  },
  sponsor_event: {
    label: PLAN_TYPE_LABELS.sponsor_event,
    description: 'Sponsoring another company’s event — deliverables and brand presence.',
    defaultPropertyGroups: ['counterparty', 'procurement'],
    defaultPhases: [
      {
        title: 'Sponsorship package & contract',
        phaseKind: 'procurement',
        section: 'Planning',
        startOffsetDays: 0,
        durationDays: 21,
        propertyGroups: ['procurement', 'counterparty'],
      },
      {
        title: 'Asset delivery to organizer',
        phaseKind: 'logistics',
        section: 'Ops',
        startOffsetDays: 21,
        durationDays: 14,
        propertyGroups: ['logistics'],
      },
      {
        title: 'On-site sponsor activation',
        phaseKind: 'activation',
        section: 'Activation',
        startOffsetDays: 40,
        durationDays: 3,
        propertyGroups: ['audience'],
      },
    ],
  },
  speaker_event: {
    label: PLAN_TYPE_LABELS.speaker_event,
    description: 'Dedicated venue speaker program — production and promotion.',
    defaultPropertyGroups: ['logistics', 'audience', 'counterparty'],
    defaultPhases: [
      {
        title: 'Venue & A/V production',
        phaseKind: 'logistics',
        section: 'Ops',
        startOffsetDays: 0,
        durationDays: 35,
        propertyGroups: ['logistics', 'procurement', 'counterparty'],
      },
      {
        title: 'Speaker & content prep',
        phaseKind: 'design',
        section: 'Creative',
        startOffsetDays: 14,
        durationDays: 28,
        propertyGroups: ['counterparty'],
      },
      {
        title: 'Promotion & registration',
        phaseKind: 'outreach',
        section: 'Planning',
        startOffsetDays: 7,
        durationDays: 42,
        propertyGroups: ['audience', 'counterparty'],
      },
      {
        title: 'Event day',
        phaseKind: 'activation',
        section: 'Activation',
        startOffsetDays: 49,
        durationDays: 1,
        propertyGroups: ['audience'],
      },
    ],
  },
}

export const PLAN_TYPES = Object.keys(PLAN_TEMPLATE_RECIPES) as PlanType[]
