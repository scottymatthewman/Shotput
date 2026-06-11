/**
 * Owner-scoped rules — signed-in users can only touch their own data.
 * `postTargets` derive ownership through their parent post.
 *
 * Push changes with: npx instant-cli push perms
 */
const rules = {
  socialAccounts: {
    bind: ['isOwner', "auth.id != null && auth.id in data.ref('owner.id')"],
    allow: {
      view: 'isOwner',
      create: 'isOwner',
      update: 'isOwner',
      delete: 'isOwner',
    },
  },
  posts: {
    bind: ['isOwner', "auth.id != null && auth.id in data.ref('owner.id')"],
    allow: {
      view: 'isOwner',
      create: 'isOwner',
      update: 'isOwner',
      delete: 'isOwner',
    },
  },
  postTargets: {
    bind: ['isOwner', "auth.id != null && auth.id in data.ref('post.owner.id')"],
    allow: {
      view: 'isOwner',
      create: 'isOwner',
      update: 'isOwner',
      delete: 'isOwner',
    },
  },
  $files: {
    allow: {
      view: 'auth.id != null',
      create: 'auth.id != null',
      delete: 'auth.id != null',
    },
  },
} as const

export default rules
