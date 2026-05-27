import { PlanStatusBadge } from '@/components/dance/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/layouts/PageHeader'
import { PageScrollArea, PageShell } from '@/layouts/PageShell'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
import '@fontsource-variable/inter'
import './typography-compare.css'

type CompareColumnProps = {
  label: string
  fontClass: 'font-compare-gen' | 'font-compare-inter'
  children: ReactNode
}

function CompareColumn({ label, fontClass, children }: CompareColumnProps) {
  return (
    <section
      className={cn(
        'flex min-w-0 flex-col gap-4 rounded-lg inset-edge-ring inset-edge-ring-full bg-surface-1 p-4',
        fontClass,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </section>
  )
}

function SpecimenBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium text-muted-foreground">{title}</p>
      {children}
    </div>
  )
}

function FontSamples() {
  return (
    <>
      <SpecimenBlock title="Plan card (Plans index)">
        <Card className="max-w-sm">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base">Summer Tour 2026</CardTitle>
              <PlanStatusBadge status="healthy" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>North America leg — venues, routing, and production milestones.</p>
            <p>Planner · May 1 – Aug 15, 2026</p>
            <p className="tabular-nums text-foreground">Budget · $31,175 / $50,000</p>
          </CardContent>
        </Card>
      </SpecimenBlock>

      <SpecimenBlock title="Workspace header">
        <div className="inset-edge-ring inset-edge-ring-b pb-3">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Summer Tour 2026
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Planner · May 1 – Aug 15, 2026
          </p>
        </div>
      </SpecimenBlock>

      <SpecimenBlock title="Budget + actions">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs tabular-nums text-foreground">$31,175 / $50,000 spent</p>
          <Button size="sm" variant="outline">
            Overview
          </Button>
        </div>
      </SpecimenBlock>

      <SpecimenBlock title="Table row">
        <div className="overflow-hidden rounded-md inset-edge-ring inset-edge-ring-full">
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 bg-surface-2 px-3 py-2 text-xs font-medium text-muted-foreground">
            <span>Phase</span>
            <span className="tabular-nums">Owner</span>
            <span className="tabular-nums">End</span>
          </div>
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 px-3 py-2.5 text-sm text-foreground">
            <span>Load-in &amp; rehearsal</span>
            <span className="tabular-nums text-muted-foreground">May 12</span>
            <span className="tabular-nums text-muted-foreground">$4,200</span>
          </div>
        </div>
      </SpecimenBlock>

      <SpecimenBlock title="Form input">
        <div className="flex max-w-xs items-center gap-2 text-sm">
          <span className="text-muted-foreground">$</span>
          <Input
            readOnly
            value="31,175"
            className="tabular-nums"
            aria-label="Budget sample"
          />
        </div>
      </SpecimenBlock>

      <SpecimenBlock title="Type scale">
        <div className="space-y-1.5">
          <p className="text-base font-semibold text-foreground">Page title · 1,234 phases</p>
          <p className="text-sm text-foreground">Body — status, dates, and budget at a glance.</p>
          <p className="text-xs text-muted-foreground">Meta · v0.0.0 · 244px sidebar</p>
          <p className="text-[10px] tabular-nums text-muted-foreground">Keyboard hint · ⌘K</p>
        </div>
      </SpecimenBlock>

      <SpecimenBlock title="Digit stress test">
        <p className="text-sm tabular-nums text-foreground">
          0123456789 · $1,111,111 · May 1 – Aug 15, 2026 · 100%
        </p>
      </SpecimenBlock>
    </>
  )
}

export function TypographyComparePage() {
  return (
    <PageShell>
      <PageHeader
        title="Font compare"
        description="Gen Interface JP (app default) vs Inter — same UI copy side by side. Remove when you have picked a font."
      />
      <PageScrollArea className="pb-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <CompareColumn label="Gen Interface JP" fontClass="font-compare-gen">
            <FontSamples />
          </CompareColumn>
          <CompareColumn label="Inter" fontClass="font-compare-inter">
            <FontSamples />
          </CompareColumn>
        </div>
      </PageScrollArea>
    </PageShell>
  )
}
