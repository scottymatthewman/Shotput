import type {
  ActivityEvent,
  Agent,
  Phase,
  Plan,
  Task,
  User,
  Workspace,
} from '@/types/domain'

const iso = (y: number, m: number, d: number) =>
  `${y.toString().padStart(4, '0')}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`

const users: User[] = [
  { id: 'u1', name: 'Alex Rivera', email: 'alex@example.com' },
  { id: 'u2', name: 'Jordan Lee', email: 'jordan@example.com' },
  { id: 'u3', name: 'Sam Patel', email: 'sam@example.com' },
  { id: 'u4', name: 'Taylor Brooks', email: 'taylor@example.com' },
  { id: 'u5', name: 'Roo Chen', email: 'roo@example.com' },
  { id: 'u6', name: 'Morgan Blake', email: 'morgan@example.com' },
  { id: 'u7', name: 'Casey Nguyen', email: 'casey@example.com' },
  { id: 'u8', name: 'Jamie Ortiz', email: 'jamie@example.com' },
  { id: 'u9', name: 'Devon Singh', email: 'devon@example.com' },
  { id: 'u10', name: 'Riley Kim', email: 'riley@example.com' },
  { id: 'u11', name: 'Quinn Foster', email: 'quinn@example.com' },
  { id: 'u12', name: 'Avery Moore', email: 'avery@example.com' },
]

const agents: Agent[] = [
  {
    id: 'a1',
    name: 'Collie',
    description: 'Schedules and nudges timelines',
  },
  {
    id: 'a2',
    name: 'Ledger',
    description: 'Summaries and rollup copy',
  },
]

const plans: Plan[] = [
  {
    id: 'p1',
    name: 'Roo Launch',
    description: 'Field marketing overhaul for Roo',
    phaseIds: [],
    status: 'at_risk',
    ownerUserId: 'u1',
    start: iso(2026, 5, 1),
    end: iso(2026, 8, 15),
    location: 'Moscone North · San Francisco, CA',
    externalRecord: {
      provider: 'attio',
      title: 'Roo Launch 2026',
      url: 'https://attio.com',
    },
    budgetCents: 50_000_00,
    budgetCurrency: 'USD',
  },
  {
    id: 'p2',
    name: 'Atlas Partners',
    description: 'Partner onboarding program',
    phaseIds: [],
    status: 'healthy',
    ownerUserId: 'u3',
    start: iso(2026, 5, 10),
    end: iso(2026, 9, 1),
    location: 'Remote · London hub',
    externalRecord: {
      provider: 'attio',
      title: 'Atlas Partners FY26',
      url: 'https://attio.com',
    },
    budgetCents: 25_000_00,
    budgetCurrency: 'USD',
  },
]

function makeChecklistTasks(prefix: string): Task[] {
  return [
    { id: `${prefix}-tk1`, title: 'Confirm scope', completed: true },
    { id: `${prefix}-tk2`, title: 'Stakeholder sign-off', completed: false },
  ]
}

function buildPhases(): Phase[] {
  const phases: Phase[] = []
  const sections = ['Planning', 'Creative', 'Ops', 'Review'] as const
  const statuses: Phase['status'][] = ['todo', 'in_progress', 'in_review', 'blocked', 'done']

  for (const plan of plans) {
    for (let i = 0; i < 14; i++) {
      const id = `phase-${plan.id}-${i}`
      const dayOffset = (i * 3 + plan.id.charCodeAt(1)) % 45
      const start = new Date(plan.start)
      start.setDate(start.getDate() + dayOffset)
      const end = new Date(start)
      end.setDate(end.getDate() + 5 + (i % 7))
      const userPool = users.slice(0, 8)
      const assigneeUserIds = [
        userPool[i % userPool.length]!.id,
        userPool[(i + 3) % userPool.length]!.id,
      ].filter((v, idx, a) => a.indexOf(v) === idx)
      const assigneeAgentIds = i % 5 === 0 ? ['a1'] : i % 7 === 0 ? ['a2'] : []
      const slot = i % 4
      const status = statuses[slot]!
      const statusIsManual = slot !== 0
      const budgetAllocatedCents = 2_500_00 + (i % 5) * 750_00
      const budgetActualCents = Math.round(budgetAllocatedCents * (0.35 + (i % 6) * 0.1))
      phases.push({
        id,
        planId: plan.id,
        title: `${sections[i % 4]} phase ${i + 1}`,
        description: `Prototype phase for ${plan.name}. Drag the bar or edit in the sheet.`,
        status,
        statusIsManual,
        priority: ['low', 'medium', 'high', 'urgent'][i % 4] as Phase['priority'],
        section: sections[i % 4]!,
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
        assigneeUserIds,
        assigneeAgentIds,
        tasks: makeChecklistTasks(id),
        budgetAllocatedCents,
        budgetActualCents,
      })
    }
  }

  plans.forEach((plan) => {
    plan.phaseIds = phases.filter((p) => p.planId === plan.id).map((p) => p.id)
  })

  return phases
}

const allPhases = buildPhases()

const activitySeed: ActivityEvent[] = [
  {
    id: 'ev1',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    actorId: 'u1',
    actorIsAgent: false,
    verb: 'changed_status',
    objectType: 'phase',
    objectId: allPhases[0]!.id,
    objectLabel: allPhases[0]!.title,
    planId: 'p1',
    payload: { to: 'in_progress' },
  },
  {
    id: 'ev2',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    actorId: 'a1',
    actorIsAgent: true,
    verb: 'commented',
    objectType: 'plan',
    objectId: 'p1',
    objectLabel: 'Roo Launch',
    planId: 'p1',
    payload: { text: 'Blocked items need owners by Friday.' },
  },
  {
    id: 'ev3',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    actorId: 'u5',
    actorIsAgent: false,
    verb: 'rescheduled',
    objectType: 'phase',
    objectId: allPhases[3]!.id,
    objectLabel: allPhases[3]!.title,
    planId: 'p1',
  },
]

export function createInitialWorkspace(): Workspace {
  const userRecord = Object.fromEntries(users.map((u) => [u.id, u]))
  const agentRecord = Object.fromEntries(agents.map((a) => [a.id, a]))
  const planRecord = Object.fromEntries(plans.map((p) => [p.id, p]))
  const phaseRecord = Object.fromEntries(allPhases.map((p) => [p.id, { ...p }]))

  return {
    id: 'w1',
    name: 'Dance Demo Workspace',
    userIds: users.map((u) => u.id),
    agentIds: agents.map((a) => a.id),
    users: userRecord,
    agents: agentRecord,
    plans: planRecord,
    phases: phaseRecord,
  }
}

export const initialActivityLog: ActivityEvent[] = [...activitySeed]
