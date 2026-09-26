'use client'

import { BlockBusy } from '@/registry/components/dashboardblocks/block-state'
import { BREAKDOWN_OTHER_COLOR } from '@/registry/components/dashboardblocks/breakdown'
import { Breakdown1 } from '@/registry/components/dashboardblocks/breakdown/breakdown-01'
import { ChartPanel1 } from '@/registry/components/dashboardblocks/chart-panel/chart-panel-01'
import {
  CompareToggle,
  type DateRangePreset,
  DateRangePicker,
  ExportMenu,
  FilterChip,
  FilterMenu,
  formatDateRange,
  getDateRange,
  getPreset,
  getPreviousRange,
} from '@/registry/components/dashboardblocks/dashboard-header'
import { DataTable2 } from '@/registry/components/dashboardblocks/data-table/data-table-02'
import { Funnel1 } from '@/registry/components/dashboardblocks/funnel/funnel-01'
import { StatGroup2 } from '@/registry/components/dashboardblocks/stat-group/stat-group-02'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useEffect, useState } from 'react'

/*
 * A store dashboard: the header's date range, compare switch and region
 * filter scope every block below it. Swap `buildStoreData` for your own
 * queries; the blocks only need their props.
 */

interface Dashboard1Props {
  title: string
  /** The last day of every date range. */
  today: Date
}

const exampleProps: Dashboard1Props = {
  title: 'Store overview',
  today: new Date(Date.UTC(2026, 8, 25)),
}

const REGIONS = [
  { name: 'North America', phase: 0, share: 0.48 },
  { name: 'Europe', phase: 1.3, share: 0.34 },
  { name: 'Asia Pacific', phase: 2.6, share: 0.18 },
]

const CHANNELS = [
  { color: 'var(--chart-1)', label: 'Organic search', share: 0.38 },
  { color: 'var(--chart-2)', label: 'Paid search', share: 0.27 },
  { color: 'var(--chart-3)', label: 'Email', share: 0.17 },
  { color: BREAKDOWN_OTHER_COLOR, label: 'Other', share: 0.18 },
]

const PRODUCTS = [
  { category: 'Displays', name: 'Studio Display 27"', price: 437, share: 0.29 },
  { category: 'Audio', name: 'Wireless headphones', price: 144, share: 0.24 },
  { category: 'Furniture', name: 'Ergonomic chair', price: 435, share: 0.21 },
  { category: 'Accessories', name: 'Mechanical keyboard', price: 120, share: 0.13 },
  { category: 'Accessories', name: 'USB-C dock', price: 90, share: 0.08 },
  { category: 'Audio', name: 'Desk speakers', price: 90, share: 0.05 },
]

interface Query {
  compare: boolean
  preset: DateRangePreset
  region: string | null
}

/** Revenue for one day (or hour, with `hourly`), `offset` steps before the end. */
const revenueAt = (offset: number, region: string | null, hourly: boolean) => {
  const regions = region ? REGIONS.filter((item) => item.name === region) : REGIONS
  return regions.reduce((sum, { phase, share }) => {
    if (hourly) {
      const hour = 23 - offset
      const curve =
        Math.exp(-((hour - 14) ** 2) / 20) + 0.35 * Math.exp(-((hour - 21) ** 2) / 6)
      return sum + share * (20 + 170 * curve)
    }
    const weekend = (offset + 2) % 7 < 2 ? 0.8 : 1
    const trend = 1_700 - offset * 3.2
    const wave =
      Math.sin(offset / 3.1 + phase) * 180 + Math.sin(offset / 11 + phase) * 120
    return sum + share * (trend + wave) * weekend
  }, 0)
}

const aovAt = (offset: number) => 36.5 + Math.sin(offset / 5) * 1.6
const conversionAt = (offset: number) => 0.031 + Math.sin(offset / 7 + 1) * 0.003

