'use client'

import {
  ChartPanelFigure,
  ChartPanelLegend,
  ChartPanelTable,
  chartAxisProps,
  chartGridProps,
} from '@/registry/components/dashboardblocks/chart-panel'
import {
  StockStatusBadge,
  getStockStatus,
  projectStock,
} from '@/registry/components/dashboardblocks/inventory'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface IncomingOrder {
  /** Days from today until it arrives. */
  day: number
  quantity: number
}

interface Inventory4Props {
  dailyDemand: number
  description: string
  /** How many days ahead to project. @default 30 */
  horizon?: number
  incoming: IncomingOrder[]
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  onHand: number
  reorderPoint: number
  title: string
}

const exampleProps: Inventory4Props = {
  dailyDemand: 22,
  description: 'Merino crew socks, 3 pack · MS-3P-GRY',
  incoming: [{ day: 9, quantity: 360 }],
  now: new Date(Date.UTC(2026, 8, 26)),
  onHand: 238,
  reorderPoint: 180,
  title: 'Stock projection',
}

const DAY = 86_400_000
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

const Inventory4 = (props: Inventory4Props) => {
  const {
    dailyDemand,
    description,
    horizon = 30,
    incoming,
    now,
    onHand,
    reorderPoint,
    title,
  } = props
  const { levels, stockoutDay } = projectStock({
    dailyDemand,
    days: horizon,
    incoming,
    onHand,
  })
  const rows = levels.map((level, day) => ({
    date: dateFormatter.format(new Date(now.getTime() + day * DAY)),
    day,
    stock: Math.max(0, Math.round(level)),
  }))
  const firstStockout = stockoutDay
  const lowest = rows.reduce((min, row) => (row.stock < min.stock ? row : min), rows[0])
  const status = getStockStatus({ onHand, reorderPoint })

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <dl className='grid grid-cols-2 gap-4 @md:grid-cols-3'>
          <div className='flex flex-col gap-1'>
            <dt className='text-muted-foreground text-xs'>On hand</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {onHand.toLocaleString()}
            </dd>
            <dd>
              <StockStatusBadge status={status} />
            </dd>
          </div>
          <div className='flex flex-col gap-1'>
            <dt className='text-muted-foreground text-xs'>Lowest point</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {lowest.stock.toLocaleString()}
            </dd>
            <dd className='text-muted-foreground text-xs'>on {lowest.date}</dd>
          </div>
          <div className='col-span-2 flex flex-col gap-1 @md:col-span-1'>
            <dt className='text-muted-foreground text-xs'>Runs out</dt>
            <dd className='text-2xl font-semibold tracking-tight'>
              {firstStockout === null
                ? 'Not in ' + horizon + ' days'
                : rows[firstStockout].date}
            </dd>
            <dd className='text-muted-foreground text-xs'>
              {incoming.length > 0
                ? `${incoming.reduce((sum, order) => sum + order.quantity, 0).toLocaleString()} arriving ${incoming.map((order) => rows[order.day]?.date).join(', ')}`
                : 'Nothing on order'}
            </dd>
          </div>
        </dl>
        <ChartPanelLegend
          items={[
            { color: 'var(--chart-2)', label: 'Projected stock' },
            { color: 'var(--muted-foreground)', label: 'Reorder point', shape: 'line' },
          ]}
        />
        <ChartPanelFigure className='h-52'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={rows} margin={{ top: 20, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid {...chartGridProps} />
              <XAxis
                {...chartAxisProps}
                dataKey='date'
                interval='preserveStartEnd'
                minTickGap={24}
              />
              <YAxis {...chartAxisProps} width={40} />
              <ReferenceLine
                label={{
                  fill: 'var(--color-muted-foreground)',
                  fontSize: 11,
                  position: 'insideTopRight',
                  value: 'Reorder point',
                }}
                stroke='var(--color-muted-foreground)'
                strokeDasharray='4 4'
                y={reorderPoint}
              />
              {incoming.map((order) => (
                <ReferenceLine
                  key={order.day}
                  label={{
                    fill: 'var(--color-foreground)',
                    fontSize: 11,
                    position: 'top',
                    value: `+${order.quantity}`,
                  }}
                  stroke='var(--color-border)'
                  x={rows[order.day]?.date}
                />
              ))}
              <Tooltip
                content={({ active, label, payload }) =>
                  active && payload?.length ? (
                    <div className='bg-popover text-popover-foreground ring-foreground/10 rounded-lg px-3 py-2 text-xs shadow-md ring-1'>
                      <span className='text-muted-foreground'>{label}</span>
                      <div className='font-medium tabular-nums'>
                        {Number(payload[0].value).toLocaleString()} units
                      </div>
                    </div>
                  ) : null
                }
                cursor={{ stroke: 'var(--color-border)' }}
              />
              <Area
                dataKey='stock'
                fill='var(--chart-2)'
                fillOpacity={0.2}
                name='Projected stock'
                stroke='var(--chart-2)'
                strokeWidth={2}
                type='stepAfter'
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanelFigure>
        <ChartPanelTable
          caption={`${title}: ${description}. ${dailyDemand} units a day, reorder point ${reorderPoint}.`}
          columns={[
            { key: 'date', label: 'Date' },
            { key: 'stock', label: 'Projected stock' },
          ]}
          rows={rows.filter(
            (row) => row.day % 5 === 0 || incoming.some((order) => order.day === row.day),
          )}
        />
      </CardContent>
    </Card>
  )
}

export {
  Inventory4,
  exampleProps as inventory4ExampleProps,
  type IncomingOrder,
  type Inventory4Props,
}
