'use client'

import {
  ChatComposer,
  ChatError,
  ChatMessage,
  type ChatMessageData,
  ChatMessageActions,
  ChatMessages,
  TypingIndicator,
  useChatStream,
} from '@/registry/components/dashboardblocks/ai-assistant'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface AiAssistant4Props {
  description: string
  /** Why the last request failed, when the conversation is loaded with one. */
  error?: string
  messages: ChatMessageData[]
  /** Streams the reply to the conversation as chunks of text. Defaults to canned demo replies. */
  onSend?: (messages: ChatMessageData[], signal: AbortSignal) => AsyncIterable<string>
  title: string
}

const exampleProps: AiAssistant4Props = {
  description: 'Answers from incidents, deploys and runbooks',
  error:
    'The assistant didn’t reply in time. Your question is saved, so you can try again.',
  messages: [
    {
      content: 'Is checkout healthy right now?',
      id: '1',
      role: 'user',
    },
    {
      content:
        'Yes. The checkout error rate is **0.3%** over the last hour, under the 1% alert threshold, and p95 latency is 420 ms. The last deploy, `web@4.18.2`, went out at 09:12 UTC with no new errors.',
      id: '2',
      role: 'assistant',
    },
    {
      content: 'Summarise last night’s incidents',
      id: '3',
      role: 'user',
    },
  ],
  title: 'Ops assistant',
}

const cannedReplies: Record<string, string> = {
  'Summarise last night’s incidents': `Two incidents overnight, both resolved:

1. **INC-2291, payments, SEV-2 (01:14–01:52 UTC).** Card payments failed for 6% of EU customers after the processor rotated a certificate. Updating the pinned certificate fixed it, and 212 orders were retried automatically.
2. **INC-2294, search, SEV-3 (03:40–04:05 UTC).** Results were up to 20 minutes stale while the indexer restarted. No data was lost.

One follow-up is open: alert on certificate expiry for payment processors, owned by Dana Whitfield.`,
}

const fallbackReply =
  'This is a demo reply. Pass `onSend` to stream answers from your own model.'

/** Resolves after `ms`, or rejects as soon as `signal` aborts. */
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
  await wait(900, signal)
  for (const word of reply.split(/(?<=\s)/)) {
    await wait(25, signal)
    yield word
  }
}

const AiAssistant4 = (props: AiAssistant4Props) => {
  const {
    description,
    error: initialError,
    messages: initialMessages,
    onSend = simulateStream,
    title,
  } = props
  const chat = useChatStream({ initialError, initialMessages, onSend })
  const { messages, status } = chat

  return (
    <Card className='h-[34rem] gap-0'>
      <CardHeader className='border-b'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex min-h-0 flex-1 flex-col px-0'>
        <ChatMessages
          status={status}
          latest={messages.at(-1)}
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
      </CardContent>
      <CardFooter className='border-t'>
        <ChatComposer
          className='w-full'
          status={status}
          onSubmit={chat.send}
          onStop={chat.stop}
          placeholder='Ask about incidents or deploys…'
        />
      </CardFooter>
    </Card>
  )
}

export { AiAssistant4, exampleProps as aiAssistant4ExampleProps, type AiAssistant4Props }
