import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { formatDateRange } from './dashboard-header'

const day = (year: number, month: number, date: number) =>
  new Date(Date.UTC(year, month - 1, date))

describe('formatDateRange', () => {
  it('reads one day as that day', () => {
    assert.equal(
      formatDateRange({ start: day(2026, 9, 25), end: day(2026, 9, 25) }),
      'Sep 25',
    )
  })

  it('names the month once within a month', () => {
    assert.equal(
      formatDateRange({ start: day(2026, 9, 10), end: day(2026, 9, 25) }),
      'Sep 10 – 25',
    )
  })

  it('names both months across months', () => {
    assert.equal(
      formatDateRange({ start: day(2026, 9, 10), end: day(2026, 10, 9) }),
      'Sep 10 – Oct 9',
    )
  })

  it('adds both years across years', () => {
    assert.equal(
      formatDateRange({ start: day(2025, 12, 20), end: day(2026, 1, 5) }),
      'Dec 20, 2025 – Jan 5, 2026',
    )
  })

  it('reads the days in UTC, whatever the time zone', () => {
    assert.equal(
      formatDateRange({
        start: new Date('2026-08-31T23:30:00Z'),
        end: new Date('2026-09-01T00:30:00Z'),
      }),
      'Aug 31 – Sep 1',
    )
  })
})
