'use client'

import {
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { Details } from '@/registry/components/dashboardblocks/details'
import {
  type InsightDriver,
  InsightDrivers,
  type InsightKind,
  InsightLabel,
  type InsightSegment,
  InsightText,
  insightToString,
} from '@/registry/components/dashboardblocks/insights'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import { buttonVariants } from '@/components/ui/button'

interface InsightItem {
  /** @default 'Explore' */
  actionLabel?: string
  drivers?: InsightDriver[]
  href?: string
  id: string
  kind: InsightKind
  segments: InsightSegment[]
  topic: string
}

interface Insights1Props {
  description: string
  /** Leave out, or pass none, to show the empty state. */
  insights?: InsightItem[]
  status?: BlockStatus
  title: string
}

const exampleProps: Insights1Props = {
  description: 'What moved from Sep 14 to 20, against the week before.',
  insights: [
    {
      drivers: [
        { label: 'Organic search', tone: 'positive', value: '+812' },
        { label: 'Referral', tone: 'positive', value: '+264' },
      ],
      href: '#',
      id: 'i1',
      kind: 'positive',
      segments: [
        'Signups ',
        { text: 'up 24%', tone: 'positive' },
        ' to ',
        { text: '6,634' },
        ', driven by organic search after the pricing page launch.',
      ],
      topic: 'Acquisition',
    },
    {
      actionLabel: 'Investigate',
      href: '#',
      id: 'i2',
      kind: 'anomaly',
      segments: [
        'Checkout conversions dropped to ',
        { text: '212', tone: 'negative' },
        ' on Tuesday, ',
        { text: '42% below', tone: 'negative' },
        ' what was expected. Traffic was normal that day.',
      ],
      topic: 'Checkout',
    },
    {
      drivers: [
        { label: 'Starter plan', tone: 'negative', value: '+0.6 pp' },
        { label: 'Annual plans', tone: 'positive', value: '−0.1 pp' },
      ],
      href: '#',
      id: 'i3',
      kind: 'negative',
      segments: [
        'Monthly churn ',
        { text: 'rose to 3.1%', tone: 'negative' },
        ' from 2.6%, mostly among Starter customers in their first 60 days.',
      ],
      topic: 'Retention',
    },
    {
      href: '#',
      id: 'i4',
      kind: 'neutral',
      segments: [
        'Mobile now accounts for ',
        { text: '52%' },
        ' of sessions, the first week it has passed desktop.',
      ],
      topic: 'Traffic',
    },
  ],
  title: 'Insights',
}

const Insights1 = (props: Insights1Props) => {
  const { description, insights = [], status, title } = props

  return (
    <BlockStateProvider state={getBlockState(status, insights)}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <BlockStateRows className='border-y' />
        {!status && insights.length > 0 && (
          <ul className='divide-y border-y'>
            {insights.map((insight) => (
              <li
                key={insight.id}
                className='flex flex-col gap-3 py-4 @lg:flex-row @lg:items-start @lg:gap-6'
              >
                <div className='flex min-w-0 flex-1 flex-col gap-1.5'>
                  <Details className='text-muted-foreground text-xs'>
                    <InsightLabel className='text-xs' kind={insight.kind} />
                    {insight.topic}
                  </Details>
                  <InsightText segments={insight.segments} />
                  {insight.drivers && <InsightDrivers drivers={insight.drivers} />}
                </div>
                {insight.href && (
                  <a
                    href={insight.href}
                    aria-label={`${insight.actionLabel ?? 'Explore'}: ${insightToString(insight.segments)}`}
                    className={buttonVariants({
                      className: 'self-start',
                      size: 'sm',
                      variant: 'outline',
                    })}
                  >
                    {insight.actionLabel ?? 'Explore'}
                    <IconPlaceholder
                      lucide='ArrowRightIcon'
                      tabler='IconArrowRight'
                      hugeicons='ArrowRight01Icon'
                      phosphor='ArrowRightIcon'
                      remixicon='RiArrowRightLine'
                      data-icon='inline-end'
                    />
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Insights1, exampleProps as insights1ExampleProps, type Insights1Props }
