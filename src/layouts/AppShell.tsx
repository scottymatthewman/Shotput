import { CommandMenu } from '@/components/CommandMenu'
import { SidebarNav } from '@/components/nav/SidebarNav'
import { APP_NAME } from '@/config/app'
import { AgentChatPanel } from '@/layouts/AgentChatPanel'
import { ShellAgentControls } from '@/layouts/ShellAgentControls'
import { ShellTabBar } from '@/layouts/ShellTabBar'
import { ShellWorkspaceHeader } from '@/layouts/ShellWorkspaceHeader'
import {
  SHELL_MAIN_TOP_PADDING_CLASS,
  shellChatMainColumnWidth,
  shellChatTopColumnWidth,
  shellGridTransitionClass,
  shellNavMainColumnWidth,
  shellNavTopColumnWidth,
} from '@/layouts/shellLayout'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/state/uiStore'
import { useEffect, type CSSProperties, type ReactNode } from 'react'
import { Link, Outlet } from 'react-router-dom'

function shellGridTemplate(sidebarCollapsed: boolean, agentChatOpen: boolean) {
  const navTop = shellNavTopColumnWidth(sidebarCollapsed)
  const navMain = shellNavMainColumnWidth(sidebarCollapsed)
  const chatTop = shellChatTopColumnWidth(agentChatOpen)
  const chatMain = shellChatMainColumnWidth(agentChatOpen)
  return {
    navMain,
    chatMain,
    topTemplate: `${navTop} minmax(0, 1fr) ${chatTop}`,
    mainTemplate: `${navMain} minmax(0, 1fr) ${chatMain}`,
  }
}

export function AppShell({ children }: { children?: ReactNode }) {
  const setCommandOpen = useUiStore((s) => s.setCommandOpen)
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebarCollapsed = useUiStore((s) => s.toggleSidebarCollapsed)
  const agentChatOpen = useUiStore((s) => s.agentChatOpen)
  const toggleAgentChatOpen = useUiStore((s) => s.toggleAgentChatOpen)

  const { topTemplate, mainTemplate, navMain } = shellGridTemplate(
    sidebarCollapsed,
    agentChatOpen,
  )

  const topGridStyle = { '--shell-top-cols': topTemplate } as CSSProperties
  const mainGridStyle = { '--shell-main-cols': mainTemplate } as CSSProperties

  /** Both side surfaces hidden → page content reaches the viewport edges. */
  const shellMaximized = sidebarCollapsed && !agentChatOpen

  const pageContent = children ?? <Outlet />

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return

      const target = e.target as HTMLElement | null
      const inEditable = target?.closest('input, textarea, [contenteditable="true"]')

      if (e.key === '/' || e.code === 'Slash') {
        if (inEditable) return
        e.preventDefault()
        toggleAgentChatOpen()
        return
      }

      if (e.key === '.' || e.code === 'Period') {
        e.preventDefault()
        toggleSidebarCollapsed()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [toggleSidebarCollapsed, toggleAgentChatOpen])

  return (
    <>
      <CommandMenu />
      <div
        className="flex h-full min-h-0 w-full max-w-full flex-col overflow-hidden overscroll-none bg-background"
        onPointerDownCapture={(e) => {
          const t = e.target as HTMLElement
          if (t.closest?.('[data-search-trigger]')) {
            setCommandOpen(true)
          }
        }}
      >
        <div className="flex items-center gap-3 inset-edge inset-edge-b px-3 py-2 md:hidden">
          <Link
            to="/"
            className="text-sm font-semibold text-foreground transition-surface duration-150 ease-hover hover:text-primary"
          >
            {APP_NAME}
          </Link>
          <Link
            to="/settings"
            className="text-xs text-muted-foreground transition-surface duration-150 ease-hover hover:text-foreground"
          >
            Settings
          </Link>
          <span className="text-xs text-muted-foreground">Press / to search</span>
        </div>

        <header
          className={cn('shell-top-grid hidden shrink-0 md:grid', shellGridTransitionClass)}
          style={topGridStyle}
        >
          <ShellWorkspaceHeader
            workspaceName={APP_NAME}
            collapsed={sidebarCollapsed}
            onToggleCollapsed={toggleSidebarCollapsed}
          />
          <div className="min-w-0 overflow-hidden">
            <ShellTabBar />
          </div>
          <ShellAgentControls
            agentChatOpen={agentChatOpen}
            onToggleAgentChat={toggleAgentChatOpen}
          />
        </header>

        <div
          className={cn('shell-main-grid', shellGridTransitionClass)}
          style={mainGridStyle}
        >
          <div
            className={cn(
              'hidden min-h-0 overflow-hidden md:block',
              navMain === '0px' && 'pointer-events-none w-0 opacity-0',
            )}
            aria-hidden={sidebarCollapsed}
          >
            {!sidebarCollapsed ? <SidebarNav className="h-full" /> : null}
          </div>

          <div
            className={cn(
              'flex min-h-0 min-w-0 flex-col overflow-hidden p-3',
              SHELL_MAIN_TOP_PADDING_CLASS,
              'transition-[padding] duration-300 ease-in-out motion-reduce:transition-none',
              shellMaximized
                ? 'md:px-0 md:pb-0'
                : cn(
                    'md:pb-2',
                    sidebarCollapsed ? 'md:pl-2' : 'md:pl-0',
                    agentChatOpen ? 'md:pr-0' : 'md:pr-2',
                  ),
            )}
            data-app-content=""
          >
            <div
              className={cn(
                'relative flex min-h-0 min-w-0 flex-1 flex-col overflow-clip inset-edge inset-edge-full inset-edge-panel bg-surface-1',
                shellMaximized ? 'md:rounded-none' : 'rounded-xl',
              )}
            >
              {pageContent}
            </div>
          </div>

          <div
            className={cn(
              'hidden h-full min-h-0 min-w-0 overflow-hidden md:block',
              !agentChatOpen && 'pointer-events-none',
            )}
            aria-hidden={!agentChatOpen}
          >
            <AgentChatPanel />
          </div>
        </div>
      </div>
    </>
  )
}
