import { createContext, useContext } from 'react'

/** Gantt scroll viewport: status menus use this for Popper `collisionBoundary` so they flip right when left has no room. */
export const GanttCollisionBoundaryContext = createContext<HTMLElement | null>(null)

export function useGanttCollisionBoundary() {
  return useContext(GanttCollisionBoundaryContext)
}
