'use client'

import {
  ChatContextChip,
  ChatPanel,
  type SuggestedPrompt,
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
  isToolPart,
} from '@/registry/components/dashboardblocks/ai-message'
import type { AIToolLabel } from '@/registry/components/dashboardblocks/ai-parts'
import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
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

interface AiAssistant1Props extends BlockStateProps {
  accounts?: Account[]
  /**
   * The chat the panel runs: `useChat()` from `@ai-sdk/react`, or `useChatStream` for any other stream. Leave out to run canned replies.
   * While the page shows in the message box, each question carries `metadata: { context }`, so the server knows to add the page's data.
   */
  chat?: AIChat
  /** Follows each previous value, such as `last month`. */
  comparison: string
  context: string
  defaultOpen?: boolean
  description: string
  /** Names each point of a metric's history, oldest first. */
  historyLabels: string[]
  /** The conversation the canned replies start from. With `chat`, pass it to the chat instead. */
  messages?: AIMessage[]
  /** Leave out, or pass none, to show the empty state. */
  metrics?: Metric[]
  suggestions: SuggestedPrompt[]
  title: string
  /** What each tool is called, by its name, or `{ running, done }` for what it's doing while it runs. Others read as their name in words. */
  toolLabels?: Record<string, AIToolLabel>
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
  toolLabels: {
    find_at_risk_accounts: {
      done: 'Checked accounts for warning signs',
      running: 'Checking accounts for warning signs',
    },
  },
}

const cannedReplies: Record<string, AIMessagePart[]> = {
  'Why did churn go up this month?': [
    {
      text: 'Churn moved from 1.4% to 1.8%. Check which plans the 31 cancellations came from and whether they line up with the Sep 1 price change.',
      type: 'reasoning',
    },
    {
      text: `Churn rose from **1.4%** to **1.8%**, and most of it comes from one place:

- **Starter plans.** 23 of the 31 cancellations were Starter customers in their first 90 days.
- **Price change.** 14 of them cancelled within a week of the Sep 1 price increase.
- **Enterprise held steady.** No Enterprise account cancelled, and two expanded.

Offering Starter customers the old price for three more months would likely win back about half of those accounts.`,
      type: 'text',
    },
  ],
  'Draft a revenue update for the team': [
    {
      text: `Here's a draft you can post:

**Revenue update, September**
MRR reached **$184,320**, up 4.2% on August, with 312 new customers. Net retention is 112%, helped by two Enterprise expansions.

Churn rose to 1.8%, mostly Starter customers after the price change. Next week we'll test a win-back offer for them.`,
      type: 'text',
    },
  ],
  'Which accounts are at risk?': [
    {
      text: 'Look for falling seat use, failed payments and a run of support tickets among the top accounts, then sort by renewal date.',
      type: 'reasoning',
    },
    {
      input: { limit: 3, signals: ['seat use', 'failed payments', 'support tickets'] },
      output: [
        {
          account: 'Brightline Studio',
          mrr: 4_200,
          renews: '2026-10-14',
          signal: '19 of 42 seats used',
        },
        {
          account: 'Kestrel Analytics',
          mrr: 3_780,
          renews: '2026-11-02',
          signal: 'Two failed payments',
        },
        {
          account: 'Oakridge Dental Group',
          mrr: 2_640,
          renews: '2026-12-09',
          signal: '4 export tickets',
        },
      ],
      state: 'output-available',
      toolCallId: 'call-at-risk',
      type: 'tool-find_at_risk_accounts',
    },
    {
      text: `Three accounts show the usual warning signs:

| Account | Signal | MRR | Renews |
| :-- | :-- | --: | :-- |
| Brightline Studio | 19 of 42 seats used | $4,200 | Oct 14 |
| Kestrel Analytics | Two failed payments | $3,780 | Nov 2 |
| Oakridge Dental Group | 4 export tickets | $2,640 | Dec 9 |

Together they're **$10,620** of MRR. Brightline renews first, so start there.`,
      type: 'text',
    },
  ],
}

