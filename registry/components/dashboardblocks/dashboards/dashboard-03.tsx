'use client'

import { BlockBusy } from '@/registry/components/dashboardblocks/block-state'
import { BREAKDOWN_OTHER_COLOR } from '@/registry/components/dashboardblocks/breakdown'
import { Breakdown1 } from '@/registry/components/dashboardblocks/breakdown/breakdown-01'
import { ChartPanel2 } from '@/registry/components/dashboardblocks/chart-panel/chart-panel-02'
import {
  type DateRangePreset,
  DateRangePicker,
  ExportMenu,
  FilterChip,
  FilterMenu,
  formatDateRange,
  getDateRange,
  getPreset,
} from '@/registry/components/dashboardblocks/dashboard-header'
import { Flow1 } from '@/registry/components/dashboardblocks/flow/flow-01'
import { Geo2 } from '@/registry/components/dashboardblocks/geo/geo-02'
import { Leaderboard01 } from '@/registry/components/dashboardblocks/leaderboard/leaderboard-01'
import { Realtime1 } from '@/registry/components/dashboardblocks/realtime/realtime-01'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useEffect, useState } from 'react'

interface Dashboard3Props {
  title: string
  /** The last day of every date range. */
  today: Date
}

const exampleProps: Dashboard3Props = {
  title: 'Site analytics',
  today: new Date(Date.UTC(2026, 8, 25)),
}

const DEVICES = [
  { bounce: 36, name: 'Desktop', pagesPerVisit: 3.4, share: 0.55 },
  { bounce: 52, name: 'Mobile', pagesPerVisit: 2.3, share: 0.39 },
  { bounce: 44, name: 'Tablet', pagesPerVisit: 2.8, share: 0.06 },
]

const SOURCES = [
  { id: 'organic', label: 'Organic search', weights: [0.41, 0.32, 0.38] },
  { id: 'paid', label: 'Paid ads', weights: [0.24, 0.21, 0.22] },
  { id: 'social', label: 'Social', weights: [0.12, 0.34, 0.24] },
  { id: 'email', label: 'Email', weights: [0.23, 0.13, 0.16] },
]

const LANDINGS: Record<string, Record<string, number>> = {
  email: { home: 0.32, pricing: 0.68 },
  organic: { blog: 0.36, home: 0.53, pricing: 0.11 },
  paid: { home: 0.3, pricing: 0.7 },
  social: { blog: 0.75, home: 0.25 },
}

const PAGES = [
  { browsed: 0.53, id: 'home', label: 'Home', signedUp: 0.12 },
  { browsed: 0.42, id: 'pricing', label: 'Pricing', signedUp: 0.27 },
  { browsed: 0.35, id: 'blog', label: 'Blog', signedUp: 0.05 },
]

const TOP_PAGES = [
  { path: '/', share: 0.36 },
  { path: '/pricing', share: 0.19 },
  { path: '/docs/getting-started', share: 0.15 },
  { path: '/blog/launch-week', share: 0.1 },
  { path: '/changelog', share: 0.07 },
  { path: '/careers', share: 0.04 },
]

const COUNTRIES = [
  { code: 'US', name: 'United States', share: 0.34 },
  { code: 'GB', name: 'United Kingdom', share: 0.1 },
  { code: 'DE', name: 'Germany', share: 0.085 },
  { code: 'IN', name: 'India', share: 0.075 },
  { code: 'CA', name: 'Canada', share: 0.056 },
  { code: 'FR', name: 'France', share: 0.05 },
  { code: 'BR', name: 'Brazil', share: 0.038 },
  { code: 'AU', name: 'Australia', share: 0.034 },
  { code: 'NL', name: 'Netherlands', share: 0.025 },
  { code: 'JP', name: 'Japan', share: 0.022 },
  { code: 'ES', name: 'Spain', share: 0.02 },
  { code: 'SE', name: 'Sweden', share: 0.014 },
  { code: 'MX', name: 'Mexico', share: 0.013 },
  { code: 'SG', name: 'Singapore', share: 0.01 },
]

const BROWSERS = [
  { color: 'var(--chart-2)', label: 'Chrome', shares: [0.63, 0.47, 0.34] },
  { color: 'var(--chart-3)', label: 'Safari', shares: [0.13, 0.43, 0.6] },
  { color: 'var(--chart-4)', label: 'Edge', shares: [0.13, 0.01, 0.01] },
  { color: 'var(--chart-5)', label: 'Firefox', shares: [0.07, 0.02, 0.01] },
]

interface Query {
  device: string | null
  preset: DateRangePreset
}

const visitorsAt = (offset: number, hourly: boolean) => {
  if (hourly) {
    const hour = 23 - offset
    const curve =
      Math.exp(-((hour - 11) ** 2) / 12) + 0.7 * Math.exp(-((hour - 20) ** 2) / 8)
    return 12 + 180 * curve
  }
  const weekend = (offset + 2) % 7 < 2 ? 0.72 : 1
  const trend = 2_600 - offset * 2.4
  const wave = Math.sin(offset / 2.7) * 190 + Math.sin(offset / 9) * 140
  return (trend + wave) * weekend
}

