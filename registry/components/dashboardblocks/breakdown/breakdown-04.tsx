'use client'

import {
  BlockStateProvider,
  BlockStateText,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { BreakdownLegend } from '@/registry/components/dashboardblocks/breakdown'
import {
  chartBarCursor,
  ChartPlaceholder,
  ChartTooltipFrame,
  ChartTooltipItem,
} from '@/registry/components/dashboardblocks/chart'
import { ChartPanelTable } from '@/registry/components/dashboardblocks/chart-panel'
import {
  formatNumber,
  formatPercent,
  formatPoints,
  formatSigned,
} from '@/registry/lib/dashboardblocks/format'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type YAxisTickContentProps,
} from 'recharts'

interface ShareShift {
  current: number
  label: string
  previous: number
}

interface Breakdown4Props {
  currentLabel: string
  description: string
  /** Leave out, or pass none, to show the empty state. */
  items?: ShareShift[]
  previousLabel: string
  status?: BlockStatus
  title: string
}

const exampleProps: Breakdown4Props = {
  currentLabel: 'This quarter',
  description:
    'Share of new signups from each acquisition channel, against last quarter.',
  items: [
    { current: 34.2, label: 'Organic search', previous: 29.8 },
    { current: 22.6, label: 'Direct', previous: 24.1 },
    { current: 18.9, label: 'Paid social', previous: 13.4 },
    { current: 14.1, label: 'Referral', previous: 17.2 },
    { current: 10.2, label: 'Email', previous: 15.5 },
  ],
  previousLabel: 'Last quarter',
  title: 'Channel share shift',
}

const CURRENT_COLOR = 'var(--color-chart-2)'
const PREVIOUS_COLOR = 'var(--color-muted-foreground)'
const ROW_HEIGHT_PX = 44
const DOT_RADIUS_PX = 5
const LABEL_AXIS_PX = 116

interface ShiftRow extends ShareShift {
  delta: number
  range: [number, number]
}

const formatShare = (value: number) =>
  formatPercent(value / 100, { minimumFractionDigits: 1 })

const describeShift = (delta: number) =>
  delta === 0
    ? 'No change'
    : `${delta > 0 ? 'Up' : 'Down'} ${formatPoints(Math.abs(delta))}`

interface ShiftShapeProps {
  height?: number
  payload?: ShiftRow
  width?: number
  x?: number
  y?: number
}

const ShiftShape = ({
  height = 0,
  payload,
  width = 0,
  x = 0,
  y = 0,
}: ShiftShapeProps) => {
  if (!payload) return null
  const [low, high] = payload.range
  const at = (value: number) =>
    high > low ? x + ((value - low) / (high - low)) * width : x
  const middle = y + height / 2
  return (
    <g>
      <line
        x1={x}
        x2={x + width}
        y1={middle}
        y2={middle}
        stroke={CURRENT_COLOR}
        strokeOpacity={0.35}
        strokeWidth={3}
        strokeLinecap='round'
      />
      <circle
        cx={at(payload.previous)}
        cy={middle}
        r={DOT_RADIUS_PX}
        fill={PREVIOUS_COLOR}
        stroke='var(--color-background)'
        strokeWidth={2}
      />
      <circle
        cx={at(payload.current)}
        cy={middle}
        r={DOT_RADIUS_PX}
        fill={CURRENT_COLOR}
        stroke='var(--color-background)'
        strokeWidth={2}
      />
    </g>
  )
}

