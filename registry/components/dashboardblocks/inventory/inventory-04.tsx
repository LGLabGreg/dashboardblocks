'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateText,
  type BlockStatus,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ChartPlaceholder,
  chartActiveDot,
  chartAxisProps,
  chartGridProps,
  chartLineCursor,
  chartReferenceLabel,
  chartReferenceProps,
  ChartTooltipContent,
  chartValueAxisWidth,
  useChartId,
} from '@/registry/components/dashboardblocks/chart'
import {
  ChartPanelFigure,
  ChartPanelLegend,
  ChartPanelTable,
} from '@/registry/components/dashboardblocks/chart-panel'
import {
  StockStatusLabel,
  getStockStatus,
  projectStock,
} from '@/registry/components/dashboardblocks/inventory'
import { formatNumber } from '@/registry/lib/dashboardblocks/format'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface IncomingOrder {
  day: number
  quantity: number
}

interface Inventory4Props {
  dailyDemand: number
  /** Defaults to a sentence saying when stock runs out. */
  description?: string
  horizon?: number
  incoming?: IncomingOrder[]
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  /** Leave out to show the empty state. */
  onHand?: number
  /** Names the item in the default description, such as `the merino socks 3-pack`. */
  product: string
  reorderPoint: number
  status?: BlockStatus
  title: string
}

const exampleProps: Inventory4Props = {
  dailyDemand: 22,
  incoming: [{ day: 9, quantity: 360 }],
  now: new Date(Date.UTC(2026, 8, 26)),
  onHand: 238,
  product: 'the merino socks 3-pack',
  reorderPoint: 180,
  title: 'Stock projection',
}

const DAY = 86_400_000
const STOCK_COLOR = 'var(--color-chart-2)'
const STOCKOUT_COLOR = 'var(--color-red-500)'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

const units = (value: number) => `${formatNumber(value)} units`

