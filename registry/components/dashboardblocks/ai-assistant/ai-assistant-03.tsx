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
import { useState } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface AiAssistant3Props {
  description: string
  messages: ChatMessageData[]
  /** Streams the reply to the conversation as chunks of text. Defaults to canned demo replies. */
  onSend?: (messages: ChatMessageData[], signal: AbortSignal) => AsyncIterable<string>
  /** What the assistant's own model charges, to price each reply. */
  prices: TokenPrices
  suggestions: SuggestedPrompt[]
  title: string
  /** The usage the card reports on. */
  tokens: TokenCounts
  /** Tokens each reply used, by message id. Pass your provider's usage. */
  usage: Record<string, TokenCounts>
}

const exampleProps: AiAssistant3Props = {
  description: 'All models, this month',
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
    { label: 'How can we raise the cache hit rate?' },
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
  'This is a demo reply. Pass `onSend` to stream answers from your own model, with the card’s data as context.'

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

/** Stands in for your model: streams a canned answer word by word. */
async function* simulateStream(messages: ChatMessageData[], signal: AbortSignal) {
  const question = messages.at(-1)?.content ?? ''
  const reply = cannedReplies[question] ?? fallbackReply
  await wait(700, signal)
  for (const word of reply.split(/(?<=\s)/)) {
    await wait(25, signal)
    yield word
  }
}

/**
 * A rough count for the demo, about four characters a token, with a cached
 * system prompt. Use the usage your provider returns instead.
 */
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

const legend = [
  { color: tokenPartColors.input, key: 'input', label: 'Input' },
  { color: tokenPartColors.cached, key: 'cached', label: 'Cached' },
  { color: tokenPartColors.output, key: 'output', label: 'Output' },
] as const

const AiAssistant3 = (props: AiAssistant3Props) => {
  const {
    description,
    messages: initialMessages,
    onSend = simulateStream,
    prices,
    suggestions,
    title,
    tokens,
    usage: initialUsage,
  } = props
  const [usage, setUsage] = useState(initialUsage)
  const chat = useChatStream({
    initialMessages,
    onFinish: (reply, { messages: conversation }) =>
      setUsage((current) => ({ ...current, [reply.id]: estimateUsage(conversation) })),
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <dl className='grid grid-cols-3 gap-4'>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Tokens</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {formatTokens(total)}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Cost</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {formatUsd(getTokenCost(tokens, prices))}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Cache hits</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {Math.round(getCacheHitRate(tokens) * 100)}%
            </dd>
          </div>
        </dl>
        <div className='flex flex-col gap-2'>
          <TokenSplitBar tokens={tokens} />
          <ul className='text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs tabular-nums'>
            {legend.map((part) => (
              <li key={part.key} className='flex items-center gap-1.5'>
                <span
                  aria-hidden
                  className='size-2.5 rounded-[3px]'
                  style={{ backgroundColor: part.color }}
                />
                {part.label} {formatTokens(tokens[part.key] ?? 0)}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <section aria-label='Ask about this data' className='flex flex-col border-t'>
        <ChatMessages
          status={status}
          latest={latest}
          label='Questions about this data'
          className='max-h-96'
          contentClassName='gap-5 px-(--card-spacing)'
        >
          {messages.map((message, index) => {
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
                    <p className='text-muted-foreground text-xs tabular-nums'>
                      {formatTokens(replyUsage.input + (replyUsage.cached ?? 0))} in ·{' '}
                      {formatTokens(replyUsage.output)} out ·{' '}
                      {formatUsd(getTokenCost(replyUsage, prices))}
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
          {status === 'submitted' && <TypingIndicator />}
          {status === 'error' && (
            <ChatError message={chat.error} onRetry={chat.regenerate} />
          )}
        </ChatMessages>
        <div className='flex flex-col gap-3 px-(--card-spacing)'>
          {status === 'ready' && remaining.length > 0 && (
            <SuggestedPrompts
              label='Suggested questions'
              prompts={remaining}
              onSelect={chat.send}
            />
          )}
          <ChatComposer
            status={status}
            onSubmit={chat.send}
            onStop={chat.stop}
            label='Ask about this data'
            placeholder='Ask about token usage…'
          />
        </div>
      </section>
    </Card>
  )
}

export { AiAssistant3, exampleProps as aiAssistant3ExampleProps, type AiAssistant3Props }
