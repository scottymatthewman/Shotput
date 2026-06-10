import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { db, hasInstantConfig } from '@/lib/instant/db'
import { createItem, deleteItem } from '@/lib/instant/mutations'
import { cn } from '@/lib/utils'
import { Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'

/**
 * EXAMPLE — a tiny CRUD list proving the data layer works end to end.
 * Synced via InstantDB when configured; in-memory in guest mode.
 * Delete this file (and `lib/instant/mutations.ts`) when starting a real product.
 */

type Item = { id: string; title: string; createdAt: string }

function useExampleItems(): {
  items: Item[]
  addItem: (title: string) => void
  removeItem: (id: string) => void
} {
  const { user } = db.useAuth()
  const { data } = db.useQuery(hasInstantConfig ? { items: {} } : null)
  const [localItems, setLocalItems] = useState<Item[]>([])

  if (hasInstantConfig) {
    return {
      items: (data?.items ?? []) as Item[],
      addItem: (title) => createItem(title, user?.id ?? null),
      removeItem: (id) => deleteItem(id),
    }
  }

  return {
    items: localItems,
    addItem: (title) =>
      setLocalItems((prev) => [
        ...prev,
        { id: crypto.randomUUID(), title, createdAt: new Date().toISOString() },
      ]),
    removeItem: (id) => setLocalItems((prev) => prev.filter((item) => item.id !== id)),
  }
}

export function ExampleItems() {
  const { items, addItem, removeItem } = useExampleItems()

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const title = new FormData(form).get('title')
    if (typeof title !== 'string' || !title.trim()) return
    addItem(title.trim())
    form.reset()
  }

  return (
    <section
      className={cn(
        'flex flex-col gap-3 rounded-lg inset-edge-ring inset-edge-ring-full inset-edge-soft bg-surface-contrast p-6',
      )}
    >
      <header>
        <h2 className="text-sm font-semibold text-foreground">Example items</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {hasInstantConfig
            ? 'Synced through InstantDB — open a second tab to watch it update live.'
            : 'Guest mode — items live in memory until you configure VITE_INSTANT_APP_ID.'}
        </p>
      </header>

      <form className="flex gap-2" onSubmit={handleSubmit}>
        <Input name="title" placeholder="Add an item…" autoComplete="off" />
        <Button type="submit" variant="outline" className="shrink-0">
          Add
        </Button>
      </form>

      {items.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2 rounded-md inset-edge-ring inset-edge-ring-full inset-edge-softer bg-background/40 py-1.5 pr-1.5 pl-3"
            >
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                {item.title}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-destructive"
                onClick={() => removeItem(item.id)}
                aria-label={`Delete ${item.title}`}
              >
                <Trash2 className="size-3.5" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-2 text-center text-sm text-muted-foreground">Nothing yet.</p>
      )}
    </section>
  )
}
