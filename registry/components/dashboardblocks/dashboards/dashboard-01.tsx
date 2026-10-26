'use client'

import {
  BlockBusy,
  BlockStateProvider,
  type BlockStateProps,
} from '@/registry/components/dashboardblocks/block-state'
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
  getDateRange,
  getPreset,
  getPreviousRange,
} from '@/registry/components/dashboardblocks/dashboard-header'
import { DataTable2 } from '@/registry/components/dashboardblocks/data-table/data-table-02'
import { Forecast3 } from '@/registry/components/dashboardblocks/forecast/forecast-03'
import { Funnel1 } from '@/registry/components/dashboardblocks/funnel/funnel-01'
import { Inventory1 } from '@/registry/components/dashboardblocks/inventory/inventory-01'
import { StatGroup2 } from '@/registry/components/dashboardblocks/stat-group/stat-group-02'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import {
  formatCurrency,
  formatDate,
  formatDateRange,
  formatPercent,
} from '@/registry/lib/dashboardblocks/format'
import { useEffect, useState } from 'react'

interface Dashboard1Props extends BlockStateProps {
  empty?: boolean
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
  { color: 'var(--color-chart-2)', label: 'Organic search', share: 0.38 },
  { color: 'var(--color-chart-3)', label: 'Paid search', share: 0.27 },
  { color: 'var(--color-chart-4)', label: 'Email', share: 0.17 },
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

const STOCK = [
  {
    dailyDemand: 9,
    leadTimeDays: 12,
    name: 'Studio Display 27"',
    onHand: 0,
    reorderPoint: 110,
    sku: 'SD-27-SLV',
  },
  {
    dailyDemand: 21,
    leadTimeDays: 8,
    name: 'Wireless headphones',
    onHand: 64,
    onOrder: 200,
    reorderPoint: 170,
    sku: 'WH-01-BLK',
  },
  {
    dailyDemand: 6,
    leadTimeDays: 21,
    name: 'Ergonomic chair',
    onHand: 88,
    reorderPoint: 126,
    sku: 'EC-02-GRY',
  },
  {
    dailyDemand: 14,
    leadTimeDays: 6,
    name: 'USB-C dock',
    onHand: 131,
    reorderPoint: 84,
    sku: 'UD-11-GRY',
  },
]

const DAILY_TARGET = 1_750

interface Query {
  compare: boolean
  preset: DateRangePreset
  region: string | null
}

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

const splitTotal = (total: number, shares: number[]) => {
  const parts = shares.map((share) => Math.round(total * share))
  parts[parts.length - 1] =
    total - parts.slice(0, -1).reduce((sum, part) => sum + part, 0)
  return parts
}

const currency = (value: number) => formatCurrency(value)

function buildStoreData({ compare, preset, region }: Query, today: Date) {
  const hourly = preset === 'today'
  const length = hourly ? 24 : getPreset(preset).days
  const range = getDateRange(preset, today)
  const previousRange = getPreviousRange(range)

  const series = (shift: number) =>
    Array.from({ length }, (_, index) => {
      const offset = length - 1 - index + shift
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
    return formatDate(date, 'day')
  }
  const elapsed = today.getUTCDate()
  const daysInMonth = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0),
  ).getUTCDate()
  const regionShare = region
    ? (REGIONS.find((item) => item.name === region)?.share ?? 1)
    : 1
  const rangeLabel = formatDateRange(range)
  const previousLabel = formatDateRange(previousRange)

  const best = current.reduce(
    (top, point, index) => (point.revenue > current[top].revenue ? index : top),
    0,
  )
  const channels = splitTotal(
    now.revenue,
    CHANNELS.map((channel, index) => channel.share + (region ? (index - 1.5) * 0.02 : 0)),
  ).map((value, index) => ({
    color: CHANNELS[index].color,
    label: CHANNELS[index].label,
    value,
  }))
  const search = channels
    .filter((channel) => channel.label.endsWith('search'))
    .reduce((sum, channel) => sum + channel.value, 0)

