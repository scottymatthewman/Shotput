import { id } from '@instantdb/react'
import { db } from '@/lib/instant/db'

/** Example mutations for the `items` entity — replace with your product's. */

export function createItem(title: string, ownerId: string | null): string {
  const itemId = id()
  const tx = db.tx.items[itemId]!.update({
    title,
    createdAt: new Date().toISOString(),
  })
  db.transact(ownerId ? tx.link({ owner: ownerId }) : tx)
  return itemId
}

export function deleteItem(itemId: string) {
  db.transact(db.tx.items[itemId]!.delete())
}
