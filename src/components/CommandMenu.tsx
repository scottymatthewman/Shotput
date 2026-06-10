import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useUiStore } from '@/state/uiStore'
import { Home, MessageSquare, Moon, PanelLeft, Settings, Sun } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Global command menu — opens with `/` or Cmd+K.
 * Add product actions here as features grow.
 */
export function CommandMenu() {
  const open = useUiStore((s) => s.commandOpen)
  const setOpen = useUiStore((s) => s.setCommandOpen)
  const theme = useUiStore((s) => s.theme)
  const toggleTheme = useUiStore((s) => s.toggleTheme)
  const toggleSidebarCollapsed = useUiStore((s) => s.toggleSidebarCollapsed)
  const toggleAgentChatOpen = useUiStore((s) => s.toggleAgentChatOpen)
  const navigate = useNavigate()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const inEditable = target?.closest('input, textarea, [contenteditable="true"]')

      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.code === 'KeyK')) {
        e.preventDefault()
        setOpen(!useUiStore.getState().commandOpen)
        return
      }
      if (e.key === '/' && !inEditable && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [setOpen])

  function run(action: () => void) {
    setOpen(false)
    action()
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => run(() => navigate('/'))}>
            <Home className="size-4" aria-hidden />
            Home
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate('/settings'))}>
            <Settings className="size-4" aria-hidden />
            Settings
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Preferences">
          <CommandItem onSelect={() => run(toggleTheme)}>
            {theme === 'dark' ? (
              <Sun className="size-4" aria-hidden />
            ) : (
              <Moon className="size-4" aria-hidden />
            )}
            Toggle theme
          </CommandItem>
          <CommandItem onSelect={() => run(toggleSidebarCollapsed)}>
            <PanelLeft className="size-4" aria-hidden />
            Toggle sidebar
          </CommandItem>
          <CommandItem onSelect={() => run(toggleAgentChatOpen)}>
            <MessageSquare className="size-4" aria-hidden />
            Toggle agent chat
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
