import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { getMrrMovement } from './billing'

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
