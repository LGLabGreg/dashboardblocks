'use client'

import {
  ChatComposer,
  ChatError,
  ChatMessage,
  ChatMessageActions,
  ChatMessages,
  ChatWelcome,
  TypingIndicator,
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
  getStreamingMessageId,
} from '@/registry/components/dashboardblocks/ai-message'
import {
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'

interface AiAssistant4Props extends BlockStateProps {
  /**
   * The chat it runs: `useChat()` from `@ai-sdk/react`, or `useChatStream` for any other stream. Leave out to run canned replies.
   * The AI SDK sends "An error occurred." for any error on the server unless the route's `onError` returns a message to show.
   */
  chat?: AIChat
  description: string
  /** Starts the canned replies on a failed reply, with this message. */
  error?: string
  /** The conversation the canned replies start from. With `chat`, pass it to the chat instead. Leave out, or pass none, for a new chat. */
  messages?: AIMessage[]
  title: string
}

const text = (value: string): AIMessagePart => ({
  state: 'done',
  text: value,
  type: 'text',
})

const deployLog = [
  '01:12:48 payments-api certificate rotated by processor',
  '01:14:02 payments-api TLS handshake failed: unknown certificate (EU region)',
  '01:51:37 payments-api pinned certificate updated, handshakes passing',
].join('\n')

const exampleProps: AiAssistant4Props = {
  description: 'Answers from incidents, deploys and runbooks.',
  error:
    'The assistant didn’t reply in time. Your question is saved, so you can try again.',
  messages: [
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
          url: `data:text/plain;charset=utf-8,${encodeURIComponent(deployLog)}`,
        },
        text('Summarise last night’s incidents'),
      ],
      role: 'user',
    },
  ],
  title: 'Ops assistant',
}

const cannedReplies: Record<string, AIMessagePart[]> = {
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
  await wait(600, signal)
  yield { parts }
  for (const step of reply) {
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
  return simulateReply(cannedReplies[question] ?? fallbackReply, signal)
}

const AiAssistant4 = (props: AiAssistant4Props) => {
  const {
    description,
    error: initialError,
    messages: initialMessages = [],
    errorMessage,
    status: blockStatus,
    title,
  } = props
  const demo = useChatStream({ initialError, initialMessages, onSend: demoReply })
  const chat = props.chat ?? demo
  const { messages, status } = chat
  const streamingId = getStreamingMessageId(messages, status)
  const state = getBlockState(blockStatus, messages)

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex h-[34rem] flex-col gap-3'>
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
              title='Ask about your systems'
              description='Answers from incidents, deploys and runbooks. Attach a log or a screenshot to ask about it.'
            />
          ) : (
            state && <BlockStateRows rows={3} />
          )}
          {!state &&
            messages.map((message, index) => {
              const isLast = index === messages.length - 1
              const streaming = message.id === streamingId
              return (
                <ChatMessage
                  key={message.id}
                  message={message}
                  streaming={streaming}
                  onToolApprovalResponse={chat.addToolApprovalResponse}
                  actions={
                    message.role === 'assistant' &&
                    !streaming && (
                      <ChatMessageActions
                        content={getMessageText(message)}
                        onRegenerate={isLast ? chat.regenerate : undefined}
                      />
                    )
                  }
                />
              )
            })}
          {!state && status === 'submitted' && !streamingId && <TypingIndicator />}
          {!state && status === 'error' && (
            <ChatError message={chat.error?.message} onRetry={chat.regenerate} />
          )}
        </ChatMessages>
        <ChatComposer
          accept='image/*,.log,.txt,.pdf'
          disabled={blockStatus !== undefined}
          status={status}
          onSubmit={chat.sendMessage}
          onStop={chat.stop}
          placeholder='Ask about incidents or deploys'
        />
      </section>
    </BlockStateProvider>
  )
}

export { AiAssistant4, exampleProps as aiAssistant4ExampleProps, type AiAssistant4Props }