const splitTotal = (total: number, shares: number[]) => {
  const sum = shares.reduce((acc, share) => acc + share, 0)
  const parts = shares.map((share) => Math.round((total * share) / sum))
  parts[parts.length - 1] =
    total - parts.slice(0, -1).reduce((acc, part) => acc + part, 0)
  return parts
}

const percentChange = (current: number, previous: number) =>
  Number((((current - previous) / (previous || 1)) * 100).toFixed(1))

function buildAnalyticsData({ device, preset }: Query, today: Date) {
  const hourly = preset === 'today'
  const length = hourly ? 24 : getPreset(preset).days
  const range = getDateRange(preset, today)
  const devices = DEVICES.map((item, index) => ({
    ...item,
    index,
    weight: device && item.name !== device ? 0 : item.share,
  }))
  const share = devices.reduce((sum, item) => sum + item.weight, 0)
  const weighted = (key: 'bounce' | 'pagesPerVisit') =>
    devices.reduce((sum, item) => sum + item.weight * item[key], 0) / share

  const point = (offset: number) => {
    const visitors = Math.round(visitorsAt(offset, hourly) * share)
    return {
      bounceRate: Math.round(
        weighted('bounce') + (hourly ? 0 : offset * 0.04) + Math.cos(offset / 2.3) * 2.5,
      ),
      pageviews: Math.round(
        visitors * (weighted('pagesPerVisit') + Math.sin(offset / 3) * 0.2),
      ),
      visitors,
    }
  }
  const labelAt = (index: number) => {
    if (hourly) return `${String(index).padStart(2, '0')}:00`
    return new Date(range.start.getTime() + index * 86_400_000).toLocaleDateString(
      'en-US',
      { day: 'numeric', month: 'short', timeZone: 'UTC' },
    )
  }
  const series = (shift: number) =>
    Array.from({ length }, (_, index) => point(length - 1 - index + shift))
  const current = series(0)
  const previous = series(length)
  const totals = (points: typeof current) => {
    const visitors = points.reduce((sum, item) => sum + item.visitors, 0)
    const pageviews = points.reduce((sum, item) => sum + item.pageviews, 0)
    const bounced = points.reduce((sum, item) => sum + item.visitors * item.bounceRate, 0)
    return { bounceRate: Math.round(bounced / (visitors || 1)), pageviews, visitors }
  }
  const now = totals(current)
  const before = totals(previous)

  const sessions = Math.round(now.visitors * 1.24)
  const sourceSessions = splitTotal(
    sessions,
    SOURCES.map((source) =>
      devices.reduce((sum, item) => sum + item.weight * source.weights[item.index], 0),
    ),
  )
  const links = SOURCES.flatMap((source, index) => {
    const targets = Object.entries(LANDINGS[source.id])
    return splitTotal(
      sourceSessions[index],
      targets.map(([, value]) => value),
    ).map((value, target) => ({ source: source.id, target: targets[target][0], value }))
  })
  const bounceShift = (weighted('bounce') - 42) / 100
  const outcomes = PAGES.flatMap((page) => {
    const landed = links
      .filter((link) => link.target === page.id)
      .reduce((sum, link) => sum + link.value, 0)
    const signedUp = Math.round(landed * page.signedUp)
    const browsed = Math.round(landed * Math.max(0, page.browsed - bounceShift))
    return [
      { source: page.id, target: 'signed-up', value: signedUp },
      { source: page.id, target: 'browsed', value: browsed },
      { source: page.id, target: 'bounced', value: landed - signedUp - browsed },
    ]
  })

  const browserShares = BROWSERS.map(
    (browser) =>
      devices.reduce((sum, item) => sum + item.weight * browser.shares[item.index], 0) /
      share,
  )
  const browsers = splitTotal(now.visitors, [
    ...browserShares,
    1 - browserShares.reduce((sum, value) => sum + value, 0),
  ])
  const scope = `${hourly ? 'Today' : formatDateRange(range)}${device ? `, ${device}` : ''}`

  return {
    browsers: browsers.map((value, index) => ({
      color: BROWSERS[index]?.color ?? BREAKDOWN_OTHER_COLOR,
      label: BROWSERS[index]?.label ?? 'Other',
      value,
    })),
    countries: splitTotal(
      now.visitors,
      COUNTRIES.map((country) => country.share),
    ).map((value, index) => ({
      code: COUNTRIES[index].code,
      name: COUNTRIES[index].name,
      value,
    })),
    flow: {
      links: [...links, ...outcomes],
      nodes: [
        ...SOURCES.map(({ id, label }) => ({ id, label })),
        ...PAGES.map(({ id, label }) => ({ id, label })),
        { color: 'var(--chart-3)', id: 'signed-up', label: 'Signed up' },
        { color: 'var(--chart-5)', id: 'browsed', label: 'Kept browsing' },
        { id: 'bounced', kind: 'exit' as const, label: 'Bounced' },
      ],
    },
    pages: splitTotal(
      Math.round(now.visitors * TOP_PAGES.reduce((sum, page) => sum + page.share, 0)),
      TOP_PAGES.map((page) => page.share),
    ).map((visitors, index) => ({ path: TOP_PAGES[index].path, visitors })),
    scope,
    traffic: {
      data: current.map((item, index) => ({ ...item, label: labelAt(index) })),
      metrics: [
        {
          key: 'visitors',
          label: 'Visitors',
          total: now.visitors,
          trend: percentChange(now.visitors, before.visitors),
        },
        {
          key: 'pageviews',
          label: 'Page views',
          total: now.pageviews,
          trend: percentChange(now.pageviews, before.pageviews),
        },
        {
          formatter: (value: number) => `${value}%`,
          goodDirection: 'down' as const,
          key: 'bounceRate',
          label: 'Bounce rate',
          total: now.bounceRate,
          trend: percentChange(now.bounceRate, before.bounceRate),
        },
      ],
    },
  }
}

