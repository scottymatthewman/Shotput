import { Button, type ButtonProps } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { ComponentProps, FormEvent, ReactNode } from 'react'

export type ActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  /** Optional id for `aria-describedby` when description is present. */
  descriptionId?: string
  confirmLabel: string
  cancelLabel?: string
  confirmVariant?: ButtonProps['variant']
  onConfirm: () => void
  confirmDisabled?: boolean
  /** Body content between header and footer. */
  children?: ReactNode
  className?: string
  contentClassName?: string
  onOpenAutoFocus?: ComponentProps<typeof DialogContent>['onOpenAutoFocus']
}

/**
 * Confirm / cancel dialog with a form submit path so primary actions close reliably.
 * Closes before `onConfirm` so store-driven re-renders do not fight controlled `open`.
 */
export function ActionDialog({
  open,
  onOpenChange,
  title,
  description,
  descriptionId,
  confirmLabel,
  cancelLabel = 'Cancel',
  confirmVariant = 'default',
  onConfirm,
  confirmDisabled = false,
  children,
  className,
  contentClassName,
  onOpenAutoFocus,
}: ActionDialogProps) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (confirmDisabled) return
    onOpenChange(false)
    onConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn('max-w-[420px]', contentClassName)}
        onOpenAutoFocus={onOpenAutoFocus}
      >
        <form className={cn('space-y-4', className)} onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? (
              <DialogDescription id={descriptionId}>{description}</DialogDescription>
            ) : null}
          </DialogHeader>
          {children}
          <div className="flex flex-col-reverse gap-2 pt-0 sm:flex-row sm:justify-end sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="transition-surface duration-200 ease-out"
              onClick={() => onOpenChange(false)}
            >
              {cancelLabel}
            </Button>
            <Button type="submit" variant={confirmVariant} disabled={confirmDisabled}>
              {confirmLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
