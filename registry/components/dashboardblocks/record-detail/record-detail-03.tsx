'use client'

import {
  ActivityFeed,
  ActivityFeedItem,
  ActivityIcon,
  ActivityTime,
} from '@/registry/components/dashboardblocks/activity-feed'
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
} from '@/registry/components/dashboardblocks/record-detail'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type FormEvent, useId, useState } from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

interface TicketEvent {
  at: Date
  author: string
  id: string
  /** A comment's text. Leave out for a change, described by `text`. */
  comment?: string
  text: string
}

interface RecordDetail3Props {
  currentUser: string
  events: TicketEvent[]
  /** Pass a fixed date, so times render the same on the server and in the browser. */
  now: Date
  onAssignToMe?: () => void
  onClose?: () => void
  /** Saves a comment. Resolve once it's saved. */
  onComment?: (text: string) => Promise<void>
  ticket: {
    assignee: string
    created: string
    description: string[]
    id: string
    labels: string[]
    linkedOrder: { href: string; label: string }
    priority: string
    reporter: string
    status: string
    title: string
  }
}

const exampleNow = new Date(Date.UTC(2026, 8, 26, 12))
const hoursAgo = (hours: number) => new Date(exampleNow.getTime() - hours * 3_600_000)

const exampleProps: RecordDetail3Props = {
  currentUser: 'Amara Okafor',
  events: [
    {
      at: hoursAgo(50),
      author: 'Priya Nair',
      id: '1',
      text: 'opened this issue',
    },
    {
      at: hoursAgo(49),
      author: 'Lena Fischer',
      id: '2',
      text: 'set priority to High',
    },
    {
      at: hoursAgo(20),
      author: 'Lena Fischer',
      comment:
        'Reproduced on Safari 17.4. The payment sheet closes before the 3-D Secure frame loads.',
      id: '3',
      text: 'commented',
    },
  ],
  now: exampleNow,
  ticket: {
    assignee: 'Lena Fischer',
    created: 'Sep 24, 2026',
    description: [
      'Customers on Safari 17 see a blank payment sheet at checkout, and the order is never placed.',
      'Started after Monday’s release. Chrome and Firefox are fine.',
    ],
    id: 'TCK-381',
    labels: ['Checkout', 'Bug'],
    linkedOrder: { href: '#', label: 'Order #1042' },
    priority: 'High',
    reporter: 'Priya Nair',
    status: 'In progress',
    title: 'Checkout fails on Safari 17',
  },
}

/** Stands in for a request to your API. */
async function saveComment() {
  await new Promise((resolve) => setTimeout(resolve, 500))
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function Person({ name }: { name: string }) {
  return (
    <span className='flex items-center gap-2'>
      <Avatar className='size-5'>
        <AvatarFallback className='text-[0.625rem]'>{initials(name)}</AvatarFallback>
      </Avatar>
      {name}
    </span>
  )
}

const RecordDetail3 = (props: RecordDetail3Props) => {
  const {
    currentUser,
    events: initialEvents,
    now,
    onAssignToMe = () => {},
    onClose = () => {},
    onComment = saveComment,
    ticket,
  } = props
  const commentId = useId()
  const [events, setEvents] = useState(initialEvents)
  const [draft, setDraft] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    setIsSaving(true)
    try {
      await onComment(text)
      setEvents((current) => [
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
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader>
        <BackLink href='#'>Issues</BackLink>
        <PageHeaderRow>
          <PageHeaderHeading
            title={ticket.title}
            description={`${ticket.id} · Opened by ${ticket.reporter} on ${ticket.created}`}
          />
          <PageHeaderActions>
            <Button variant='outline' onClick={onAssignToMe}>
              Assign to me
            </Button>
            <Button onClick={onClose}>Close issue</Button>
          </PageHeaderActions>
        </PageHeaderRow>
      </PageHeader>
      <RecordLayout
        aside={
          <Card>
            <CardHeader>
              <CardTitle>Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <PropertyList>
                <Property label='Status'>
                  <Badge variant='secondary'>{ticket.status}</Badge>
                </Property>
                <Property label='Priority'>{ticket.priority}</Property>
                <Property label='Assignee'>
                  <Person name={ticket.assignee} />
                </Property>
                <Property label='Reporter'>
                  <Person name={ticket.reporter} />
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
            </CardContent>
          </Card>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-3 text-sm'>
            {ticket.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-6'>
            <ActivityFeed aria-label={`Activity on ${ticket.id}`}>
              {events.map((event) => (
                <ActivityFeedItem key={event.id} className='pb-5 last:pb-0' connector>
                  <ActivityIcon
                    icon={
                      event.comment ? (
                        <IconPlaceholder
                          lucide='MessageSquareIcon'
                          tabler='IconMessage'
                          hugeicons='MessageIcon'
                          phosphor='ChatCircleIcon'
                          remixicon='RiChat1Line'
                        />
                      ) : (
                        <IconPlaceholder
                          lucide='CircleDotIcon'
                          tabler='IconCircleDot'
                          hugeicons='CircleIcon'
                          phosphor='DotOutlineIcon'
                          remixicon='RiRecordCircleLine'
                        />
                      )
                    }
                    tone={event.comment ? 'info' : 'neutral'}
                  />
                  <div className='flex min-w-0 flex-1 flex-col gap-2 pt-1.5'>
                    <p className='flex flex-wrap items-baseline justify-between gap-x-3 text-sm'>
                      <span>
                        <span className='font-medium'>{event.author}</span> {event.text}
                      </span>
                      <ActivityTime date={event.at} now={now} />
                    </p>
                    {event.comment && (
                      <p className='bg-muted/50 rounded-lg p-3 text-sm'>
                        {event.comment}
                      </p>
                    )}
                  </div>
                </ActivityFeedItem>
              ))}
            </ActivityFeed>
            <form
              onSubmit={(event) => void submit(event)}
              className='flex flex-col gap-2'
            >
              <label htmlFor={commentId} className='sr-only'>
                Comment
              </label>
              <Textarea
                id={commentId}
                rows={3}
                placeholder='Leave a comment…'
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
              <Button
                type='submit'
                className='self-end'
                disabled={isSaving || !draft.trim()}
              >
                {isSaving ? 'Posting…' : 'Comment'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </RecordLayout>
    </div>
  )
}

export {
  RecordDetail3,
  exampleProps as recordDetail3ExampleProps,
  type RecordDetail3Props,
}