const Dashboard3 = (props: Dashboard3Props) => {
  const { title, today } = props
  const [query, setQuery] = useState<Query>({ device: null, preset: '30d' })
  const [displayedQuery, setDisplayedQuery] = useState(query)
  const busy = displayedQuery !== query

  useEffect(() => {
    if (displayedQuery === query) return
    const timer = setTimeout(() => setDisplayedQuery(query), 500)
    return () => clearTimeout(timer)
  }, [query, displayedQuery])

  const update = (patch: Partial<Query>) =>
    setQuery((current) => ({ ...current, ...patch }))
  const data = buildAnalyticsData(displayedQuery, today)
  const range = getDateRange(query.preset, today)

  return (
    <div className='@container flex w-full flex-col gap-6'>
      <header className='flex flex-col gap-4'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h1 className='text-2xl font-semibold tracking-tight'>{title}</h1>
            <p className='text-muted-foreground text-sm' aria-live='polite'>
              {formatDateRange(range)}
              {query.device && ` · ${query.device}`}
            </p>
          </div>
          <ExportMenu onExport={() => {}} />
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <DateRangePicker
            onValueChange={(preset) => update({ preset })}
            today={today}
            value={query.preset}
          />
          <FilterMenu
            allLabel='All devices'
            label='Device'
            onValueChange={(device) => update({ device })}
            options={DEVICES.map((item) => item.name)}
            value={query.device}
          >
            <IconPlaceholder
              lucide='SmartphoneIcon'
              tabler='IconDeviceMobile'
              hugeicons='SmartPhone01Icon'
              phosphor='DeviceMobileIcon'
              remixicon='RiSmartphoneLine'
            />
            {query.device ? 'Change device' : 'Filter by device'}
          </FilterMenu>
          {query.device && (
            <FilterChip
              field='Device'
              value={query.device}
              onRemove={() => update({ device: null })}
            />
          )}
        </div>
      </header>
      <div className='grid gap-4 @4xl:grid-cols-3'>
        <BlockBusy busy={busy} label='Updating traffic' className='@4xl:col-span-2'>
          <ChartPanel2
            data={data.traffic.data}
            metrics={data.traffic.metrics}
            title={`Traffic, ${data.scope}`}
          />
        </BlockBusy>
        <Realtime1
          activeUsers={284}
          description='Users on the site in the last 5 minutes, all devices'
          pageViews={Array.from({ length: 60 }, (_, second) =>
            Math.round(44 + Math.sin(second / 4) * 12 + Math.cos(second / 1.7) * 5),
          )}
          pages={[
            { path: '/pricing', users: 71 },
            { path: '/', users: 63 },
            { path: '/docs/getting-started', users: 44 },
            { path: '/blog/launch-week', users: 32 },
            { path: '/changelog', users: 18 },
          ]}
          simulate
          title='Right now'
        />
      </div>
      <BlockBusy
        busy={busy}
        label='Updating sources, pages and locations'
        className='grid gap-4 @4xl:grid-cols-3'
      >
        <div className='@4xl:col-span-3'>
          <Flow1
            description={`Sessions from each source, through the landing page, to the outcome, ${data.scope}`}
            goal='signed-up'
            links={data.flow.links}
            nodes={data.flow.nodes}
            title='Traffic flow'
          />
        </div>
        <Leaderboard01
          description={`Unique visitors, ${data.scope}`}
          pages={data.pages}
          title='Top pages'
        />
        <Geo2
          countries={data.countries}
          description={`Visitors, ${data.scope}`}
          limit={6}
          title='Top countries'
        />
        <Breakdown1
          description={`Visitors, ${data.scope}`}
          formatter={(value) => value.toLocaleString('en-US')}
          segments={data.browsers}
          title='Browsers'
        />
      </BlockBusy>
    </div>
  )
}

export { Dashboard3, exampleProps as dashboard3ExampleProps, type Dashboard3Props }
