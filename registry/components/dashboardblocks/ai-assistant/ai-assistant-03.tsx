'use client'

import {
  ChatComposer,
  ChatError,
  ChatMessage,
  type ChatMessageData,
  ChatMessageActions,
  ChatMessages,
  type SuggestedPrompt,
  SuggestedPrompts,
  TypingIndicator,
  useChatStream,
} from '@/registry/components/dashboardblocks/ai-assistant'
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
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { Details } from '@/registry/components/dashboardblocks/details'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { formatPercent } from '@/registry/lib/dashboardblocks/format'
import { useId, useState } from 'react'

interface AiAssistant3Props {
  description: string
  messages: ChatMessageData[]
  /** Streams the reply to the conversation as chunks of text. */
  onSend?: (messages: ChatMessageData[], signal: AbortSignal) => AsyncIterable<string>
  prices: TokenPrices
  status?: BlockStatus
  suggestions: SuggestedPrompt[]
  title: string
  /** Leave out to show the empty state. */
  tokens?: TokenCounts
  usage: Record<string, TokenCounts>
}

const exampleProps: AiAssistant3Props = {
  description: 'All models this month. Output is 8% of the tokens and 38% of the cost.',
  messages: [
    {
      content: 'What drove the cost this month?',
      id: '1',
      role: 'user',
    },
    {
      content: `Output tokens: they're **8%** of the tokens but **38%** of the cost, at five times the input price. Most come from the support summaries feature, which writes about 900 tokens per ticket.

Capping summaries at 400 tokens would save roughly **$150** a month.`,
      id: '2',
      role: 'assistant',
    },
  ],
  prices: { cached: 0.3, input: 3, output: 15 },
  suggestions: [
    {
      label: 'Raise the cache hit rate',
      prompt: 'How can we raise the cache hit rate?',
    },
    { label: 'Forecast next month’s cost' },
  ],
  title: 'Token usage',
  tokens: { cached: 83_000_000, input: 197_000_000, output: 25_500_000 },
  usage: { '2': { cached: 1_400, input: 620, output: 96 } },
}

const cannedReplies: Record<string, string> = {
  'Forecast next month’s cost': `At this month's pace, next month comes to about **$1,040**:

- **Input:** 205M tokens, $615
- **Cached input:** 88M tokens, $26
- **Output:** 26.5M tokens, $398

That assumes support volume grows 4%, as it has for the last three months.`,
  'How can we raise the cache hit rate?': `**30%** of input tokens come from the cache now. Two changes would raise it:

1. **Put the system prompt and tool definitions first**, and anything that changes per request after them. Only an identical prefix is cached.
2. **Reuse the same knowledge base snippet order** in support summaries. Today it's sorted by relevance, so the prefix rarely matches.

Together they could lift the hit rate to about 55%, saving around $180 a month.`,
}

const fallbackReply =
  'This is a demo reply. Pass `onSend` to stream answers from your own model, with this data as context.'

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

async function* simulateStream(messages: ChatMessageData[], signal: AbortSignal) {
  const question = messages.at(-1)?.content ?? ''
  const reply = cannedReplies[question] ?? fallbackReply
  await wait(700, signal)
  for (const word of reply.split(/(?<=\s)/)) {
    await wait(25, signal)
    yield word
  }
}

function estimateUsage(conversation: ChatMessageData[]): TokenCounts {
  const reply = conversation.at(-1)?.content ?? ''
  const characters = conversation.reduce(
    (sum, message) => sum + message.content.length,
    0,
  )
  return {
    cached: 1_400,
    input: Math.ceil((characters - reply.length) / 4),
    output: Math.ceil(reply.length / 4),
  }
}

const tokenParts = [
  { key: 'input', label: 'Input' },
  { key: 'cached', label: 'Cached' },
  { key: 'output', label: 'Output' },
] as const

const AiAssistant3 = (props: AiAssistant3Props) => {
  const {
    description,
    messages: initialMessages,
    onSend = simulateStream,
    prices,
    status: blockStatus,
    suggestions,
    title,
    tokens = { input: 0, output: 0 },
    usage: initialUsage,
  } = props
  const state = getBlockState(blockStatus, props.tokens)
  const askId = useId()
  const [usage, setUsage] = useState(initialUsage)
  const chat = useChatStream({
    initialMessages,
    onFinish: (reply, { messages: conversation }) =>
      setUsage((current) => ({
        ...current,
        [reply.id]: estimateUsage(conversation),
      })),
    onSend,
  })
  const { messages, status } = chat
  const latest = messages.at(-1)
  const asked = new Set(messages.map((message) => message.content))
  const remaining = suggestions.filter(
    (prompt) => !asked.has(prompt.prompt ?? prompt.label),
  )
  const total = tokens.input + (tokens.cached ?? 0) + tokens.output

  return (
    <BlockStateProvider state={state}>
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
                    const streaming = isLast && status === 'streaming'
                    const replyUsage = usage[message.id]
                    return (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        streaming={streaming}
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
                              content={message.content}
                              onRegenerate={isLast ? chat.regenerate : undefined}
                            />
                          )
                        }
                      />
                    )
                  })}
                {!state && status === 'submitted' && <TypingIndicator />}
                {!state && status === 'error' && (
                  <ChatError message={chat.error} onRetry={chat.regenerate} />
                )}
              </ChatMessages>
              {!state && status === 'ready' && remaining.length > 0 && (
                <SuggestedPrompts
                  label='Suggested questions'
                  prompts={remaining}
                  onSelect={chat.send}
                />
              )}
              <ChatComposer
                disabled={!!state}
                status={status}
                onSubmit={chat.send}
                onStop={chat.stop}
                label='Ask about this data'
                placeholder='Ask about token usage…'
              />
            </section>
          </>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { AiAssistant3, exampleProps as aiAssistant3ExampleProps, type AiAssistant3Props }
