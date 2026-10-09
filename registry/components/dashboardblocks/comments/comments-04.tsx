'use client'

import {
  type CommentAuthor,
  CommentComposer,
  CommentItem,
  getMentions,
  type ThreadComment,
  toggleReaction,
  updateComment,
} from '@/registry/components/dashboardblocks/comments'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type MessageKind = 'customer' | 'reply' | 'note'

interface TicketMessage extends ThreadComment {
  /** From the customer, a reply sent to them, or a note only the team sees. */
  kind: MessageKind
}

type Mode = 'reply' | 'note'

interface Comments4Props {
  currentUser: CommentAuthor
  customer: { company: string; email: string; name: string }
  messages: TicketMessage[]
  /** Pass a fixed date, so times render the same on the server and in the browser. */
  now: Date
  onReact?: (messageId: string, emoji: string) => void
  /** Sends a reply to the customer, or saves an internal note. Resolve once it's saved. */
  onSubmit?: (body: string, options: { internal: boolean }) => Promise<void>
  /** Teammates to suggest after @ in internal notes. */
  people: CommentAuthor[]
  ticketId: string
}

const exampleNow = new Date(Date.UTC(2026, 8, 26, 12))
const hoursAgo = (hours: number) => new Date(exampleNow.getTime() - hours * 3_600_000)

const hannah = { name: 'Hannah Becker' }
const lena = { name: 'Lena Fischer' }
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
}

/** Stands in for a request to your API. */
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
    messages: initialMessages,
    now,
    onReact = () => {},
    onSubmit = saveMessage,
    people,
    ticketId,
  } = props
  const [messages, setMessages] = useState(initialMessages)
  const [mode, setMode] = useState<Mode>('reply')
  const [drafts, setDrafts] = useState({ note: '', reply: '' })
  const [status, setStatus] = useState('')
  const mentioned = getMentions(
    drafts.note,
    people.map((person) => person.name),
  )

  async function send(body: string, kind: Mode) {
    await onSubmit(body, { internal: kind === 'note' })
    setMessages((current) => [
      ...current,
      { at: now, author: currentUser, body, id: `${Date.now()}`, kind },
    ])
    setStatus(kind === 'note' ? 'Note added' : `Reply sent to ${customer.name}`)
  }

  function badge(kind: MessageKind) {
    if (kind === 'customer') return <Badge variant='outline'>Customer</Badge>
    if (kind === 'note')
      return (
        <Badge variant='outline'>
          {lockIcon}
          Internal
        </Badge>
      )
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversation</CardTitle>
        <CardDescription>
          {ticketId} · {customer.name}, {customer.company}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol aria-label={`Conversation on ${ticketId}`} className='flex flex-col gap-4'>
          {messages.map((message) => (
            <li
              key={message.id}
              className={
                message.kind === 'note'
                  ? 'rounded-lg bg-amber-500/5 p-3 ring-1 ring-amber-500/20'
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
        <p aria-live='polite' className='sr-only'>
          {status}
        </p>
      </CardContent>
      <CardFooter className='border-t'>
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
              className='*:data-[slot=input-group]:bg-amber-500/5'
              label='Internal note'
              placeholder='Add a note for your team. Type @ to mention someone.'
              submitLabel='Add note'
              pendingLabel='Adding…'
              people={people}
              value={drafts.note}
              footer={
                <span className='flex min-w-0 items-center gap-1.5 text-amber-800 dark:text-amber-400 [&_svg]:size-3.5 [&_svg]:shrink-0'>
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
      </CardFooter>
    </Card>
  )
}

export { Comments4, exampleProps as comments4ExampleProps, type Comments4Props }
