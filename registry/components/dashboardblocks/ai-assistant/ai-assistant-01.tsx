'use client'

import {
  ChatComposer,
  ChatContextChip,
  ChatError,
  ChatHeader,
  ChatMessage,
  type ChatMessageData,
  ChatMessageActions,
  ChatMessages,
  ChatWelcome,
  type SuggestedPrompt,
  SuggestedPrompts,
  TypingIndicator,
  useChatStream,
} from '@/registry/components/dashboardblocks/ai-assistant'
import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  Stat,
  StatChange,
  StatGroup,
  StatLabel,
  type StatMetric,
  StatSparkline,
  StatValue,
  formatStatValue,
  getStatPlaceholders,
} from '@/registry/components/dashboardblocks/stat-group'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatCurrency, formatPercent } from '@/registry/lib/dashboardblocks/format'
import { useEffect, useId, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

interface Metric extends StatMetric {
  /** Oldest first, ending with `value`. */
  history: number[]
}

interface Account {
  mrr: number
  name: string
  plan: string
}

interface AiAssistant1Props {
  accounts?: Account[]
  /** Follows each previous value, such as `last month`. */
  comparison: string
  context: string
  defaultOpen?: boolean
  description: string
  /** Names each point of a metric's history, oldest first. */
  historyLabels: string[]
  messages: ChatMessageData[]
  /** Leave out, or pass none, to show the empty state. */
  metrics?: Metric[]
  /** Streams the reply to the conversation as chunks of text. */
  onSend?: (
    messages: ChatMessageData[],
    signal: AbortSignal,
    context?: string,
  ) => AsyncIterable<string>
  status?: BlockStatus
  suggestions: SuggestedPrompt[]
  title: string
}

const asCurrency = (value: number) => formatCurrency(value)
const asPercent = (value: number) => formatPercent(value / 100)

const exampleProps: AiAssistant1Props = {
  accounts: [
    { mrr: 12_400, name: 'Northwind Logistics', plan: 'Enterprise' },
    { mrr: 8_950, name: 'Helio Health', plan: 'Enterprise' },
    { mrr: 4_200, name: 'Brightline Studio', plan: 'Growth' },
    { mrr: 3_780, name: 'Kestrel Analytics', plan: 'Growth' },
    { mrr: 2_640, name: 'Oakridge Dental Group', plan: 'Growth' },
  ],
  comparison: 'last month',
  context: 'Revenue, last 30 days',
  defaultOpen: true,
  description: 'Recurring revenue and customers over the last 30 days.',
  historyLabels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
  messages: [],
  metrics: [
    {
      formatter: asCurrency,
      history: [151_200, 158_900, 164_400, 171_050, 176_890, 184_320],
      key: 'mrr',
      label: 'MRR',
      previous: 176_890,
      value: 184_320,
    },
    {
      history: [241, 266, 258, 289, 274, 312],
      key: 'customers',
      label: 'New customers',
      previous: 274,
      value: 312,
    },
    {
      changeType: 'points',
      formatter: asPercent,
      goodDirection: 'down',
      history: [1.6, 1.5, 1.3, 1.5, 1.4, 1.8],
      key: 'churn',
      label: 'Churn',
      previous: 1.4,
      value: 1.8,
    },
    {
      changeType: 'points',
      formatter: asPercent,
      history: [106, 107, 109, 108, 110, 112],
      key: 'retention',
      label: 'Net retention',
      previous: 110,
      value: 112,
    },
  ],
  suggestions: [
    {
      icon: (
        <IconPlaceholder
          lucide='TrendingDownIcon'
          tabler='IconTrendingDown'
          hugeicons='ChartDownIcon'
          phosphor='TrendDownIcon'
          remixicon='RiArrowDownLine'
        />
      ),
      label: 'Why did churn go up this month?',
    },
    {
      icon: (
        <IconPlaceholder
          lucide='TriangleAlertIcon'
          tabler='IconAlertTriangle'
          hugeicons='Alert02Icon'
          phosphor='WarningIcon'
          remixicon='RiErrorWarningLine'
        />
      ),
      label: 'Which accounts are at risk?',
    },
    {
      icon: (
        <IconPlaceholder
          lucide='PencilIcon'
          tabler='IconPencil'
          hugeicons='PencilEdit02Icon'
          phosphor='PencilSimpleIcon'
          remixicon='RiPencilLine'
        />
      ),
      label: 'Draft a revenue update for the team',
    },
  ],
  title: 'Revenue',
}

const cannedReplies: Record<string, string> = {
  'Why did churn go up this month?': `Churn rose from **1.4%** to **1.8%**, and most of it comes from one place:

- **Starter plans.** 23 of the 31 cancellations were Starter customers in their first 90 days.
- **Price change.** 14 of them cancelled within a week of the Sep 1 price increase.
- **Enterprise held steady.** No Enterprise account cancelled, and two expanded.

Offering Starter customers the old price for three more months would likely win back about half of those accounts.`,
  'Draft a revenue update for the team': `Here's a draft you can post:

**Revenue update, September**
MRR reached **$184,320**, up 4.2% on August, with 312 new customers. Net retention is 112%, helped by two Enterprise expansions.

Churn rose to 1.8%, mostly Starter customers after the price change. Next week we'll test a win-back offer for them.`,
  'Which accounts are at risk?': `Three accounts show the usual warning signs:

1. **Brightline Studio**: seats used fell from 42 to 19 since August, and their admin hasn't logged in for 12 days.
2. **Kestrel Analytics**: two failed payments this month; the card on file expires Sep 30.
3. **Oakridge Dental Group**: opened 4 support tickets about exports in the last two weeks.

Together they're **$10,620** of MRR. Brightline renews first, on Oct 14.`,
}

const fallbackReply =
  'This is a demo reply. Pass `onSend` to stream answers from your own model, with the page’s data as context.'

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

async function* simulateStream(
  messages: ChatMessageData[],
  signal: AbortSignal,
  context?: string,
) {
  const question = messages.at(-1)?.content ?? ''
  const reply = context
    ? (cannedReplies[question] ?? fallbackReply)
    : 'I can’t see this page without its context. Add it back to the message box to ask about these numbers.'
  await wait(700, signal)
  for (const word of reply.split(/(?<=\s)/)) {
    await wait(25, signal)
    yield word
  }
}

const AiAssistant1 = (props: AiAssistant1Props) => {
  const {
    accounts = [],
    comparison,
    context: contextLabel,
    defaultOpen = true,
    description,
    historyLabels,
    messages: initialMessages,
    metrics = [],
    onSend = simulateStream,
    status: blockStatus,
    suggestions,
    title,
  } = props
  const state = getBlockState(blockStatus, metrics)
  const shown: (StatMetric & { history?: number[] })[] =
    blockStatus === 'loading' ? getStatPlaceholders(4) : metrics
  const accountsMrr = accounts.reduce((sum, account) => sum + account.mrr, 0)
  const panelId = useId()
  const [open, setOpen] = useState(defaultOpen)
  const [withContext, setWithContext] = useState(true)
  const chat = useChatStream({
    initialMessages,
    onSend: (conversation, signal) =>
      onSend(conversation, signal, withContext ? contextLabel : undefined),
  })
  const { messages, status } = chat
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const focusNext = useRef<'composer' | 'toggle' | null>(null)
  const latest = messages.at(-1)

  useEffect(() => {
    const target = focusNext.current === 'composer' ? composerRef : toggleRef
    if (focusNext.current) target.current?.focus()
    focusNext.current = null
  }, [open])

  function send(text: string) {
    chat.send(text)
    composerRef.current?.focus()
  }

  function newChat() {
    chat.reset()
    composerRef.current?.focus()
  }

  return (
    <BlockStateProvider state={state}>
      <div className='bg-background @container flex h-svh'>
        <div
          className={
            open
              ? '@container/main hidden min-w-0 flex-1 flex-col @3xl:flex'
              : '@container/main flex min-w-0 flex-1 flex-col'
          }
        >
          <div className='flex flex-1 flex-col gap-8 overflow-y-auto p-4 @xl/main:p-6'>
            <header className='flex items-end justify-between gap-4'>
              <div className='flex min-w-0 flex-col gap-0.5'>
                <h1 className='truncate text-2xl font-semibold tracking-tight'>
                  {title}
                </h1>
                <p className='text-muted-foreground truncate text-sm'>{description}</p>
              </div>
              <Button
                ref={toggleRef}
                variant='outline'
                size='sm'
                aria-expanded={open}
                aria-controls={open ? panelId : undefined}
                onClick={() => {
                  focusNext.current = open ? 'toggle' : 'composer'
                  setOpen(!open)
                }}
              >
                <IconPlaceholder
                  lucide='SparklesIcon'
                  tabler='IconSparkles'
                  hugeicons='SparklesIcon'
                  phosphor='SparkleIcon'
                  remixicon='RiSparklingLine'
                  data-icon='inline-start'
                />
                Ask AI
              </Button>
            </header>
            <StatGroup className='grid-cols-1 @md/main:grid-cols-2 @4xl/main:grid-cols-4'>
              {shown.map((metric) => (
                <Stat key={metric.key}>
                  <StatLabel>{metric.label}</StatLabel>
                  <StatValue className='text-3xl @2xl/main:text-4xl'>
                    {formatStatValue(metric)}
                  </StatValue>
                  <StatChange comparison={comparison} metric={metric} />
                  <dd className='mt-2'>
                    <StatSparkline
                      data={metric.history ?? []}
                      formatter={metric.formatter}
                      label={`${metric.label} by month, ${historyLabels[0]} to ${historyLabels.at(-1)}`}
                      labels={historyLabels}
                    />
                  </dd>
                </Stat>
              ))}
            </StatGroup>
            {state !== 'empty' && state !== 'error' && (
              <section
                aria-labelledby={`${panelId}-accounts`}
                className='flex flex-col gap-3'
              >
                <header className='flex flex-col gap-0.5'>
                  <h2 id={`${panelId}-accounts`} className='font-semibold tracking-tight'>
                    Top accounts
                  </h2>
                  <BlockReady className='text-sm'>
                    <p className='text-muted-foreground text-sm'>
                      Your {accounts.length} largest accounts pay{' '}
                      {formatCurrency(accountsMrr)} a month.
                    </p>
                  </BlockReady>
                </header>
                {state === 'loading' ? (
                  <BlockStateRows className='border-y' rows={5} />
                ) : (
                  <ul className='divide-y border-y'>
                    {accounts.map((account) => (
                      <li
                        key={account.name}
                        className='flex items-center justify-between gap-4 py-2.5 text-sm'
                      >
                        <span className='flex min-w-0 flex-col'>
                          <span className='truncate font-medium'>{account.name}</span>
                          <span className='text-muted-foreground text-xs'>
                            {account.plan}
                          </span>
                        </span>
                        <span className='tabular-nums'>
                          {formatCurrency(account.mrr)}
                          <span className='text-muted-foreground'>/mo</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </div>
        </div>
        {open && (
          <aside
            id={panelId}
            aria-label='Assistant'
            className='bg-background flex w-full flex-col border-s @3xl:w-96'
          >
            <ChatHeader
              title='Assistant'
              description='Answers from your revenue data'
              className='border-b'
              actions={
                <>
                  <Button
                    variant='ghost'
                    size='icon-sm'
                    aria-label='New chat'
                    disabled={messages.length === 0}
                    onClick={newChat}
                  >
                    <IconPlaceholder
                      lucide='SquarePenIcon'
                      tabler='IconEdit'
                      hugeicons='PencilEdit02Icon'
                      phosphor='NotePencilIcon'
                      remixicon='RiEditBoxLine'
                    />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon-sm'
                    aria-label='Close assistant'
                    onClick={() => {
                      focusNext.current = 'toggle'
                      setOpen(false)
                    }}
                  >
                    <IconPlaceholder
                      lucide='XIcon'
                      tabler='IconX'
                      hugeicons='Cancel01Icon'
                      phosphor='XIcon'
                      remixicon='RiCloseLine'
                    />
                  </Button>
                </>
              }
            />
            {messages.length === 0 ? (
              <div className='flex min-h-0 flex-1 flex-col overflow-y-auto p-4'>
                <ChatWelcome
                  className='m-auto'
                  title='How can I help?'
                  description='Ask about revenue, customers or churn on this page.'
                >
                  <SuggestedPrompts
                    variant='list'
                    prompts={suggestions}
                    onSelect={send}
                  />
                </ChatWelcome>
              </div>
            ) : (
              <ChatMessages status={status} latest={latest}>
                {messages.map((message, index) => {
                  const isLast = index === messages.length - 1
                  const streaming = isLast && status === 'streaming'
                  return (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      streaming={streaming}
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
            )}
            <ChatComposer
              className='p-4 pt-0'
              textareaRef={composerRef}
              status={status}
              onSubmit={chat.send}
              onStop={chat.stop}
              placeholder='Ask about this page…'
              context={
                withContext && (
                  <ChatContextChip
                    label={contextLabel}
                    icon={
                      <IconPlaceholder
                        lucide='LayoutDashboardIcon'
                        tabler='IconDashboard'
                        hugeicons='DashboardSquare01Icon'
                        phosphor='SquaresFourIcon'
                        remixicon='RiDashboardLine'
                      />
                    }
                    onRemove={() => {
                      setWithContext(false)
                      composerRef.current?.focus()
                    }}
                  />
                )
              }
            />
          </aside>
        )}
      </div>
    </BlockStateProvider>
  )
}

export { AiAssistant1, exampleProps as aiAssistant1ExampleProps, type AiAssistant1Props }
