'use client'

import {
  ChatComposer,
  ChatError,
  ChatMessage,
  ChatMessageActions,
  ChatMessages,
  type SuggestedPrompt,
  SuggestedPrompts,
  TypingIndicator,
  useChatStream,
} from '@/registry/components/dashboardblocks/ai-assistant'
import {
  type AIChat,
  type AIMessage,
  type AIMessagePart,
  type AIReasoningPart,
  type AIReply,
  type AITextPart,
  getMessageText,
  getStreamingMessageId,
  isToolPart,
} from '@/registry/components/dashboardblocks/ai-message'
import {
  type TokenCounts,
  type TokenPrices,
  TokenSplitBar,
  formatTokens,
  formatUsd,
  getCacheHitRate,
  getTokenCost,
  tokenPartColors,
} from '@/registry/components/dashboardblocks/ai-usage'
import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { Details } from '@/registry/components/dashboardblocks/details'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { formatPercent } from '@/registry/lib/dashboardblocks/format'
import { useId } from 'react'

interface AiAssistant3Props extends BlockStateProps {
  /**
   * The chat it runs: `useChat()` from `@ai-sdk/react`, or `useChatStream` for any other stream. Leave out to run canned replies.
   * A reply's tokens show under it when its `metadata.usage` is `{ input, cached, output }`: send it from the route with `messageMetadata`.
   * A tool that waits for approval continues once answered when `useChat` has `sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses`.
   */
  chat?: AIChat
  description: string
  /** The conversation the canned replies start from. With `chat`, pass it to the chat instead. */
  messages?: AIMessage[]
  prices: TokenPrices
  suggestions: SuggestedPrompt[]
  title: string
  /** What each tool is called, by its name. Others read as their name in words. */
  toolLabels?: Record<string, string>
  /** Leave out to show the empty state. */
  tokens?: TokenCounts
}

const text = (value: string): AIMessagePart => ({
  state: 'done',
  text: value,
  type: 'text',
})

const exampleProps: AiAssistant3Props = {
  description: 'All models this month. Output is 8% of the tokens and 38% of the cost.',
  messages: [
    { id: '1', parts: [text('What drove the cost this month?')], role: 'user' },
    {
      id: '2',
      metadata: { usage: { cached: 1_400, input: 620, output: 96 } },
      parts: [
        { type: 'step-start' },
        {
          input: { range: 'month' },
          output: [
            { costUsd: 168.4, feature: 'Support summaries', outputTokens: 11_230_000 },
            { costUsd: 61.2, feature: 'Search answers', outputTokens: 4_080_000 },
            { costUsd: 28.5, feature: 'Email drafts', outputTokens: 1_900_000 },
          ],
          state: 'output-available',
          toolCallId: 'call-1',
          type: 'tool-get_usage_by_feature',
        },
        { type: 'step-start' },
        text(`Output tokens: they're **8%** of the tokens but **38%** of the cost, at five times the input price. Most come from support summaries, which write about 900 tokens per ticket.

Capping summaries at 400 tokens would save roughly **$150** a month.`),
      ],
      role: 'assistant',
    },
  ],
  prices: { cached: 0.3, input: 3, output: 15 },
  suggestions: [
    { label: 'Cap support summaries', prompt: 'Cap support summaries at 400 tokens' },
    {
      label: 'Raise the cache hit rate',
      prompt: 'How can we raise the cache hit rate?',
    },
    { label: 'Forecast next month’s cost' },
  ],
  title: 'Token usage',
  toolLabels: {
    get_usage_by_feature: 'Read usage by feature',
    set_output_limit: 'Set an output limit',
  },
  tokens: { cached: 83_000_000, input: 197_000_000, output: 25_500_000 },
}

const cannedReplies: Record<string, AIMessagePart[]> = {
  'Cap support summaries at 400 tokens': [
    {
      text: 'Support summaries average about 900 output tokens. Setting the limit changes what every summary can write, so it needs a person to approve it.',
      type: 'reasoning',
    },
    {
      approval: { id: 'approval-1' },
      input: { feature: 'Support summaries', maxOutputTokens: 400 },
      state: 'approval-requested',
      toolCallId: 'call-2',
      type: 'tool-set_output_limit',
    },
  ],
  'Forecast next month’s cost': [
    {
      text: 'Take this month’s tokens by type, grow them by the last three months’ support volume trend, and price them.',
      type: 'reasoning',
    },
    text(`At this month's pace, next month comes to about **$1,040**:

| Tokens | Count | Cost |
| :-- | --: | --: |
| Input | 205M | $615 |
| Cached input | 88M | $26 |
| Output | 26.5M | $398 |

That assumes support volume grows 4%, as it has for the last three months.`),
  ],
  'How can we raise the cache hit rate?': [
    text(`**30%** of input tokens come from the cache now. Two changes would raise it:

1. **Put the system prompt and tool definitions first**, and anything that changes per request after them. Only an identical prefix is cached.
2. **Reuse the same knowledge base snippet order** in support summaries. Today it's sorted by relevance, so the prefix rarely matches.

Together they could lift the hit rate to about 55%, saving around $180 a month.`),
  ],
}

