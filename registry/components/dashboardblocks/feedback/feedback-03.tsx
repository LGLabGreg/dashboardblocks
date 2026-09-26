'use client'

import { StarRating } from '@/registry/components/dashboardblocks/feedback'
import { PersonAvatar } from '@/registry/components/dashboardblocks/team'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Review {
  author: string
  date: Date
  id: string
  rating: number
  /** Whether the team has replied. Low ratings without a reply are flagged. */
  replied?: boolean
  /** Where it was posted, e.g. "App Store". */
  source: string
  text: string
}

interface Feedback3Props {
  description: string
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  /** Newest first. */
  reviews: Review[]
  title: string
}

const NOW = new Date(Date.UTC(2026, 8, 26, 12))
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 86_400_000)

const exampleProps: Feedback3Props = {
  description: 'The latest from every source',
  now: NOW,
  reviews: [
    {
      author: 'Priya Raman',
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
  const { description, now, reviews, title } = props
  const needsReply = reviews.filter(
    (review) => review.rating <= 2 && !review.replied,
  ).length

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
          {needsReply > 0 && `, ${needsReply} waiting for a reply`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className='flex flex-col divide-y'>
          {reviews.map((review) => (
            <li key={review.id} className='flex gap-3 py-3 first:pt-0 last:pb-0'>
              <PersonAvatar person={{ name: review.author }} size='sm' />
              <div className='flex min-w-0 flex-1 flex-col gap-1'>
                <div className='flex flex-wrap items-center gap-x-2 gap-y-0.5'>
                  <span className='text-sm font-medium'>{review.author}</span>
                  <StarRating className='[&_svg]:size-3.5' value={review.rating} />
                  {review.rating <= 2 && (
                    <span
                      className={
                        review.replied
                          ? 'text-muted-foreground text-xs'
                          : 'rounded-full bg-amber-500/10 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-400'
                      }
                    >
                      {review.replied ? 'Replied' : 'Needs reply'}
                    </span>
                  )}
                </div>
                <p className='text-sm'>{review.text}</p>
                <span className='text-muted-foreground text-xs'>
                  {review.source} ·{' '}
                  <time dateTime={review.date.toISOString()}>
                    {formatReviewAge(review.date, now)}
                  </time>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export {
  Feedback3,
  exampleProps as feedback3ExampleProps,
  type Feedback3Props,
  type Review,
}