  return {
    bestDay: `${hourly ? 'Busiest hour' : 'Best day'} was ${label(best)}, at ${currency(current[best].revenue)}.`,
    channels,
    channelSummary: `Search brings in ${formatPercent(search / now.revenue, { maximumFractionDigits: 0 })} of revenue.`,
    chart: current.map((point, index) => ({
      current: Math.round(point.revenue),
      label: label(index),
      previous: Math.round(previous[index].revenue),
    })),
    month: {
      current: Array.from({ length: elapsed }, (_, offset) =>
        Math.round(revenueAt(offset, region, false)),
      ).reduce((sum, value) => sum + value, 0),
      elapsed,
      name: formatDate(today, 'month-long'),
      target: Math.round((DAILY_TARGET * daysInMonth * regionShare) / 1_000) * 1_000,
      total: daysInMonth,
    },
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
    stats: [
      {
        history: current.map((point) => Math.round(point.sessions)),
        key: 'sessions',
        label: 'Sessions',
        previous: compare ? Math.round(before.sessions) : undefined,
        value: Math.round(now.sessions),
      },
      {
        history: current.map((point) => Math.round(point.orders)),
        key: 'orders',
        label: 'Orders',
        previous: compare ? Math.round(before.orders) : undefined,
        value: Math.round(now.orders),
      },
      {
        formatter: (value: number) => formatCurrency(value, { precision: 'exact' }),
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
        formatter: (value: number) => formatPercent(value / 100),
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
  const { empty = false, errorMessage, status, title, today } = props
  const [query, setQuery] = useState<Query>({
    compare: true,
    preset: '30d',
    region: null,
  })
  const [displayedQuery, setDisplayedQuery] = useState(query)
  const busy = displayedQuery !== query

  useEffect(() => {
    if (displayedQuery === query) return
    const timer = setTimeout(() => setDisplayedQuery(query), 500)
    return () => clearTimeout(timer)
  }, [query, displayedQuery])

  const update = (patch: Partial<Query>) =>
    setQuery((current) => ({ ...current, ...patch }))
  const data = buildStoreData(displayedQuery, today)
  const range = getDateRange(query.preset, today)

  return (
    <BlockStateProvider
      errorMessage={errorMessage}
      state={status ?? (empty ? 'empty' : undefined)}
    >
      <div className='@container flex w-full flex-col gap-8'>
        <header className='flex flex-col gap-3'>
          <div className='flex flex-col gap-2'>
            <div className='flex flex-wrap items-start justify-between gap-3'>
              <h1 className='min-w-0 text-2xl font-semibold tracking-tight'>{title}</h1>
              <div className='flex items-center gap-3'>
                <CompareToggle
                  checked={query.compare}
                  onCheckedChange={(compare) => update({ compare })}
                />
                <ExportMenu
                  disabled={status !== undefined || empty}
                  onExport={() => {}}
                />
              </div>
            </div>
            <p className='text-muted-foreground leading-relaxed'>
              Showing{' '}
              <DateRangePicker
                onValueChange={(preset) => update({ preset })}
                today={today}
                value={query.preset}
                variant='inline'
              />
              <span aria-live='polite'>
                , {formatDateRange(range)}
                {query.compare &&
                  `, compared with ${formatDateRange(getPreviousRange(range))}`}
                .
              </span>
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            {query.region && (
              <FilterChip
                field='Region'
                value={query.region}
                onRemove={() => update({ region: null })}
              />
            )}
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
          </div>
        </header>
        <BlockBusy
          busy={busy}
          label='Updating the dashboard'
          className='grid gap-x-8 gap-y-12 @4xl:grid-cols-3'
        >
          <div className='@4xl:col-span-3'>
            <StatGroup2
              errorMessage={errorMessage}
              status={status}
              comparison={data.previousLabel}
              description={
                displayedQuery.compare
                  ? undefined
                  : 'Sessions, orders, order value and conversion, by day.'
              }
              metrics={empty ? [] : data.stats}
              title='Shoppers and orders'
            />
          </div>
          <div className='@4xl:col-span-2'>
            <ChartPanel1
              errorMessage={errorMessage}
              status={status}
              comparison={`in ${data.previousLabel}`}
              currentLabel={data.rangeLabel}
              data={empty ? [] : data.chart}
              description={status || empty ? '' : data.bestDay}
              formatter={currency}
              previousLabel={data.previousLabel}
              showPrevious={displayedQuery.compare}
              title='Revenue'
            />
          </div>
          <Forecast3
            errorMessage={errorMessage}
            status={status}
            current={empty ? undefined : data.month.current}
            description='Projected at the daily run-rate.'
            elapsed={data.month.elapsed}
            formatter={currency}
            target={data.month.target}
            title={`${data.month.name} revenue`}
            total={data.month.total}
          />
          <div className='@4xl:col-span-2'>
            <DataTable2
              errorMessage={errorMessage}
              status={status}
              rows={empty ? [] : data.products}
              title='Revenue by product'
            />
          </div>
          <Funnel1
            errorMessage={errorMessage}
            status={status}
            description='Most shoppers leave before adding to cart.'
            stages={empty ? [] : data.funnel}
            title='Checkout funnel'
          />
          <div className='@4xl:col-span-2'>
            <Inventory1
              errorMessage={errorMessage}
              status={status}
              items={empty ? [] : STOCK}
              title='Low stock'
            />
          </div>
          <Breakdown1
            errorMessage={errorMessage}
            status={status}
            description={status || empty ? '' : data.channelSummary}
            formatter={currency}
            segments={empty ? [] : data.channels}
            title='Revenue by channel'
          />
        </BlockBusy>
      </div>
    </BlockStateProvider>
  )
}

export { Dashboard1, exampleProps as dashboard1ExampleProps, type Dashboard1Props }
