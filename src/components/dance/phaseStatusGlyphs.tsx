import completedSvg from '@/assets/StatusIcons/completed.svg?raw'
import inProgressSvg from '@/assets/StatusIcons/inProgress.svg?raw'
import inReviewSvg from '@/assets/StatusIcons/InReveiw.svg?raw'
import missedSvg from '@/assets/StatusIcons/missed.svg?raw'
import todoSvg from '@/assets/StatusIcons/todo.svg?raw'
import { cn } from '@/lib/utils'
import type { PhaseStatus } from '@/types/domain'
import type { SVGProps } from 'react'

function themeStatusAssetSvg(raw: string): string {
  return raw
    .replaceAll('fill="black"', 'fill="currentColor"')
    .replaceAll('stroke="black"', 'stroke="currentColor"')
}

const byStatusHtml: Record<PhaseStatus, string> = {
  backlog: themeStatusAssetSvg(todoSvg),
  todo: themeStatusAssetSvg(todoSvg),
  in_progress: themeStatusAssetSvg(inProgressSvg),
  in_review: themeStatusAssetSvg(inReviewSvg),
  blocked: themeStatusAssetSvg(missedSvg),
  done: themeStatusAssetSvg(completedSvg),
}

function escapeSvgClassAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function injectSvgRootAttrs(
  svgHtml: string,
  className: string | undefined,
  ariaHidden: boolean | 'true' | 'false' | undefined,
): string {
  const cls = cn('shrink-0', className)
  let rootExtras = ` class="${escapeSvgClassAttr(cls)}"`
  if (ariaHidden === true || ariaHidden === 'true') rootExtras += ' aria-hidden="true"'
  if (ariaHidden === false || ariaHidden === 'false') rootExtras += ' aria-hidden="false"'
  return svgHtml.replace('<svg', `<svg${rootExtras}`)
}

type PhaseStatusGlyphProps = {
  status: PhaseStatus
} & Pick<SVGProps<SVGSVGElement>, 'className' | 'aria-hidden'>

/** Phase-status glyphs from `src/assets/StatusIcons`; colors follow `currentColor` for theming. */
export function PhaseStatusGlyph({
  status,
  className,
  'aria-hidden': ariaHidden,
}: PhaseStatusGlyphProps) {
  const themed = byStatusHtml[status] ?? byStatusHtml.todo
  const html = injectSvgRootAttrs(themed, className, ariaHidden)
  return <span className="contents" dangerouslySetInnerHTML={{ __html: html }} />
}
