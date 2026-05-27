/** Shared sidebar / command palette density — keep nav, search, and command rows aligned. */
export const sidebarNavDensity = {
  row: 'h-6',
  text: 'text-xs',
  gap: 'gap-3',
  px: 'px-1',
  icon: 'size-3',
  /** Extra vertical padding on search fields (+4px top/bottom). */
  searchPy: 'py-1',
} as const

export const sidebarNavRow = {
  standard: {
    root: cnRow('standard'),
    active: 'font-medium text-foreground hover:text-nav-hover',
    inactive: 'font-medium text-muted-foreground hover:text-nav-hover',
    icon: cnIcon(),
  },
  nested: {
    root: cnRow('nested'),
    active: 'font-medium text-foreground hover:text-nav-hover',
    inactive: 'font-medium text-muted-foreground hover:text-nav-hover',
    icon: cnIcon(),
  },
} as const

function cnRow(variant: 'standard' | 'nested') {
  const gap = variant === 'nested' ? 'gap-2' : sidebarNavDensity.gap
  return `group flex ${sidebarNavDensity.row} items-center ${gap} rounded-md ${sidebarNavDensity.px} ${sidebarNavDensity.text} transition-surface duration-150 ease-hover`
}

function cnIcon() {
  return `${sidebarNavDensity.icon} shrink-0 text-muted-foreground transition-surface motion-reduce:transition-none group-hover:text-nav-hover`
}

export type SidebarNavRowVariant = keyof typeof sidebarNavRow
