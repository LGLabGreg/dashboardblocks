'use client'

import {
  type Activity,
  ActivityFeed01,
} from '@/registry/components/dashboardblocks/activity-feed/activity-feed-01'
import { BlockBusy } from '@/registry/components/dashboardblocks/block-state'
import { ChartPanel4 } from '@/registry/components/dashboardblocks/chart-panel/chart-panel-04'
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
import { Funnel3 } from '@/registry/components/dashboardblocks/funnel/funnel-03'
import type {
  PipelineItem,
  PipelineStage,
} from '@/registry/components/dashboardblocks/pipeline'
import { Pipeline2 } from '@/registry/components/dashboardblocks/pipeline/pipeline-02'
import { Pipeline3 } from '@/registry/components/dashboardblocks/pipeline/pipeline-03'
import { Pipeline4 } from '@/registry/components/dashboardblocks/pipeline/pipeline-04'
import { StatGroup2 } from '@/registry/components/dashboardblocks/stat-group/stat-group-02'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'

/*
 * A CRM dashboard: the segment filter scopes every block. The date range
 * scopes the sales stats and lead conversion. Bookings by month cover the last
 * twelve full months, and the open pipeline, quarter forecast, deal activity and
 * stuck deals are as of today, so the date range doesn't apply to them. Swap
 * `buildCrmData` for your own queries.
 */

interface Dashboard4Props {
  title: string
  /** The last day of every date range. */
  today: Date
}

const exampleProps: Dashboard4Props = {
  title: 'Sales overview',
  today: new Date(Date.UTC(2026, 8, 25)),
}

const DAY = 86_400_000
const NOW_HOURS = 17

const SEGMENTS = [
  { cycle: 24, deal: 9_400, leads: 6, name: 'SMB', rates: [0.36, 0.48, 0.34] },
  { cycle: 48, deal: 36_500, leads: 3.5, name: 'Mid-market', rates: [0.42, 0.54, 0.29] },
  { cycle: 96, deal: 96_000, leads: 3, name: 'Enterprise', rates: [0.5, 0.6, 0.24] },
]

const STAGES: PipelineStage[] = [
  { expectedDays: 7, id: 'lead', label: 'Lead', probability: 0.05 },
  { expectedDays: 10, id: 'qualified', label: 'Qualified', probability: 0.1 },
  { expectedDays: 14, id: 'discovery', label: 'Discovery', probability: 0.25 },
  { expectedDays: 14, id: 'proposal', label: 'Proposal', probability: 0.5 },
  { expectedDays: 10, id: 'negotiation', label: 'Negotiation', probability: 0.75 },
]

const REPS = [
  { name: 'Luis Romero', quota: 180_000, segment: 'SMB', share: 0.56 },
  { name: 'Aiko Tanaka', quota: 175_000, segment: 'SMB', share: 0.44 },
  { name: 'Jonas Weber', quota: 460_000, segment: 'Mid-market', share: 0.45 },
  { name: 'Grace Kim', quota: 470_000, segment: 'Mid-market', share: 0.55 },
  { name: 'Maya Patel', quota: 1_900_000, segment: 'Enterprise', share: 1 },
]

const OPEN_DEALS: Record<string, number[]> = {
  Enterprise: [4, 3, 3, 2, 2],
  'Mid-market': [9, 7, 5, 4, 3],
  SMB: [14, 10, 8, 5, 4],
}

const COMPANIES = [
  'Northwind',
  'Brightline',
  'Kestrel',
  'Halcyon',
  'Meridian',
  'Lumen',
  'Copperleaf',
  'Bluefin',
  'Ardent',
  'Tidewater',
  'Summit',
  'Harbor',
  'Evergreen',
  'Foxglove',
  'Granite',
  'Juniper',
  'Keystone',
  'Larkspur',
  'Mosaic',
  'Nimbus',
  'Orchard',
  'Pinnacle',
  'Quarry',
  'Redwood',
  'Silverline',
  'Trellis',
  'Upland',
  'Vantage',
  'Willow',
  'Zephyr',
]
const INDUSTRIES = [
  'Labs',
  'Health',
  'Logistics',
  'Foods',
  'Capital',
  'Robotics',
  'Studio',
  'Energy',
  'Retail',
  'Systems',
  'Media',
  'Bank',
  'Freight',
  'Clinics',
  'Software',
]

/** A seeded random number generator, so the example renders the same on the server and in the browser. */
function random(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296
  }
}

interface DealActivity extends Activity {
  segment: string
}

