'use client'

import { Billing1 } from '@/registry/components/dashboardblocks/billing/billing-01'
import { BlockBusy } from '@/registry/components/dashboardblocks/block-state'
import {
  type DateRangePreset,
  ExportMenu,
  FilterChip,
  FilterMenu,
  formatDateRange,
  getDateRange,
  getPreset,
  getPreviousRange,
} from '@/registry/components/dashboardblocks/dashboard-header'
import {
  DataTable4,
  dataTable4ExampleProps,
} from '@/registry/components/dashboardblocks/data-table/data-table-04'
import { Geo4 } from '@/registry/components/dashboardblocks/geo/geo-04'
import { Heatmap1 } from '@/registry/components/dashboardblocks/heatmap/heatmap-01'
import { Retention3 } from '@/registry/components/dashboardblocks/retention/retention-03'
import { StatGroup3 } from '@/registry/components/dashboardblocks/stat-group/stat-group-03'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'

/*
 * A SaaS dashboard: the date range and plan filter scope the metrics,
 * activity, MRR by region and MRR movement below. Retention compares the latest
 * monthly cohorts on the chosen plan. Service status is live, so it isn't
 * filtered. Swap `buildSaasData` for your own queries.
 */

interface Dashboard2Props {
  title: string
  /** The last day of every date range. */
  today: Date
}

const exampleProps: Dashboard2Props = {
  title: 'Product health',
  today: new Date(Date.UTC(2026, 8, 25)),
}

const PLANS = [
  { name: 'Starter', price: 19, retention: [0.52, 0.33, 0.19], share: 0.58 },
  { name: 'Pro', price: 49, retention: [0.64, 0.46, 0.31], share: 0.33 },
  { name: 'Enterprise', price: 240, retention: [0.81, 0.69, 0.58], share: 0.09 },
]

const REGIONS = [
  { color: 'var(--chart-2)', label: 'North America', share: 0.46 },
  { color: 'var(--chart-3)', label: 'Europe', share: 0.36 },
  { color: 'var(--chart-4)', label: 'Asia Pacific', share: 0.18 },
]

const SEGMENTS: { label: string; value: DateRangePreset }[] = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface Query {
  plan: string | null
  preset: DateRangePreset
}

const subscribersAt = (offset: number, share: number) =>
  share * (7_600 - offset * 9 + Math.sin(offset / 9) * 60)

const accountsAt = (offset: number, share: number) =>
  share *
  (5_400 - offset * 6 + Math.sin(offset / 4.3) * 140 - ((offset + 2) % 7 < 2 ? 520 : 0))

/** Everything the blocks show for one query. Replace with your own data fetching. */
function buildSaasData({ plan, preset }: Query, today: Date) {
  const days = getPreset(preset).days
  const range = getDateRange(preset, today)
  const previousRange = getPreviousRange(range)
  const plans = plan ? PLANS.filter((item) => item.name === plan) : PLANS
  const share = plans.reduce((sum, item) => sum + item.share, 0)
  const price = plans.reduce((sum, item) => sum + item.share * item.price, 0) / share

  const day = (offset: number) => {
    const accounts = accountsAt(offset, share)
    const churn = 1.9 + Math.sin(offset / 6) * 0.3 + (plan === 'Starter' ? 0.8 : 0)
    return {
      accounts: Math.round(accounts),
      churn: Number(churn.toFixed(1)),
      mrr: Math.round(subscribersAt(offset, share) * price),
      nps: Math.round(44 + Math.sin(offset / 9) * 4 + (plan === 'Enterprise' ? 8 : 0)),
    }
  }
  const labelAt = (index: number) =>
    new Date(range.start.getTime() + index * 86_400_000).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    })
  const daily = (key: 'accounts' | 'churn' | 'mrr' | 'nps') =>
    Array.from({ length: days }, (_, index) => {
      const offset = days - 1 - index
      return {
        current: day(offset)[key],
        label: labelAt(index),
        previous: day(offset + days)[key],
      }
    })
  const mean = (
    points: { current: number; previous: number }[],
    key: 'current' | 'previous',
  ) => points.reduce((sum, point) => sum + point[key], 0) / (points.length || 1)
  const last = <T,>(points: T[]) => points[points.length - 1]

  const mrr = daily('mrr')
  const accounts = daily('accounts')
  const churn = daily('churn')
  const nps = daily('nps')
  const scope = `${formatDateRange(range)}${plan ? `, ${plan} plan` : ''}`

  const months = days / 30
  const starting = day(days).mrr
  const ending = last(mrr).current
  const churned = Math.round((starting * mean(churn, 'current') * months) / 100)
  const contraction = Math.round(starting * 0.011 * months)
  const expansion = Math.round(starting * (plan === 'Starter' ? 0.018 : 0.034) * months)

  const retention = [1, 7, 30].map((dayNumber, index) => {
    const rate = plans.reduce((sum, item) => sum + item.share * item.retention[index], 0)
    return {
      current: Number((rate / share + 0.012).toFixed(3)),
      label: `Day ${dayNumber}`,
      previous: Number((rate / share + [-0.009, -0.011, 0.018][index]).toFixed(3)),
    }
  })

  return {
    activity: DAYS.map((_, weekday) =>
      Array.from({ length: 24 }, (_, hour) => {
        const weekend = weekday >= 5
        const work =
          Math.exp(-((hour - 11) ** 2) / 14) + 0.8 * Math.exp(-((hour - 15) ** 2) / 10)
        return Math.round(share * (60 + 900 * work * (weekend ? 0.3 : 1)))
      }),
    ),
    currentLabel: formatDateRange(range),
    metrics: [
      {
        daily: mrr,
        formatter: (value: number) => `$${Math.round(value).toLocaleString('en-US')}`,
        key: 'mrr',
        label: 'MRR',
        previous: last(mrr).previous,
        value: last(mrr).current,
      },
      {
        daily: accounts,
        key: 'accounts',
        label: 'Active accounts',
        previous: last(accounts).previous,
        value: last(accounts).current,
      },
      {
        changeType: 'points' as const,
        daily: churn,
        formatter: (value: number) => `${value.toFixed(1)}%`,
        goodDirection: 'down' as const,
        key: 'churn',
        label: 'Churn',
        previous: Number(mean(churn, 'previous').toFixed(1)),
        value: Number(mean(churn, 'current').toFixed(1)),
      },
      {
        changeType: 'points' as const,
        daily: nps,
        key: 'nps',
        label: 'NPS',
        previous: Math.round(mean(nps, 'previous')),
        value: Math.round(mean(nps, 'current')),
      },
    ],
    movement: {
      churn: churned,
      contraction,
      expansion,
      newBusiness: Math.max(0, ending - starting - expansion + contraction + churned),
      starting,
    },
    previousLabel: formatDateRange(previousRange),
    regions: REGIONS.map((region, index) => {
      const drift = (index - 1) * 0.01
      return {
        color: region.color,
        current: Math.round(last(mrr).current * (region.share + drift)),
        label: region.label,
        previous: Math.round(last(mrr).previous * (region.share - drift)),
      }
    }),
    retention,
    scope,
  }
}

