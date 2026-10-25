import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { layoutChartMarkers } from './chart'

const plot = { left: 0, right: 500 }

describe('layoutChartMarkers', () => {
  it('puts each name left of its line when there is room', () => {
    assert.deepEqual(
      layoutChartMarkers([200, 450], ['Shared dashboards', 'Lumen 2.0'], plot),
      ['end', 'end'],
    )
  })

  it('puts a name right of its line near the left edge, so it is not cut off', () => {
    assert.deepEqual(layoutChartMarkers([40], ['Lumen 2.0'], plot), ['start'])
  })

  it('moves the second of two close names right of its line', () => {
    assert.deepEqual(
      layoutChartMarkers([300, 330], ['Shared dashboards', 'Lumen 2.0'], plot),
      ['end', 'start'],
    )
  })

  it('gives up on names when two lines are too close for either side', () => {
    assert.equal(
      layoutChartMarkers([300, 305], ['Shared dashboards', 'Lumen 2.0'], plot),
      null,
    )
  })

  it('gives up on names when one fits on neither side of a narrow chart', () => {
    assert.equal(
      layoutChartMarkers([50], ['Shared dashboards'], { left: 0, right: 100 }),
      null,
    )
  })
})