const ACTIVITY: (Omit<DealActivity, 'at'> & { minutesAgo: number })[] = [
  {
    action: 'moved Keystone Freight to',
    actor: { name: 'Grace Kim' },
    id: 'a1',
    minutesAgo: 12,
    segment: 'Mid-market',
    target: 'Negotiation',
  },
  {
    action: 'won',
    actor: { name: 'Luis Romero' },
    id: 'a2',
    minutesAgo: 47,
    segment: 'SMB',
    target: 'Orchard Foods · $11,200',
  },
  {
    action: 'sent a proposal to',
    actor: { name: 'Maya Patel' },
    id: 'a3',
    minutesAgo: 95,
    segment: 'Enterprise',
    target: 'Meridian Bank',
  },
  {
    action: 'booked a demo with',
    actor: { name: 'Aiko Tanaka' },
    id: 'a4',
    minutesAgo: 160,
    segment: 'SMB',
    target: 'Foxglove Studio',
  },
  {
    action: 'lost',
    actor: { name: 'Jonas Weber' },
    id: 'a5',
    minutesAgo: 240,
    segment: 'Mid-market',
    target: 'Tidewater Logistics',
  },
  {
    action: 'qualified',
    actor: { name: 'Maya Patel' },
    id: 'a6',
    minutesAgo: 60 * 19,
    segment: 'Enterprise',
    target: 'Silverline Energy',
  },
  {
    action: 'won',
    actor: { name: 'Grace Kim' },
    id: 'a7',
    minutesAgo: 60 * 21,
    segment: 'Mid-market',
    target: 'Lumen Clinics · $42,800',
  },
  {
    action: 'moved Pinnacle Retail to',
    actor: { name: 'Luis Romero' },
    id: 'a8',
    minutesAgo: 60 * 23,
    segment: 'SMB',
    target: 'Proposal',
  },
  {
    action: 'added a note to',
    actor: { name: 'Maya Patel' },
    id: 'a9',
    minutesAgo: 60 * 26,
    segment: 'Enterprise',
    target: 'Vantage Capital',
  },
]

const RANGE_OPTIONS: { label: string; value: DateRangePreset }[] = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
]

const currency = (value: number) => `$${Math.round(value).toLocaleString('en-US')}`

interface Query {
  preset: DateRangePreset
  segment: string | null
}

function dayAt(segment: (typeof SEGMENTS)[number], offset: number, today: Date) {
  const weekday = new Date(today.getTime() - offset * DAY).getUTCDay()
  const weekend = weekday === 0 || weekday === 6
  const leads =
    segment.leads *
    (1 - offset * 0.0015 + Math.sin(offset / 5 + segment.cycle) * 0.14) *
    (weekend ? 0.3 : 1.25)
  const qualified = leads * segment.rates[0]
  const proposals = qualified * segment.rates[1]
  const won =
    proposals * segment.rates[2] * (1 + Math.sin(offset / 13) * 0.06 - offset * 0.0008)
  const deal = segment.deal * (1 + Math.sin(offset / 7 + 1) * 0.08)
  return {
    cycle: segment.cycle * (1 + Math.sin(offset / 17) * 0.05 + offset * 0.001),
    leads,
    proposals,
    qualified,
    revenue: won * deal,
    won,
  }
}

type Day = ReturnType<typeof dayAt>

function totalAt(segments: typeof SEGMENTS, offset: number, today: Date): Day {
  const days = segments.map((segment) => dayAt(segment, offset, today))
  const sum = (key: keyof Day) => days.reduce((total, day) => total + day[key], 0)
  const won = sum('won')
  return {
    cycle: days.reduce((total, day) => total + day.cycle * day.won, 0) / (won || 1),
    leads: sum('leads'),
    proposals: sum('proposals'),
    qualified: sum('qualified'),
    revenue: sum('revenue'),
    won,
  }
}

function buildOpenDeals(today: Date): (PipelineItem & { segment: string })[] {
  const next = random(42)
  let index = 0
  return SEGMENTS.flatMap((segment) => {
    const owners = REPS.filter((rep) => rep.segment === segment.name)
    return STAGES.flatMap((stage, stageIndex) =>
      Array.from({ length: OPEN_DEALS[segment.name][stageIndex] }, (_, dealIndex) => {
        const company = COMPANIES[index % COMPANIES.length]
        const industry =
          INDUSTRIES[
            (index * 7 + Math.floor(index / COMPANIES.length)) % INDUSTRIES.length
          ]
        index++
        const days = Math.floor(next() ** 1.6 * (stage.expectedDays ?? 7) * 1.3)
        const value = Math.round((segment.deal * (0.5 + next() * 1.1)) / 500) * 500
        return {
          enteredStageAt: new Date(today.getTime() - days * DAY),
          id: `${segment.name}-${stage.id}-${dealIndex}`,
          owner: owners[dealIndex % owners.length].name,
          segment: segment.name,
          stage: stage.id,
          subtitle: `${segment.name} · ${currency(value)}`,
          title: `${company} ${industry}`,
          value,
        }
      }),
    )
  })
}

