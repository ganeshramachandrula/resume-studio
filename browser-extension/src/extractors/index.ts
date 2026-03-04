import type { SiteName, JobMeta } from '@shared/types'
import * as indeed from './indeed'
import * as linkedin from './linkedin'
import * as glassdoor from './glassdoor'
import * as monster from './monster'
import * as dice from './dice'
import * as ziprecruiter from './ziprecruiter'
import * as generic from './generic'

const extractors: Record<SiteName, { extractJD: () => string | null; extractMeta: () => JobMeta }> = {
  indeed,
  linkedin,
  glassdoor,
  monster,
  dice,
  ziprecruiter,
  generic,
}

export function detectSite(): SiteName {
  const host = window.location.hostname
  if (host.includes('indeed.com')) return 'indeed'
  if (host.includes('linkedin.com')) return 'linkedin'
  if (host.includes('monster.com')) return 'monster'
  if (host.includes('glassdoor.com')) return 'glassdoor'
  if (host.includes('dice.com')) return 'dice'
  if (host.includes('ziprecruiter.com')) return 'ziprecruiter'
  return 'generic'
}

export function extractJD(site: SiteName): string | null {
  return extractors[site].extractJD()
}

export function extractMeta(site: SiteName): JobMeta {
  return extractors[site].extractMeta()
}