const fallbackReply: AIMessagePart[] = [
  text(
    'This is a demo reply. Pass `chat` to stream answers from your own model, with this data as context.',
  ),
]

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort)
      resolve()
    }, ms)
    function abort() {
      clearTimeout(timer)
      reject(signal.reason)
    }
    signal.addEventListener('abort', abort, { once: true })
  })
}

function estimateUsage(conversation: AIMessage[], reply: string): TokenCounts {
  const characters = conversation.reduce(
    (sum, message) => sum + getMessageText(message).length,
    0,
  )
  return {
    cached: 1_400,
    input: Math.ceil(characters / 4),
    output: Math.ceil(reply.length / 4),
  }
}

async function* simulateReply(
  conversation: AIMessage[],
  reply: AIMessagePart[],
  signal: AbortSignal,
  parts: AIMessagePart[] = [],
): AsyncGenerator<AIReply> {
  parts.push({ type: 'step-start' })
  await wait(400, signal)
  yield { parts }
  for (const step of reply) {
    if (step.type === 'text' || step.type === 'reasoning') {
      const part: AITextPart | AIReasoningPart = { ...step, state: 'streaming', text: '' }
      parts.push(part)
      await wait(step.type === 'reasoning' ? 900 : 200, signal)
      for (const word of step.text.split(/(?<=\s)/)) {
        await wait(step.type === 'reasoning' ? 8 : 25, signal)
        part.text += word
        yield { parts }
      }
      part.state = 'done'
    } else {
      await wait(500, signal)
      parts.push(step)
      yield { parts }
    }
  }
  const written = parts
    .map((part) => {
      if (part.type === 'text' || part.type === 'reasoning') return part.text
      return isToolPart(part) ? JSON.stringify(part.input) : ''
    })
    .join('')
  yield { metadata: { usage: estimateUsage(conversation, written) }, parts }
}

async function* continueAfterApproval(
  conversation: AIMessage[],
  reply: AIMessage,
  signal: AbortSignal,
): AsyncGenerator<AIReply> {
  const parts = reply.parts.map((part) => {
    if (!isToolPart(part) || part.state !== 'approval-responded' || !part.approval) {
      return part
    }
    return part.approval.approved
      ? {
          ...part,
          approval: { ...part.approval, approved: true as const },
          output: { feature: 'Support summaries', maxOutputTokens: 400, previous: 900 },
          state: 'output-available' as const,
        }
      : {
          ...part,
          approval: { ...part.approval, approved: false as const },
          state: 'output-denied' as const,
        }
  })
  const approved = parts.some(
    (part) => isToolPart(part) && part.state === 'output-available',
  )
  yield* simulateReply(
    conversation,
    [
      text(
        approved
          ? 'Done. Support summaries now stop at **400** output tokens, down from about 900. At this month’s volume that saves about **$150** a month.'
          : 'Okay, I left the limit as it is. Support summaries still write about 900 tokens each.',
      ),
    ],
    signal,
    parts,
  )
}

function demoReply(conversation: AIMessage[], signal: AbortSignal) {
  const last = conversation.at(-1)
  if (last?.role === 'assistant') return continueAfterApproval(conversation, last, signal)
  const question = last ? getMessageText(last) : ''
  return simulateReply(conversation, cannedReplies[question] ?? fallbackReply, signal)
}

function readUsage(metadata: unknown): TokenCounts | undefined {
  if (typeof metadata !== 'object' || metadata === null || !('usage' in metadata)) {
    return undefined
  }
  const { usage } = metadata
  if (typeof usage !== 'object' || usage === null) return undefined
  const { cached, input, output } = usage as Record<string, unknown>
  if (typeof input !== 'number' || typeof output !== 'number') return undefined
  return { cached: typeof cached === 'number' ? cached : 0, input, output }
}

const tokenParts = [
  { key: 'input', label: 'Input' },
  { key: 'cached', label: 'Cached' },
  { key: 'output', label: 'Output' },
] as const

