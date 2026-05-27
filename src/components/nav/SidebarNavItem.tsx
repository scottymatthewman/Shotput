import { cn } from '@/lib/utils'
import { ChevronDown, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { sidebarNavDensity, sidebarNavRow, type SidebarNavRowVariant } from '@/components/nav/sidebarNavStyles'

export type SidebarNavLinkRowProps = {
  to: string
  end?: boolean
  label: string
  icon?: LucideIcon
  /** Merged with `NavLink` `isActive` (e.g. highlight plan while its workspace is open). */
  activeWhen?: boolean
  variant: SidebarNavRowVariant
  trailing?: ReactNode
  className?: string
}

function SidebarNavLinkRow({
  to,
  end,
  label,
  icon: Icon,
  activeWhen,
  variant,
  trailing,
  className,
}: SidebarNavLinkRowProps) {
  const cfg = sidebarNavRow[variant]
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(cfg.root, isActive || activeWhen ? cfg.active : cfg.inactive, className)
      }
    >
      {({ isActive }) => {
        const active = isActive || activeWhen
        return (
          <>
            {Icon ? <Icon className={cn(cfg.icon, active && 'text-nav-hover')} /> : null}
            <span className="min-w-0 flex-1 truncate">{label}</span>
            {trailing}
          </>
        )
      }}
    </NavLink>
  )
}

export type SidebarNavStandardItemProps = Omit<SidebarNavLinkRowProps, 'variant' | 'trailing'> & {
  icon: LucideIcon
}

/** Primary sidebar row with leading icon + label. */
export function SidebarNavStandardItem({ icon, ...props }: SidebarNavStandardItemProps) {
  return <SidebarNavLinkRow variant="standard" icon={icon} {...props} />
}

export type SidebarNavDropdownItemProps = Omit<SidebarNavStandardItemProps, 'trailing'> & {
  /** Defaults to disclosure chevron; replace when wiring real menus. */
  trailing?: ReactNode
}

/** Same chrome as SidebarNavStandardItem with a trailing affordance for expand / menu. */
export function SidebarNavDropdownItem({ trailing, ...props }: SidebarNavDropdownItemProps) {
  return (
    <SidebarNavLinkRow
      variant="standard"
      trailing={
        trailing ?? (
          <ChevronDown
            className={cn(sidebarNavDensity.icon, 'shrink-0 text-muted-foreground transition-surface motion-reduce:transition-none group-hover:text-nav-hover')}
            aria-hidden
          />
        )
      }
      {...props}
    />
  )
}

export type SidebarNavNestedItemProps = Omit<SidebarNavLinkRowProps, 'variant'>

/** Indented child route row; optional icon uses nested scale. */
export function SidebarNavNestedItem(props: SidebarNavNestedItemProps) {
  return <SidebarNavLinkRow variant="nested" {...props} />
}

export function SidebarNavStubItem({
  label,
  icon: Icon,
  className,
}: {
  label: string
  icon: LucideIcon
  className?: string
}) {
  const cfg = sidebarNavRow.standard
  return (
    <div
      className={cn(cfg.root, cfg.inactive, 'cursor-default opacity-50', className)}
      aria-disabled="true"
    >
      <Icon className={cfg.icon} aria-hidden />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="shrink-0 text-[10px] text-muted-foreground">Soon</span>
    </div>
  )
}