/** Everything the blocks show for one query. Replace with your own data fetching. */
function buildCrmData({ preset, segment }: Query, today: Date) {
  const days = getPreset(preset).days
  const range = getDateRange(preset, today)
  const previousRange = getPreviousRange(range)
  const segments = segment ? SEGMENTS.filter((item) => item.name === segment) : SEGMENTS
  const scope = `${formatDateRange(range)}${segment ? `, ${segment}` : ''}`

  const series = (shift: number) =>
    Array.from({ length: days }, (_, index) =>
      totalAt(segments, days - 1 - index + shift, today),
    )
  const current = series(0)
  const previous = series(days)
  const totals = (points: Day[], whole = true) => {
    const sum = (key: keyof Day) => points.reduce((total, point) => total + point[key], 0)
    const count = (key: keyof Day) => (whole ? Math.round(sum(key)) : sum(key))
    const exactWon = sum('won') || 1
    const won = count('won')
    const proposals = count('proposals')
    const deal = sum('revenue') / exactWon
    return {
      cycle:
        points.reduce((total, point) => total + point.cycle * point.won, 0) / exactWon,
      deal,
      leads: count('leads'),
      proposals,
      qualified: count('qualified'),
      revenue: won * deal,
      winRate: proposals > 0 ? (won / proposals) * 100 : 0,
      won,
    }
  }
  const now = totals(current)
  const before = totals(previous)
  const week = [...previous.slice(-6), ...current]
  const trend = current.map((_, index) => totals(week.slice(index, index + 7), false))

  const monthStart = (back: number) =>
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - back, 1)
  const months = Array.from({ length: 12 }, (_, index) => {
    const back = 12 - index
    const start = monthStart(back)
    const end = monthStart(back - 1)
    let revenue = 0
    for (let time = start; time < end; time += DAY) {
      revenue += totalAt(segments, (today.getTime() - time) / DAY, today).revenue
    }
    return {
      label: new Date(start).toLocaleDateString('en-US', {
        month: 'short',
        timeZone: 'UTC',
      }),
      value: Math.round(revenue / 100) * 100,
    }
  })

  const quarter = Math.floor(today.getUTCMonth() / 3)
  const quarterStart = Date.UTC(today.getUTCFullYear(), quarter * 3, 1)
  const quarterEnd = Date.UTC(today.getUTCFullYear(), quarter * 3 + 3, 1)
  const elapsed = Math.floor((today.getTime() - quarterStart) / DAY) + 1
  const quarterDays = (quarterEnd - quarterStart) / DAY
  const closedThisQuarter = (name: string) => {
    const item = SEGMENTS.find((entry) => entry.name === name)
    if (!item) return 0
    return Array.from({ length: elapsed }, (_, offset) =>
      dayAt(item, offset, today),
    ).reduce((total, day) => total + day.revenue, 0)
  }
  const deals = buildOpenDeals(today).filter(
    (deal) => !segment || deal.segment === segment,
  )
  const reps = REPS.filter((rep) => !segment || rep.segment === segment)
  const segmentLabel = segment ? `, ${segment}` : ''

  return {
    activity: ACTIVITY.filter((item) => !segment || item.segment === segment)
      .slice(0, 6)
      .map(({ minutesAgo, ...item }) => ({
        ...item,
        at: new Date(today.getTime() + NOW_HOURS * 3_600_000 - minutesAgo * 60_000),
      })),
    deals,
    funnel: [
      { label: 'Leads', value: now.leads },
      { label: 'Qualified', value: now.qualified },
      { label: 'Proposal sent', value: now.proposals },
      { label: 'Won', value: now.won },
    ],
    months,
    owners: reps.map((rep) => ({
      closed: Math.round((closedThisQuarter(rep.segment) * rep.share) / 1_000) * 1_000,
      deals: deals
        .filter((deal) => deal.owner === rep.name)
        .map((deal) => ({ stage: deal.stage, value: deal.value ?? 0 })),
      name: rep.name,
      quota: rep.quota,
    })),
    previousLabel: formatDateRange(previousRange),
    quarter: {
      label: `Q${quarter + 1} ${today.getUTCFullYear()}`,
      day: elapsed,
      days: quarterDays,
    },
    scope,
    segmentLabel,
    stages: STAGES.map((stage) => {
      const inStage = deals.filter((deal) => deal.stage === stage.id)
      return {
        count: inStage.length,
        label: stage.label,
        value: inStage.reduce((sum, deal) => sum + (deal.value ?? 0), 0),
      }
    }),
    stats: [
      {
        formatter: currency,
        history: trend.map((point) => Math.round(point.revenue)),
        key: 'bookings',
        label: 'Bookings',
        previous: Math.round(before.revenue),
        value: Math.round(now.revenue),
      },
      {
        changeType: 'points' as const,
        formatter: (value: number) => `${value.toFixed(1)}%`,
        history: trend.map((point) => Number(point.winRate.toFixed(1))),
        key: 'win-rate',
        label: 'Win rate',
        previous: Number(before.winRate.toFixed(1)),
        value: Number(now.winRate.toFixed(1)),
      },
      {
        formatter: currency,
        history: trend.map((point) => Math.round(point.deal)),
        key: 'deal-size',
        label: 'Avg deal size',
        previous: Math.round(before.deal),
        value: Math.round(now.deal),
      },
      {
        formatter: (value: number) => `${value} days`,
        goodDirection: 'down' as const,
        history: trend.map((point) => Math.round(point.cycle)),
        key: 'cycle',
        label: 'Sales cycle',
        previous: Math.round(before.cycle),
        value: Math.round(now.cycle),
      },
    ],
  }
}

