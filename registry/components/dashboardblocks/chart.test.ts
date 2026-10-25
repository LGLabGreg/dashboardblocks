import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { ChartEdgeTick, layoutChartMarkers } from './chart'

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

describe('ChartEdgeTick', () => {
  // Recharts gives each label a position estimated from a measured width (x) beside its point
  // (payload.coordinate); the edge labels must sit on their point, inside the chart.
  const tick = (index: number, x: number, coordinate: number) =>
    renderToStaticMarkup(
      createElement(ChartEdgeTick, {
        index,
        payload: { coordinate, value: '2026-10-19' },
        textAnchor: 'middle',
        tickFormatter: (value: string) => `Week of ${value}`,
        visibleTicksCount: 3,
        x,
        y: 200,
      }),
    )

  it('ends the last label at its point, so the right edge never cuts it', () => {
    const markup = tick(2, 590, 600)
    assert.match(markup, /text-anchor="end"/)
    assert.match(markup, / x="600"/)
    assert.match(markup, /Week of 2026-10-19/)
  })

  it('starts the first label at its point', () => {
    const markup = tick(0, 66, 48)
    assert.match(markup, /text-anchor="start"/)
    assert.match(markup, / x="48"/)
  })

  it('leaves a label between them centred where recharts put it', () => {
    const markup = tick(1, 300, 300)
    assert.match(markup, /text-anchor="middle"/)
    assert.match(markup, / x="300"/)
  })
})
