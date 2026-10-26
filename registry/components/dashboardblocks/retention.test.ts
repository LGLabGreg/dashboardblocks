import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import {
  CohortTable,
  getAverageRetention,
  getPlateau,
  getRetentionRates,
} from './retention'

describe('CohortTable', () => {
  it('prints the mean cohort size in the Average row, not the total', () => {
    const html = renderToStaticMarkup(
      createElement(CohortTable, {
        caption: 'Signups',
        cohorts: [
          { label: 'Jan', retained: [100, 50], size: 100 },
          { label: 'Feb', retained: [200, 80], size: 200 },
          { label: 'Mar', retained: [400], size: 400 },
        ],
      }),
    )
    const footer = html.slice(html.indexOf('<tfoot>'), html.indexOf('</tfoot>'))
    const sizeCell = footer.match(/<\/th><td[^>]*>([^<]*)<\/td>/)?.[1]
    assert.equal(sizeCell, '233')
  })
})

describe('getAverageRetention', () => {
  it('leaves a still-filling last period out of the average', () => {
    const average = getAverageRetention([
      { filling: true, label: 'Jan', retained: [100, 50, 40], size: 100 },
      { label: 'Feb', retained: [100, 30], size: 100 },
      { filling: true, label: 'Mar', retained: [300], size: 300 },
    ])
    // Period 0: all three, 500 of 500. Period 1: Jan and Feb, 80 of 200. Period 2: only Jan's, still filling.
    assert.deepEqual(average, [1, 0.4, null])
  })

  it('counts each period over the people old enough to reach it', () => {
    const google = {
      eligible: [100, 60, 20],
      label: 'Google',
      retained: [100, 30, 10],
      size: 100,
    }
    const direct = { label: 'Direct', retained: [50, 20], size: 50 }
    // Google: 30 of 60, then 10 of 20, not of 100.
    assert.deepEqual(getRetentionRates(google), [1, 0.5, 0.5])
    // Period 1: 50 of 110 (60 + 50). Period 2: only Google's 10 of 20.
    assert.deepEqual(getAverageRetention([google, direct]), [1, 50 / 110, 0.5])
    const html = renderToStaticMarkup(
      createElement(CohortTable, {
        caption: 'By source',
        cohorts: [google, direct],
        onCellSelect: () => {},
      }),
    )
    assert.match(html, /aria-label="50%, Google, period 1: 30 of 60"/)
  })
})

describe('CohortTable cells', () => {
  const cohorts = [
    { label: 'Jan', retained: [100, 50, 40], size: 100 },
    { filling: true, label: 'Feb', retained: [200, 80], size: 200 },
  ]

  it('makes each cohort cell after period 0 a button only when cells can be selected', () => {
    const still = renderToStaticMarkup(
      createElement(CohortTable, { caption: 'Signups', cohorts }),
    )
    assert.equal(still.match(/<button/g), null)
    const html = renderToStaticMarkup(
      createElement(CohortTable, {
        caption: 'Signups',
        cohorts,
        onCellSelect: () => undefined,
        periodName: 'Week',
        selected: { period: 1, row: 1 },
      }),
    )
    // Jan's weeks 1 and 2, Feb's week 1; not week 0 and not the average row.
    assert.equal(html.match(/<button/g)?.length, 3)
    assert.match(html, /aria-label="40%, Feb, week 1: 80 of 200" aria-pressed="true"/)
    assert.match(html, /aria-label="50%, Jan, week 1: 50 of 100" aria-pressed="false"/)
  })

  it('stripes only the last period of a still-filling cohort', () => {
    const html = renderToStaticMarkup(
      createElement(CohortTable, { caption: 'Signups', cohorts }),
    )
    assert.equal(html.match(/repeating-linear-gradient/g)?.length, 1)
    const feb = html.slice(
      html.indexOf('>Feb<'),
      html.indexOf('</tr>', html.indexOf('>Feb<')),
    )
    assert.match(feb, /repeating-linear-gradient[^>]*>40%</)
  })
})

describe('getPlateau', () => {
  it('finds where a low curve holds, not a pause before it falls again', () => {
    // 15% to 14.9% is a pause, but it then falls to 11%, more than 10% below 15%.
    assert.equal(getPlateau([1, 0.3, 0.2, 0.15, 0.149, 0.13, 0.11]), null)
    // Week 3: 38% to 37% is under 5% of 38%, and nothing later falls below 34.2%.
    assert.deepEqual(getPlateau([1, 0.5, 0.4, 0.38, 0.37, 0.365]), {
      period: 3,
      rate: 0.38,
    })
  })
})
