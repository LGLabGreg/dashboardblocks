'use client'

import {
  StarRating,
  getRatingSummary,
} from '@/registry/components/dashboardblocks/feedback'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Feedback1Props {
  /** How many 1, 2, 3, 4 and 5-star ratings. */
  counts: number[]
  description: string
  /** The average for the period before, to show the change. */
  previousAverage?: number
  title: string
}

const exampleProps: Feedback1Props = {
  counts: [86, 64, 171, 612, 1_491],
  description: 'App Store and Play ratings, last 90 days',
  previousAverage: 4.31,
  title: 'Ratings',
}

const Feedback1 = (props: Feedback1Props) => {
  const { counts, description, previousAverage, title } = props
  const { average, shares, total } = getRatingSummary(counts)
  const change = previousAverage !== undefined ? average - previousAverage : null

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5 @md:flex-row @md:items-center @md:gap-8'>
        <div className='flex flex-col items-start gap-1 @md:items-center @md:text-center'>
          <span className='text-5xl font-semibold tracking-tight tabular-nums'>
            {average.toFixed(1)}
          </span>
          <StarRating value={average} />
          <span className='text-muted-foreground text-xs tabular-nums'>
            {total.toLocaleString()} ratings
          </span>
          {change !== null && Math.abs(change) >= 0.01 && (
            <span
              className={
                change > 0
                  ? 'text-xs font-medium text-green-700 dark:text-green-400'
                  : 'text-xs font-medium text-red-700 dark:text-red-400'
              }
            >
              {change > 0 ? '↑' : '↓'} {Math.abs(change).toFixed(2)} on last period
            </span>
          )}
        </div>
        <ol className='flex flex-1 flex-col-reverse gap-1.5'>
          {counts.map((count, index) => (
            <li key={index} className='flex items-center gap-2 text-sm'>
              <span className='text-muted-foreground w-10 shrink-0 tabular-nums'>
                {index + 1}
                <span aria-hidden> ★</span>
                <span className='sr-only'> stars</span>
              </span>
              <span
                aria-hidden
                className='bg-muted h-2 flex-1 overflow-hidden rounded-full'
              >
                <span
                  className='block h-full rounded-full bg-amber-500'
                  style={{ width: `${shares[index] * 100}%` }}
                />
              </span>
              <span className='w-10 shrink-0 text-right tabular-nums'>
                {Math.round(shares[index] * 100)}%
              </span>
              <span className='text-muted-foreground hidden w-12 shrink-0 text-right text-xs tabular-nums @md:inline'>
                {count.toLocaleString()}
              </span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

export { Feedback1, exampleProps as feedback1ExampleProps, type Feedback1Props }
