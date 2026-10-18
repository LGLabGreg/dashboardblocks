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
  CommentItem,
  getMentions,
  type ThreadComment,
  toggleReaction,
  updateComment,
} from '@/registry/components/dashboardblocks/comments'
import { startTransition, useId, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Tab = 'write' | 'preview'

interface Comments2Props {
  currentUser: CommentAuthor
  /** Pass a fixed date, so times render the same on the server and in the browser. */
  now: Date
  onReact?: (updateId: string, emoji: string) => void
  /** Posts an update and notifies the people it mentions. */
  onSubmit?: (body: string, options: { mentions: string[] }) => Promise<void>
  people: CommentAuthor[]
  project: string
  status?: BlockStatus
  title: string
  /** Newest first. Leave out, or pass none, to show the empty state. */
  updates?: ThreadComment[]
}

const exampleNow = new Date(Date.UTC(2026, 8, 26, 12))
const hoursAgo = (hours: number) => new Date(exampleNow.getTime() - hours * 3_600_000)

const exampleProps: Comments2Props = {
  currentUser: { name: 'Amara Okafor' },
  now: exampleNow,
  people: [
    { name: 'Priya Nair' },
    { name: 'Lena Fischer' },
    { name: 'Mateo Silva' },
    { name: 'Jonas Weber' },
    { avatar: '/images/avatar-05.webp', name: 'Sofia Rossi' },
  ],
  project: 'Website relaunch',
  title: 'Post an update',
  updates: [
    {
      at: hoursAgo(5),
      author: { avatar: '/images/avatar-05.webp', name: 'Sofia Rossi' },
      body: 'New pricing page is on staging. @Priya Nair can you check the annual toggle copy before Thursday?',
      id: 'u1',
      reactions: [
        { count: 2, emoji: '👍', reacted: false },
        { count: 1, emoji: '👀', reacted: true },
      ],
    },
    {
      at: hoursAgo(29),
      author: { name: 'Mateo Silva' },
      body: 'Lighthouse score is up from 71 to 94 on mobile after moving the hero video to a poster image.',
      id: 'u2',
      reactions: [{ count: 5, emoji: '🚀', reacted: false }],
    },
  ],
}

const noUpdates: ThreadComment[] = []

async function saveUpdate() {
  await new Promise((resolve) => setTimeout(resolve, 500))
}

const describeUpdates = (updates: ThreadComment[], now: Date) => {
  if (updates.length === 0) return 'No updates yet. The first one shows here.'
  const latest = Math.max(...updates.map((update) => update.at.getTime()))
  const hours = Math.max(0, Math.round((now.getTime() - latest) / 3_600_000))
  const when =
    hours < 1 ? 'under an hour ago' : `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  return `${updates.length} ${updates.length === 1 ? 'update' : 'updates'}, the latest ${when}.`
}

const listFormat = new Intl.ListFormat('en-US', { type: 'conjunction' })

const Comments2 = (props: Comments2Props) => {
  const {
    currentUser,
    now,
    onReact = () => {},
    onSubmit = saveUpdate,
    people,
    project,
    status,
    title,
    updates: initialUpdates = noUpdates,
  } = props
  const headingId = useId()
  const [updates, setUpdates] = useState(initialUpdates)
  const [loaded, setLoaded] = useState(initialUpdates)
  if (initialUpdates !== loaded) {
    setLoaded(initialUpdates)
    setUpdates(initialUpdates)
  }
  const state = getBlockState(status, updates.length === 0)
  const [tab, setTab] = useState<Tab>('write')
  const [draft, setDraft] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const names = people.map((person) => person.name)
  const mentioned = getMentions(draft, names).flatMap((name) =>
    people.filter((person) => person.name === name),
  )

  async function post(body: string) {
    await onSubmit(body, { mentions: getMentions(body, names) })
    startTransition(() => {
      setUpdates((current) => [
        { at: now, author: currentUser, body, id: `${Date.now()}` },
        ...current,
      ])
      setDraft('')
      setTab('write')
    })
  }

  async function postFromPreview() {
    setIsPosting(true)
    try {
      await post(draft.trim())
    } finally {
      startTransition(() => setIsPosting(false))
    }
  }

  const notifies =
    mentioned.length > 0 ? (
      <span className='flex min-w-0 items-center gap-2'>
        <span className='flex shrink-0 -space-x-1.5'>
          {mentioned.slice(0, 3).map((person) => (
            <CommentAvatar
              key={person.name}
              author={person}
              size='sm'
              className='ring-background ring-2'
            />
          ))}
        </span>
        <span className='truncate'>
          Notifies {listFormat.format(mentioned.map((person) => person.name))}
        </span>
      </span>
    ) : (
      'Type @ to notify a teammate'
    )

  return (
    <BlockStateProvider status={status} empty={updates.length === 0}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>
            {project}. Everyone on the project sees it, and anyone you mention is
            notified.
          </p>
        </header>
        <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
          <TabsList>
            <TabsTrigger value='write'>Write</TabsTrigger>
            <TabsTrigger value='preview'>Preview</TabsTrigger>
          </TabsList>
          <TabsContent value='write'>
            <CommentComposer
              label='Update'
              placeholder='What changed, and who needs to know?'
              submitLabel='Post update'
              people={people}
              value={draft}
              footer={<span className='text-muted-foreground'>{notifies}</span>}
              onValueChange={setDraft}
              onSubmit={post}
            />
          </TabsContent>
          <TabsContent value='preview' className='flex flex-col gap-3'>
            <div className='min-h-24 rounded-md border p-3'>
              {draft.trim() ? (
                <CommentItem
                  comment={{ at: now, author: currentUser, body: draft, id: 'preview' }}
                  now={now}
                  people={people}
                />
              ) : (
                <p className='text-muted-foreground text-sm'>Nothing to preview yet.</p>
              )}
            </div>
            <div className='flex items-center justify-between gap-3'>
              <span className='text-muted-foreground min-w-0 text-xs'>{notifies}</span>
              <Button
                size='sm'
                disabled={isPosting || !draft.trim()}
                onClick={() => void postFromPreview()}
              >
                {isPosting ? 'Posting…' : 'Post update'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        <section
          aria-labelledby={headingId}
          className='flex flex-col gap-1 border-t pt-4'
        >
          <h3 id={headingId} className='text-sm font-medium'>
            Recent updates
          </h3>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>
              {describeUpdates(updates, now)}
            </p>
          </BlockReady>
          <div className='mt-2 flex flex-col divide-y'>
            <BlockStateRows rows={3} />
            {!state &&
              updates.map((update) => (
                <CommentItem
                  key={update.id}
                  className='py-4 first:pt-0 last:pb-0'
                  comment={update}
                  now={now}
                  people={people}
                  onReact={(emoji) => {
                    onReact(update.id, emoji)
                    setUpdates((current) =>
                      updateComment(current, update.id, (item) => ({
                        ...item,
                        reactions: toggleReaction(item.reactions, emoji),
                      })),
                    )
                  }}
                />
              ))}
          </div>
        </section>
      </section>
    </BlockStateProvider>
  )
}

export { Comments2, exampleProps as comments2ExampleProps, type Comments2Props }
