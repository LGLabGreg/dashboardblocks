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
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useEffect, useId, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Metric {
  change: string
  label: string
  value: string
}

interface Account {
  mrr: string
  name: string
  plan: string
}

interface AiAssistant1Props {
  accounts: Account[]
  /** What the assistant can see, shown as a chip in the message box. */
  context: string
  /** Open the assistant on load. */
  defaultOpen?: boolean
  description: string
  messages: ChatMessageData[]
  metrics: Metric[]
  /**
   * Streams the reply to the conversation as chunks of text. `context` is the
   * page's label while its chip is in the message box. Defaults to canned demo replies.
   */
  onSend?: (
    messages: ChatMessageData[],
    signal: AbortSignal,
    context?: string,
  ) => AsyncIterable<string>
  suggestions: SuggestedPrompt[]
  title: string
}

const exampleProps: AiAssistant1Props = {
  accounts: [
    { mrr: '$12,400', name: 'Northwind Logistics', plan: 'Enterprise' },
    { mrr: '$8,950', name: 'Helio Health', plan: 'Enterprise' },
    { mrr: '$4,200', name: 'Brightline Studio', plan: 'Growth' },
    { mrr: '$3,780', name: 'Kestrel Analytics', plan: 'Growth' },
    { mrr: '$2,640', name: 'Oakridge Dental Group', plan: 'Growth' },
  ],
  context: 'Revenue · Last 30 days',
  defaultOpen: true,
  description: 'Recurring revenue and customers, last 30 days',
  messages: [],
  metrics: [
    { change: '+4.2%', label: 'MRR', value: '$184,320' },
    { change: '+38', label: 'New customers', value: '312' },
    { change: '+0.4 pts', label: 'Churn', value: '1.8%' },
    { change: '+2 pts', label: 'Net retention', value: '112%' },
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

/** Stands in for your model: streams a canned answer word by word. */
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
    accounts,
    context: contextLabel,
    defaultOpen = true,
    description,
    messages: initialMessages,
    metrics,
    onSend = simulateStream,
    suggestions,
    title,
  } = props
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
    <div className='bg-background @container flex h-svh'>
      <div
        className={
          open
            ? '@container/main hidden min-w-0 flex-1 flex-col @3xl:flex'
            : '@container/main flex min-w-0 flex-1 flex-col'
        }
      >
        <header className='flex items-center justify-between gap-4 border-b px-4 py-3 @xl/main:px-6'>
          <div className='flex min-w-0 flex-col'>
            <h1 className='truncate text-lg font-semibold tracking-tight'>{title}</h1>
            <p className='text-muted-foreground truncate text-sm'>{description}</p>
          </div>
          <Button
            ref={toggleRef}
            variant='outline'
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
        <div className='flex flex-1 flex-col gap-4 overflow-y-auto p-4 @xl/main:p-6'>
          <div className='grid grid-cols-2 gap-4 @2xl/main:grid-cols-4'>
            {metrics.map((metric) => (
              <Card key={metric.label} size='sm'>
                <CardContent>
                  <dl className='flex flex-col gap-1'>
                    <dt className='text-muted-foreground text-xs'>{metric.label}</dt>
                    <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
                      {metric.value}
                    </dd>
                    <dd className='text-muted-foreground text-xs tabular-nums'>
                      {metric.change} on last month
                    </dd>
                  </dl>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Top accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className='divide-y'>
                {accounts.map((account) => (
                  <li
                    key={account.name}
                    className='flex items-center justify-between gap-4 py-2.5 text-sm first:pt-0 last:pb-0'
                  >
                    <span className='flex min-w-0 flex-col'>
                      <span className='truncate font-medium'>{account.name}</span>
                      <span className='text-muted-foreground text-xs'>
                        {account.plan}
                      </span>
                    </span>
                    <span className='tabular-nums'>{account.mrr}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      {open && (
        <aside
          id={panelId}
          aria-label='Assistant'
          className='bg-background flex w-full flex-col border-l @3xl:w-96'
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
                <SuggestedPrompts variant='list' prompts={suggestions} onSelect={send} />
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
  )
}

export { AiAssistant1, exampleProps as aiAssistant1ExampleProps, type AiAssistant1Props }
