/** Catalog record for scraped / enriched industry events (Find). Not workspace plans. */
export type FindIndustryEvent = {
  id: string
  name: string
  organizer: string
  location: string
  startIso: string
  endIso: string
  estRoiIndex: number
  estAttendanceMid: number
  sentimentSummary: string
  synopsis: string
}

export const FIND_INDUSTRY_CATALOG: FindIndustryEvent[] = [
  {
    id: 'cat-config-2026',
    name: 'Config 2026',
    organizer: 'Figma',
    location: 'Moscone West · San Francisco, CA',
    startIso: '2026-05-06',
    endIso: '2026-05-08',
    estRoiIndex: 91,
    estAttendanceMid: 8500,
    sentimentSummary: 'Strong product-design demand; sponsorship waitlist historically tight.',
    synopsis:
      'Design systems and cross-functional collaboration dominate the agenda—high signal for tooling and booth-led demos.',
  },
  {
    id: 'cat-saas-connected',
    name: 'SAAS Connected NYC',
    organizer: 'Pavilion',
    location: 'Jacob Javits Center · New York, NY',
    startIso: '2026-06-03',
    endIso: '2026-06-05',
    estRoiIndex: 78,
    estAttendanceMid: 4200,
    sentimentSummary: 'Mid-market-heavy audience; ROI tends to hinge on outbound before the show.',
    synopsis:
      'Revenue-leader programming and partner pavilion—good fit if your ICP skews SaaS Ops and RevOps titles.',
  },
  {
    id: 'cat-dublin-tech',
    name: 'Dublin Tech Summit',
    organizer: 'DTS',
    location: 'RDS · Dublin, Ireland',
    startIso: '2026-07-09',
    endIso: '2026-07-10',
    estRoiIndex: 73,
    estAttendanceMid: 11000,
    sentimentSummary: 'International mix; softer direct intent vs US flagship conferences.',
    synopsis:
      'EU hiring and infra buyers show up at volume—pair with localized field programs for best ROI.',
  },
]

export function getFindIndustryEvent(id: string): FindIndustryEvent | undefined {
  return FIND_INDUSTRY_CATALOG.find((e) => e.id === id)
}
