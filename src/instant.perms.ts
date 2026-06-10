/**
 * Owner-scoped rules — signed-in users can only touch their own items.
 *
 * Push changes with: npx instant-cli push perms
 */
const rules = {
  items: {
    bind: ['isOwner', "auth.id != null && auth.id in data.ref('owner.id')"],
    allow: {
      view: 'isOwner',
      create: 'isOwner',
      update: 'isOwner',
      delete: 'isOwner',
    },
  },
} as const

export default rules
