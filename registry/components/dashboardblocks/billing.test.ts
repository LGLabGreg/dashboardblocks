import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { getMrrMovement, getWaterfallScale } from './billing'

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
