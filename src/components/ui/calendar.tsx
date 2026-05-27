import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  DayPicker,
  getDefaultClassNames,
  type DayPickerProps,
} from 'react-day-picker'

export type CalendarProps = DayPickerProps

/** Branded month grid — uses app tokens (popover, border, primary) instead of browser-native date UI. */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const defaults = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('w-fit bg-transparent p-2 text-popover-foreground', className)}
      classNames={{
        root: cn('w-fit rounded-md', defaults.root),
        months: cn('relative flex flex-col gap-4 md:flex-row', defaults.months),
        month: cn('mt-1 flex w-full min-w-[240px] flex-col gap-3', defaults.month),
        month_caption: cn(
          'relative mb-1 flex h-8 w-full items-center justify-center px-8',
          defaults.month_caption,
        ),
        caption_label: cn('text-sm font-medium text-foreground', defaults.caption_label),
        // Stack above `.month`/`.month_caption` so siblings painted later can't steal clicks.
        nav: cn(
          'absolute inset-x-0 top-0 z-20 flex w-full items-center justify-between gap-1 px-0',
          defaults.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: 'outline', size: 'icon' }),
          'size-7 shrink-0 bg-card p-0 text-foreground transition-surface duration-150 ease-hover hover:bg-muted/50 [&_svg]:size-4',
          defaults.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline', size: 'icon' }),
          'size-7 shrink-0 bg-card p-0 text-foreground transition-surface duration-150 ease-hover hover:bg-muted/50 [&_svg]:size-4',
          defaults.button_next,
        ),
        month_grid: cn('mt-1 w-full border-collapse', defaults.month_grid),
        weekdays: cn('flex gap-0', defaults.weekdays),
        weekday: cn(
          'flex-1 select-none rounded-md text-center text-[0.75rem] font-medium text-muted-foreground',
          defaults.weekday,
        ),
        weeks: cn('gap-0', defaults.weeks),
        week: cn('mt-2 flex w-full', defaults.week),
        day: cn(
          'relative size-8 flex-1 p-0 text-center text-sm select-none [&:has([aria-selected])]:bg-transparent',
          defaults.day,
        ),
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'size-8 rounded-md p-0 font-normal text-foreground transition-surface duration-150 ease-hover',
          'hover:bg-accent/40 hover:text-accent-foreground',
          'dance-focus-ring aria-selected:opacity-100',
          defaults.day_button,
        ),
        selected: cn(
          '[&_button]:border-transparent [&_button]:bg-primary [&_button]:text-primary-foreground [&_button]:hover:bg-primary/90 [&_button]:hover:text-primary-foreground',
          defaults.selected,
        ),
        today: cn('bg-accent/25 [&_button]:font-semibold [&_button]:text-foreground', defaults.today),
        outside: cn('text-muted-foreground/60', defaults.outside),
        disabled: cn('opacity-40', defaults.disabled),
        hidden: cn('invisible', defaults.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ className: chClass, orientation }) => {
          const Icon = orientation === 'left' ? ChevronLeft : ChevronRight
          return <Icon aria-hidden className={cn('size-4', chClass)} />
        },
      }}
      {...props}
    />
  )
}

export { Calendar }
