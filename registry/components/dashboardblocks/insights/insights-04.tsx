'use client'

import {
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  type InsightKind,
  InsightLabel,
  type InsightSegment,
  InsightText,
} from '@/registry/components/dashboardblocks/insights'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useId, useState } from 'react'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

type DigestFeedback = 'helpful' | 'not-helpful'

interface Takeaway {
  kind: InsightKind
  segments: InsightSegment[]
}

interface Insights4Props extends BlockStateProps {
  defaultFeedback?: DigestFeedback | null
  headline: string
  /** Called with `null` when the reader takes their feedback back. */
  onFeedback?: (feedback: DigestFeedback | null) => void
  period: string
  /** Leave out, or pass none, to show the empty state. */
  takeaways?: Takeaway[]
}

const exampleProps: Insights4Props = {
  headline: 'A strong week for signups, with a checkout dip to look into',
  period: 'Weekly digest, Sep 14–20',
  takeaways: [
    {
      kind: 'positive',
      segments: [
        'Signups ',
        { text: 'up 24%', tone: 'positive' },
        ' to 6,634. Organic search brought in ',
        { text: '+812', tone: 'positive' },
        ' after the new pricing page went live.',
      ],
    },
    {
      kind: 'anomaly',
      segments: [
        'Checkout conversions fell to ',
        { text: '212', tone: 'negative' },
        ' on Tuesday, ',
        { text: '42% below', tone: 'negative' },
        ' expected, while card payment errors spiked.',
      ],
    },
    {
      kind: 'neutral',
      segments: [
        'Mobile passed desktop for the first time, at ',
        { text: '52%' },
        ' of sessions.',
      ],
    },
  ],
}

const feedbackOptions = [
  { label: 'Helpful', value: 'helpful' },
  { label: 'Not helpful', value: 'not-helpful' },
] as const

const Insights4 = (props: Insights4Props) => {
  const {
    defaultFeedback = null,
    headline,
    onFeedback,
    period,
    errorMessage,
    status,
    takeaways = [],
  } = props
  const unavailable = status !== undefined || takeaways.length === 0
  const [feedback, setFeedback] = useState<DigestFeedback | null>(defaultFeedback)
  const [announcement, setAnnouncement] = useState('')
  const promptId = useId()

  const choose = (value: DigestFeedback) => {
    const next = feedback === value ? null : value
    setFeedback(next)
    setAnnouncement(next ? 'Thanks for your feedback' : 'Feedback removed')
    onFeedback?.(next)
  }

  return (
    <BlockStateProvider
      errorMessage={errorMessage}
      state={getBlockState(status, takeaways)}
    >
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{headline}</h2>
          <p className='text-muted-foreground text-sm'>{period}</p>
        </header>
        <BlockStateRows className='border-y' rows={3} />
        {!unavailable && (
          <ol className='flex flex-col divide-y border-y'>
            {takeaways.map((takeaway, index) => (
              <li key={index} className='flex flex-col gap-1 py-3'>
                <InsightLabel className='text-xs' kind={takeaway.kind} />
                <InsightText segments={takeaway.segments} />
              </li>
            ))}
          </ol>
        )}
        <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-2'>
          <p id={promptId} className='text-muted-foreground text-sm'>
            Was this digest helpful?
          </p>
          <div role='group' aria-labelledby={promptId} className='flex gap-2'>
            {feedbackOptions.map((option) => {
              const pressed = feedback === option.value
              return (
                <Button
                  key={option.value}
                  variant='outline'
                  size='sm'
                  aria-pressed={pressed}
                  disabled={unavailable}
                  onClick={() => choose(option.value)}
                  className='aria-pressed:border-foreground/30 aria-pressed:bg-muted'
                >
                  {option.value === 'helpful' ? (
                    <IconPlaceholder
                      lucide='ThumbsUpIcon'
                      tabler='IconThumbUp'
                      hugeicons='ThumbsUpIcon'
                      phosphor='ThumbsUpIcon'
                      remixicon='RiThumbUpLine'
                      data-icon='inline-start'
                      className={cn(pressed && 'fill-current')}
                    />
                  ) : (
                    <IconPlaceholder
                      lucide='ThumbsDownIcon'
                      tabler='IconThumbDown'
                      hugeicons='ThumbsDownIcon'
                      phosphor='ThumbsDownIcon'
                      remixicon='RiThumbDownLine'
                      data-icon='inline-start'
                      className={cn(pressed && 'fill-current')}
                    />
                  )}
                  {option.label}
                </Button>
              )
            })}
          </div>
          <p role='status' className='sr-only'>
            {announcement}
          </p>
        </div>
      </section>
    </BlockStateProvider>
  )
}

export { Insights4, exampleProps as insights4ExampleProps, type Insights4Props }
