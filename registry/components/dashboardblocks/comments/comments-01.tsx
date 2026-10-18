'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  CommentAvatar,
  type CommentAuthor,
  CommentComposer,
  CommentThread,
  type ThreadComment,
  toggleReaction,
  updateComment,
} from '@/registry/components/dashboardblocks/comments'
import { startTransition, useRef, useState } from 'react'

interface Comments1Props {
  /** Leave out, or pass none, to show the empty state. */
  comments?: ThreadComment[]
  currentUser: CommentAuthor
  /** Pass a fixed date, so times render the same on the server and in the browser. */
  now: Date
  onDelete?: (commentId: string) => void
  onEdit?: (commentId: string, body: string) => Promise<void>
  onReact?: (commentId: string, emoji: string) => void
  onResolve?: (commentId: string, resolved: boolean) => void
  /** Posts a comment, or a reply when `parentId` is set. */
  onSubmit?: (body: string, options: { parentId?: string }) => Promise<void>
  people: CommentAuthor[]
  status?: BlockStatus
  title: string
}

const exampleNow = new Date(Date.UTC(2026, 8, 26, 12))
const hoursAgo = (hours: number) => new Date(exampleNow.getTime() - hours * 3_600_000)

const amara = { name: 'Amara Okafor' }
const priya = { avatar: '/images/avatar-02.webp', name: 'Priya Nair' }
const lena = { avatar: '/images/avatar-03.webp', name: 'Lena Fischer' }
const mateo = { name: 'Mateo Silva' }
const jonas = { avatar: '/images/avatar-07.webp', name: 'Jonas Weber' }

const exampleProps: Comments1Props = {
  comments: [
    {
      at: hoursAgo(3),
      author: priya,
      body: 'Enterprise ARR jumped 18% in August. @Lena Fischer is that the Northwind renewal landing early?',
      id: 'c1',
      reactions: [{ count: 2, emoji: '👀', reacted: false }],
      replies: [
        {
          at: hoursAgo(2.5),
          author: lena,
          body: 'Yes, they signed on Aug 28 instead of Sep 15. I’ll add a note to the chart.',
          id: 'c1-1',
          reactions: [{ count: 3, emoji: '👍', reacted: true }],
        },
        {
          at: hoursAgo(1),
          author: mateo,
          body: 'Worth splitting renewals from new business here, otherwise September will look flat.',
          id: 'c1-2',
        },
      ],
    },
    {
      at: hoursAgo(26),
      author: amara,
      body: 'SMB churn is back under 3% for the first time since March. Nice work on the onboarding emails, @Mateo Silva 🎉',
      edited: true,
      id: 'c2',
      reactions: [
        { count: 4, emoji: '🎉', reacted: false },
        { count: 1, emoji: '❤️', reacted: false },
      ],
    },
    {
      at: hoursAgo(50),
      author: jonas,
      body: 'The EU revenue tile includes VAT, so it doesn’t match the finance report.',
      id: 'c3',
      replies: [
        {
          at: hoursAgo(47),
          author: lena,
          body: 'Fixed in the model. Revenue is net of VAT everywhere now.',
          id: 'c3-1',
        },
      ],
      resolved: true,
    },
  ],
  currentUser: amara,
  now: exampleNow,
  people: [priya, lena, mateo, jonas],
  title: 'Q3 revenue review',
}

const noComments: ThreadComment[] = []

async function save() {
  await new Promise((resolve) => setTimeout(resolve, 500))
}

const Comments1 = (props: Comments1Props) => {
  const {
    comments: initialComments = noComments,
    currentUser,
    now,
    onDelete = () => {},
    onEdit = save,
    onReact = () => {},
    onResolve = () => {},
    onSubmit = save,
    people,
    status,
    title,
  } = props
  const [comments, setComments] = useState(initialComments)
  const [loaded, setLoaded] = useState(initialComments)
  if (initialComments !== loaded) {
    setLoaded(initialComments)
    setComments(initialComments)
  }
  const state = getBlockState(status, comments.length === 0)
  const composerRef = useRef<HTMLDivElement>(null)
  const open = comments.filter((comment) => !comment.resolved).length
  const resolved = comments.length - open

  async function post(body: string, parentId?: string) {
    await onSubmit(body, { parentId })
    startTransition(() => {
      setComments((current) => {
        const comment: ThreadComment = {
          at: now,
          author: currentUser,
          body,
          id: `${Date.now()}`,
        }
        return parentId
          ? updateComment(current, parentId, (parent) => ({
              ...parent,
              replies: [...(parent.replies ?? []), comment],
            }))
          : [...current, comment]
      })
    })
  }

  return (
    <BlockStateProvider status={status} empty={comments.length === 0}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>
              {open} open {open === 1 ? 'thread' : 'threads'} in the discussion
              {resolved > 0 && `, ${resolved} resolved`}.
            </p>
          </BlockReady>
        </header>
        <div className='flex flex-col divide-y border-t'>
          <BlockStateRows className='pb-4' rows={4} />
          {!state &&
            comments.map((comment) => (
              <CommentThread
                key={comment.id}
                className='py-4'
                comment={comment}
                currentUser={currentUser}
                now={now}
                people={people}
                onReply={(body) => post(body, comment.id)}
                onReact={(commentId, emoji) => {
                  onReact(commentId, emoji)
                  setComments((current) =>
                    updateComment(current, commentId, (item) => ({
                      ...item,
                      reactions: toggleReaction(item.reactions, emoji),
                    })),
                  )
                }}
                onResolve={(resolved) => {
                  onResolve(comment.id, resolved)
                  setComments((current) =>
                    updateComment(current, comment.id, (item) => ({ ...item, resolved })),
                  )
                }}
                onEdit={async (commentId, body) => {
                  await onEdit(commentId, body)
                  startTransition(() =>
                    setComments((current) =>
                      updateComment(current, commentId, (item) => ({
                        ...item,
                        body,
                        edited: true,
                      })),
                    ),
                  )
                }}
                onDelete={(commentId) => {
                  onDelete(commentId)
                  setComments((current) => updateComment(current, commentId, () => null))
                  if (commentId === comment.id) {
                    requestAnimationFrame(() =>
                      composerRef.current?.querySelector('textarea')?.focus(),
                    )
                  }
                }}
              />
            ))}
        </div>
        <div ref={composerRef} className='-mt-4 flex gap-3 border-t pt-4'>
          <CommentAvatar author={currentUser} className='self-start' />
          <CommentComposer
            className='min-w-0 flex-1'
            disabled={state === 'loading' || state === 'error'}
            people={people}
            placeholder='Add to the discussion…'
            onSubmit={(body) => post(body)}
          />
        </div>
      </section>
    </BlockStateProvider>
  )
}

export { Comments1, exampleProps as comments1ExampleProps, type Comments1Props }
