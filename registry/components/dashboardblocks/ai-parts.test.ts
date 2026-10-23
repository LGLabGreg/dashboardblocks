import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import type { AIMessage } from './ai-message'
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
})