const fallbackReply: AIMessagePart[] = [
  {
    text: 'This is a demo reply. Pass `chat` to stream answers from your own model, with the page’s data as context.',
    type: 'text',
  },
]

const noContextReply: AIMessagePart[] = [
  {
    text: 'I can’t see this page without its context. Add it back to the message box to ask about these numbers.',
    type: 'text',
  },
]

function hasContext(metadata: unknown) {
  return typeof metadata === 'object' && metadata !== null && 'context' in metadata
}

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

async function* simulateReply(
  reply: AIMessagePart[],
  signal: AbortSignal,
): AsyncGenerator<AIReply> {
  const parts: AIMessagePart[] = [{ type: 'step-start' }]
  await wait(400, signal)
  yield { parts }
  for (const step of reply) {
    if (isToolPart(step)) {
      const part = { ...step, output: undefined, state: 'input-available' as const }
      parts.push(part)
      yield { parts }
      await wait(900, signal)
      Object.assign(part, { output: step.output, state: step.state })
      yield { parts }
      continue
    }
    if (step.type !== 'text' && step.type !== 'reasoning') continue
    const part: AITextPart | AIReasoningPart = {
      ...step,
      state: 'streaming',
      text: '',
    }
    parts.push(part)
    await wait(step.type === 'reasoning' ? 900 : 200, signal)
    for (const word of step.text.split(/(?<=\s)/)) {
      await wait(step.type === 'reasoning' ? 8 : 25, signal)
      part.text += word
      yield { parts }
    }
    part.state = 'done'
  }
  yield { parts }
}

const AiAssistant1 = (props: AiAssistant1Props) => {
  const {
    accounts = [],
    comparison,
    context: contextLabel,
    defaultOpen = true,
    description,
    historyLabels,
    messages: initialMessages = [],
    metrics = [],
    errorMessage,
    status: blockStatus,
    suggestions,
    title,
    toolLabels,
  } = props
  const state = getBlockState(blockStatus, metrics)
  const shown: (StatMetric & { history?: number[] })[] =
    blockStatus === 'loading' ? getStatPlaceholders(4) : metrics
  const accountsMrr = accounts.reduce((sum, account) => sum + account.mrr, 0)
  const panelId = useId()
  const [open, setOpen] = useState(defaultOpen)
  const [withContext, setWithContext] = useState(true)
  const demo = useChatStream({
    initialMessages,
    onSend: (conversation, signal) => {
      const last = conversation.at(-1)
      const question = getMessageText(last ?? { parts: [] })
      const reply = hasContext(last?.metadata)
        ? (cannedReplies[question] ?? fallbackReply)
        : noContextReply
      return simulateReply(reply, signal)
    },
  })
  const baseChat = props.chat ?? demo
  const chat: AIChat = {
    ...baseChat,
    sendMessage: (message) =>
      baseChat.sendMessage({
        ...message,
        metadata: withContext ? { context: contextLabel } : undefined,
      }),
  }
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const focusNext = useRef<'composer' | 'toggle' | null>(null)

  useEffect(() => {
    const target = focusNext.current === 'composer' ? composerRef : toggleRef
    if (focusNext.current) target.current?.focus()
    focusNext.current = null
  }, [open])

  function close() {
    focusNext.current = 'toggle'
    setOpen(false)
  }

  return (
    <div className='bg-background @container flex h-svh'>
      <BlockStateProvider errorMessage={errorMessage} state={state}>
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
      </BlockStateProvider>
      {open && (
        <ChatPanel
          id={panelId}
          className='w-full border-s @3xl:w-96'
          chat={chat}
          title='Assistant'
          description='Answers from your revenue data'
          placeholder='Ask about this page'
          suggestions={suggestions}
          textareaRef={composerRef}
          toolLabels={toolLabels}
          onClose={close}
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
      )}
    </div>
  )
}

export { AiAssistant1, exampleProps as aiAssistant1ExampleProps, type AiAssistant1Props }
