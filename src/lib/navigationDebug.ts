/**
 * Dev-only navigation / view diagnostics (Vite `import.meta.env.DEV`).
 *
 * Silence: localStorage.setItem('dance-debug-nav', '0')
 * (default in dev is on; `'0'` turns logs off.)
 */
function navigationDebugAllowed(): boolean {
  if (!import.meta.env.DEV) return false
  try {
    return typeof localStorage === 'undefined' || localStorage.getItem('dance-debug-nav') !== '0'
  } catch {
    return true
  }
}

/** Route changes, mount hooks, hydrate — prefixed for console filtering (`dance`). */
export function navigationDebug(tag: string, detail?: Record<string, unknown>): void {
  if (!navigationDebugAllowed()) return
  if (detail === undefined) {
    console.info('[dance:nav]', tag)
  } else {
    console.info('[dance:nav]', tag, detail)
  }
}
