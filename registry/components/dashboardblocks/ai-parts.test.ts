import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { type AIMessage, getMessageSources, getMessageText } from './ai-message'
import { AIMessageParts } from './ai-parts'

function render(
  message: AIMessage,
  options: Partial<Parameters<typeof AIMessageParts>[0]> = {},
) {
  return renderToStaticMarkup(
    createElement(AIMessageParts, {
      message,
      onToolApprovalResponse: () => {},
      toolLabels: { lookup_order: 'Look up the order' },
      ...options,
    }),
  )
}

const reply = (parts: AIMessage['parts']): AIMessage => ({
  id: 'a',
  parts,
  role: 'assistant',
})

// Claude's web search reply through the AI SDK, recorded 2026-11-04, with three of its nine sources.
const searched = reply([
  {
    sourceId: 'SsFQjqH3mmMAl8pN',
    title: "React 19: What's New for Developers [2026]",
    type: 'source-url',
    url: 'https://scrimba.com/articles/react-19-whats-new-for-developers/',
  },
  {
    sourceId: 'LgCDfBZGWOHpuVYC',
    title: 'React Latest Version - Support Lifecycle & EOL — VersionLog',
    type: 'source-url',
    url: 'https://versionlog.com/react/',
  },
  {
    sourceId: 'Pz6XXaW4s74QhO1Z',
    title: 'react - npm',
    type: 'source-url',
    url: 'https://www.npmjs.com/package/react?activeTab=versions',
  },
  {
    state: 'done',
    text: 'The most recent stable React release is 19.3.1, which npm currently tags as its default version ',
    type: 'text',
  },
  {
    citations: [
      {
        source: {
          id: 'https://www.npmjs.com/package/react?activeTab=versions',
          sourceType: 'url',
          title: 'react - npm',
          url: 'https://www.npmjs.com/package/react?activeTab=versions',
        },
      },
    ],
    state: 'done',
    text: 'Latest version: 19.3.1, last published: 21 days ago.',
    type: 'text',
  },
  {
    state: 'done',
    text: ' It shipped on October 14, 2026, according to ',
    type: 'text',
  },
  {
    citations: [
      {
        source: {
          id: 'https://versionlog.com/react/',
          sourceType: 'url',
          title: 'React Latest Version - Support Lifecycle & EOL — VersionLog',
          url: 'https://versionlog.com/react/',
        },
      },
    ],
    state: 'done',
    text: "VersionLog's release history",
    type: 'text',
  },
  {
    state: 'done',
    text: '.',
    type: 'text',
  },
])

describe('AIMessageParts', () => {
  it('names a tool the model made up, even one called __proto__ or toString', () => {
    for (const toolName of ['__proto__', 'toString', 'constructor']) {
      const html = render(
        reply([
          {
            input: {},
            state: 'input-available',
            toolCallId: 't',
            toolName,
            type: 'dynamic-tool',
          },
        ]),
      )
      assert.doesNotMatch(html, /\[object|function/)
    }
    assert.match(
      render(
        reply([
          {
            input: {},
            state: 'input-available',
            toolCallId: 't',
            type: 'tool-lookup_order',
          },
        ]),
      ),
      /Look up the order/,
    )
  })

  it('previews only an image the browser already holds', () => {
    const image = (url: string) =>
      render(
        reply([{ filename: 'chart.png', mediaType: 'image/png', type: 'file', url }]),
      )
    assert.doesNotMatch(image('https://evil.example/pixel.png?mrr=48290'), /<img|<link/)
    assert.match(
      image('data:image/png;base64,iVBORw0KGgo='),
      /<img [^>]*src="data:image\/png/,
    )
  })

  it('offers Approve and Deny once the reply has stopped streaming', () => {
    const waiting = reply([
      {
        approval: { id: 'approval-1' },
        input: { maxOutputTokens: 400 },
        state: 'approval-requested',
        toolCallId: 't',
        type: 'tool-set_output_limit',
      },
    ])
    assert.doesNotMatch(render(waiting, { streaming: true }), />Approve</)
    assert.match(render(waiting, { streaming: true }), /Waiting for approval/)
    assert.match(render(waiting), />Approve</)
  })
  it('cites the sources a block holds instead of the reply’s, and can leave out the list', () => {
    const cited = reply([
      {
        sourceId: 's',
        title: 'From the reply',
        type: 'source-url',
        url: 'https://example.com/reply',
      },
      { state: 'done', text: 'MRR fell [1].', type: 'text' },
    ])
    const held = render(cited, {
      sources: [{ href: '/customers/acme', label: 'Acme' }],
    })
    assert.match(held, /<a href="\/customers\/acme"[^>]*>.*Source 1: Acme/)
    assert.doesNotMatch(held, /From the reply/)
    assert.match(render(cited), /Source 1: From the reply/)
    assert.match(render(cited), /data-slot="source-list"/)
    assert.doesNotMatch(render(cited, { showSources: false }), /data-slot="source-list"/)
  })

  it('reads a reply split around its citations as one text, citing what it cites', () => {
    const text =
      "The most recent stable React release is 19.3.1, which npm currently tags as its default version Latest version: 19.3.1, last published: 21 days ago.[1] It shipped on October 14, 2026, according to VersionLog's release history[2]."
    assert.equal(getMessageText(searched), text)
    assert.deepEqual(getMessageSources(searched), [
      {
        href: 'https://www.npmjs.com/package/react?activeTab=versions',
        label: 'react - npm',
      },
      {
        href: 'https://versionlog.com/react/',
        label: 'React Latest Version - Support Lifecycle & EOL — VersionLog',
      },
    ])
    const html = render(searched)
    assert.equal(html.match(/<p[ >]/g)?.length, 1)
    assert.match(
      html,
      /21 days ago\.<sup data-slot="citation"[^>]*><a href="https:\/\/www\.npmjs\.com[^"]*"[^>]*>.*Source 1: react - npm/,
    )
    assert.match(
      html,
      /release history<sup data-slot="citation"[^>]*><a href="https:\/\/versionlog\.com\/react\/"/,
    )
    assert.doesNotMatch(html, /scrimba/)
  })
})
