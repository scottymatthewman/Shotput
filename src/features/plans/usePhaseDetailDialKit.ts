import { useDialKit } from 'dialkit'

export type PhaseDetailLayoutDial = {
  maxWidth: number
  scrollPadding: number
  columnGap: number
  columnPaddingTop: number
  columnPaddingBottom: number
  panelGap: number
  panelPaddingX: number
  panelPaddingTop: number
  panelPaddingBottom: number
  sectionCardGap: number
  sectionCardPadding: number
  metricPaddingY: number
}

/** Live-tunable layout for the phase detail page (DialKit, dev panel). */
export function usePhaseDetailDialKit(): PhaseDetailLayoutDial {
  const params = useDialKit('Phase detail', {
    layout: {
      maxWidth: [700, 480, 1200],
      scrollPadding: [12, 0, 48],
      columnGap: [12, 0, 32],
      columnPaddingTop: [20, 0, 48],
      columnPaddingBottom: [60, 0, 128],
    },
    panel: {
      _collapsed: true,
      outerGap: [6, 0, 32],
      paddingX: [0, 0, 48],
      paddingTop: [0, 0, 48],
      paddingBottom: [0, 0, 128],
    },
    sections: {
      _collapsed: true,
      cardGap: [16, 0, 32],
      cardPadding: [16, 0, 32],
      metricPaddingY: [6, 0, 32],
    },
  })

  return {
    maxWidth: params.layout.maxWidth,
    scrollPadding: params.layout.scrollPadding,
    columnGap: params.layout.columnGap,
    columnPaddingTop: params.layout.columnPaddingTop,
    columnPaddingBottom: params.layout.columnPaddingBottom,
    panelGap: params.panel.outerGap,
    panelPaddingX: params.panel.paddingX,
    panelPaddingTop: params.panel.paddingTop,
    panelPaddingBottom: params.panel.paddingBottom,
    sectionCardGap: params.sections.cardGap,
    sectionCardPadding: params.sections.cardPadding,
    metricPaddingY: params.sections.metricPaddingY,
  }
}
