import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { Funnel1 } from './funnel/funnel-01'
import { Retention2 } from './retention/retention-02'
import { Retention4 } from './retention/retention-04'

const cohorts = [
  { label: 'Week of Sep 1', retained: [400, 220, 180], size: 400 },
  { label: 'Week of Sep 8', retained: [500, 260], size: 500 },
]

describe('Retention blocks that failed to load', () => {
  it('Retention 02 names no cohort above "Couldn’t load"', () => {
    const html = renderToStaticMarkup(
      createElement(Retention2, {
        cohorts,
        description: 'Weekly cohorts.',
        periodName: 'Week',
        status: 'error',
        title: 'Weekly retention',
      }),
    )
    assert.match(html, /Latest cohort/)
    assert.doesNotMatch(html, /Week of Sep/)
  })

  it('Retention 04 names no period above "Couldn’t load"', () => {
    const html = renderToStaticMarkup(
      createElement(Retention4, {
        description: 'New, returning and lost users by week.',
        periods: [{ churned: 90, label: 'Oct 18', new: 140, resurrected: 30 }],
        status: 'error',
        title: 'Growth accounting',
      }),
    )
    assert.match(html, /Quick ratio/)
    assert.doesNotMatch(html, /Oct 18/)
  })
})

describe('A title link to the full chart', () => {
  const link = { href: '/funnels', label: 'Open in Funnels' }
  const funnel = {
    description: 'Sign-up to activation.',
    stages: [
      { label: 'Signed up', value: 1200 },
      { label: 'Activated', value: 540 },
    ],
    title: 'Activation funnel',
  }

  it('Funnel 01 shows the link beside its title, and none without one', () => {
    const linked = renderToStaticMarkup(createElement(Funnel1, { ...funnel, link }))
    assert.match(linked, /<a [^>]*href="\/funnels"[^>]*>Open in Funnels<[^]*?<\/a>/)
    const plain = renderToStaticMarkup(createElement(Funnel1, funnel))
    assert.doesNotMatch(plain, /<a /)
  })

  it('Retention 02 shows the link, also while it failed to load', () => {
    const html = renderToStaticMarkup(
      createElement(Retention2, {
        cohorts,
        description: 'Weekly cohorts.',
        link: { href: '/retention', label: 'Open in Retention' },
        status: 'error',
        title: 'Weekly retention',
      }),
    )
    assert.match(html, /<a [^>]*href="\/retention"[^>]*>Open in Retention<[^]*?<\/a>/)
  })
})
