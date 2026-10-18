'use client'

import {
  BlockStateProvider,
  BlockStateText,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  SentimentChart,
  type SentimentTopic,
  formatNetSentiment,
  getNetSentiment,
} from '@/registry/components/dashboardblocks/feedback'
import { formatNumber } from '@/registry/lib/dashboardblocks/format'

interface Feedback2Props {
  description: string
  status?: BlockStatus
  title: string
  /** Leave out, or pass none, to show the empty state. */
  topics?: SentimentTopic[]
}

const exampleProps: Feedback2Props = {
  description: 'Mentions in reviews and support tickets from the last 30 days.',
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
  const { description, status, title, topics = [] } = props
  const state = getBlockState(status, topics)
  const sorted = [...topics].sort((a, b) => getNetSentiment(b) - getNetSentiment(a))
  const mentions = topics.reduce(
    (sum, topic) => sum + topic.negative + topic.neutral + topic.positive,
    0,
  )
  const best = sorted[0]
  const negative = sorted.filter((topic) => getNetSentiment(topic) < 0)
  const worst = negative.at(-1)

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        {state && (
          <div className='border-t pt-4'>
            <BlockStateText className='text-sm' />
          </div>
        )}
        {!state && best && (
          <p className='border-t pt-4 text-sm text-pretty'>
            People like <span className='font-medium'>{best.label.toLowerCase()}</span>{' '}
            most, at{' '}
            <span className='tabular-nums'>
              {formatNetSentiment(getNetSentiment(best))}
            </span>
            {worst &&
              (negative.length === 1 ? (
                <>
                  , and <span className='font-medium'>{worst.label.toLowerCase()}</span>{' '}
                  is the one topic with more complaints than praise
                </>
              ) : (
                <>
                  , and <span className='tabular-nums'>{negative.length}</span> topics get
                  more complaints than praise,{' '}
                  <span className='font-medium'>{worst.label.toLowerCase()}</span> most
                </>
              ))}
            .{' '}
            <span className='text-muted-foreground'>
              From <span className='tabular-nums'>{formatNumber(mentions)}</span>{' '}
              mentions.
            </span>
          </p>
        )}
        <SentimentChart label={`${title}: ${description}`} topics={sorted} />
        {state !== 'error' && state !== 'empty' && (
          <p className='text-muted-foreground text-xs'>
            Net is positive minus negative mentions, as a share of all mentions, from −100
            to +100.
          </p>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Feedback2, exampleProps as feedback2ExampleProps, type Feedback2Props }
