import { fencedBlocks } from '@/registry/lib/dashboardblocks/markdown-fences'
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import {
  AIMarkdown,
  completeMarkdown,
  getCitedNumbers,
  joinMarkdownBlocks,
  markChange,
  markdownBlocks,
  markdownToPlainText,
} from './ai-markdown'
import { LinkProvider, type LinkProviderProps } from './link'

function render(
  text: string,
  options: { sources?: { href?: string; label: string }[]; streaming?: boolean } = {},
) {
  return renderToStaticMarkup(createElement(AIMarkdown, { text, ...options }))
}

const textOf = (html: string) => html.replace(/<[^>]+>/g, '')

describe('ai-markdown', () => {
  it('drops a link a model wrote to a script, keeping its words', () => {
    const html = render(
      '[Open the report](javascript:alert(1)) or [this](data:text/html,x)',
    )
    assert.doesNotMatch(html, /href/)
    assert.match(html, /<span>Open the report<\/span>/)
    assert.match(html, /<span>this<\/span>/)
  })

  it('shows HTML a model wrote as text', () => {
    const html = render(
      'Done <img src=x onerror="alert(1)"> now\n\n<script>alert(2)</script>',
    )
    assert.doesNotMatch(html, /<img|<script/)
    assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/)
    assert.match(html, /&lt;script&gt;alert\(2\)&lt;\/script&gt;/)
  })

  it('shows an image as a link, so nothing loads from a URL the model chose', () => {
    const html = render('![MRR chart](https://evil.example/pixel.png?mrr=48290)')
    assert.doesNotMatch(html, /<img/)
    assert.match(html, /<a [^>]*href="https:\/\/evil\.example\/pixel\.png\?mrr=48290"/)
    assert.match(html, /target="_blank"/)
    assert.match(html, /rel="noopener noreferrer"/)
    assert.match(
      html,
      />MRR chart<span class="sr-only"> \(opens in a new tab\)<\/span><\/a>/,
    )
  })

  it('shows named entities as the characters they stand for, and code as written', () => {
    const html = render(
      'AT&T &amp; Co &copy; 2026 &bogus; `a &amp; b`\n\n| Plan &amp; seats |\n| --- |\n| &lt;b&gt; |',
    )
    assert.match(html, /AT&amp;T &amp; Co © 2026 &amp;bogus;/)
    assert.match(html, /<code[^>]*>a &amp;amp; b<\/code>/)
    assert.match(html, /Plan &amp; seats/)
    assert.match(html, /&lt;b&gt;/)
    assert.doesNotMatch(html, /<b>/)
    assert.equal(markdownToPlainText('Fees &amp; tax'), 'Fees & tax')
  })

  it('opens an in-app link the model wrote as a plain link, never the app’s router link', () => {
    function RouterLink(props: object) {
      return createElement('a', { ...props, 'data-router': '' })
    }
    const html = renderToStaticMarkup(
      createElement(
        LinkProvider,
        // createElement's types want children in props as well as after them.
        { component: RouterLink } as LinkProviderProps,
        createElement(AIMarkdown, { text: '[Export](/api/export?all=1)' }),
      ),
    )
    assert.match(html, /<a [^>]*href="\/api\/export\?all=1"/)
    assert.doesNotMatch(html, /data-router/)
  })

  it('links a citation to its source and leaves a number with no source as text', () => {
    const html = render('Spend is up [1] and down [3].', {
      sources: [{ href: '/usage', label: 'Usage' }],
    })
    assert.equal(html.match(/data-slot="citation"/g)?.length, 1)
    assert.match(html, /Spend is up<sup[^>]*><a [^>]*href="\/usage"/)
    assert.match(html, /Source 1: Usage/)
    assert.match(html, /and down \[3\]\./)
  })

  it('closes unfinished syntax and holds back a half-written citation while streaming', () => {
    assert.equal(completeMarkdown('Pro fell **12'), 'Pro fell **12**')
    assert.equal(completeMarkdown('Run `select'), 'Run `select`')
    assert.equal(completeMarkdown('Spend is up [1'), 'Spend is up')
    assert.equal(completeMarkdown('Spend is up ['), 'Spend is up')
    assert.equal(completeMarkdown('See [the docs](https://exa'), 'See the docs')
  })

  it('holds back a table until the line under its header arrives', () => {
    const header = 'By plan:\n\n| Plan | MRR |'
    const partial = render(header, { streaming: true })
    assert.doesNotMatch(partial, /\|/)
    assert.match(textOf(partial), /By plan:/)

    const table = render(`${header}\n| --- | ---: |\n| Pro | $4,815 |`, {
      streaming: true,
    })
    assert.match(table, /<table/)
    assert.match(table, /<th[^>]*>(<span[^>]*>)+Plan(<\/span>)+<\/th>/)
    assert.match(table, /\$4,815/)
  })

  it('fades in each word while the text streams, and no word once it is done', () => {
    const sources = [{ label: 'billing.mrr_by_plan' }]
    const streaming = render('Pro fell **12%** [1].', { sources, streaming: true })
    const faded = [
      ...streaming.matchAll(/<span class="[^"]*fade-in[^"]*">([^<]*)<\/span>/g),
    ]
    assert.deepEqual(
      faded.map((match) => match[1]),
      ['Pro ', 'fell ', '12%', '.'],
    )
    assert.doesNotMatch(render('Pro fell **12%** [1].', { sources }), /fade-in/)
  })

  it('reads a reply without its Markdown, for an announcement', () => {
    assert.equal(
      markdownToPlainText(
        '**Pro** fell by `12%`.\n\n- Acme left\n- Globex paused\n\n| Plan | MRR |\n| --- | --- |\n| Pro | $4,815 |',
      ),
      'Pro fell by 12%.\nAcme left\nGlobex paused\nPlan, MRR\nPro, $4,815',
    )
  })
  it('reads a reply without the numbers of the sources it cites, keeping other brackets', () => {
    assert.equal(
      markdownToPlainText('MRR fell [1], led by Acme [2]. See row [9] and `a[1]`.', 2),
      'MRR fell, led by Acme. See row [9] and a[1].',
    )
    assert.equal(markdownToPlainText('Item [1] of [0].'), 'Item [1] of [0].')
  })

  it('lists the sources a text cites, once each and in order', () => {
    assert.deepEqual(
      getCitedNumbers('Late [3], then [1], again [3], and [4] [0].', 3),
      [1, 3],
    )
    assert.deepEqual(getCitedNumbers('No citations.', 3), [])
  })
})

