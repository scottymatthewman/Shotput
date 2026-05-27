import { cn } from '@/lib/utils'

/** Attio brand color — abstract mark evokes CRM record rows (distinct from bundled trademark artwork). */
const ATTIO_PURPLE = 'var(--palette-purple-600)'

/**
 * Tiny provider mark beside linked CRM rows (prototype).
 */
export function CrmLogoMark({
  provider,
  className,
}: {
  provider: 'attio'
  className?: string
}) {
  if (provider !== 'attio') return null

  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('size-4 shrink-0', className)}
      aria-hidden
    >
      <rect width="24" height="24" rx="6" fill={ATTIO_PURPLE} />
      <circle cx="8" cy="9" r="2" fill="white" opacity="0.95" />
      <circle cx="16" cy="9" r="2" fill="white" opacity="0.95" />
      <circle cx="12" cy="15" r="2" fill="white" opacity="0.95" />
      <path d="M8 13v2M16 13v2" stroke="white" strokeOpacity="0.85" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