/** Splits a whole-number total by shares, giving the rounding remainder to the last part. */
const splitTotal = (total: number, shares: number[]) => {
  const parts = shares.map((share) => Math.round(total * share))
  parts[parts.length - 1] =
    total - parts.slice(0, -1).reduce((sum, part) => sum + part, 0)
  return parts
}

const currency = (value: number) => `$${Math.round(value).toLocaleString('en-US')}`

/** Everything the blocks show for one query. Replace with your own data fetching. */
function buildStoreData({ compare, preset, region }: Query, today: Date) {
  const hourly = preset === 'today'
  const length = hourly ? 24 : getPreset(preset).days
  const range = getDateRange(preset, today)
  const previousRange = getPreviousRange(range)

  const series = (shift: number) =>
    Array.from({ length }, (_, index) => {
      const offset = length - 1 - index + shift
      // Round once here so every block sums the same values.
      const revenue = Math.round(revenueAt(offset, region, hourly))
      const orders = revenue / aovAt(offset)
      return { offset, orders, revenue, sessions: orders / conversionAt(offset) }
    })
  const current = series(0)
  const previous = series(length)
  const sum = (points: typeof current, key: 'orders' | 'revenue' | 'sessions') =>
    points.reduce((total, point) => total + point[key], 0)

  const totals = (points: typeof current) => {
    const revenue = sum(points, 'revenue')
    const orders = sum(points, 'orders')
    const sessions = sum(points, 'sessions')
    return {
      aov: revenue / orders,
      conversion: (orders / sessions) * 100,
      orders,
      revenue,
      sessions,
    }
  }
  const now = totals(current)
  const before = totals(previous)
  const label = (index: number) => {
    if (hourly) return `${String(index).padStart(2, '0')}:00`
    const date = new Date(range.start.getTime() + index * 86_400_000)
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    })
  }
  const rangeLabel = formatDateRange(range)
  const previousLabel = formatDateRange(previousRange)
  const scope = `${hourly ? 'Today' : rangeLabel}${region ? `, ${region}` : ''}`

  return {
    chart: current.map((point, index) => ({
      current: Math.round(point.revenue),
      label: label(index),
      previous: Math.round(previous[index].revenue),
    })),
    channels: splitTotal(
      now.revenue,
      CHANNELS.map(
        (channel, index) => channel.share + (region ? (index - 1.5) * 0.02 : 0),
      ),
    ).map((value, index) => ({
      color: CHANNELS[index].color,
      label: CHANNELS[index].label,
      value,
    })),
    funnel: [
      { label: 'Sessions', value: Math.round(now.sessions) },
      { label: 'Viewed a product', value: Math.round(now.sessions * 0.62) },
      { label: 'Added to cart', value: Math.round(now.sessions * 0.17) },
      { label: 'Started checkout', value: Math.round(now.sessions * 0.071) },
      { label: 'Purchased', value: Math.round(now.orders) },
    ],
    previousLabel,
    products: splitTotal(
      now.revenue,
      PRODUCTS.map((product) => product.share),
    ).map((revenue, index) => ({
      category: PRODUCTS[index].category,
      name: PRODUCTS[index].name,
      revenue,
      units: Math.max(1, Math.round(revenue / PRODUCTS[index].price)),
    })),
    rangeLabel,
    scope,
    stats: [
      {
        formatter: currency,
        history: current.map((point) => Math.round(point.revenue)),
        key: 'revenue',
        label: 'Revenue',
        previous: compare ? Math.round(before.revenue) : undefined,
        value: Math.round(now.revenue),
      },
      {
        history: current.map((point) => Math.round(point.orders)),
        key: 'orders',
        label: 'Orders',
        previous: compare ? Math.round(before.orders) : undefined,
        value: Math.round(now.orders),
      },
      {
        formatter: (value: number) => `$${value.toFixed(2)}`,
        history: current.map((point) =>
          Number((point.revenue / point.orders).toFixed(2)),
        ),
        key: 'aov',
        label: 'Avg order value',
        previous: compare ? Number(before.aov.toFixed(2)) : undefined,
        value: Number(now.aov.toFixed(2)),
      },
      {
        changeType: 'points' as const,
        formatter: (value: number) => `${value}%`,
        history: current.map((point) =>
          Number(((point.orders / point.sessions) * 100).toFixed(1)),
        ),
        key: 'conversion',
        label: 'Conversion rate',
        previous: compare ? Number(before.conversion.toFixed(1)) : undefined,
        value: Number(now.conversion.toFixed(1)),
      },
    ],
  }
}

