import { cn } from '@/lib/utils'
import type { SVGProps } from 'react'

/** Urgent priority — `--color-coral` (red status) by default; paths use `currentColor`. */
export function UrgentPriorityGlyph({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className={cn('size-4 shrink-0 text-coral', className)}
      aria-hidden
      {...rest}
    >
      <path
        d="M1.29289 4.54289C0.90237 4.93342 0.90237 5.56658 1.29289 5.95711C1.68342 6.34763 2.31658 6.34763 2.70711 5.95711L5.70711 2.95711C6.09763 2.56658 6.09763 1.93342 5.70711 1.54289C5.31658 1.15237 4.68342 1.15237 4.29289 1.54289L1.29289 4.54289Z"
        fill="currentColor"
      />
      <path
        d="M19.7071 1.54289C19.3166 1.15237 18.6834 1.15237 18.2929 1.54289C17.9024 1.93342 17.9024 2.56658 18.2929 2.95711L21.2929 5.95711C21.6834 6.34763 22.3166 6.34763 22.7071 5.95711C23.0976 5.56658 23.0976 4.93342 22.7071 4.54289L19.7071 1.54289Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22 12C22 17.5228 17.5228 22 11.9999 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 11.9999 2C17.5228 2 22 6.47715 22 12ZM11.9999 7C12.5522 7 12.9999 7.44772 12.9999 8V11.5858L15.2071 13.7929C15.5976 14.1834 15.5976 14.8166 15.2071 15.2071C14.8165 15.5976 14.1834 15.5976 13.7928 15.2071L11.2928 12.7071C11.1053 12.5196 10.9999 12.2652 10.9999 12V8C10.9999 7.44772 11.4477 7 11.9999 7Z"
        fill="currentColor"
      />
    </svg>
  )
}
