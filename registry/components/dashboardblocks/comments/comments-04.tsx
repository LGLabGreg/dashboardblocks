'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  type CommentAuthor,
  CommentComposer,
  CommentItem,
  getMentions,
  type ThreadComment,
  toggleReaction,
  updateComment,
} from '@/registry/components/dashboardblocks/comments'
import { StatusLabel } from '@/registry/components/dashboardblocks/status-label'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { startTransition, useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type MessageKind = 'customer' | 'reply' | 'note'

interface TicketMessage extends ThreadComment {
  kind: MessageKind
}

type Mode = 'reply' | 'note'

interface Comments4Props {
  currentUser: CommentAuthor
  customer: { company: string; email: string; name: string }
  /** Oldest first. Leave out, or pass none, to show the empty state. */
  messages?: TicketMessage[]
  /** Pass a fixed date, so times render the same on the server and in the browser. */
  now: Date
  onReact?: (messageId: string, emoji: string) => void
  onSubmit?: (body: string, options: { internal: boolean }) => Promise<void>
  people: CommentAuthor[]
  status?: BlockStatus
  ticketId: string
  title: string
}

const exampleNow = new Date(Date.UTC(2026, 8, 26, 12))
const hoursAgo = (hours: number) => new Date(exampleNow.getTime() - hours * 3_600_000)

const hannah = { avatar: '/images/avatar-01.webp', name: 'Hannah Becker' }
const lena = { avatar: '/images/avatar-03.webp', name: 'Lena Fischer' }
const mateo = { name: 'Mateo Silva' }

const exampleProps: Comments4Props = {
  currentUser: { name: 'Amara Okafor' },
  customer: {
    company: 'Northwind Traders',
    email: 'hannah@northwind.example',
    name: 'Hannah Becker',
  },
  messages: [
    {
      at: hoursAgo(50),
      author: hannah,
      body: 'Our customers on Safari can’t finish checkout. The payment sheet goes blank and the order never goes through. It started on Monday.',
      id: 'm1',
      kind: 'customer',
    },
    {
      at: hoursAgo(49),
      author: lena,
      body: 'Thanks Hannah, we can reproduce it and we’re on it. I’ll update you here as soon as a fix ships.',
      id: 'm2',
      kind: 'reply',
    },
    {
      at: hoursAgo(20),
      author: lena,
      body: 'Reproduced on Safari 17.4: the payment sheet closes before the 3-D Secure frame loads. @Mateo Silva can you check the iframe sandbox flags?',
      id: 'm3',
      kind: 'note',
      reactions: [{ count: 1, emoji: '👀', reacted: false }],
    },
    {
      at: hoursAgo(18),
      author: mateo,
      body: 'Found it, the frame can’t navigate the top window. The fix is in review and ships tomorrow morning.',
      id: 'm4',
      kind: 'note',
      reactions: [{ count: 2, emoji: '👍', reacted: true }],
    },
    {
      at: hoursAgo(3),
      author: hannah,
      body: 'Any update? We’re losing about 40 orders a day.',
      id: 'm5',
      kind: 'customer',
    },
  ],
  now: exampleNow,
  people: [lena, mateo, { name: 'Priya Nair' }, { name: 'Jonas Weber' }],
  ticketId: 'TCK-381',
  title: 'Conversation',
}

const noMessages: TicketMessage[] = []

async function saveMessage() {
  await new Promise((resolve) => setTimeout(resolve, 500))
}

const lockIcon = (
  <IconPlaceholder
    lucide='LockIcon'
    tabler='IconLock'
    hugeicons='SquareLock02Icon'
    phosphor='LockIcon'
    remixicon='RiLockLine'
  />
)

const Comments4 = (props: Comments4Props) => {
  const {
    currentUser,
    customer,
    messages: initialMessages = noMessages,
    now,
    onReact = () => {},
    onSubmit = saveMessage,
    people,
    status,
    ticketId,
    title,
  } = props
  const [messages, setMessages] = useState(initialMessages)
  const [loaded, setLoaded] = useState(initialMessages)
  if (initialMessages !== loaded) {
    setLoaded(initialMessages)
    setMessages(initialMessages)
  }
  const [mode, setMode] = useState<Mode>('reply')
  const [drafts, setDrafts] = useState({ note: '', reply: '' })
  const [announcement, setAnnouncement] = useState('')
  const state = getBlockState(status, messages)
  const unavailable = state === 'loading' || state === 'error'
  const mentioned = getMentions(
    drafts.note,
    people.map((person) => person.name),
  )

  async function send(body: string, kind: Mode) {
    await onSubmit(body, { internal: kind === 'note' })
    startTransition(() => {
      setMessages((current) => [
        ...current,
        { at: now, author: currentUser, body, id: `${Date.now()}`, kind },
      ])
      setAnnouncement(kind === 'note' ? 'Note added' : `Reply sent to ${customer.name}`)
    })
  }

  function badge(kind: MessageKind) {
    if (kind === 'customer')
      return (
        <StatusLabel variant='text' className='text-xs' tone='info'>
          Customer
        </StatusLabel>
      )
    if (kind === 'note')
      return (
        <StatusLabel
          variant='text'
          className='flex items-center gap-1 text-xs [&_svg]:size-3'
          tone='warning'
        >
          {lockIcon}
          Internal
        </StatusLabel>
      )
    return null
  }

  const last = messages[messages.length - 1]
  const waitingHours =
    last?.kind === 'customer'
      ? Math.max(0, Math.round((now.getTime() - last.at.getTime()) / 3_600_000))
      : null
  const waiting =
    waitingHours === null
      ? 'Waiting on the customer.'
      : `${customer.name.split(' ')[0]} has waited ${waitingHours < 1 ? 'under an hour' : `${waitingHours} ${waitingHours === 1 ? 'hour' : 'hours'}`} for a reply.`

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>
            {ticketId} with {customer.name}, {customer.company}.{' '}
            <BlockReady>{waiting}</BlockReady>
          </p>
        </header>
        <div>
          {state && (
            <div className='border-t'>
              <BlockStateRows rows={3} />
            </div>
          )}
          {!state && (
            <ol
              aria-label={`Conversation on ${ticketId}`}
              className='flex flex-col gap-4 border-t pt-4'
            >
              {messages.map((message) => (
                <li
                  key={message.id}
                  className={
                    message.kind === 'note'
                      ? 'border-l-2 border-orange-500/60 bg-orange-500/5 py-3 pr-3 pl-[calc(0.75rem-2px)]'
                      : 'px-3'
                  }
                >
                  <CommentItem
                    comment={message}
                    now={now}
                    people={message.kind === 'note' ? people : undefined}
                    badge={badge(message.kind)}
                    onReact={
                      message.kind === 'note'
                        ? (emoji) => {
                            onReact(message.id, emoji)
                            setMessages((current) =>
                              updateComment(current, message.id, (item) => ({
                                ...item,
                                reactions: toggleReaction(item.reactions, emoji),
                              })),
                            )
                          }
                        : undefined
                    }
                  />
                </li>
              ))}
            </ol>
          )}
          <p aria-live='polite' className='sr-only'>
            {announcement}
          </p>
        </div>
        <div className='border-t pt-4'>
          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as Mode)}
            className='w-full'
          >
            <TabsList>
              <TabsTrigger value='reply'>Reply</TabsTrigger>
              <TabsTrigger value='note'>Internal note</TabsTrigger>
            </TabsList>
            <TabsContent value='reply'>
              <CommentComposer
                label={`Reply to ${customer.name}`}
                placeholder={`Reply to ${customer.name.split(' ')[0]}…`}
                submitLabel='Send reply'
                pendingLabel='Sending…'
                disabled={unavailable}
                value={drafts.reply}
                footer={
                  <span className='text-muted-foreground block truncate'>
                    Emailed to {customer.email}
                  </span>
                }
                onValueChange={(reply) => setDrafts((current) => ({ ...current, reply }))}
                onSubmit={(body) => send(body, 'reply')}
              />
            </TabsContent>
            <TabsContent value='note'>
              <CommentComposer
                className='*:data-[slot=input-group]:bg-orange-500/5'
                label='Internal note'
                placeholder='Add a note for your team. Type @ to mention someone.'
                submitLabel='Add note'
                pendingLabel='Adding…'
                disabled={unavailable}
                people={people}
                value={drafts.note}
                footer={
                  <span className='flex min-w-0 items-center gap-1.5 text-orange-700 dark:text-orange-400 [&_svg]:size-3.5 [&_svg]:shrink-0'>
                    {lockIcon}
                    <span className='truncate'>
                      {mentioned.length > 0
                        ? `Only your team sees this. Notifies ${mentioned.join(', ')}.`
                        : 'Only your team sees this'}
                    </span>
                  </span>
                }
                onValueChange={(note) => setDrafts((current) => ({ ...current, note }))}
                onSubmit={(body) => send(body, 'note')}
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </BlockStateProvider>
  )
}

export { Comments4, exampleProps as comments4ExampleProps, type Comments4Props }
