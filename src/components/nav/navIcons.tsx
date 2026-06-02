import addSvg from '@/assets/NavIcons/Add.svg?raw'
import copyLinkPng from '@/assets/NavIcons/CopyLink.png'
import agentSvg from '@/assets/NavIcons/Agent.svg?raw'
import chatActiveSvg from '@/assets/NavIcons/Chat-Active.svg?raw'
import chatInactiveSvg from '@/assets/NavIcons/Chat-Inactive.svg?raw'
import closeSvg from '@/assets/NavIcons/Close.svg?raw'
import eventsSvg from '@/assets/NavIcons/Events.svg?raw'
import historySvg from '@/assets/NavIcons/History.svg?raw'
import homeSvg from '@/assets/NavIcons/Home.svg?raw'
import inboxSvg from '@/assets/NavIcons/Inbox.svg?raw'
import plansSvg from '@/assets/NavIcons/Plans.svg?raw'
import reportsSvg from '@/assets/NavIcons/Reports.svg?raw'
import searchSvg from '@/assets/NavIcons/Search.svg?raw'
import sendSvg from '@/assets/NavIcons/Send.svg?raw'
import settingsSvg from '@/assets/NavIcons/Settings.svg?raw'
import sidebarSvg from '@/assets/NavIcons/Sidebar.svg?raw'
import suggestedSendSvg from '@/assets/NavIcons/SuggestedSend.svg?raw'
import tableSvg from '@/assets/NavIcons/Table.svg?raw'
import timelineSvg from '@/assets/NavIcons/Timeline.svg?raw'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export type SidebarNavIconProps = {
  className?: string
  'aria-hidden'?: boolean | 'true' | 'false'
}

export type SidebarNavIcon = (props: SidebarNavIconProps) => ReactNode

export type NavIconId =
  | 'home'
  | 'inbox'
  | 'plans'
  | 'reports'
  | 'settings'
  | 'search'
  | 'sidebar'
  | 'events'
  | 'chatActive'
  | 'chatInactive'
  | 'history'
  | 'agent'
  | 'suggestedSend'
  | 'send'
  | 'timeline'
  | 'table'
  | 'close'
  | 'add'

function themeNavAssetSvg(raw: string): string {
  return raw
    .replaceAll('fill="black"', 'fill="currentColor"')
    .replaceAll('stroke="black"', 'stroke="currentColor"')
}

const byIdHtml: Record<NavIconId, string> = {
  home: themeNavAssetSvg(homeSvg),
  inbox: themeNavAssetSvg(inboxSvg),
  plans: themeNavAssetSvg(plansSvg),
  reports: themeNavAssetSvg(reportsSvg),
  settings: themeNavAssetSvg(settingsSvg),
  search: themeNavAssetSvg(searchSvg),
  sidebar: themeNavAssetSvg(sidebarSvg),
  events: themeNavAssetSvg(eventsSvg),
  chatActive: themeNavAssetSvg(chatActiveSvg),
  chatInactive: themeNavAssetSvg(chatInactiveSvg),
  history: themeNavAssetSvg(historySvg),
  agent: themeNavAssetSvg(agentSvg),
  suggestedSend: themeNavAssetSvg(suggestedSendSvg),
  send: themeNavAssetSvg(sendSvg),
  timeline: themeNavAssetSvg(timelineSvg),
  table: themeNavAssetSvg(tableSvg),
  close: themeNavAssetSvg(closeSvg),
  add: themeNavAssetSvg(addSvg),
}

function escapeSvgClassAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function injectSvgRootAttrs(
  svgHtml: string,
  className: string | undefined,
  ariaHidden: SidebarNavIconProps['aria-hidden'],
): string {
  const cls = cn('shrink-0', className)
  let rootExtras = ` class="${escapeSvgClassAttr(cls)}"`
  if (ariaHidden === true || ariaHidden === 'true') rootExtras += ' aria-hidden="true"'
  if (ariaHidden === false || ariaHidden === 'false') rootExtras += ' aria-hidden="false"'
  return svgHtml.replace('<svg', `<svg${rootExtras}`)
}

export function NavIcon({
  id,
  className,
  'aria-hidden': ariaHidden,
}: SidebarNavIconProps & { id: NavIconId }) {
  const themed = byIdHtml[id]
  const html = injectSvgRootAttrs(themed, className, ariaHidden)
  return <span className="contents" dangerouslySetInnerHTML={{ __html: html }} />
}

function createNavIcon(id: NavIconId): SidebarNavIcon {
  const Icon = ({ className, 'aria-hidden': ariaHidden }: SidebarNavIconProps) => (
    <NavIcon id={id} className={className} aria-hidden={ariaHidden} />
  )
  Icon.displayName = `NavIcon(${id})`
  return Icon
}

export const navHomeIcon = createNavIcon('home')
export const navInboxIcon = createNavIcon('inbox')
export const navPlansIcon = createNavIcon('plans')
export const navReportsIcon = createNavIcon('reports')
export const navSettingsIcon = createNavIcon('settings')
export const navSearchIcon = createNavIcon('search')
export const navSidebarIcon = createNavIcon('sidebar')
export const navEventsIcon = createNavIcon('events')
export const navChatActiveIcon = createNavIcon('chatActive')
export const navChatInactiveIcon = createNavIcon('chatInactive')
export const navHistoryIcon = createNavIcon('history')
export const navAgentIcon = createNavIcon('agent')
export const navSuggestedSendIcon = createNavIcon('suggestedSend')
export const navSendIcon = createNavIcon('send')
export const navTimelineIcon = createNavIcon('timeline')
export const navTableIcon = createNavIcon('table')
export const navCloseIcon = createNavIcon('close')
export const navAddIcon = createNavIcon('add')

/** Masked PNG — inherits `currentColor` from parent text color. */
export function navCopyLinkIcon({ className, 'aria-hidden': ariaHidden }: SidebarNavIconProps) {
  return (
    <span
      aria-hidden={ariaHidden}
      className={cn('inline-block size-[18px] shrink-0 bg-current', className)}
      style={{
        WebkitMaskImage: `url("${copyLinkPng}")`,
        maskImage: `url("${copyLinkPng}")`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
      }}
    />
  )
}