const Dashboard2 = (props: Dashboard2Props) => {
  const { title, today } = props
  const [query, setQuery] = useState<Query>({ plan: null, preset: '30d' })
  const [displayedQuery, setDisplayedQuery] = useState(query)
  const busy = displayedQuery !== query

  // Stands in for a request's delay: the blocks stay dimmed until it ends.
  useEffect(() => {
    if (displayedQuery === query) return
    const timer = setTimeout(() => setDisplayedQuery(query), 500)
    return () => clearTimeout(timer)
  }, [query, displayedQuery])

  const update = (patch: Partial<Query>) =>
    setQuery((current) => ({ ...current, ...patch }))
  const data = buildSaasData(displayedQuery, today)
  const range = getDateRange(query.preset, today)

  return (
    <div className='@container flex w-full flex-col gap-6'>
      <header className='flex flex-col gap-4'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h1 className='text-2xl font-semibold tracking-tight'>{title}</h1>
            <p className='text-muted-foreground text-sm' aria-live='polite'>
              {formatDateRange(range)} vs {formatDateRange(getPreviousRange(range))}
              {query.plan && ` · ${query.plan} plan`}
            </p>
          </div>
          <ExportMenu onExport={() => {}} />
        </div>
        <div className='flex flex-wrap items-center gap-x-4 gap-y-3'>
          <ButtonGroup aria-label='Date range'>
            {SEGMENTS.map((segment) => (
              <Button
                key={segment.value}
                aria-pressed={query.preset === segment.value}
                className='aria-pressed:bg-muted aria-pressed:text-foreground text-muted-foreground'
                onClick={() => update({ preset: segment.value })}
                variant='outline'
              >
                {segment.label}
              </Button>
            ))}
          </ButtonGroup>
          <div className='flex flex-wrap items-center gap-2'>
            <FilterMenu
              allLabel='All plans'
              label='Plan'
              onValueChange={(plan) => update({ plan })}
              options={PLANS.map((item) => item.name)}
              value={query.plan}
            >
              <IconPlaceholder
                lucide='LayersIcon'
                tabler='IconStack2'
                hugeicons='Layers01Icon'
                phosphor='StackIcon'
                remixicon='RiStackLine'
              />
              {query.plan ? 'Change plan' : 'Filter by plan'}
            </FilterMenu>
            {query.plan && (
              <FilterChip
                field='Plan'
                value={query.plan}
                onRemove={() => update({ plan: null })}
              />
            )}
          </div>
        </div>
      </header>
      <BlockBusy
        busy={busy}
        label='Updating the dashboard'
        className='grid gap-4 @4xl:grid-cols-3'
      >
        <div className='@4xl:col-span-3'>
          <StatGroup3
            currentLabel={data.currentLabel}
            metrics={data.metrics}
            previousLabel={data.previousLabel}
            title={data.scope}
          />
        </div>
        <div className='@4xl:col-span-2'>
          <Heatmap1
            description={`Average active accounts by weekday and hour, ${data.scope}`}
            title='When customers are active'
            unit='accounts'
            values={data.activity}
          />
        </div>
        <Geo4
          description={`MRR at the end of ${data.scope}`}
          formatter={(value) => `$${value.toLocaleString('en-US')}`}
          previousLabel={`vs ${data.previousLabel}`}
          regions={data.regions}
          title='MRR by region'
        />
        <div className='@4xl:col-span-2'>
          <Billing1
            description={data.scope}
            movement={data.movement}
            title='MRR movement'
          />
        </div>
        <Retention3
          description={`Latest monthly signup cohort${displayedQuery.plan ? `, ${displayedQuery.plan} plan` : ''}, compared with the one before`}
          milestones={data.retention}
          previousLabel='Previous cohort'
          title='Retention milestones'
        />
      </BlockBusy>
      <DataTable4 {...dataTable4ExampleProps} />
    </div>
  )
}

export { Dashboard2, exampleProps as dashboard2ExampleProps, type Dashboard2Props }
