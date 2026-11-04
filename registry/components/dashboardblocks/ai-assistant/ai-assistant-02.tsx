'use client'

import {
  type ChatFeedback,
  ChatComposer,
  ChatConversation,
  ChatMessages,
  ChatWelcome,
  type SuggestedPrompt,
  SuggestedPrompts,
} from '@/registry/components/dashboardblocks/ai-assistant'
import {
  type AIChat,
  getMessageText,
} from '@/registry/components/dashboardblocks/ai-message'
import type { AIToolLabel } from '@/registry/components/dashboardblocks/ai-parts'
import {
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { useRef, useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'

interface AiAssistant2Props extends BlockStateProps {
  /** The chat it runs: `useChat()` from `@ai-sdk/react`, or `useChatStream` for any other stream. */
  chat: AIChat
  description: string
  /** Suggested next questions, under the last reply and in a new chat. */
  followUps: SuggestedPrompt[]
  onFeedback?: (messageId: string, feedback: ChatFeedback | null) => void
  title: string
  /** What each tool is called, by its name, or `{ running, done }` for what it's doing while it runs. Others read as their name in words. */
  toolLabels?: Record<string, AIToolLabel>
}

const exampleProps: Omit<AiAssistant2Props, 'chat'> = {
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
  title: 'Analytics assistant',
  toolLabels: {
    compare_weeks: {
      done: 'Compared the two weeks',
      running: 'Comparing the two weeks',
    },
  },
}

const AiAssistant2 = (props: AiAssistant2Props) => {
  const {
    description,
    followUps,
    onFeedback = () => {},
    errorMessage,
    status: blockStatus,
    title,
    toolLabels,
  } = props
  const { chat } = props
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
    <Card>
      <CardContent>
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
                    followUps.filter(
                      (prompt) => !asked.has(prompt.prompt ?? prompt.label),
                    )
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
      </CardContent>
    </Card>
  )
}

export { AiAssistant2, exampleProps as aiAssistant2ExampleProps, type AiAssistant2Props }
