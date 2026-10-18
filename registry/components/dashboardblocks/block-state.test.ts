import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { getBlockState } from './block-state'

describe('getBlockState', () => {
  it('is empty when the data is left out, null, an empty string or an empty list', () => {
    assert.equal(getBlockState(undefined, undefined), 'empty')
    assert.equal(getBlockState(undefined, null), 'empty')
    assert.equal(getBlockState(undefined, ''), 'empty')
    assert.equal(getBlockState(undefined, []), 'empty')
  })

  it('counts zero, NaN, an object and a list of empty items as data', () => {
    assert.equal(getBlockState(undefined, 0), undefined)
    assert.equal(getBlockState(undefined, Number.NaN), undefined)
    assert.equal(getBlockState(undefined, {}), undefined)
    assert.equal(getBlockState(undefined, [[]]), undefined)
    assert.equal(getBlockState(undefined, 'Paid'), undefined)
  })

  it('shows loading or error over the data, empty or not', () => {
    assert.equal(getBlockState('loading', []), 'loading')
    assert.equal(getBlockState('error', [1, 2]), 'error')
  })
})
