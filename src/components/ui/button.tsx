import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'
/* eslint-disable react-refresh/only-export-components -- re-export CVA variants (shadcn pattern) */
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'

const buttonVariants = cva(
  'pressable inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-surface dance-focus-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary:
          'border border-border bg-secondary text-secondary-foreground hover:bg-muted',
        ghost: 'hover:bg-accent/30 hover:text-accent-foreground',
        outline:
          'border border-border bg-transparent hover:bg-muted/80',
        destructive:
          'border border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90',
        link: 'active:scale-100 text-primary underline-offset-4 hover:underline',
        /**
         * Back / ancillary control on tinted `PageHeader` rows (timeline workspace).
         * Pair with `size="icon"`; important sizing wins over icon dimensions in merge.
         */
        pageChrome:
          '!h-8 !max-h-8 !min-h-8 !w-8 !max-w-8 !min-w-8 shrink-0 border-0 bg-transparent px-0 text-white/60 shadow-none transition-surface duration-150 ease-hover hover:bg-transparent hover:text-white active:bg-transparent [&_svg]:!size-5',
        /** Primary toolbar action beside `pageChrome` (slightly larger hit target). */
        pageChromeLg:
          '!h-10 !max-h-10 !min-h-10 !w-10 !max-w-10 !min-w-10 shrink-0 border-0 bg-transparent px-0 text-white/60 shadow-none transition-surface duration-150 ease-hover hover:bg-transparent hover:text-white active:bg-transparent',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
}

export { Button, buttonVariants }
