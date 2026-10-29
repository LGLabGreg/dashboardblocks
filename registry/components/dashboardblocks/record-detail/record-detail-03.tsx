'use client'

import {
  ActivityFeed,
  ActivityFeedItem,
  ActivityTime,
} from '@/registry/components/dashboardblocks/activity-feed'
import {
  BlockStateProvider,
  BlockStateText,
  type BlockStateProps,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  BackLink,
  PageHeader,
  PageHeaderActions,
  PageHeaderHeading,
  PageHeaderRow,
} from '@/registry/components/dashboardblocks/page-header'
import {
  Property,
  PropertyList,
  RecordLayout,
  RecordPlaceholder,
  RecordSection,
} from '@/registry/components/dashboardblocks/record-detail'
import {
  StatusLabel,
  type StatusTone,
} from '@/registry/components/dashboardblocks/status-label'
import { type Person, PersonAvatar } from '@/registry/components/dashboardblocks/team'
import { joinDetails } from '@/registry/lib/dashboardblocks/format'
import { type FormEvent, startTransition, useId, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type TicketPerson = Pick<Person, 'avatar' | 'name'>
type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent'
type TicketStatus = 'Open' | 'In progress' | 'Done'

interface TicketEvent {
  at: Date
  author: TicketPerson
  id: string
  comment?: string
  text: string
}

interface RecordDetail3Props extends BlockStateProps {
  currentUser: TicketPerson
  events?: TicketEvent[]
  /** Pass a fixed date, so times render the same on the server and in the browser. */
  now: Date
  onAssignToMe?: () => void
  onClose?: () => void
  onComment?: (text: string) => Promise<void>
  /** Leave out to show the empty state. */
  ticket?: {
    assignee: TicketPerson
    created: string
    description: string[]
    id: string
    labels: string[]
    linkedOrder: { href: string; label: string }
    priority: TicketPriority
    reporter: TicketPerson
    status: TicketStatus
    title: string
  }
}

const exampleNow = new Date(Date.UTC(2026, 8, 26, 12))
const hoursAgo = (hours: number) => new Date(exampleNow.getTime() - hours * 3_600_000)

const exampleProps: RecordDetail3Props = {
  currentUser: { avatar: '/images/avatar-05.webp', name: 'Amara Okafor' },
  events: [
    {
      at: hoursAgo(50),
      author: { avatar: '/images/avatar-02.webp', name: 'Priya Nair' },
      id: '1',
      text: 'opened this issue',
    },
    {
      at: hoursAgo(49),
      author: { avatar: '/images/avatar-03.webp', name: 'Lena Fischer' },
      id: '2',
      text: 'set priority to High',
    },
    {
      at: hoursAgo(20),
      author: { avatar: '/images/avatar-03.webp', name: 'Lena Fischer' },
      comment:
        'Reproduced on Safari 17.4. The payment sheet closes before the 3-D Secure frame loads.',
      id: '3',
      text: 'commented',
    },
  ],
  now: exampleNow,
  ticket: {
    assignee: { avatar: '/images/avatar-03.webp', name: 'Lena Fischer' },
    created: 'Sep 24, 2026',
    description: [
      'Customers on Safari 17 see a blank payment sheet at checkout, and the order is never placed.',
      'Started after Monday’s release. Chrome and Firefox are fine.',
    ],
    id: 'TCK-381',
    labels: ['Checkout', 'Bug'],
    linkedOrder: { href: '#', label: 'Order #1042' },
    priority: 'High',
    reporter: { avatar: '/images/avatar-02.webp', name: 'Priya Nair' },
    status: 'In progress',
    title: 'Checkout fails on Safari 17',
  },
}

const noEvents: TicketEvent[] = []

async function saveComment() {
  await new Promise((resolve) => setTimeout(resolve, 500))
}

const PRIORITY_TONE: Record<TicketPriority, StatusTone> = {
  High: 'warning',
  Low: 'neutral',
  Medium: 'neutral',
  Urgent: 'bad',
}

const STATUS_TONE: Record<TicketStatus, StatusTone> = {
  Done: 'good',
  'In progress': 'info',
  Open: 'neutral',
}

function PersonName({ person }: { person: TicketPerson }) {
  return (
    <span className='flex items-center gap-2'>
      <PersonAvatar person={person} size='sm' />
      {person.name}
    </span>
  )
}

const RecordDetail3 = (props: RecordDetail3Props) => {
  const {
    currentUser,
    events: loadedEvents = noEvents,
    now,
    onAssignToMe = () => {},
    onClose = () => {},
    onComment = saveComment,
    errorMessage,
    status,
    ticket,
  } = props
  const commentId = useId()
  const [posted, setPosted] = useState<TicketEvent[]>([])
  const events = [...loadedEvents, ...posted]
  const state = getBlockState(status, ticket)
  const ready = ticket !== undefined && state === undefined
  const [draft, setDraft] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return document.getElementById(commentId)?.focus()
    setIsSaving(true)
    try {
      await onComment(text)
      startTransition(() => {
        setPosted((current) => [
          ...current,
          {
            at: now,
            author: currentUser,
            comment: text,
            id: `${Date.now()}`,
            text: 'commented',
          },
        ])
        setDraft('')
      })
    } finally {
      startTransition(() => setIsSaving(false))
    }
  }

  const comments = events.filter((event) => event.comment).length

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <div className='flex flex-col gap-8'>
        <PageHeader>
          <BackLink href='#'>Issues</BackLink>
          <PageHeaderRow className='@2xl/page-header:items-end'>
            {ready ? (
              <PageHeaderHeading
                title={ticket.title}
                description={joinDetails(
                  ticket.id,
                  `Opened by ${ticket.reporter.name} on ${ticket.created}`,
                )}
                badge={
                  <StatusLabel tone={STATUS_TONE[ticket.status]}>
                    {ticket.status}
                  </StatusLabel>
                }
              />
            ) : (
              <PageHeaderHeading
                title={<BlockStateText variant='short' />}
                description={state === 'loading' && <SkeletonText className='w-56' />}
              />
            )}
            <PageHeaderActions>
              <Button variant='outline' disabled={!ready} onClick={onAssignToMe}>
                Assign to me
              </Button>
              <Button disabled={!ready} onClick={onClose}>
                Close issue
              </Button>
            </PageHeaderActions>
          </PageHeaderRow>
        </PageHeader>
        <RecordPlaceholder
          aside={['Properties']}
          sections={['Description', 'Activity']}
        />
        {ready && (
          <RecordLayout
            aside={
              <RecordSection title='Properties'>
                <PropertyList>
                  <Property label='Priority'>
                    <StatusLabel tone={PRIORITY_TONE[ticket.priority]}>
                      {ticket.priority}
                    </StatusLabel>
                  </Property>
                  <Property label='Assignee'>
                    <PersonName person={ticket.assignee} />
                  </Property>
                  <Property label='Reporter'>
                    <PersonName person={ticket.reporter} />
                  </Property>
                  <Property label='Labels'>
                    <span className='flex flex-wrap gap-1'>
                      {ticket.labels.map((label) => (
                        <Badge key={label} variant='outline'>
                          {label}
                        </Badge>
                      ))}
                    </span>
                  </Property>
                  <Property label='Linked'>
                    <a
                      href={ticket.linkedOrder.href}
                      className='underline-offset-4 hover:underline'
                    >
                      {ticket.linkedOrder.label}
                    </a>
                  </Property>
                </PropertyList>
              </RecordSection>
            }
          >
            <RecordSection title='Description'>
              <div className='flex flex-col gap-3 text-sm'>
                {ticket.description.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </RecordSection>
            <RecordSection
              description={`${events.length} updates, ${comments} ${comments === 1 ? 'comment' : 'comments'}.`}
              title='Activity'
            >
              <ActivityFeed aria-label={`Activity on ${ticket.id}`}>
                {events.map((event) => (
                  <ActivityFeedItem key={event.id} className='pb-5 last:pb-0' connector>
                    <span className='flex size-(--activity-marker) shrink-0 items-center justify-center'>
                      <PersonAvatar
                        className='ring-background ring-4'
                        person={event.author}
                      />
                    </span>
                    <div className='flex min-w-0 flex-1 flex-col gap-2 pt-1.5'>
                      <p className='flex flex-wrap items-baseline justify-between gap-x-3 text-sm'>
                        <span>
                          <span className='font-medium'>{event.author.name}</span>{' '}
                          <span className='text-muted-foreground'>{event.text}</span>
                        </span>
                        <ActivityTime date={event.at} now={now} />
                      </p>
                      {event.comment && (
                        <p className='border-l-2 pl-3 text-sm'>{event.comment}</p>
                      )}
                    </div>
                  </ActivityFeedItem>
                ))}
              </ActivityFeed>
              <form
                method='post'
                onSubmit={(event) => void submit(event)}
                className='flex flex-col gap-2 pt-2'
              >
                <label htmlFor={commentId} className='sr-only'>
                  Comment
                </label>
                <Textarea
                  id={commentId}
                  rows={3}
                  placeholder='Leave a comment'
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                />
                <Button
                  type='submit'
                  variant='outline'
                  size='sm'
                  className='self-end'
                  disabled={isSaving}
                >
                  {isSaving ? 'Posting…' : 'Comment'}
                </Button>
              </form>
            </RecordSection>
          </RecordLayout>
        )}
      </div>
    </BlockStateProvider>
  )
}

export {
  RecordDetail3,
  exampleProps as recordDetail3ExampleProps,
  type RecordDetail3Props,
}
