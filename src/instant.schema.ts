import { i } from '@instantdb/react'

const schema = i.schema({
  entities: {
    workspaces: i.entity({
      name: i.string(),
    }),
    users: i.entity({
      name: i.string(),
      email: i.string(),
      avatarUrl: i.string().optional(),
    }),
    agents: i.entity({
      name: i.string(),
      description: i.string(),
    }),
    plans: i.entity({
      name: i.string(),
      description: i.string(),
      status: i.string(),
      ownerUserId: i.string(),
      start: i.string(),
      end: i.string(),
      location: i.string().optional(),
      externalRecordJson: i.string().optional(),
      teamMemberUserIdsJson: i.string().optional(),
      industryEventId: i.string().optional(),
      navIconId: i.string().optional(),
      navColor: i.string().optional(),
      sortOrder: i.number().optional(),
      budgetCents: i.number().optional(),
      budgetCurrency: i.string().optional(),
      planType: i.string().optional(),
    }),
    phases: i.entity({
      title: i.string(),
      description: i.string(),
      status: i.string(),
      statusIsManual: i.boolean().optional(),
      priority: i.string(),
      phaseKind: i.string().optional(),
      section: i.string(),
      start: i.string(),
      end: i.string(),
      hardStop: i.string().optional(),
      dependencyIdsJson: i.string().optional(),
      assigneeUserIdsJson: i.string(),
      assigneeAgentIdsJson: i.string(),
      tasksJson: i.string(),
      propertiesJson: i.string().optional(),
      sortOrder: i.number().optional(),
      budgetAllocatedCents: i.number().optional(),
      budgetActualCents: i.number().optional(),
    }),
    activityEvents: i.entity({
      timestamp: i.string(),
      actorId: i.string(),
      actorIsAgent: i.boolean(),
      verb: i.string(),
      objectType: i.string(),
      objectId: i.string(),
      objectLabel: i.string(),
      planId: i.string().optional(),
      payloadJson: i.string().optional(),
    }),
  },
  links: {
    workspacePlans: {
      forward: { on: 'workspaces', has: 'many', label: 'plans' },
      reverse: { on: 'plans', has: 'one', label: 'workspace' },
    },
    workspaceUsers: {
      forward: { on: 'workspaces', has: 'many', label: 'users' },
      reverse: { on: 'users', has: 'one', label: 'workspace' },
    },
    workspaceAgents: {
      forward: { on: 'workspaces', has: 'many', label: 'agents' },
      reverse: { on: 'agents', has: 'one', label: 'workspace' },
    },
    planPhases: {
      forward: { on: 'plans', has: 'many', label: 'phases' },
      reverse: { on: 'phases', has: 'one', label: 'plan' },
    },
  },
})

export type AppSchema = typeof schema
export default schema
