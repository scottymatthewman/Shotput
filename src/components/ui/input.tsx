import { cn } from '@/lib/utils'
import type { InputHTMLAttributes } from 'react'

function Input({ className, type, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded-md inset-edge-ring inset-edge-ring-full bg-card px-3 py-1 text-sm text-foreground transition-surface dance-focus-ring duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
