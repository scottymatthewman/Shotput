import { cn } from '@/lib/utils'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import type { ComponentProps } from 'react'

function Tabs({ className, ...props }: ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root className={cn('flex flex-col gap-2', className)} {...props} />
}

function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        'inline-flex min-h-9 items-stretch rounded-md inset-edge-ring inset-edge-ring-full bg-muted/50 p-1 text-muted-foreground [&>*]:flex [&>*]:h-full [&>*]:min-h-0',
        className,
      )}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'pressable inline-flex h-full min-h-0 items-center justify-center whitespace-nowrap rounded-[var(--radius-nested-md-p1)] px-3 text-xs font-medium transition-surface dance-focus-ring duration-150 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn('outline-none', className)} {...props} />
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
