'use client'

import { useChatStream } from '@/registry/components/dashboardblocks/ai-assistant'
import {
  AiAssistant1,
  type AiAssistant1Props,
} from '@/registry/components/dashboardblocks/ai-assistant/ai-assistant-01'
import {
  AiAssistant2,
  type AiAssistant2Props,
} from '@/registry/components/dashboardblocks/ai-assistant/ai-assistant-02'
import {
  AiAssistant3,
  type AiAssistant3Props,
} from '@/registry/components/dashboardblocks/ai-assistant/ai-assistant-03'
import {
  AiAssistant4,
  type AiAssistant4Props,
} from '@/registry/components/dashboardblocks/ai-assistant/ai-assistant-04'
import {
  type AIMessage,
  type AIMessagePart,
  type AIReasoningPart,
  type AIReply,
  type AITextPart,
  getMessageText,
  isToolPart,
} from '@/registry/components/dashboardblocks/ai-message'
import type { TokenCounts } from '@/registry/components/dashboardblocks/ai-usage'

// The docs preview only: each block runs on canned replies that stream in
// word by word, in place of a model. Not part of any registry item.

const text = (value: string): AIMessagePart => ({
  state: 'done',
  text: value,
  type: 'text',
})

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

const cannedReplies1: Record<string, AIMessagePart[]> = {
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

const fallbackReply1: AIMessagePart[] = [
  {
    text: 'This is a demo reply. Pass `chat` to stream answers from your own model, with the page’s data as context.',
    type: 'text',
  },
]

const noContextReply1: AIMessagePart[] = [
  {
    text: 'I can’t see this page without its context. Add it back to the message box to ask about these numbers.',
    type: 'text',
  },
]

function hasContext1(metadata: unknown) {
  return typeof metadata === 'object' && metadata !== null && 'context' in metadata
}

async function* simulateReply1(
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

const AiAssistant1Preview = (props: Omit<AiAssistant1Props, 'chat'>) => {
  const chat = useChatStream({
    onSend: (conversation, signal) => {
      const last = conversation.at(-1)
      const question = getMessageText(last ?? { parts: [] })
      const reply = hasContext1(last?.metadata)
        ? (cannedReplies1[question] ?? fallbackReply1)
        : noContextReply1
      return simulateReply1(reply, signal)
    },
  })
  return <AiAssistant1 {...props} chat={chat} />
}

const messages2: AIMessage[] = [
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
]

const cannedReplies2: Record<string, AIMessagePart[]> = {
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

const regeneratedReply2: AIMessagePart[] = [
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

const fallbackReply2: AIMessagePart[] = [
  text('This is a demo reply. Pass `chat` to stream answers from your own model.'),
]

async function* simulateReply2(
  reply: AIMessagePart[],
  signal: AbortSignal,
): AsyncGenerator<AIReply> {
  const parts: AIMessagePart[] = [{ type: 'step-start' }]
  await wait(400, signal)
  yield { parts }
  for (const step of reply) {
    if (isToolPart(step)) {
      const part = {
        ...step,
        output: undefined,
        state: 'input-available' as const,
      }
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

function demoReply2(messages: AIMessage[], signal: AbortSignal) {
  const asked = messages.at(-1)
  const question = asked ? getMessageText(asked) : ''
  const reply =
    cannedReplies2[question] ??
    (question === 'Can you give me the SQL to check the Safari errors?'
      ? regeneratedReply2
      : fallbackReply2)
  return simulateReply2(reply, signal)
}

type AiAssistant2PreviewProps = Omit<AiAssistant2Props, 'chat'> & {
  messages?: AIMessage[]
}

const AiAssistant2Preview = ({ messages, ...props }: AiAssistant2PreviewProps) => {
  const chat = useChatStream({ initialMessages: messages, onSend: demoReply2 })
  return <AiAssistant2 {...props} chat={chat} />
}

const messages3: AIMessage[] = [
  { id: '1', parts: [text('What drove the cost this month?')], role: 'user' },
  {
    id: '2',
    metadata: { usage: { cached: 1_400, input: 620, output: 96 } },
    parts: [
      { type: 'step-start' },
      {
        input: { range: 'month' },
        output: [
          {
            costUsd: 168.4,
            feature: 'Support summaries',
            outputTokens: 11_230_000,
          },
          {
            costUsd: 61.2,
            feature: 'Search answers',
            outputTokens: 4_080_000,
          },
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
]

const cannedReplies3: Record<string, AIMessagePart[]> = {
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
    {
      input: { months: 3 },
      output: [
        {
          cached: 74_000_000,
          input: 182_000_000,
          month: '2026-08',
          output: 23_600_000,
        },
        {
          cached: 79_000_000,
          input: 189_000_000,
          month: '2026-09',
          output: 24_500_000,
        },
        {
          cached: 83_000_000,
          input: 197_000_000,
          month: '2026-10',
          output: 25_500_000,
        },
      ],
      state: 'output-available',
      toolCallId: 'call-monthly',
      type: 'tool-get_monthly_usage',
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

const fallbackReply3: AIMessagePart[] = [
  text(
    'This is a demo reply. Pass `chat` to stream answers from your own model, with this data as context.',
  ),
]

function estimateUsage3(conversation: AIMessage[], reply: string): TokenCounts {
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

async function* simulateReply3(
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
    } else if (isToolPart(step) && step.state === 'output-available') {
      const part = {
        ...step,
        output: undefined,
        state: 'input-available' as const,
      }
      parts.push(part)
      yield { parts }
      await wait(900, signal)
      Object.assign(part, { output: step.output, state: step.state })
      yield { parts }
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
  yield { metadata: { usage: estimateUsage3(conversation, written) }, parts }
}

async function* continueAfterApproval3(
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
          output: {
            feature: 'Support summaries',
            maxOutputTokens: 400,
            previous: 900,
          },
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
  yield* simulateReply3(
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

function demoReply3(conversation: AIMessage[], signal: AbortSignal) {
  const last = conversation.at(-1)
  if (last?.role === 'assistant')
    return continueAfterApproval3(conversation, last, signal)
  const question = last ? getMessageText(last) : ''
  return simulateReply3(conversation, cannedReplies3[question] ?? fallbackReply3, signal)
}

type AiAssistant3PreviewProps = Omit<AiAssistant3Props, 'chat'> & {
  messages?: AIMessage[]
}

const AiAssistant3Preview = ({ messages, ...props }: AiAssistant3PreviewProps) => {
  const chat = useChatStream({ initialMessages: messages, onSend: demoReply3 })
  return <AiAssistant3 {...props} chat={chat} />
}

const deployLog4 = [
  '01:12:48 payments-api certificate rotated by processor',
  '01:14:02 payments-api TLS handshake failed: unknown certificate (EU region)',
  '01:51:37 payments-api pinned certificate updated, handshakes passing',
].join('\n')

const messages4: AIMessage[] = [
  { id: '1', parts: [text('Is checkout healthy right now?')], role: 'user' },
  {
    id: '2',
    parts: [
      text(
        'Yes. The checkout error rate is **0.3%** over the last hour, under the 1% alert threshold, and p95 latency is 420 ms. The last deploy, `web@4.18.2`, went out at 09:12 UTC with no new errors.',
      ),
    ],
    role: 'assistant',
  },
  {
    id: '3',
    parts: [
      {
        filename: 'payments-api.log',
        mediaType: 'text/plain',
        type: 'file',
        url: `data:text/plain;charset=utf-8,${encodeURIComponent(deployLog4)}`,
      },
      text('Summarise last night’s incidents'),
    ],
    role: 'user',
  },
]

const cannedReplies4: Record<string, AIMessagePart[]> = {
  'Summarise last night’s incidents': [
    {
      text: 'Two incidents overnight. The attached log shows the payments one started with a certificate rotation at 01:12 and ended with the pinned certificate update at 01:51.',
      type: 'reasoning',
    },
    text(`Two incidents overnight, both resolved:

1. **INC-2291, payments, SEV-2 (01:14–01:52 UTC).** Card payments failed for 6% of EU customers after the processor rotated a certificate. Updating the pinned certificate fixed it, and 212 orders were retried automatically.
2. **INC-2294, search, SEV-3 (03:40–04:05 UTC).** Results were up to 20 minutes stale while the indexer restarted. No data was lost.

One follow-up is open: alert on certificate expiry for payment processors, owned by Dana Whitfield.`),
  ],
}

const fallbackReply4: AIMessagePart[] = [
  text('This is a demo reply. Pass `chat` to stream answers from your own model.'),
]

async function* simulateReply4(
  reply: AIMessagePart[],
  signal: AbortSignal,
): AsyncGenerator<AIReply> {
  const parts: AIMessagePart[] = [{ type: 'step-start' }]
  await wait(600, signal)
  yield { parts }
  for (const step of reply) {
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

function demoReply4(messages: AIMessage[], signal: AbortSignal) {
  const asked = messages.at(-1)
  const question = asked ? getMessageText(asked) : ''
  return simulateReply4(cannedReplies4[question] ?? fallbackReply4, signal)
}

type AiAssistant4PreviewProps = Omit<AiAssistant4Props, 'chat'> & {
  error?: string
  messages?: AIMessage[]
}

const AiAssistant4Preview = ({ error, messages, ...props }: AiAssistant4PreviewProps) => {
  const chat = useChatStream({
    initialError: error,
    initialMessages: messages,
    onSend: demoReply4,
  })
  return <AiAssistant4 {...props} chat={chat} />
}

const aiAssistantPreviewProps = {
  'ai-assistant-02': { messages: messages2 },
  'ai-assistant-03': { messages: messages3 },
  'ai-assistant-04': {
    error:
      'The assistant didn’t reply in time. Your question is saved, so you can try again.',
    messages: messages4,
  },
}

export {
  AiAssistant1Preview,
  AiAssistant2Preview,
  AiAssistant3Preview,
  AiAssistant4Preview,
  aiAssistantPreviewProps,
  wait,
}
