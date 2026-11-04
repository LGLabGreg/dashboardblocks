'use client'

import {
  ChatComposer,
  ChatConversation,
  ChatMessages,
  type SuggestedPrompt,
  SuggestedPrompts,
} from '@/registry/components/dashboardblocks/ai-assistant'
import {
  type AIChat,
  getMessageText,
} from '@/registry/components/dashboardblocks/ai-message'
import type { AIToolLabel } from '@/registry/components/dashboardblocks/ai-parts'
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
import { useId, useRef } from 'react'

import { Card, CardContent } from '@/components/ui/card'

interface AiAssistant3Props extends BlockStateProps {
  /**
   * The chat it runs: `useChat()` from `@ai-sdk/react`, or `useChatStream` for any other stream.
   * A reply's tokens show under it when its `metadata.usage` is `{ input, cached, output }`: send it from the route with `messageMetadata`.
   * A tool that waits for approval continues once answered when `useChat` has `sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses`.
   */
  chat: AIChat
  description: string
  prices: TokenPrices
  suggestions: SuggestedPrompt[]
  title: string
  /** What each tool is called, by its name, or `{ running, done }` for what it's doing while it runs. Others read as their name in words. */
  toolLabels?: Record<string, AIToolLabel>
  /** Leave out to show the empty state. */
  tokens?: TokenCounts
}

const exampleProps: Omit<AiAssistant3Props, 'chat'> = {
  description: 'All models this month. Output is 8% of the tokens and 38% of the cost.',
  prices: { cached: 0.3, input: 3, output: 15 },
  suggestions: [
    {
      label: 'Cap support summaries',
      prompt: 'Cap support summaries at 400 tokens',
    },
    {
      label: 'Raise the cache hit rate',
      prompt: 'How can we raise the cache hit rate?',
    },
    { label: 'Forecast next month', prompt: 'Forecast next month’s cost' },
  ],
  title: 'Token usage',
  toolLabels: {
    get_monthly_usage: {
      done: 'Read the last three months of usage',
      running: 'Reading the last three months of usage',
    },
    get_usage_by_feature: {
      done: 'Read usage by feature',
      running: 'Reading usage by feature',
    },
    set_output_limit: 'Set an output limit',
  },
  tokens: { cached: 83_000_000, input: 197_000_000, output: 25_500_000 },
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
  const { chat } = props
  const { messages, status } = chat
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const asked = new Set(messages.map(getMessageText))
  const remaining = suggestions.filter(
    (prompt) => !asked.has(prompt.prompt ?? prompt.label),
  )
  const total = tokens.input + (tokens.cached ?? 0) + tokens.output

  return (
    <Card>
      <CardContent>
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
                        format={(rate) =>
                          formatPercent(rate, { maximumFractionDigits: 0 })
                        }
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
                            style={{
                              backgroundColor: tokenPartColors[part.key],
                            }}
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
                    latest={messages.at(-1)}
                    label='Questions about this data'
                    className='max-h-96'
                    contentClassName='gap-5 ps-0 pe-4 pt-0'
                  >
                    {state && <BlockStateRows rows={2} />}
                    {!state && messages.length === 0 && (
                      <SuggestedPrompts
                        label='Suggested questions'
                        prompts={suggestions}
                        onSelect={(question) => chat.sendMessage({ text: question })}
                      />
                    )}
                    {!state && (
                      <ChatConversation
                        chat={chat}
                        composerRef={composerRef}
                        followUps={() => remaining}
                        toolLabels={toolLabels}
                        footer={(reply) => {
                          const replyUsage = readUsage(reply.metadata)
                          if (!replyUsage) return null
                          return (
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
                        }}
                      />
                    )}
                  </ChatMessages>
                  <ChatComposer
                    disabled={!!state}
                    status={status}
                    textareaRef={composerRef}
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
      </CardContent>
    </Card>
  )
}

export { AiAssistant3, exampleProps as aiAssistant3ExampleProps, type AiAssistant3Props }
