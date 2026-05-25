import { parseBudgetInput, budgetInputDisplay } from '@/lib/budget'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

type BudgetAmountFieldProps = {
  valueCents: number | undefined
  currency?: string
  ariaLabel: string
  placeholder?: string
  className?: string
  onCommit: (cents: number | undefined) => void
}

export function BudgetAmountField({
  valueCents,
  currency: _currency,
  ariaLabel,
  placeholder = '0',
  className,
  onCommit,
}: BudgetAmountFieldProps) {
  const [draft, setDraft] = useState(() => budgetInputDisplay(valueCents))

  useEffect(() => {
    setDraft(budgetInputDisplay(valueCents))
  }, [valueCents])

  const commit = () => {
    const parsed = parseBudgetInput(draft)
    if (parsed === valueCents) return
    if (parsed === undefined && valueCents === undefined) return
    onCommit(parsed)
  }

  return (
    <div className={cn('flex w-fit max-w-full min-w-0 items-center gap-2', className)}>
      <span className="shrink-0 text-sm text-muted-foreground" aria-hidden>
        $
      </span>
      <input
        type="text"
        inputMode="decimal"
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            ;(e.target as HTMLInputElement).blur()
          }
          if (e.key === 'Escape') {
            e.preventDefault()
            ;(e.target as HTMLInputElement).blur()
          }
        }}
        size={Math.max(draft.length || placeholder.length, 1)}
        className={cn(
          'min-w-8 w-auto max-w-full border-0 bg-transparent px-2 py-1 text-left text-sm tabular-nums text-foreground shadow-none outline-none ring-0 transition-surface duration-150 field-sizing-content',
          'rounded-md placeholder:text-muted-foreground',
          'focus-visible:bg-gantt-canvas focus-visible:outline-none focus-visible:ring-0 motion-reduce:transition-none',
        )}
      />
    </div>
  )
}