const Dashboard1 = (props: Dashboard1Props) => {
  const { title, today } = props
  const [query, setQuery] = useState<Query>({
    compare: true,
    preset: '30d',
    region: null,
  })
  // The query the blocks currently show. It lags behind while "fetching",
  // and the blocks stay in place, dimmed, until the new data arrives.
  const [shown, setShown] = useState(query)
  const busy = shown !== query

  useEffect(() => {
    if (shown === query) return
    const timer = setTimeout(() => setShown(query), 500)
    return () => clearTimeout(timer)
  }, [query, shown])

  const update = (patch: Partial<Query>) =>
    setQuery((current) => ({ ...current, ...patch }))
  const data = buildStoreData(shown, today)
  const range = getDateRange(query.preset, today)

  return (
    <div className='@container flex w-full flex-col gap-6'>
      <header className='flex flex-col gap-4'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h1 className='text-2xl font-semibold tracking-tight'>{title}</h1>
            <p className='text-muted-foreground text-sm' aria-live='polite'>
              {formatDateRange(range)}
              {query.compare && ` vs ${formatDateRange(getPreviousRange(range))}`}
              {query.region && ` · ${query.region}`}
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
          <CompareToggle
            checked={query.compare}
            className='px-1'
            onCheckedChange={(compare) => update({ compare })}
          />
          <FilterMenu
            allLabel='All regions'
            label='Region'
            onValueChange={(region) => update({ region })}
            options={REGIONS.map((item) => item.name)}
            value={query.region}
          >
            <IconPlaceholder
              lucide='MapPinIcon'
              tabler='IconMapPin'
              hugeicons='Location01Icon'
              phosphor='MapPinIcon'
              remixicon='RiMapPinLine'
            />
            {query.region ? 'Change region' : 'Filter by region'}
          </FilterMenu>
          {query.region && (
            <FilterChip
              field='Region'
              value={query.region}
              onRemove={() => update({ region: null })}
            />
          )}
        </div>
      </header>
      <BlockBusy
        busy={busy}
        label='Updating the dashboard'
        className='grid gap-4 @4xl:grid-cols-3'
      >
        <div className='@4xl:col-span-3'>
          <StatGroup2
            description={
              shown.compare
                ? `${data.scope}, compared with ${data.previousLabel}`
                : data.scope
            }
            metrics={data.stats}
            title='Performance'
          />
        </div>
        <div className='@4xl:col-span-2'>
          <ChartPanel1
            currentLabel={data.rangeLabel}
            data={data.chart}
            description={
              shown.compare
                ? `${data.scope}, compared with ${data.previousLabel}`
                : data.scope
            }
            formatter={currency}
            previousLabel={data.previousLabel}
            showPrevious={shown.compare}
            title='Revenue'
          />
        </div>
        <Breakdown1
          description={data.scope}
          formatter={currency}
          segments={data.channels}
          title='Revenue by channel'
        />
        <div className='@4xl:col-span-2'>
          <DataTable2
            description={`Units sold, revenue and share of total, ${data.scope}`}
            rows={data.products}
            title='Revenue by product'
          />
        </div>
        <Funnel1 description={data.scope} stages={data.funnel} title='Checkout funnel' />
      </BlockBusy>
    </div>
  )
}

export { Dashboard1, exampleProps as dashboard1ExampleProps, type Dashboard1Props }
