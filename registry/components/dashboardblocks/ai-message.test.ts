import type { UseChatHelpers } from '@ai-sdk/react'
import type { UIMessage } from 'ai'
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  type AIChat,
  type AIMessage,
  type AIReply,
  getMessageSources,
  getMessageText,
  getSafeHref,
  getStreamingMessageId,
  getToolLabel,
  replyFromText,
} from './ai-message'

// Fails to type-check when an AI SDK update changes a message, or a chat, so they no longer pass straight into the blocks.
function acceptsSdkShapes(chat: UseChatHelpers<UIMessage>, message: UIMessage) {
  const blockChat: AIChat = chat
  const blockMessage: AIMessage = message
  return [blockChat, blockMessage]
}

async function* chunks(...values: string[]) {
  yield* values
}

describe('ai-message', () => {
  it('takes the AI SDK’s chat and messages as they are', () => {
    assert.equal(typeof acceptsSdkShapes, 'function')
  })

  it('names a tool in words, unless it has a title', () => {
    const call = { state: 'input-available', toolCallId: 'a' } as const
    assert.equal(getToolLabel({ ...call, type: 'tool-lookup_order' }), 'Lookup order')
    assert.equal(getToolLabel({ ...call, type: 'tool-getMRRByPlan' }), 'Get mrr by plan')
    assert.equal(
      getToolLabel({ ...call, toolName: 'issue-refund', type: 'dynamic-tool' }),
      'Issue refund',
    )
    assert.equal(
      getToolLabel({
        ...call,
        title: 'Refund order',
        type: 'tool-issue_refund',
      }),
      'Refund order',
    )
  })

  it('copies only the text a reply wrote, paragraph by paragraph', () => {
    const message: AIMessage = {
      id: '1',
      parts: [
        { type: 'step-start' },
        { state: 'done', text: 'Checking the order.', type: 'reasoning' },
        { state: 'done', text: 'Order 41213 was delivered.  ', type: 'text' },
        {
          input: {},
          state: 'output-available',
          toolCallId: 't',
          type: 'tool-refund',
        },
        { state: 'done', text: '   ', type: 'text' },
        { state: 'done', text: 'Refunded $960.', type: 'text' },
      ],
      role: 'assistant',
    }
    assert.equal(getMessageText(message), 'Order 41213 was delivered.\n\nRefunded $960.')
  })

  it('numbers sources in the order the reply sent them', () => {
    const sources = getMessageSources({
      parts: [
        {
          sourceId: 'a',
          title: 'Overview',
          type: 'source-url',
          url: '/overview',
        },
        { state: 'done', text: 'Spend is up [1].', type: 'text' },
        { sourceId: 'b', type: 'source-url', url: 'https://example.com/calls' },
        {
          mediaType: 'application/pdf',
          sourceId: 'c',
          title: 'Q3 report',
          type: 'source-document',
        },
      ],
    })
    assert.deepEqual(sources, [
      { href: '/overview', label: 'Overview' },
      { href: 'https://example.com/calls', label: 'https://example.com/calls' },
      { label: 'Q3 report' },
    ])
  })

  it('opens only web, mail and in-app links from a model', () => {
    assert.equal(getSafeHref(' https://example.com/a?b=1 '), 'https://example.com/a?b=1')
    assert.equal(getSafeHref('mailto:support@example.com'), 'mailto:support@example.com')
    assert.equal(getSafeHref('/docs/billing#tax'), '/docs/billing#tax')
    assert.equal(getSafeHref('#sources'), '#sources')
    assert.equal(getSafeHref('javascript:alert(1)'), undefined)
    assert.equal(getSafeHref('JavaScript:alert(1)'), undefined)
    assert.equal(getSafeHref('java\nscript:alert(1)'), undefined)
    assert.equal(getSafeHref('https://example.com/\tx'), undefined)
    assert.equal(getSafeHref('data:text/html,<script>alert(1)</script>'), undefined)
    assert.equal(getSafeHref('//evil.example/path'), undefined)
    assert.equal(getSafeHref('/\\evil.example'), undefined)
    assert.equal(getSafeHref('vbscript:msgbox'), undefined)
    assert.equal(getSafeHref(''), undefined)
  })

  it('treats the last reply as arriving while it streams or goes on after an approval', () => {
    const question = { id: 'q', role: 'user' } as const
    const reply = { id: 'a', role: 'assistant' } as const
    assert.equal(getStreamingMessageId([question, reply], 'streaming'), 'a')
    assert.equal(getStreamingMessageId([question, reply], 'submitted'), 'a')
    assert.equal(getStreamingMessageId([question, reply], 'ready'), undefined)
    assert.equal(getStreamingMessageId([question, reply], 'error'), undefined)
    assert.equal(getStreamingMessageId([reply, question], 'submitted'), undefined)
    assert.equal(getStreamingMessageId([], 'submitted'), undefined)
  })

  it('turns text chunks into a reply that grows, then ends as done', async () => {
    const replies: AIReply[] = []
    for await (const reply of replyFromText(chunks('Up ', '20%'))) replies.push(reply)
    assert.deepEqual(replies, [
      { parts: [{ state: 'streaming', text: 'Up ', type: 'text' }] },
      { parts: [{ state: 'streaming', text: 'Up 20%', type: 'text' }] },
      { parts: [{ state: 'done', text: 'Up 20%', type: 'text' }] },
    ])
  })
})
