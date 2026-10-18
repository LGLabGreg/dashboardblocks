'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { Details } from '@/registry/components/dashboardblocks/details'
import { StarRating } from '@/registry/components/dashboardblocks/feedback'
import { StatusLabel } from '@/registry/components/dashboardblocks/status-label'
import { PersonAvatar } from '@/registry/components/dashboardblocks/team'

interface Review {
  author: string
  avatar?: string
  date: Date
  id: string
  rating: number
  replied?: boolean
  source: string
  text: string
}

interface Feedback3Props {
  description: string
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  /** Newest first. Leave out, or pass none, to show the empty state. */
  reviews?: Review[]
  status?: BlockStatus
  title: string
}

const NOW = new Date(Date.UTC(2026, 8, 26, 12))
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 86_400_000)

const exampleProps: Feedback3Props = {
  description: 'The latest from every source, newest first.',
  now: NOW,
  reviews: [
    {
      author: 'Priya Raman',
      avatar: '/images/avatar-02.webp',
      date: daysAgo(0.2),
      id: 'r1',
      rating: 5,
      source: 'App Store',
      text: 'The new dashboard is so much faster. Setting up reports took minutes, not an afternoon.',
    },
    {
      author: 'Marcus Webb',
      date: daysAgo(0.8),
      id: 'r2',
      rating: 2,
      replied: false,
      source: 'G2',
      text: 'Pricing jumped at renewal with no warning. The product is fine but this felt sneaky.',
    },
    {
      author: 'Lena Fischer',
      date: daysAgo(1.6),
      id: 'r3',
      rating: 4,
      source: 'Play Store',
      text: 'Love the offline mode. Sync occasionally takes a while after reconnecting.',
    },
    {
      author: 'Tomás Alvarez',
      avatar: '/images/avatar-04.webp',
      date: daysAgo(3),
      id: 'r4',
      rating: 1,
      replied: true,
      source: 'Support survey',
      text: 'Export to CSV has been broken for a week and nobody has told us when it will be fixed.',
    },
  ],
  title: 'Recent reviews',
}

const relative = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })

function formatReviewAge(date: Date, now: Date) {
  const hours = (now.getTime() - date.getTime()) / 3_600_000
  if (hours < 24) return relative.format(-Math.max(1, Math.round(hours)), 'hour')
  return relative.format(-Math.round(hours / 24), 'day')
}

const Feedback3 = (props: Feedback3Props) => {
  const { description, now, reviews = [], status, title } = props
  const state = getBlockState(status, reviews.length === 0)
  const needsReply = reviews.filter(
    (review) => review.rating <= 2 && !review.replied,
  ).length

  return (
    <BlockStateProvider status={status} empty={reviews.length === 0}>
      <section className='@container flex flex-col gap-3'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>
            {description}{' '}
            <BlockReady>
              {needsReply === 0
                ? 'Every low rating has a reply.'
                : `${needsReply} low ${needsReply === 1 ? 'rating is' : 'ratings are'} waiting for a reply.`}
            </BlockReady>
          </p>
        </header>
        {state && (
          <div className='border-t'>
            <BlockStateRows rows={4} />
          </div>
        )}
        {!state && (
          <ul className='flex flex-col divide-y border-t'>
            {reviews.map((review) => (
              <li key={review.id} className='flex gap-3 py-3 last:pb-0'>
                <PersonAvatar
                  person={{ avatar: review.avatar, name: review.author }}
                  size='sm'
                />
                <div className='flex min-w-0 flex-1 flex-col gap-1'>
                  <div className='flex flex-wrap items-center gap-x-2 gap-y-0.5'>
                    <span className='text-sm font-medium'>{review.author}</span>
                    <StarRating className='[&_svg]:size-3.5' value={review.rating} />
                    {review.rating <= 2 && (
                      <StatusLabel
                        className='text-xs'
                        tone={review.replied ? 'neutral' : 'warning'}
                      >
                        {review.replied ? 'Replied' : 'Needs a reply'}
                      </StatusLabel>
                    )}
                  </div>
                  <p className='text-sm text-pretty'>{review.text}</p>
                  <Details className='text-muted-foreground text-xs'>
                    {review.source}
                    <time dateTime={review.date.toISOString()}>
                      {formatReviewAge(review.date, now)}
                    </time>
                  </Details>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  Feedback3,
  exampleProps as feedback3ExampleProps,
  type Feedback3Props,
  type Review,
}