const Inventory4 = (props: Inventory4Props) => {
  const {
    dailyDemand,
    horizon = 30,
    incoming = [],
    now,
    onHand,
    product,
    reorderPoint,
    status,
    title,
  } = props
  const state = getBlockState(status, onHand === undefined)
  const ready = state === undefined || state === 'loading'
  const gradientId = useChartId()
  const { levels, stockoutDay } = projectStock({
    dailyDemand,
    days: horizon,
    incoming,
    onHand: onHand ?? 0,
  })
  const rows = levels.map((level, day) => ({
    date: dateFormatter.format(new Date(now.getTime() + day * DAY)),
    day,
    stock: Math.max(0, Math.round(level)),
  }))
  const stockout = stockoutDay === null ? null : rows[stockoutDay]
  const lowest = rows.reduce((min, row) => (row.stock < min.stock ? row : min), rows[0])
  const arriving = incoming.reduce((sum, order) => sum + order.quantity, 0)
  const {
    description = stockout
      ? `At ${formatNumber(dailyDemand)} a day, ${product} runs out on ${stockout.date}, even with what’s on order.`
      : `At ${formatNumber(dailyDemand)} a day, ${product} lasts the next ${horizon} days.`,
  } = props

  return (
    <BlockStateProvider status={status} empty={onHand === undefined}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        <dl className='grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-4 @md:grid-cols-3'>
          <div className='flex flex-col gap-1'>
            <dt className='text-muted-foreground text-sm'>On hand</dt>
            <dd className='text-2xl font-light tracking-tight tabular-nums'>
              {state || onHand === undefined ? (
                <BlockStateText variant='short' />
              ) : (
                formatNumber(onHand)
              )}
            </dd>
            <dd>
              <BlockReady className='text-xs'>
                <StockStatusLabel
                  className='text-xs'
                  status={getStockStatus({ onHand: onHand ?? 0, reorderPoint })}
                />
              </BlockReady>
            </dd>
          </div>
          {ready && (
            <div className='flex flex-col gap-1'>
              <dt className='text-muted-foreground text-sm'>Lowest point</dt>
              <dd className='text-2xl font-light tracking-tight tabular-nums'>
                {state ? <SkeletonText className='w-16' /> : formatNumber(lowest.stock)}
              </dd>
              <dd className='text-muted-foreground text-xs'>
                <BlockReady className='text-xs'>on {lowest.date}</BlockReady>
              </dd>
            </div>
          )}
          {ready && (
            <div className='col-span-2 flex flex-col gap-1 @md:col-span-1'>
              <dt className='text-muted-foreground text-sm'>Runs out</dt>
              <dd className='text-2xl font-light tracking-tight'>
                {state ? (
                  <SkeletonText className='w-20' />
                ) : stockout ? (
                  stockout.date
                ) : (
                  `Not in ${horizon} days`
                )}
              </dd>
              <dd className='text-muted-foreground text-xs'>
                <BlockReady className='text-xs'>
                  {incoming.length > 0
                    ? `${formatNumber(arriving)} arriving ${incoming.map((order) => rows[order.day]?.date).join(', ')}`
                    : 'Nothing on order'}
                </BlockReady>
              </dd>
            </div>
          )}
        </dl>
        {ready && (
          <ChartPanelLegend
            items={[
              { color: STOCK_COLOR, label: 'Projected stock' },
              {
                color: 'var(--color-muted-foreground)',
                label: 'Reorder point',
                shape: 'line',
              },
            ]}
          />
        )}
        {state ? (
          <ChartPanelFigure className='h-56'>
            <ChartPlaceholder height='100%' />
          </ChartPanelFigure>
        ) : (
          <>
            <ChartPanelFigure className='h-56'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart
                  data={rows}
                  margin={{ top: 20, right: 12, bottom: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='0%' stopColor={STOCK_COLOR} stopOpacity={0.3} />
                      <stop offset='100%' stopColor={STOCK_COLOR} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...chartGridProps} />
                  <XAxis
                    {...chartAxisProps}
                    dataKey='date'
                    interval='preserveStartEnd'
                    minTickGap={24}
                  />
                  <YAxis {...chartAxisProps} width={chartValueAxisWidth} />
                  <ReferenceLine
                    {...chartReferenceProps}
                    label={{
                      ...chartReferenceLabel,
                      position: 'insideTopRight',
                      value: 'Reorder point',
                    }}
                    y={reorderPoint}
                  />
                  {incoming.map((order) => (
                    <ReferenceLine
                      key={order.day}
                      {...chartReferenceProps}
                      label={{
                        ...chartReferenceLabel,
                        fill: 'var(--color-foreground)',
                        position: 'top',
                        value: `+${formatNumber(order.quantity)} arrive`,
                      }}
                      x={rows[order.day]?.date}
                    />
                  ))}
                  <Tooltip
                    content={<ChartTooltipContent valueFormatter={units} />}
                    cursor={chartLineCursor}
                  />
                  <Area
                    activeDot={chartActiveDot}
                    dataKey='stock'
                    fill={`url(#${gradientId})`}
                    name='Projected stock'
                    stroke={STOCK_COLOR}
                    strokeWidth={2}
                    type='stepAfter'
                  />
                  {stockout && (
                    <ReferenceLine
                      label={{
                        ...chartReferenceLabel,
                        fill: STOCKOUT_COLOR,
                        position: 'insideTopLeft',
                        value: 'Runs out',
                      }}
                      stroke={STOCKOUT_COLOR}
                      strokeDasharray='3 3'
                      x={stockout.date}
                    />
                  )}
                  {stockout && (
                    <ReferenceDot
                      fill={STOCKOUT_COLOR}
                      r={4}
                      stroke='var(--color-background)'
                      strokeWidth={2}
                      x={stockout.date}
                      y={0}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </ChartPanelFigure>
            <ChartPanelTable
              caption={`${title}: ${description} Reorder point ${formatNumber(reorderPoint)}.`}
              columns={[
                { key: 'date', label: 'Date' },
                { key: 'stock', label: 'Projected stock' },
              ]}
              rows={rows.filter(
                (row) =>
                  row.day % 5 === 0 || incoming.some((order) => order.day === row.day),
              )}
            />
          </>
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  Inventory4,
  exampleProps as inventory4ExampleProps,
  type IncomingOrder,
  type Inventory4Props,
}
