/** App shell column widths — keep top + main rows in sync with Figma Terrace layout. */

/** Top strip row — must fit `SHELL_TOP_PADDING_CLASS` (20px) + `WorkspaceMark` (40px). */
export const SHELL_TOP_HEIGHT_PX = 60
export const SHELL_NAV_WIDTH_EXPANDED_PX = 260
export const SHELL_NAV_WIDTH_COLLAPSED_TOP_PX = 56
export const SHELL_CHAT_WIDTH_PX = 292
/** Top-strip width for chat controls when the panel is closed — matches collapsed nav chrome. */
export const SHELL_CHAT_TOP_CONTROLS_PX = SHELL_NAV_WIDTH_COLLAPSED_TOP_PX

/** Horizontal padding for top-strip chrome (nav toggle, chat controls). */
export const SHELL_TOP_CHROME_PADDING_CLASS = 'px-4'

/** Top padding for top strip + nav column (20px). */
export const SHELL_TOP_PADDING_CLASS = 'pt-5'

/** Top padding for main-row content and chat columns (4px). */
export const SHELL_MAIN_TOP_PADDING_CLASS = 'pt-1'

export function shellNavTopColumnWidth(sidebarCollapsed: boolean): string {
  return sidebarCollapsed
    ? `${SHELL_NAV_WIDTH_COLLAPSED_TOP_PX}px`
    : `${SHELL_NAV_WIDTH_EXPANDED_PX}px`
}

export function shellNavMainColumnWidth(sidebarCollapsed: boolean): string {
  return sidebarCollapsed ? '0px' : `${SHELL_NAV_WIDTH_EXPANDED_PX}px`
}

/** Bottom row — chat panel column (0 when closed). */
export function shellChatMainColumnWidth(agentChatOpen: boolean): string {
  return agentChatOpen ? `${SHELL_CHAT_WIDTH_PX}px` : '0px'
}

/** Top row — always reserves space for chat/history controls. */
export function shellChatTopColumnWidth(agentChatOpen: boolean): string {
  return agentChatOpen
    ? `${SHELL_CHAT_WIDTH_PX}px`
    : `${SHELL_CHAT_TOP_CONTROLS_PX}px`
}

export const shellGridTransitionClass = 'shell-grid-animate'
