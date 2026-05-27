import { cn } from '@/lib/utils'
import { sidebarNavDensity } from '@/components/nav/sidebarNavStyles'
import { Command as CommandPrimitive } from 'cmdk'
import { Search } from 'lucide-react'
import type { ComponentProps, HTMLAttributes } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'

function Command({ className, ...props }: ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      className={cn(
        'flex h-full w-full flex-col overflow-hidden rounded-md inset-edge-ring inset-edge-ring-full bg-popover text-popover-foreground',
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
      <DialogContent className={cn('overflow-hidden p-0 sm:max-w-lg', className)}>
        <Command className="inset-edge-none shadow-none [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({ className, ...props }: ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      className={cn('flex items-center inset-edge-ring inset-edge-ring-b px-3', sidebarNavDensity.searchPy)}
      cmdk-input-wrapper=""
    >
      <Search className={cn('mr-2 shrink-0 text-muted-foreground', sidebarNavDensity.icon)} />
      <CommandPrimitive.Input
        className={cn(
          'dance-focus-ring flex h-auto min-h-0 w-full rounded-md bg-transparent py-0 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
          sidebarNavDensity.text,
          className,
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({ className, ...props }: ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      className={cn('max-h-72 overflow-y-auto overflow-x-hidden p-1', className)}
      {...props}
    />
  )
}

function CommandEmpty({ ...props }: ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty className="py-6 text-center text-xs text-muted-foreground" {...props} />
  )
}

function CommandGroup({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      className={cn(
        'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground',
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
        'dance-focus-ring relative flex cursor-default select-none items-center rounded-[var(--radius-nested-md-p1)] outline-none transition-surface duration-150 data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent/40 data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50',
        sidebarNavDensity.row,
        sidebarNavDensity.px,
        sidebarNavDensity.gap,
        sidebarNavDensity.text,
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
