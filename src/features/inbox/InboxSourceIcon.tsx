import type { InboxSource } from '@/features/inbox/inboxTypes'
import { cn } from '@/lib/utils'

function SlackIcon({ className }: { className?: string }) {
  return (
    <span className={cn('relative inline-block size-4 shrink-0', className)} aria-hidden>
      <span className="absolute bottom-0 left-0 size-[7.5px] rounded-[1px] bg-[#36C5F0]" />
      <span className="absolute top-0 left-0 size-[7.5px] rounded-[1px] bg-[#2EB67D]" />
      <span className="absolute top-0 right-0 size-[7.5px] rounded-[1px] bg-[#E01E5A]" />
      <span className="absolute right-0 bottom-0 size-[7.5px] rounded-[1px] bg-[#ECB22E]" />
    </span>
  )
}

function GmailIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 12"
      className={cn('size-4 shrink-0', className)}
      aria-hidden
    >
      <path
        fill="#4285F4"
        d="M0 0.5v11l4.5-4.5L0 0.5z"
      />
      <path
        fill="#34A853"
        d="M16 0.5v11l-4.5-4.5L16 0.5z"
      />
      <path
        fill="#FBBC04"
        d="M0 0.5l4.5 4.5L8 2.5 11.5 5 16 0.5H0z"
      />
      <path
        fill="#EA4335"
        d="M0 12h16V5.5l-4.5 4.5L8 9.5 4.5 10 0 12z"
      />
    </svg>
  )
}

function GenericIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-surface-3',
        className,
      )}
      aria-hidden
    >
      <span className="size-2 rounded-full bg-muted-foreground/50" />
    </span>
  )
}

export function InboxSourceIcon({
  source,
  className,
}: {
  source: InboxSource
  className?: string
}) {
  switch (source) {
    case 'slack':
      return <SlackIcon className={className} />
    case 'gmail':
      return <GmailIcon className={className} />
    default:
      return <GenericIcon className={className} />
  }
}
