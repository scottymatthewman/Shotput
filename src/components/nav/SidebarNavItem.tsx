import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { SidebarNavIcon } from '@/components/nav/navIcons'
import { navSearchIcon } from '@/components/nav/navIcons'
import { availableNavToneActive, sidebarNavItem } from '@/components/nav/sidebarNavStyles'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

type SidebarNavItemClassName = { className?: string }

type SidebarNavRouteItemBase = SidebarNavItemClassName & {
  to: string
  label: string
  end?: boolean
  trailing?: ReactNode
}

export type SidebarNavLinkItemProps = SidebarNavRouteItemBase & {
  variant: 'link' | 'nested'
  icon: SidebarNavIcon
}

export type SidebarNavUserItemProps = SidebarNavRouteItemBase & {
  variant: 'user'
  avatarUrl?: string
  initials: string
}

export type SidebarNavStubItemProps = SidebarNavItemClassName & {
  variant: 'stub'
  label: string
  icon: SidebarNavIcon
}

export type SidebarNavSearchItemProps = SidebarNavItemClassName & {
  variant: 'search'
}

export type SidebarNavMetaItemProps = SidebarNavItemClassName & {
  variant: 'meta'
  label: string
}

export type SidebarNavItemProps =
  | SidebarNavLinkItemProps
  | SidebarNavUserItemProps
  | SidebarNavStubItemProps
  | SidebarNavSearchItemProps
  | SidebarNavMetaItemProps

function SidebarNavLinkItem({
  variant,
  to,
  label,
  end,
  trailing,
  className,
  icon: Icon,
}: SidebarNavLinkItemProps) {
  const cfg = sidebarNavItem[variant]
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(cfg.root, isActive ? availableNavToneActive : cfg.tone, className)
      }
    >
      <Icon className={cfg.icon} aria-hidden />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {trailing}
    </NavLink>
  )
}

/** Sidebar nav row — one component, variant-driven (link, search, user, stub, meta, nested). */
export function SidebarNavItem(props: SidebarNavItemProps) {
  const { className } = props

  if (props.variant === 'search') {
    const cfg = sidebarNavItem.search
    const SearchIcon = navSearchIcon
    return (
      <button
        type="button"
        className={cn(cfg.root, className)}
        data-search-trigger
      >
        <span className={cfg.leading}>
          <SearchIcon className={cfg.icon} aria-hidden />
          <span className="min-w-0 truncate">Search</span>
        </span>
        <kbd className={cfg.kbd}>/</kbd>
      </button>
    )
  }

  if (props.variant === 'stub') {
    const cfg = sidebarNavItem.stub
    const Icon = props.icon
    return (
      <div className={cn(cfg.root, cfg.tone, className)} aria-disabled="true">
        <Icon className={cfg.icon} aria-hidden />
        <span className="min-w-0 flex-1 truncate font-medium">{props.label}</span>
        <span className={cfg.soon}>Soon</span>
      </div>
    )
  }

  if (props.variant === 'meta') {
    return <p className={cn(sidebarNavItem.meta.root, className)}>{props.label}</p>
  }

  if (props.variant === 'user') {
    const cfg = sidebarNavItem.user
    return (
      <NavLink to={props.to} end={props.end} className={cn(cfg.root, className)}>
        <Avatar className={cn('size-[18px] rounded-full', cfg.avatar)}>
          {props.avatarUrl ? <AvatarImage src={props.avatarUrl} alt="" /> : null}
          <AvatarFallback className="rounded-full bg-surface-3 text-[9px] font-medium text-muted-foreground">
            {props.initials}
          </AvatarFallback>
        </Avatar>
        <span className={cfg.label}>{props.label}</span>
        {props.trailing}
      </NavLink>
    )
  }

  return <SidebarNavLinkItem {...props} />
}

/** @deprecated Prefer `<SidebarNavItem variant="link" />`. */
export type SidebarNavStandardItemProps = Omit<SidebarNavLinkItemProps, 'variant'>

export function SidebarNavStandardItem({ icon, ...props }: SidebarNavStandardItemProps) {
  return <SidebarNavItem variant="link" icon={icon} {...props} />
}

export type SidebarNavDropdownItemProps = Omit<SidebarNavStandardItemProps, 'trailing'> & {
  trailing?: ReactNode
}

export function SidebarNavDropdownItem({ trailing, ...props }: SidebarNavDropdownItemProps) {
  return (
    <SidebarNavItem
      variant="link"
      trailing={
        trailing ?? (
          <ChevronDown
            className={cn(
              sidebarNavItem.link.icon,
              'transition-surface motion-reduce:transition-none',
            )}
            aria-hidden
          />
        )
      }
      {...props}
    />
  )
}

export type SidebarNavNestedItemProps = Omit<SidebarNavLinkItemProps, 'variant'>

export function SidebarNavNestedItem(props: SidebarNavNestedItemProps) {
  return <SidebarNavItem variant="nested" {...props} />
}

/** @deprecated Prefer `<SidebarNavItem variant="stub" />`. */
export function SidebarNavStubItem({
  label,
  icon,
  className,
}: Omit<SidebarNavStubItemProps, 'variant'>) {
  return <SidebarNavItem variant="stub" label={label} icon={icon} className={className} />
}