const Breakdown4 = (props: Breakdown4Props) => {
  const { currentLabel, description, items = [], previousLabel, status, title } = props
  const state = getBlockState(status, items.length === 0)
  const rows: ShiftRow[] = items.map((item) => ({
    ...item,
    delta: Math.round((item.current - item.previous) * 10) / 10,
    range: [Math.min(item.current, item.previous), Math.max(item.current, item.previous)],
  }))
  const values = items.flatMap((item) => [item.current, item.previous])
  const pad = (Math.max(...values) - Math.min(...values)) * 0.08 || 1
  const domain: [number, number] = [
    Math.max(0, Math.min(...values) - pad),
    Math.max(...values) + pad,
  ]
  const gainer = rows.reduce<ShiftRow | undefined>(
    (best, row) => (best && best.delta >= row.delta ? best : row),
    undefined,
  )

  return (
    <BlockStateProvider status={status} empty={items.length === 0}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <div className='flex flex-col gap-3 border-t pt-4'>
          {state ? (
            <BlockStateText className='text-sm' />
          ) : (
            gainer &&
            gainer.delta > 0 && (
              <p className='text-muted-foreground text-sm'>
                <span className='text-foreground font-medium'>{gainer.label}</span> gained
                the most, up {formatPoints(gainer.delta)} to {formatShare(gainer.current)}
                .
              </p>
            )
          )}
          <BreakdownLegend
            items={[
              { color: PREVIOUS_COLOR, label: previousLabel },
              { color: CURRENT_COLOR, label: currentLabel },
            ]}
          />
        </div>
        {state ? (
          <ChartPlaceholder height={5 * ROW_HEIGHT_PX} />
        ) : (
          <div
            role='img'
            aria-label={`${title} chart`}
            className='w-full'
            style={{ height: rows.length * ROW_HEIGHT_PX }}
          >
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                accessibilityLayer={false}
                barCategoryGap={0}
                data={rows}
                layout='vertical'
                margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
              >
                <XAxis
                  allowDataOverflow
                  dataKey='current'
                  domain={domain}
                  hide
                  type='number'
                />
                <YAxis
                  axisLine={false}
                  dataKey='label'
                  tick={{
                    dx: -LABEL_AXIS_PX + 8,
                    fill: 'var(--color-foreground)',
                    fontSize: 14,
                    textAnchor: 'start',
                  }}
                  tickLine={false}
                  type='category'
                  width={LABEL_AXIS_PX}
                />
                <YAxis
                  axisLine={false}
                  dataKey='label'
                  orientation='right'
                  tick={({ payload, x, y }: YAxisTickContentProps) => {
                    const row = rows.find((item) => item.label === payload?.value)
                    if (!row) return <g />
                    return (
                      <text
                        x={Number(x) + 8}
                        y={Number(y)}
                        textAnchor='start'
                        dominantBaseline='middle'
                      >
                        <tspan fill='var(--color-foreground)' fontSize={14}>
                          {formatShare(row.current)}
                        </tspan>
                        <tspan dx={6} fill='var(--color-muted-foreground)' fontSize={11}>
                          {formatSigned(row.delta, (value) =>
                            formatNumber(value, { minimumFractionDigits: 1 }),
                          )}
                        </tspan>
                      </text>
                    )
                  }}
                  tickLine={false}
                  type='category'
                  width={84}
                  yAxisId='values'
                />
                <Tooltip
                  content={({ active, payload }) => {
                    const row = payload?.[0]?.payload as ShiftRow | undefined
                    if (!active || !row) return null
                    return (
                      <ChartTooltipFrame>
                        <span className='font-medium'>{row.label}</span>
                        <ChartTooltipItem
                          color={CURRENT_COLOR}
                          name={currentLabel}
                          value={formatShare(row.current)}
                        />
                        <ChartTooltipItem
                          color={PREVIOUS_COLOR}
                          name={previousLabel}
                          value={formatShare(row.previous)}
                        />
                        <span className='text-muted-foreground'>
                          {describeShift(row.delta)}
                        </span>
                      </ChartTooltipFrame>
                    )
                  }}
                  cursor={chartBarCursor}
                />
                <Bar
                  dataKey='range'
                  shape={(shape: ShiftShapeProps) => <ShiftShape {...shape} />}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <ChartPanelTable
          caption={`${title}: ${description}`}
          columns={[
            { key: 'label', label: 'Channel' },
            { key: 'previous', label: previousLabel },
            { key: 'current', label: currentLabel },
            { key: 'change', label: 'Change' },
          ]}
          rows={rows.map((row) => ({
            change: describeShift(row.delta),
            current: formatShare(row.current),
            label: row.label,
            previous: formatShare(row.previous),
          }))}
        />
      </section>
    </BlockStateProvider>
  )
}

export { Breakdown4, exampleProps as breakdown4ExampleProps, type Breakdown4Props }
