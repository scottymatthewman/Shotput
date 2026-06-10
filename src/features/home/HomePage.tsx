import { ExampleItems } from '@/features/home/ExampleItems'
import { CenteredPageScroll } from '@/layouts/CenteredPageScroll'
import { PageHeader } from '@/layouts/PageHeader'
import { PageShell } from '@/layouts/PageShell'
import { cn } from '@/lib/utils'

const sectionClass = cn(
  'flex flex-col gap-3 rounded-lg inset-edge-ring inset-edge-ring-full inset-edge-soft bg-surface-contrast p-6',
)

export function HomePage() {
  return (
    <PageShell>
      <PageHeader title="Home" description="A clean slate with great bones." layout="inline" />
      <CenteredPageScroll columnClassName="gap-4">
        <section className={sectionClass}>
          <h2 className="text-sm font-semibold text-foreground">Start here</h2>
          <ul className="flex list-disc flex-col gap-1.5 pl-4 text-sm text-muted-foreground">
            <li>
              Rename the product in <code className="font-mono text-xs">src/config/app.ts</code>
            </li>
            <li>
              Model your data in{' '}
              <code className="font-mono text-xs">src/instant.schema.ts</code> and add routes in{' '}
              <code className="font-mono text-xs">src/App.tsx</code>
            </li>
            <li>
              Build pages from <code className="font-mono text-xs">src/components/ui</code>{' '}
              primitives — tokens and recipes live in{' '}
              <code className="font-mono text-xs">DESIGN.md</code>
            </li>
            <li>
              Press <kbd className="font-mono text-xs">/</kbd> for the command menu,{' '}
              <kbd className="font-mono text-xs">⌘.</kbd> to toggle the sidebar
            </li>
          </ul>
        </section>

        <ExampleItems />
      </CenteredPageScroll>
    </PageShell>
  )
}
