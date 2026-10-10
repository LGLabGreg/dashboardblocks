'use client'

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
import { useId, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
  updates: ThreadComment[]
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
    { name: 'Sofia Rossi' },
  ],
  project: 'Website relaunch',
  updates: [
    {
      at: hoursAgo(5),
      author: { name: 'Sofia Rossi' },
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

async function saveUpdate() {
  await new Promise((resolve) => setTimeout(resolve, 500))
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
    updates: initialUpdates,
  } = props
  const headingId = useId()
  const [updates, setUpdates] = useState(initialUpdates)
  const [tab, setTab] = useState<Tab>('write')
  const [draft, setDraft] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const names = people.map((person) => person.name)
  const mentioned = getMentions(draft, names).flatMap((name) =>
    people.filter((person) => person.name === name),
  )

  async function post(body: string) {
    await onSubmit(body, { mentions: getMentions(body, names) })
    setUpdates((current) => [
      { at: now, author: currentUser, body, id: `${Date.now()}` },
      ...current,
    ])
    setDraft('')
    setTab('write')
  }

  async function postFromPreview() {
    setIsPosting(true)
    try {
      await post(draft.trim())
    } finally {
      setIsPosting(false)
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
    <Card>
      <CardHeader>
        <CardTitle>Post an update</CardTitle>
        <CardDescription>{project} · Visible to everyone on the project</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-6'>
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
        <Separator />
        <section aria-labelledby={headingId} className='flex flex-col gap-5'>
          <h3 id={headingId} className='text-sm font-medium'>
            Recent updates
          </h3>
          {updates.map((update) => (
            <CommentItem
              key={update.id}
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
        </section>
      </CardContent>
    </Card>
  )
}

export { Comments2, exampleProps as comments2ExampleProps, type Comments2Props }