const Dashboard4 = (props: Dashboard4Props) => {
  const { title, today } = props
  const [query, setQuery] = useState<Query>({ preset: '90d', segment: null })
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
  const data = buildCrmData(displayedQuery, today)
  const range = getDateRange(query.preset, today)

  return (
    <div className='@container flex w-full flex-col gap-6'>
      <header className='flex flex-col gap-4'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h1 className='text-2xl font-semibold tracking-tight'>{title}</h1>
            <p className='text-muted-foreground text-sm' aria-live='polite'>
              {formatDateRange(range)} vs {formatDateRange(getPreviousRange(range))}
              {query.segment && ` · ${query.segment}`}
            </p>
          </div>
          <ExportMenu onExport={() => {}} />
        </div>
        <div className='flex flex-wrap items-center gap-x-4 gap-y-3'>
          <ButtonGroup aria-label='Date range'>
            {RANGE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                aria-pressed={query.preset === option.value}
                className='not-aria-pressed:text-muted-foreground aria-pressed:bg-muted aria-pressed:text-foreground'
                onClick={() => update({ preset: option.value })}
                variant='outline'
              >
                {option.label}
              </Button>
            ))}
          </ButtonGroup>
          <div className='flex flex-wrap items-center gap-2'>
            <FilterMenu
              allLabel='All segments'
              label='Segment'
              onValueChange={(segment) => update({ segment })}
              options={SEGMENTS.map((item) => item.name)}
              value={query.segment}
            >
              <IconPlaceholder
                lucide='BuildingIcon'
                tabler='IconBuilding'
                hugeicons='Building03Icon'
                phosphor='BuildingIcon'
                remixicon='RiBuildingLine'
              />
              {query.segment ? 'Change segment' : 'Filter by segment'}
            </FilterMenu>
            {query.segment && (
              <FilterChip
                field='Segment'
                value={query.segment}
                onRemove={() => update({ segment: null })}
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
          <StatGroup2
            description={`${data.scope}, compared with ${data.previousLabel}`}
            metrics={data.stats}
            title='Sales performance'
          />
        </div>
        <div className='@4xl:col-span-3'>
          <Pipeline2
            noun='deals'
            stages={data.stages}
            title={`Open pipeline${data.segmentLabel}`}
          />
        </div>
        <div className='@4xl:col-span-2'>
          <ChartPanel4
            data={data.months}
            description={`New business won, last 12 full months${data.segmentLabel}`}
            formatter={currency}
            title='Bookings'
          />
        </div>
        <Funnel3 description={data.scope} stages={data.funnel} title='Lead conversion' />
        <div className='@4xl:col-span-2'>
          <Pipeline4
            description={`${data.quarter.label}, day ${data.quarter.day} of ${data.quarter.days}${data.segmentLabel}: closed plus open deals weighted by stage`}
            owners={data.owners}
            stages={STAGES}
            title='Quarter forecast'
          />
        </div>
        <ActivityFeed01
          activities={data.activity}
          description={`Latest changes to deals${data.segmentLabel}`}
          now={new Date(today.getTime() + NOW_HOURS * 3_600_000)}
          title='Deal activity'
        />
        <div className='@4xl:col-span-3'>
          <Pipeline3
            items={data.deals}
            noun='open deals'
            now={today}
            stages={STAGES}
            title={`Stuck deals${data.segmentLabel}`}
          />
        </div>
      </BlockBusy>
    </div>
  )
}

export { Dashboard4, exampleProps as dashboard4ExampleProps, type Dashboard4Props }
