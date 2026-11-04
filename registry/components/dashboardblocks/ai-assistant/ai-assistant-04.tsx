'use client'

import {
  ChatComposer,
  ChatConversation,
  ChatMessages,
  ChatWelcome,
} from '@/registry/components/dashboardblocks/ai-assistant'
import type { AIChat } from '@/registry/components/dashboardblocks/ai-message'
import {
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { useRef } from 'react'

import { Card, CardContent } from '@/components/ui/card'

interface AiAssistant4Props extends BlockStateProps {
  /**
   * The chat it runs: `useChat()` from `@ai-sdk/react`, or `useChatStream` for any other stream.
   * The AI SDK sends "An error occurred." for any error on the server unless the route's `onError` returns a message to show.
   */
  chat: AIChat
  description: string
  title: string
}

const exampleProps: Omit<AiAssistant4Props, 'chat'> = {
  description: 'Answers from incidents, deploys and runbooks.',
  title: 'Ops assistant',
}

const AiAssistant4 = (props: AiAssistant4Props) => {
  const { description, errorMessage, status: blockStatus, title } = props
  const { chat } = props
  const { messages, status } = chat
  const state = getBlockState(blockStatus, messages)
  const composerRef = useRef<HTMLTextAreaElement>(null)

  return (
    <Card>
      <CardContent>
        <BlockStateProvider errorMessage={errorMessage} state={state}>
          <section className='@container flex h-[44rem] flex-col gap-3'>
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
              {!state && <ChatConversation chat={chat} composerRef={composerRef} />}
            </ChatMessages>
            <ChatComposer
              accept='image/*,.log,.txt,.pdf'
              disabled={blockStatus !== undefined}
              status={status}
              textareaRef={composerRef}
              onSubmit={chat.sendMessage}
              onStop={chat.stop}
              placeholder='Ask about incidents or deploys'
            />
          </section>
        </BlockStateProvider>
      </CardContent>
    </Card>
  )
}

export { AiAssistant4, exampleProps as aiAssistant4ExampleProps, type AiAssistant4Props }
