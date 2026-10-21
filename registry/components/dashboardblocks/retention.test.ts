import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { CohortTable } from './retention'

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
