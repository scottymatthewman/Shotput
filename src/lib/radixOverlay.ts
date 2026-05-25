/** Dropdown / context menu / popover portals outside `Dialog`/`Sheet`; ignore “outside” dismiss. */
export function isRadixOverlayContentTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(
    target.closest(
      [
        '[data-radix-menu-content]',
        '[data-radix-popover-content]',
        '[data-radix-select-content]',
        '[data-radix-popper-content-wrapper]',
        '[role="dialog"][data-state="open"]',
      ].join(', '),
    ),
  )
}

/** @deprecated Use {@link isRadixOverlayContentTarget}. */
export function isRadixMenuContentTarget(target: EventTarget | null): boolean {
  return isRadixOverlayContentTarget(target)
}
