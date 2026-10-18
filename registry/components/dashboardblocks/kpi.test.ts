import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { getKPIChange } from './kpi'

describe('getKPIChange', () => {
  it('rounds a tiny fall to a plain zero, not -0', () => {
    assert.ok(Object.is(getKPIChange({ value: 32_600, previous: 32_610 }), 0))
  })

  it('rounds to one decimal', () => {
    assert.equal(getKPIChange({ value: 110, previous: 100 }), 10)
    assert.equal(getKPIChange({ value: 99.5, previous: 100 }), -0.5)
    assert.equal(getKPIChange({ value: 12.34, previous: 10, changeType: 'points' }), 2.3)
  })

  it('has no percent change from zero, so no "No change" line for a value that appeared', () => {
    assert.equal(getKPIChange({ value: 120, previous: 0 }), undefined)
    assert.equal(getKPIChange({ value: 0, previous: 0 }), 0)
    assert.equal(getKPIChange({ value: 4, previous: 0, changeType: 'points' }), 4)
  })
})
