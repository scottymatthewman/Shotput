import { cn } from '@/lib/utils'
import type { TextareaHTMLAttributes } from 'react'

function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'flex min-h-[100px] w-full rounded-md inset-edge-ring inset-edge-ring-full bg-card px-3 py-2 text-sm text-foreground transition-surface app-focus-ring duration-150 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
