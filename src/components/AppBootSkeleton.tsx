import { Skeleton } from '@/components/ui/skeleton'

/** Skeleton shell matching AppShell layout while UI / Instant hydrate. */
export function AppBootSkeleton() {
  return (
    <div className="flex h-dvh w-dvw min-h-0 overflow-hidden bg-background p-0">
      <aside className="hidden w-[244px] shrink-0 flex-col gap-3 inset-edge inset-edge-r p-3 md:flex">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-9 w-full" />
        <div className="mt-2 space-y-2">
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-3/4" />
        </div>
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col inset-edge inset-edge-b bg-background p-3 md:inset-edge-b-none md:pl-0">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-clip rounded-xl inset-edge inset-edge-full inset-edge-panel bg-surface-1 p-4">
          <Skeleton className="mb-4 h-8 w-48" />
          <Skeleton className="h-full w-full min-h-[200px]" />
        </div>
      </div>
    </div>
  )
}
