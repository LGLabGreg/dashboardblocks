import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { formatProvenanceFilters, formatProvenanceWindow } from './kpi-provenance-format'

// Intl may use a narrow or thin space around the dash, depending on the ICU version.
const plain = (text: string) => text.replace(/[\u2009\u202f]/g, ' ')

describe('formatProvenanceWindow', () => {
  it('reads all time without a window', () => {
    assert.equal(formatProvenanceWindow(null, 'en-US', 'UTC'), 'All time')
  })

  it('shortens a range within one month', () => {
    assert.equal(
      plain(
        formatProvenanceWindow(
          {
            from: new Date('2026-09-01T00:00:00Z'),
            to: new Date('2026-09-30T00:00:00Z'),
          },
          'en-US',
          'UTC',
        ),
      ),
      'Sep 1 – 30, 2026',
    )
  })

  it('names both months across a month boundary', () => {
    assert.equal(
      plain(
        formatProvenanceWindow(
          {
            from: new Date('2026-09-28T00:00:00Z'),
            to: new Date('2026-10-04T00:00:00Z'),
          },
          'en-US',
          'UTC',
        ),
      ),
      'Sep 28 – Oct 4, 2026',
    )
  })

  it('names both years across a year boundary', () => {
    assert.equal(
      plain(
        formatProvenanceWindow(
          {
            from: new Date('2025-12-29T00:00:00Z'),
            to: new Date('2026-01-04T00:00:00Z'),
          },
          'en-US',
          'UTC',
        ),
      ),
      'Dec 29, 2025 – Jan 4, 2026',
    )
  })

  it('shows the dates in the time zone given', () => {
    assert.equal(
      plain(
        formatProvenanceWindow(
          {
            from: new Date('2026-09-01T02:00:00Z'),
            to: new Date('2026-09-08T02:00:00Z'),
          },
          'en-US',
          'America/New_York',
        ),
      ),
      'Aug 31 – Sep 7, 2026',
    )
  })
})

describe('formatProvenanceFilters', () => {
  it('lists nothing without filters', () => {
    assert.deepEqual(formatProvenanceFilters({}), [])
  })

  it('lists each filter as name and value, in order', () => {
    assert.deepEqual(formatProvenanceFilters({ Plan: 'Pro', Region: 'Europe' }), [
      'Plan: Pro',
      'Region: Europe',
    ])
  })
})
