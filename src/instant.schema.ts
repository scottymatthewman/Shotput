import { i } from '@instantdb/react'

/**
 * Minimal example schema — `$users` is InstantDB's built-in auth entity.
 * `items` is a throwaway example; replace it with your product's entities.
 *
 * Push changes with: npx instant-cli push schema
 */
const schema = i.schema({
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed(),
    }),
    items: i.entity({
      title: i.string(),
      createdAt: i.string(),
    }),
  },
  links: {
    itemOwner: {
      forward: { on: 'items', has: 'one', label: 'owner' },
      reverse: { on: '$users', has: 'many', label: 'items' },
    },
  },
})

export type AppSchema = typeof schema
export default schema
