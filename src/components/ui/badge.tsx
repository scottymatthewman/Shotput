import { cn } from '@/lib/utils'
/* eslint-disable react-refresh/only-export-components -- re-export CVA variants (shadcn pattern) */
import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-surface app-focus-ring duration-150',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary:
          'inset-edge-ring inset-edge-ring-full bg-secondary text-secondary-foreground',
        outline: 'inset-edge-ring inset-edge-ring-full text-foreground',
        destructive: 'bg-destructive/20 text-destructive',
        muted: 'bg-muted text-muted-foreground',
        /** Fill + edge from `.phase-badge` / `.plan-badge-*` — not `inset-edge-ring`. */
        status: 'font-normal',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
