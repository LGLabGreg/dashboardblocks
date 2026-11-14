import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { getMrrMovement, getOutstandingInvoices, getWaterfallScale } from './billing'

describe('getMrrMovement', () => {
  it('keeps contraction and churn as decreases when they are zero', () => {
    const { steps } = getMrrMovement({
      starting: 1_000,
      newBusiness: 200,
      expansion: 0,
      contraction: 0,
      churn: 0,
    })
    assert.deepEqual(
      steps.map(({ key, kind }) => [key, kind]),
      [
        ['starting', 'total'],
        ['new', 'increase'],
        ['expansion', 'increase'],
        ['contraction', 'decrease'],
        ['churn', 'decrease'],
        ['ending', 'total'],
      ],
    )
  })
})

describe('getWaterfallScale', () => {
  it('starts the axis below the lowest running total on round ticks', () => {
    const { steps } = getMrrMovement({
      starting: 182_400,
      newBusiness: 14_850,
      expansion: 12_480,
      contraction: 2_940,
      churn: 5_260,
    })
    assert.deepEqual(getWaterfallScale(steps), {
      ceiling: 210_000,
      floor: 160_000,
      ticks: [160_000, 170_000, 180_000, 190_000, 200_000, 210_000],
    })
  })

  it('widens the tick step instead of drawing more than five steps', () => {
    const { steps } = getMrrMovement({
      starting: 1_000,
      newBusiness: 900,
      expansion: 0,
      contraction: 0,
      churn: 0,
    })
    assert.deepEqual(getWaterfallScale(steps), {
      ceiling: 2_000,
      floor: 0,
      ticks: [0, 400, 800, 1_200, 1_600, 2_000],
    })
  })
})

describe('getOutstandingInvoices', () => {
  const day = (date: string) => new Date(`${date}T00:00:00Z`)

  it('leaves out invoices that leave nothing to pay: paid, granted, void and drafts not sent', () => {
    const outstanding = getOutstandingInvoices([
      { amount: 2_000, date: day('2026-11-06'), id: 'paid', status: 'paid' as const },
      { amount: 0, date: day('2026-11-07'), id: 'grant', status: 'granted' as const },
      { amount: 49, date: day('2026-09-01'), id: 'void', status: 'void' as const },
      { amount: 980, date: day('2026-08-20'), id: 'draft', status: 'draft' as const },
      {
        amount: 2_000,
        date: day('2026-11-08'),
        id: 'declined',
        status: 'failed' as const,
      },
      { amount: 612, date: day('2026-10-14'), id: 'due', status: 'due' as const },
    ])
    // Only the declined top-up and the due invoice are owed: 2,000 + 612.
    assert.equal(outstanding.amount, 2_612)
    assert.equal(outstanding.count, 2)
    assert.equal(outstanding.oldest?.id, 'due')
  })

  it('is nothing when every invoice is settled', () => {
    const outstanding = getOutstandingInvoices([
      { amount: 0, date: day('2026-11-07'), status: 'granted' as const },
    ])
    assert.deepEqual(outstanding, { amount: 0, count: 0, oldest: undefined })
  })
})
