import { cn } from '@/lib/utils'
import { Command as CommandPrimitive } from 'cmdk'
import { Search, X } from 'lucide-react'
import type { ComponentProps, HTMLAttributes } from 'react'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'

function Command({ className, ...props }: ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      className={cn(
        'flex h-full w-full flex-col overflow-hidden rounded-sm inset-edge-ring inset-edge-ring-full bg-popover text-popover-foreground',
        className,
      )}
      {...props}
    />
  )
}

function CommandDialog({
  children,
  className,
  ...props
}: ComponentProps<typeof Dialog> & { className?: string }) {
  return (
    <Dialog {...props}>
      <DialogContent hideClose className={cn('overflow-hidden p-0 sm:max-w-3xl', className)}>
        <Command className="inset-edge-none shadow-none [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:text-sm [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({ className, ...props }: ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      className="flex min-h-12 items-center gap-3 inset-edge-ring inset-edge-ring-b px-4 py-3"
      cmdk-input-wrapper=""
    >
      <Search className="size-5 shrink-0 text-muted-foreground" />
      <CommandPrimitive.Input
        className={cn(
          'dance-focus-ring flex h-full min-h-0 min-w-0 flex-1 bg-transparent py-0 text-base font-medium outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
      <DialogClose
        className={cn(
          'pressable dance-focus-ring flex size-10 shrink-0 items-center justify-center rounded-sm',
          'text-muted-foreground opacity-70 transition-surface duration-150 ease-hover',
          'hover:text-foreground hover:opacity-100',
        )}
      >
        <X className="size-5" aria-hidden />
        <span className="sr-only">Close</span>
      </DialogClose>
    </div>
  )
}

function CommandList({ className, ...props }: ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      className={cn('max-h-[27rem] overflow-y-auto overflow-x-hidden p-1.5', className)}
      {...props}
    />
  )
}

function CommandEmpty({ ...props }: ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty className="py-9 text-center text-sm text-muted-foreground" {...props} />
  )
}

function CommandGroup({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      className={cn(
        'overflow-hidden p-1.5 text-foreground [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-sm [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

function CommandItem({ className, ...props }: ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      className={cn(
        'dance-focus-ring relative flex h-12 min-h-12 cursor-default select-none items-center gap-3 rounded-[var(--radius-nested-md-p1)] p-2 text-base font-medium outline-none transition-surface duration-150 data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent/40 data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive.Separator>) {
  return <CommandPrimitive.Separator className={cn('-mx-1 h-px bg-border', className)} {...props} />
}

function CommandShortcut({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
}
