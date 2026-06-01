import { inkBody, overviewMetricCardBase, OverviewRow } from '@/features/plans/overviewPageLayout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getVisiblePropertyGroups } from '@/lib/phaseProperties'
import { usePlansStore } from '@/state/store'
import type {
  Phase,
  PhaseAudienceProperties,
  PhaseCounterpartyProperties,
  PhaseLogisticsProperties,
  PhasePaymentStatus,
  PhaseProperties,
  PlanType,
} from '@/types/domain'
import { cn } from '@/lib/utils'

const PAYMENT_STATUSES: PhasePaymentStatus[] = [
  'none',
  'invoice_received',
  'deposit_paid',
  'cleared',
]

const PAYMENT_LABELS: Record<PhasePaymentStatus, string> = {
  none: 'None',
  invoice_received: 'Invoice received',
  deposit_paid: 'Deposit paid',
  cleared: 'Cleared',
}

const GROUP_LABELS = {
  procurement: 'Procurement',
  logistics: 'Logistics',
  counterparty: 'Vendor & inbox',
  audience: 'Audience',
} as const

const fieldClass =
  'h-8 w-full min-w-0 rounded-md border-0 bg-surface-3 px-2 text-sm text-foreground outline-none transition-surface duration-150 ease-hover focus-visible:ring-1 focus-visible:ring-ring'

type PhasePropertiesSectionProps = {
  phaseId: string
  planType?: PlanType
  phase: Phase
  sectionShell: string
  sectionShellStyle?: import('react').CSSProperties
}

export function PhasePropertiesSection({
  phaseId,
  planType,
  phase,
  sectionShell,
  sectionShellStyle,
}: PhasePropertiesSectionProps) {
  const updatePhaseProperties = usePlansStore((s) => s.updatePhaseProperties)
  const groups = getVisiblePropertyGroups(planType, phase)

  if (groups.length === 0) return null

  const patch = (next: PhaseProperties) => updatePhaseProperties(phaseId, next)

  return (
    <div className={cn(sectionShell, overviewMetricCardBase)} style={sectionShellStyle}>
      <p className={cn(inkBody, 'text-sm font-medium text-foreground')}>Details</p>
      {groups.map((group) => (
        <div key={group} className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {GROUP_LABELS[group]}
          </p>
          {group === 'procurement' ? (
            <ProcurementFields
              values={phase.properties?.procurement}
              onChange={(procurement) => patch({ procurement })}
            />
          ) : null}
          {group === 'logistics' ? (
            <LogisticsFields
              values={phase.properties?.logistics}
              onChange={(logistics) => patch({ logistics })}
            />
          ) : null}
          {group === 'counterparty' ? (
            <CounterpartyFields
              values={phase.properties?.counterparty}
              onChange={(counterparty) => patch({ counterparty })}
            />
          ) : null}
          {group === 'audience' ? (
            <AudienceFields
              values={phase.properties?.audience}
              onChange={(audience) => patch({ audience })}
            />
          ) : null}
        </div>
      ))}
    </div>
  )
}

function ProcurementFields({
  values,
  onChange,
}: {
  values?: PhaseProperties['procurement']
  onChange: (v: PhaseProperties['procurement']) => void
}) {
  return (
    <OverviewRow label="Payment">
      <select
        aria-label="Payment status"
        className={cn(fieldClass, 'cursor-pointer')}
        value={values?.paymentStatus ?? 'none'}
        onChange={(e) =>
          onChange({
            ...values,
            paymentStatus: e.target.value as PhasePaymentStatus,
          })
        }
      >
        {PAYMENT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {PAYMENT_LABELS[s]}
          </option>
        ))}
      </select>
    </OverviewRow>
  )
}

function LogisticsFields({
  values,
  onChange,
}: {
  values?: PhaseLogisticsProperties
  onChange: (v: PhaseLogisticsProperties) => void
}) {
  return (
    <>
      <OverviewRow label="Location">
        <Input
          className={fieldClass}
          placeholder="Venue or address"
          value={values?.locationOrVenue ?? ''}
          onChange={(e) => onChange({ ...values, locationOrVenue: e.target.value })}
          onBlur={(e) => onChange({ ...values, locationOrVenue: e.target.value.trim() })}
        />
      </OverviewRow>
      <OverviewRow label="Tracking">
        <Input
          className={fieldClass}
          placeholder="Comma-separated tracking numbers"
          value={(values?.trackingNumbers ?? []).join(', ')}
          onChange={(e) =>
            onChange({
              ...values,
              trackingNumbers: e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />
      </OverviewRow>
    </>
  )
}

function CounterpartyFields({
  values,
  onChange,
}: {
  values?: PhaseCounterpartyProperties
  onChange: (v: PhaseCounterpartyProperties) => void
}) {
  return (
    <>
      <OverviewRow label="Vendor">
        <Input
          className={fieldClass}
          value={values?.vendorName ?? ''}
          onChange={(e) => onChange({ ...values, vendorName: e.target.value })}
          onBlur={(e) => onChange({ ...values, vendorName: e.target.value.trim() })}
        />
      </OverviewRow>
      <OverviewRow label="Contact">
        <Input
          className={fieldClass}
          value={values?.pointOfContact ?? ''}
          onChange={(e) => onChange({ ...values, pointOfContact: e.target.value })}
          onBlur={(e) => onChange({ ...values, pointOfContact: e.target.value.trim() })}
        />
      </OverviewRow>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Linked emails (inbox routing)</Label>
        <Input
          className={fieldClass}
          placeholder="vendor@example.com, thread-id@slack"
          value={(values?.associatedEmails ?? []).join(', ')}
          onChange={(e) =>
            onChange({
              ...values,
              associatedEmails: e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />
      </div>
    </>
  )
}

function AudienceFields({
  values,
  onChange,
}: {
  values?: PhaseAudienceProperties
  onChange: (v: PhaseAudienceProperties) => void
}) {
  const num = (raw: string) => {
    const n = parseInt(raw, 10)
    return Number.isFinite(n) ? n : undefined
  }

  return (
    <>
      <OverviewRow label="Target">
        <Input
          className={fieldClass}
          inputMode="numeric"
          value={values?.targetCount ?? ''}
          onChange={(e) => onChange({ ...values, targetCount: num(e.target.value) })}
        />
      </OverviewRow>
      <OverviewRow label="RSVPs">
        <Input
          className={fieldClass}
          inputMode="numeric"
          value={values?.currentRsvpCount ?? ''}
          onChange={(e) => onChange({ ...values, currentRsvpCount: num(e.target.value) })}
        />
      </OverviewRow>
      <OverviewRow label="Lead goal">
        <Input
          className={fieldClass}
          inputMode="numeric"
          value={values?.leadGoal ?? ''}
          onChange={(e) => onChange({ ...values, leadGoal: num(e.target.value) })}
        />
      </OverviewRow>
    </>
  )
}
