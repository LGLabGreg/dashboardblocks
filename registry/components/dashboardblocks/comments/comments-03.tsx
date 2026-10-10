'use client'

import {
  type CommentAuthor,
  CommentThread,
  type ThreadComment,
  toggleReaction,
  updateComment,
} from '@/registry/components/dashboardblocks/comments'
import { Fragment, type ReactNode, useRef, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ReviewComment extends ThreadComment {
  quote: string
}

type Filter = 'open' | 'resolved'

interface Comments3Props {
  comments: ReviewComment[]
  currentUser: CommentAuthor
  document: {
    paragraphs: string[]
    status: string
    title: string
    updated: string
  }
  /** Pass a fixed date, so times render the same on the server and in the browser. */
  now: Date
  onReact?: (commentId: string, emoji: string) => void
  onResolve?: (commentId: string, resolved: boolean) => void
  onSubmit?: (body: string, options: { parentId: string }) => Promise<void>
  people: CommentAuthor[]
}

const exampleNow = new Date(Date.UTC(2026, 8, 26, 12))
const hoursAgo = (hours: number) => new Date(exampleNow.getTime() - hours * 3_600_000)

const amara = { name: 'Amara Okafor' }
const priya = { name: 'Priya Nair' }
const lena = { name: 'Lena Fischer' }
const mateo = { name: 'Mateo Silva' }
const jonas = { name: 'Jonas Weber' }

const exampleProps: Comments3Props = {
  comments: [
    {
      at: hoursAgo(4),
      author: priya,
      body: 'Legal asked for “No card required” so it matches the checkout page.',
      id: 'r1',
      quote: 'No credit card needed',
      reactions: [{ count: 1, emoji: '👍', reacted: false }],
      replies: [
        {
          at: hoursAgo(3),
          author: lena,
          body: '@Priya Nair checkout says “No card required” too, so let’s use that everywhere.',
          id: 'r1-1',
        },
      ],
    },
    {
      at: hoursAgo(2),
      author: mateo,
      body: 'Support’s response time on Growth is one business day. Four hours is Enterprise only.',
      id: 'r2',
      quote: 'a four-hour response time',
      reactions: [{ count: 2, emoji: '👀', reacted: false }],
    },
    {
      at: hoursAgo(30),
      author: jonas,
      body: 'SSO is only on Enterprise. Listing it here will turn into support tickets.',
      id: 'r3',
      quote: 'SSO and audit logs',
      replies: [
        {
          at: hoursAgo(26),
          author: amara,
          body: 'Moved SSO to the Enterprise column and kept audit logs here.',
          id: 'r3-1',
        },
      ],
      resolved: true,
    },
  ],
  currentUser: amara,
  document: {
    paragraphs: [
      'Start free for 14 days. No credit card needed, and you can cancel any time from Settings.',
      'Teams on the annual plan save 20% and get priority support with a four-hour response time.',
      'Every plan includes unlimited dashboards, scheduled reports, SSO and audit logs.',
      'Need more than 200 seats? Talk to sales about volume pricing and invoicing.',
    ],
    status: 'In review',
    title: 'Pricing page copy',
    updated: 'Edited 2 hours ago by Sofia Rossi',
  },
  now: exampleNow,
  people: [priya, lena, mateo, jonas, { name: 'Sofia Rossi' }],
}

async function saveReply() {
  await new Promise((resolve) => setTimeout(resolve, 500))
}

function highlight(paragraph: string, comments: ReviewComment[], activeId?: string) {
  const parts: ReactNode[] = []
  let rest = paragraph
  let pending = comments.filter((comment) => comment.quote)
  for (;;) {
    const next = pending
      .map((comment) => ({ comment, index: rest.indexOf(comment.quote) }))
      .filter((found) => found.index >= 0)
      .sort((a, b) => a.index - b.index)[0]
    if (!next) break
    parts.push(rest.slice(0, next.index))
    parts.push(
      <mark
        key={next.comment.id}
        data-active={next.comment.id === activeId || undefined}
        className='text-foreground data-active:ring-amber-500/60 rounded-sm bg-amber-500/20 transition-colors data-active:bg-amber-500/35 data-active:ring-1'
      >
        {next.comment.quote}
      </mark>,
    )
    rest = rest.slice(next.index + next.comment.quote.length)
    pending = pending.filter((comment) => comment !== next.comment)
  }
  parts.push(rest)
  return parts.map((part, index) => <Fragment key={index}>{part}</Fragment>)
}

const Comments3 = (props: Comments3Props) => {
  const {
    comments: initialComments,
    currentUser,
    document,
    now,
    onReact = () => {},
    onResolve = () => {},
    onSubmit = saveReply,
    people,
  } = props
  const [comments, setComments] = useState(initialComments)
  const [filter, setFilter] = useState<Filter>('open')
  const [activeId, setActiveId] = useState<string>()
  const [status, setStatus] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const open = comments.filter((comment) => !comment.resolved)
  const resolved = comments.filter((comment) => comment.resolved)

  function update(id: string, change: (comment: ThreadComment) => ThreadComment) {
    setComments((current) => updateComment(current, id, change))
  }

  function resolve(comment: ReviewComment, next: boolean) {
    onResolve(comment.id, next)
    update(comment.id, (item) => ({ ...item, resolved: next }))
    setActiveId(undefined)
    setStatus(
      next
        ? `Resolved. ${open.length - 1} open ${open.length - 1 === 1 ? 'comment' : 'comments'} left.`
        : 'Reopened. It’s under Open.',
    )
    requestAnimationFrame(() => listRef.current?.focus())
  }

  const filters = [
    { items: open, label: 'Open', value: 'open' as const },
    { items: resolved, label: 'Resolved', value: 'resolved' as const },
  ]

  return (
    <div className='@container'>
      <div className='grid gap-6 @3xl:grid-cols-[minmax(0,1fr)_22rem]'>
        <Card className='self-start'>
          <CardHeader>
            <CardTitle className='flex flex-wrap items-center gap-2'>
              {document.title}
              <Badge variant='secondary'>{document.status}</Badge>
            </CardTitle>
            <CardDescription>{document.updated}</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4 text-sm leading-relaxed'>
            {document.paragraphs.map((paragraph) => (
              <p key={paragraph}>{highlight(paragraph, open, activeId)}</p>
            ))}
          </CardContent>
        </Card>
        <Card className='self-start'>
          <CardHeader>
            <CardTitle>Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
              <TabsList className='w-full'>
                {filters.map((item) => (
                  <TabsTrigger key={item.value} value={item.value}>
                    {item.label}
                    <span className='text-muted-foreground tabular-nums'>
                      {item.items.length}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
              {filters.map((item) => (
                <TabsContent key={item.value} value={item.value}>
                  <div
                    ref={item.value === filter ? listRef : undefined}
                    tabIndex={-1}
                    aria-label={`${item.label} comments`}
                    className='flex flex-col divide-y outline-none'
                  >
                    {item.items.length === 0 ? (
                      <p className='text-muted-foreground py-10 text-center text-sm'>
                        {item.value === 'open'
                          ? 'All comments are resolved.'
                          : 'No resolved comments yet.'}
                      </p>
                    ) : (
                      item.items.map((comment) => (
                        <div
                          key={comment.id}
                          className='py-4 first:pt-2 last:pb-0'
                          onMouseEnter={() => setActiveId(comment.id)}
                          onMouseLeave={() => setActiveId(undefined)}
                          onFocus={() => setActiveId(comment.id)}
                          onBlur={(event) => {
                            if (
                              !event.currentTarget.contains(
                                event.relatedTarget as Node | null,
                              )
                            )
                              setActiveId(undefined)
                          }}
                        >
                          <CommentThread
                            comment={comment}
                            currentUser={currentUser}
                            now={now}
                            people={people}
                            header={
                              <blockquote className='text-muted-foreground border-l-2 border-amber-500/60 pl-3 text-xs'>
                                <span className='line-clamp-2'>{comment.quote}</span>
                              </blockquote>
                            }
                            onReply={async (body) => {
                              await onSubmit(body, { parentId: comment.id })
                              update(comment.id, (parent) => ({
                                ...parent,
                                replies: [
                                  ...(parent.replies ?? []),
                                  {
                                    at: now,
                                    author: currentUser,
                                    body,
                                    id: `${Date.now()}`,
                                  },
                                ],
                              }))
                            }}
                            onReact={(commentId, emoji) => {
                              onReact(commentId, emoji)
                              update(commentId, (target) => ({
                                ...target,
                                reactions: toggleReaction(target.reactions, emoji),
                              }))
                            }}
                            onResolve={(next) => resolve(comment, next)}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
            <p aria-live='polite' className='sr-only'>
              {status}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export { Comments3, exampleProps as comments3ExampleProps, type Comments3Props }
