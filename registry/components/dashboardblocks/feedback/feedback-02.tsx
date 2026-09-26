'use client'

import {
  SentimentBar,
  type SentimentCounts,
  SentimentKey,
  getNetSentiment,
} from '@/registry/components/dashboardblocks/feedback'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface FeedbackTopic extends SentimentCounts {
  label: string
}

interface Feedback2Props {
  description: string
  title: string
  topics: FeedbackTopic[]
}

const exampleProps: Feedback2Props = {
  description: 'Mentions in reviews and support tickets, last 30 days',
  title: 'Sentiment by topic',
  topics: [
    { label: 'Ease of use', negative: 38, neutral: 71, positive: 412 },
    { label: 'Support', negative: 64, neutral: 58, positive: 296 },
    { label: 'Integrations', negative: 71, neutral: 92, positive: 188 },
    { label: 'Performance', negative: 142, neutral: 61, positive: 174 },
    { label: 'Pricing', negative: 203, neutral: 87, positive: 96 },
  ],
}

const Feedback2 = (props: Feedback2Props) => {
  const { description, title, topics } = props
  const sorted = [...topics].sort((a, b) => getNetSentiment(b) - getNetSentiment(a))
  // One scale for every row: each half spans the largest side of any row.
  const extent = Math.max(
    0.01,
    ...topics.map((topic) => {
      const total = topic.negative + topic.neutral + topic.positive || 1
      return Math.max(topic.negative, topic.positive) / total + topic.neutral / 2 / total
    }),
  )

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <ul className='text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs'>
          <li className='flex items-center gap-1.5'>
            <SentimentKey sentiment='negative' />
            Negative
          </li>
          <li className='flex items-center gap-1.5'>
            <SentimentKey sentiment='neutral' />
            Neutral
          </li>
          <li className='flex items-center gap-1.5'>
            <SentimentKey sentiment='positive' />
            Positive
          </li>
        </ul>
        {/* Narrow cards stack the bar under its label; wider ones put it between label and net. */}
        <div className='grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 @md:grid-cols-[auto_minmax(0,1fr)_auto]'>
          <span className='hidden @md:block' />
          <span className='text-muted-foreground col-span-full flex justify-between text-[11px] @md:col-span-1'>
            <span>More negative</span>
            <span>More positive</span>
          </span>
          <span className='text-muted-foreground hidden text-right text-[11px] @md:block'>
            Net
          </span>
          {sorted.map((topic) => {
            const net = getNetSentiment(topic)
            const total = topic.negative + topic.neutral + topic.positive
            return (
              <div
                key={topic.label}
                className='col-span-full grid grid-cols-subgrid items-center gap-y-1.5'
              >
                <span className='col-start-1 row-start-1 text-sm whitespace-nowrap'>
                  {topic.label}
                </span>
                <SentimentBar
                  className='col-span-full row-start-2 @md:col-span-1 @md:col-start-2 @md:row-start-1'
                  counts={topic}
                  extent={extent}
                  variant='diverging'
                />
                <span
                  className={cn(
                    'col-start-2 row-start-1 w-12 text-right text-sm font-medium tabular-nums @md:col-start-3',
                    net > 0.05
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : net < -0.05
                        ? 'text-red-700 dark:text-red-400'
                        : 'text-muted-foreground',
                  )}
                >
                  {net > 0 ? '+' : net < 0 ? '−' : ''}
                  {Math.abs(Math.round(net * 100))}
                  <span className='sr-only'>
                    {`: ${topic.positive} positive, ${topic.neutral} neutral and ${topic.negative} negative of ${total} mentions`}
                  </span>
                </span>
              </div>
            )
          })}
        </div>
        <p className='text-muted-foreground border-t pt-3 text-xs'>
          Net is positive minus negative mentions, as a share of all mentions, from −100
          to +100.
        </p>
      </CardContent>
    </Card>
  )
}

export {
  Feedback2,
  exampleProps as feedback2ExampleProps,
  type Feedback2Props,
  type FeedbackTopic,
}
