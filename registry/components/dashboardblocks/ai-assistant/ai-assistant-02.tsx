'use client'

import {
  type ChatFeedback,
  ChatComposer,
  ChatConversation,
  ChatMessages,
  ChatWelcome,
  type SuggestedPrompt,
  SuggestedPrompts,
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
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { useRef, useState } from 'react'

interface AiAssistant2Props extends BlockStateProps {
  /** The chat it runs: `useChat()` from `@ai-sdk/react`, or `useChatStream` for any other stream. Leave out to run canned replies. */
  chat?: AIChat
  description: string
  /** Suggested next questions, under the last reply and in a new chat. */
  followUps: SuggestedPrompt[]
  /** The conversation the canned replies start from. With `chat`, pass it to the chat instead. Leave out, or pass none, for a new chat. */
  messages?: AIMessage[]
  onFeedback?: (messageId: string, feedback: ChatFeedback | null) => void
  title: string
  /** What each tool is called, by its name, or `{ running, done }` for what it's doing while it runs. Others read as their name in words. */
  toolLabels?: Record<string, AIToolLabel>
}

const text = (value: string): AIMessagePart => ({
  state: 'done',
  text: value,
  type: 'text',
})

const exampleProps: AiAssistant2Props = {
  description: 'Answers from your product analytics, with the query behind each one.',
  followUps: [
    { label: 'Compare with last week', prompt: 'Compare with the week before' },
    {
      label: 'Pages that lost sessions',
      prompt: 'Which pages lost the most sessions?',
    },
    {
      label: 'Note for payments',
      prompt: 'Draft a note for the payments team',
    },
  ],
  messages: [
    {
      id: '1',
      parts: [text('Why did checkout conversion drop last week?')],
      role: 'user',
    },
    {
      id: '2',
      parts: [
        { type: 'step-start' },
        {
          state: 'done',
          text: 'Compare Sep 15–21 with the week before: conversion by browser, shipping estimates shown, and traffic by channel.',
          type: 'reasoning',
        },
        text(`Checkout conversion fell from **3.8%** to **3.1%** between Sep 15 and Sep 21. Three things changed that week:

- **Safari 17 payment errors.** 41% of failed checkouts were on Safari 17, starting with the Sep 15 release.
- **Longer shipping estimates.** Standard delivery showed 5–7 days instead of 3–5 for EU addresses.
- **More paid social traffic.** Sessions from paid social doubled, and they convert at 1.2%.

The Safari errors explain most of the drop. Fixing them should win back about half a point.`),
      ],
      role: 'assistant',
    },
    {
      id: '3',
      parts: [text('Can you give me the SQL to check the Safari errors?')],
      role: 'user',
    },
    {
      id: '4',
      parts: [
        text(`This counts started and failed checkouts by browser for that week, from the \`events\` table:

\`\`\`sql
select
  browser,
  count(*) filter (where name = 'checkout_started') as started,
  count(*) filter (where name = 'checkout_failed') as failed,
  round(100.0 * count(*) filter (where name = 'checkout_failed')
    / nullif(count(*) filter (where name = 'checkout_started'), 0), 1) as failure_rate
from events
where occurred_at >= '2026-09-15' and occurred_at < '2026-09-22'
group by browser
order by failed desc;
\`\`\`

If Safari's \`failure_rate\` is well above the other browsers, the release is the likely cause.`),
      ],
      role: 'assistant',
    },
  ],
  title: 'Analytics assistant',
  toolLabels: {
    compare_weeks: {
      done: 'Compared the two weeks',
      running: 'Comparing the two weeks',
    },
  },
}

const cannedReplies: Record<string, AIMessagePart[]> = {
  'Compare with the week before': [
    {
      text: 'Line up sessions, checkouts started and orders for Sep 15–21 against Sep 8–14.',
      type: 'reasoning',
    },
    {
      input: {
        metrics: ['sessions', 'checkouts_started', 'orders'],
        weeks: ['2026-09-08', '2026-09-15'],
      },
      output: [
        { metric: 'sessions', previous: 44_230, value: 48_210 },
        { metric: 'checkouts_started', previous: 3_827, value: 3_904 },
        { metric: 'orders', previous: 1_680, value: 1_495 },
      ],
      state: 'output-available',
      toolCallId: 'call-compare',
      type: 'tool-compare_weeks',
    },
    text(`Against Sep 8–14, last week had:

| Metric | Last week | Change |
| :-- | --: | --: |
| Sessions | 48,210 | Up 9% |
| Checkouts started | 3,904 | Up 2% |
| Orders | 1,495 | Down 11% |

Traffic grew but orders fell, so the problem is inside checkout rather than in getting people there.`),
  ],
  'Draft a note for the payments team': [
    text(`Here's a draft:

Hi team, checkout conversion dropped from 3.8% to 3.1% last week. 41% of failed checkouts were on Safari 17, starting with the Sep 15 release, and the payment sheet closes before the 3-D Secure frame loads. Could you take a look this sprint? Happy to share the query and session recordings.`),
  ],
  'Which pages lost the most sessions?': [
    {
      text: 'Rank pages by the fall in sessions week on week, then check what changed on the biggest one.',
      type: 'reasoning',
    },
    text(`The biggest drops, week on week:

1. \`/pricing\`: 6,120 sessions, down 18%
2. \`/checkout/shipping\`: 3,410, down 12%
3. \`/blog/fall-release\`: 2,980, down 9%

The pricing page dropped after its hero image failed to load on mobile from Sep 16.`),
  ],
}

const regeneratedReply: AIMessagePart[] = [
  text(`Here's another way to check it, grouped by browser version so you can see whether only Safari 17 is affected:

\`\`\`sql
select browser, browser_version, count(*) as failed
from events
where name = 'checkout_failed'
  and occurred_at >= '2026-09-15'
group by browser, browser_version
order by failed desc
limit 10;
\`\`\``),
]

const fallbackReply: AIMessagePart[] = [
  text('This is a demo reply. Pass `chat` to stream answers from your own model.'),
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
    const part: AITextPart | AIReasoningPart = { ...step, state: 'streaming', text: '' }
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

function demoReply(messages: AIMessage[], signal: AbortSignal) {
  const asked = messages.at(-1)
  const question = asked ? getMessageText(asked) : ''
  const reply =
    cannedReplies[question] ??
    (question === 'Can you give me the SQL to check the Safari errors?'
      ? regeneratedReply
      : fallbackReply)
  return simulateReply(reply, signal)
}

const AiAssistant2 = (props: AiAssistant2Props) => {
  const {
    description,
    followUps,
    messages: initialMessages = [],
    onFeedback = () => {},
    errorMessage,
    status: blockStatus,
    title,
    toolLabels,
  } = props
  const demo = useChatStream({ initialMessages, onSend: demoReply })
  const chat = props.chat ?? demo
  const { messages, status } = chat
  const state = getBlockState(blockStatus, messages)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const [feedback, setFeedback] = useState<Record<string, ChatFeedback | null>>({})
  const asked = new Set(messages.map(getMessageText))
  const send = (question: string) => chat.sendMessage({ text: question })

  function rate(messageId: string, value: ChatFeedback | null) {
    setFeedback((current) => ({ ...current, [messageId]: value }))
    onFeedback(messageId, value)
  }

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex h-[40rem] flex-col gap-3'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <ChatMessages
          status={status}
          latest={messages.at(-1)}
          className='min-h-0 border-t'
          contentClassName='ps-0 pe-4'
        >
          {state === 'empty' ? (
            <ChatWelcome
              className='my-auto py-8'
              title='Ask about your product'
              description='Answers come with the query behind them.'
            >
              <SuggestedPrompts
                variant='list'
                label='Suggested questions'
                prompts={followUps}
                onSelect={send}
              />
            </ChatWelcome>
          ) : (
            state && <BlockStateRows rows={3} />
          )}
          {!state && (
            <ChatConversation
              chat={chat}
              composerRef={composerRef}
              feedback={feedback}
              onFeedback={rate}
              toolLabels={toolLabels}
              followUps={() =>
                followUps.filter((prompt) => !asked.has(prompt.prompt ?? prompt.label))
              }
            />
          )}
        </ChatMessages>
        <ChatComposer
          accept='.csv,image/*'
          disabled={blockStatus !== undefined}
          status={status}
          textareaRef={composerRef}
          onSubmit={chat.sendMessage}
          onStop={chat.stop}
          placeholder='Ask a follow-up'
        />
      </section>
    </BlockStateProvider>
  )
}

export { AiAssistant2, exampleProps as aiAssistant2ExampleProps, type AiAssistant2Props }
