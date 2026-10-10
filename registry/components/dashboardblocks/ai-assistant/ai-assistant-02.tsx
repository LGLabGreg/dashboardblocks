'use client'

import {
  type ChatFeedback,
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
import { useState } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface AiAssistant2Props {
  description: string
  followUps: SuggestedPrompt[]
  messages: ChatMessageData[]
  onFeedback?: (messageId: string, feedback: ChatFeedback | null) => void
  /** Streams the reply to the conversation as chunks of text. */
  onSend?: (messages: ChatMessageData[], signal: AbortSignal) => AsyncIterable<string>
  title: string
}

const exampleNow = new Date(Date.UTC(2026, 8, 26, 12))
const minutesAgo = (minutes: number) => new Date(exampleNow.getTime() - minutes * 60_000)

const exampleProps: AiAssistant2Props = {
  description: 'Ask questions about your product analytics',
  followUps: [
    { label: 'Compare with the week before' },
    { label: 'Which pages lost the most sessions?' },
    { label: 'Draft a note for the payments team' },
  ],
  messages: [
    {
      content: 'Why did checkout conversion drop last week?',
      createdAt: minutesAgo(6),
      id: '1',
      role: 'user',
    },
    {
      content: `Checkout conversion fell from **3.8%** to **3.1%** between Sep 15 and Sep 21. Three things changed that week:

- **Safari 17 payment errors.** 41% of failed checkouts were on Safari 17, starting with the Sep 15 release.
- **Longer shipping estimates.** Standard delivery showed 5–7 days instead of 3–5 for EU addresses.
- **More paid social traffic.** Sessions from paid social doubled, and they convert at 1.2%.

The Safari errors explain most of the drop. Fixing them should win back about half a point.`,
      createdAt: minutesAgo(6),
      id: '2',
      role: 'assistant',
    },
    {
      content: 'Can you give me the SQL to check the Safari errors?',
      createdAt: minutesAgo(3),
      id: '3',
      role: 'user',
    },
    {
      content: `This counts started and failed checkouts by browser for that week, from the \`events\` table:

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

If Safari's \`failure_rate\` is well above the other browsers, the release is the likely cause.`,
      createdAt: minutesAgo(3),
      id: '4',
      role: 'assistant',
    },
  ],
  title: 'Analytics assistant',
}

const cannedReplies: Record<string, string> = {
  'Compare with the week before': `Against Sep 8–14, last week had:

- **Sessions:** 48,210, up 9%
- **Checkouts started:** 3,904, up 2%
- **Orders:** 1,495, down 11%

Traffic grew but orders fell, so the problem is inside checkout rather than in getting people there.`,
  'Draft a note for the payments team': `Here's a draft:

Hi team, checkout conversion dropped from 3.8% to 3.1% last week. 41% of failed checkouts were on Safari 17, starting with the Sep 15 release, and the payment sheet closes before the 3-D Secure frame loads. Could you take a look this sprint? Happy to share the query and session recordings.`,
  'Which pages lost the most sessions?': `The biggest drops, week on week:

1. \`/pricing\`: 6,120 sessions, down 18%
2. \`/checkout/shipping\`: 3,410, down 12%
3. \`/blog/fall-release\`: 2,980, down 9%

The pricing page dropped after its hero image failed to load on mobile from Sep 16.`,
}

const regeneratedReply = `Here's another way to check it, grouped by browser version so you can see whether only Safari 17 is affected:

\`\`\`sql
select browser, browser_version, count(*) as failed
from events
where name = 'checkout_failed'
  and occurred_at >= '2026-09-15'
group by browser, browser_version
order by failed desc
limit 10;
\`\`\``

const fallbackReply =
  'This is a demo reply. Pass `onSend` to stream answers from your own model.'

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
  const reply =
    cannedReplies[question] ??
    (question === 'Can you give me the SQL to check the Safari errors?'
      ? regeneratedReply
      : fallbackReply)
  await wait(700, signal)
  for (const word of reply.split(/(?<=\s)/)) {
    await wait(25, signal)
    yield word
  }
}

const AiAssistant2 = (props: AiAssistant2Props) => {
  const {
    description,
    followUps,
    messages: initialMessages,
    onFeedback = () => {},
    onSend = simulateStream,
    title,
  } = props
  const chat = useChatStream({ initialMessages, onSend })
  const { messages, status } = chat
  const [feedback, setFeedback] = useState<Record<string, ChatFeedback | null>>({})
  const latest = messages.at(-1)
  const asked = new Set(messages.map((message) => message.content))

  function rate(messageId: string, value: ChatFeedback | null) {
    setFeedback((current) => ({ ...current, [messageId]: value }))
    onFeedback(messageId, value)
  }

  return (
    <Card className='h-[40rem] gap-0'>
      <CardHeader className='border-b'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex min-h-0 flex-1 flex-col px-0'>
        <ChatMessages
          status={status}
          latest={latest}
          contentClassName='px-(--card-spacing)'
        >
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
                      feedback={feedback[message.id]}
                      onFeedback={(value) => rate(message.id, value)}
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
          {status === 'ready' && latest?.role === 'assistant' && (
            <SuggestedPrompts
              label='Follow-up questions'
              prompts={followUps.filter(
                (prompt) => !asked.has(prompt.prompt ?? prompt.label),
              )}
              onSelect={chat.send}
            />
          )}
        </ChatMessages>
      </CardContent>
      <CardFooter className='border-t'>
        <ChatComposer
          className='w-full'
          status={status}
          onSubmit={chat.send}
          onStop={chat.stop}
          placeholder='Ask a follow-up…'
        />
      </CardFooter>
    </Card>
  )
}

export { AiAssistant2, exampleProps as aiAssistant2ExampleProps, type AiAssistant2Props }