const AiAssistant3 = (props: AiAssistant3Props) => {
  const {
    description,
    messages: initialMessages = [],
    prices,
    errorMessage,
    status: blockStatus,
    suggestions,
    title,
    toolLabels,
    tokens = { input: 0, output: 0 },
  } = props
  const state = getBlockState(blockStatus, props.tokens)
  const askId = useId()
  const demo = useChatStream({ initialMessages, onSend: demoReply })
  const chat = props.chat ?? demo
  const { messages, status } = chat
  const streamingId = getStreamingMessageId(messages, status)
  const latest = messages.at(-1)
  const asked = new Set(messages.map(getMessageText))
  const remaining = suggestions.filter(
    (prompt) => !asked.has(prompt.prompt ?? prompt.label),
  )
  const total = tokens.input + (tokens.cached ?? 0) + tokens.output

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <dl className='grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-4 @md:grid-cols-3'>
          <div className='col-span-2 flex flex-col gap-1 @md:col-span-1'>
            <dt className='text-muted-foreground text-sm'>Tokens</dt>
            <dd>
              <KPIValue
                className='whitespace-nowrap'
                value={total}
                format={formatTokens}
              />
            </dd>
          </div>
          {state !== 'empty' && state !== 'error' && (
            <>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>Cost</dt>
                <dd>
                  <KPIValue
                    className='text-2xl'
                    value={getTokenCost(tokens, prices)}
                    format={formatUsd}
                  />
                </dd>
              </div>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>From the cache</dt>
                <dd>
                  <KPIValue
                    className='text-2xl'
                    value={getCacheHitRate(tokens)}
                    format={(rate) => formatPercent(rate, { maximumFractionDigits: 0 })}
                  />
                </dd>
              </div>
            </>
          )}
        </dl>
        {state !== 'empty' && state !== 'error' && (
          <>
            <div className='flex flex-col gap-2'>
              <TokenSplitBar tokens={tokens} />
              <BlockReady className='text-xs'>
                <ul className='text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs tabular-nums'>
                  {tokenParts.map((part) => (
                    <li key={part.key} className='flex items-center gap-1.5'>
                      <span
                        aria-hidden
                        className='size-2.5 rounded-[3px]'
                        style={{ backgroundColor: tokenPartColors[part.key] }}
                      />
                      {part.label}
                      <span className='text-foreground font-medium'>
                        {formatTokens(tokens[part.key] ?? 0)}
                      </span>
                    </li>
                  ))}
                </ul>
              </BlockReady>
            </div>
            <section
              aria-labelledby={askId}
              className='flex flex-col gap-3 border-t pt-4'
            >
              <h3 id={askId} className='text-sm font-medium'>
                Ask about this data
              </h3>
              <ChatMessages
                status={status}
                latest={latest}
                label='Questions about this data'
                className='max-h-96'
                contentClassName='gap-5 ps-0 pe-4 pt-0'
              >
                {state && <BlockStateRows rows={2} />}
                {!state &&
                  messages.map((message, index) => {
                    const isLast = index === messages.length - 1
                    const streaming = message.id === streamingId
                    const replyUsage = readUsage(message.metadata)
                    return (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        streaming={streaming}
                        toolLabels={toolLabels}
                        onToolApprovalResponse={chat.addToolApprovalResponse}
                        footer={
                          replyUsage &&
                          !streaming && (
                            <p className='text-muted-foreground flex justify-between gap-3 text-xs tabular-nums'>
                              <Details>
                                <span>
                                  {formatTokens(
                                    replyUsage.input + (replyUsage.cached ?? 0),
                                  )}{' '}
                                  in
                                </span>
                                <span>{formatTokens(replyUsage.output)} out</span>
                              </Details>
                              <span>{formatUsd(getTokenCost(replyUsage, prices))}</span>
                            </p>
                          )
                        }
                        actions={
                          message.role === 'assistant' &&
                          !streaming && (
                            <ChatMessageActions
                              content={getMessageText(message)}
                              onRegenerate={isLast ? chat.regenerate : undefined}
                            />
                          )
                        }
                      />
                    )
                  })}
                {!state && status === 'submitted' && !streamingId && <TypingIndicator />}
                {!state && status === 'error' && (
                  <ChatError message={chat.error?.message} onRetry={chat.regenerate} />
                )}
              </ChatMessages>
              {!state && status === 'ready' && remaining.length > 0 && (
                <SuggestedPrompts
                  label='Suggested questions'
                  prompts={remaining}
                  onSelect={(question) => chat.sendMessage({ text: question })}
                />
              )}
              <ChatComposer
                disabled={!!state}
                status={status}
                onSubmit={chat.sendMessage}
                onStop={chat.stop}
                label='Ask about this data'
                placeholder='Ask about token usage'
              />
            </section>
          </>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { AiAssistant3, exampleProps as aiAssistant3ExampleProps, type AiAssistant3Props }