describe('fences', () => {
  const fences = {
    chart: ({ code, writing }: { code: string; writing: boolean }) =>
      createElement('figure', { 'data-writing': String(writing) }, code),
  }
  const draw = (text: string, streaming = false) =>
    renderToStaticMarkup(createElement(AIMarkdown, { fences, streaming, text }))

  it('hands a fenced block of a named language to its part, and shows other languages as code', () => {
    const html = draw('Before\n\n```chart\n{"type":"bar"}\n```\n\n```json\n{"a":1}\n```')
    assert.match(
      html,
      /<figure data-writing="false">\{&quot;type&quot;:&quot;bar&quot;\}<\/figure>/,
    )
    assert.doesNotMatch(html, /<figure[^>]*>\{&quot;a&quot;/)
    assert.match(textOf(html), /json\{&quot;a&quot;:1\}/)
  })

  it('says the block is still being written only while it is the last thing in a streaming reply', () => {
    assert.match(
      draw('Intro\n\n```chart\n{"type":', true),
      /data-writing="true">\{&quot;type&quot;:/,
    )
    assert.match(
      draw('Intro\n\n```chart\n{"type":"bar"}\n```\n\nAfter it', true),
      /data-writing="false"/,
    )
    assert.match(
      draw('Intro\n\n- A point\n\n  ```chart\n  {"type":', true),
      /data-writing="true"/,
    )
    assert.match(
      draw('- A point\n\n  ```chart\n  {"type":"bar"}\n  ```\n\nAfter the list', true),
      /data-writing="false"/,
    )
  })
})

describe('fencedBlocks', () => {
  it('finds each block of the language, in a list or a quote too, as the reader sees it', () => {
    const text = [
      'Orders ```chart {} in a sentence.',
      '',
      '```chartjs',
      'new Chart(ctx)',
      '```',
      '',
      '- York',
      '',
      '   ```chart',
      '   {"a":1}',
      '   ```',
      '',
      '> ~~~chart',
      '> {"b":2}',
      '> ~~~',
      '',
      '```chart title',
      '{"c":3}',
      '```',
    ].join('\n')
    assert.deepEqual(fencedBlocks(text, 'chart'), ['{"a":1}', '{"b":2}', '{"c":3}'])
  })
})

describe('markdownBlocks', () => {
  it('splits a document into its top-level blocks and joins them back as they were', () => {
    const text =
      'Dear Rosa,\n\nOur prices change.\n\n| Coffee | Now |\n| :-- | --: |\n| Decaf | £17.60 |\n\n- One\n- Two\n\nBest wishes,\nNadia\n'
    const blocks = markdownBlocks(text)
    assert.deepEqual(
      blocks.map((block) => block.source),
      [
        'Dear Rosa,',
        'Our prices change.',
        '| Coffee | Now |\n| :-- | --: |\n| Decaf | £17.60 |',
        '- One\n- Two',
        'Best wishes,\nNadia',
      ],
    )
    assert.equal(joinMarkdownBlocks(blocks), text)
  })
})

describe('markChange', () => {
  const html = (text: string) =>
    renderToStaticMarkup(createElement(AIMarkdown, { changes: true, text }))

  it('drops the marks from text that doesn’t ask for changes, such as a model’s reply', () => {
    assert.equal(
      render(`Prices ${markChange('rise', 'removed')} in January.`),
      '<div data-slot="ai-markdown" class="flex min-w-0 flex-col gap-3 leading-relaxed break-words"><p><span>Prices rise in January.</span></p></div>',
    )
  })

  it('draws marked words as added or removed, the rest as they are', () => {
    const out = html(
      `Prices ${markChange('rise', 'removed')} ${markChange('change', 'added')} in January.`,
    )
    assert.match(
      out,
      /<p><span>Prices <del[^>]*><span class="sr-only">removed <\/span>rise<\/del> <ins[^>]*><span class="sr-only">added <\/span>change<\/ins> in January\.<\/span><\/p>/,
    )
  })

  it('carries a change across bold text inside it', () => {
    const out = html(markChange('now **six** kilos', 'added'))
    assert.equal(out.match(/<ins/g)?.length, 3)
    assert.match(
      out,
      /<strong class="font-semibold"><span><ins[^>]*><span class="sr-only">added <\/span>six<\/ins><\/span><\/strong>/,
    )
  })

  it('marks a table cell without breaking the table', () => {
    const out = html(
      `| Coffee | Price |\n| :-- | --: |\n| Decaf | ${markChange('£17.60', 'removed')} ${markChange('£18.10', 'added')} |`,
    )
    assert.match(out, /<table/)
    assert.match(out, /<del[^>]*><span class="sr-only">removed <\/span>£17.60<\/del>/)
  })

  it('leaves the marks out of the plain text', () => {
    assert.equal(markdownToPlainText(`a ${markChange('b', 'added')} c`), 'a b c')
  })
})
