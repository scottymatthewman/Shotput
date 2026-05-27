import { useUiStore } from '@/state/uiStore'
import { useEffect } from 'react'

/** Applies `dark` class on `<html>` from persisted uiStore theme. */
export function ThemeSync() {
  const theme = useUiStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.classList.toggle('light', theme === 'light')
    root.style.colorScheme = theme
  }, [theme])

  return null
}
