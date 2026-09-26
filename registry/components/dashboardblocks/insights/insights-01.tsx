'use client'

import {
  type InsightDriver,
  InsightDrivers,
  InsightIcon,
  type InsightKind,
  type InsightSegment,
  InsightText,
  insightKindConfig,
  insightToString,
} from '@/registry/components/dashboardblocks/insights'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface InsightItem {
  /** @default 'Explore' */
  actionLabel?: string
  drivers?: InsightDriver[]
  href?: string
  id: string
  kind: InsightKind
  segments: InsightSegment[]
  /** What the insight is about, such as a metric or a team. */
  topic: string
}

interface Insights1Props {
  description: string
  insights: InsightItem[]
  title: string
}

const exampleProps: Insights1Props = {
  description: '14–20 Sep compared with the week before',
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
  const { description, insights, title } = props

  return (
    <Card className='@container gap-0 pb-0'>
      <CardHeader className='border-b'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='px-0'>
        <ul>
          {insights.map((insight) => {
            const config = insightKindConfig[insight.kind]
            return (
              <li
                key={insight.id}
                className='flex flex-col gap-3 border-b px-6 py-4 last:border-b-0 @lg:flex-row @lg:items-start'
              >
                <div className='flex min-w-0 flex-1 items-start gap-3'>
                  <InsightIcon kind={insight.kind} />
                  <div className='flex min-w-0 flex-col gap-1.5'>
                    <p className='text-xs'>
                      <span className={cn('font-semibold', config.text)}>
                        {config.label}
                      </span>
                      <span className='text-muted-foreground'> · {insight.topic}</span>
                    </p>
                    <InsightText segments={insight.segments} />
                    {insight.drivers && <InsightDrivers drivers={insight.drivers} />}
                  </div>
                </div>
                {insight.href && (
                  <div className='pl-11 @lg:pl-0'>
                    <a
                      href={insight.href}
                      aria-label={`${insight.actionLabel ?? 'Explore'}: ${insightToString(insight.segments)}`}
                      className={buttonVariants({ size: 'sm', variant: 'outline' })}
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
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

export { Insights1, exampleProps as insights1ExampleProps, type Insights1Props }
