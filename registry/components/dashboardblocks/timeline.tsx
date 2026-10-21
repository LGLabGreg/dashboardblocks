'use client'

import {
  BlockStateRows,
  useBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ChartPlaceholder,
  ChartTooltipFrame,
  useChartId,
  chartTimeGridProps,
} from '@/registry/components/dashboardblocks/chart'
import { Details } from '@/registry/components/dashboardblocks/details'
import {
  StatusLabel,
  type StatusTone,
} from '@/registry/components/dashboardblocks/status-label'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatDateRange, formatPercent } from '@/registry/lib/dashboardblocks/format'
import type { ReactNode } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { cn } from '@/lib/utils'

const DAY = 86_400_000

type TimelineUnit = 'week' | 'month' | 'quarter'

function getTimelineScale(start: Date, end: Date) {
  const from = start.getTime()
  const span = Math.max(DAY, end.getTime() - from)
  return (date: Date) =>
    Math.min(100, Math.max(0, ((date.getTime() - from) / span) * 100))
}

function getTimelineTicks(start: Date, end: Date, unit: TimelineUnit) {
  const ticks: Date[] = []
  let cursor: Date
  if (unit === 'week') {
    const weekday = (start.getUTCDay() + 6) % 7
    cursor = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() - weekday),
    )
    if (cursor < start) cursor = new Date(cursor.getTime() + 7 * DAY)
  } else {
    const step = unit === 'quarter' ? 3 : 1
    const month = Math.ceil(start.getUTCMonth() / step) * step
    cursor = new Date(Date.UTC(start.getUTCFullYear(), month, 1))
    if (cursor < start)
      cursor = new Date(Date.UTC(start.getUTCFullYear(), month + step, 1))
  }
  while (cursor <= end) {
    ticks.push(cursor)
    cursor =
      unit === 'week'
        ? new Date(cursor.getTime() + 7 * DAY)
        : new Date(
            Date.UTC(
              cursor.getUTCFullYear(),
              cursor.getUTCMonth() + (unit === 'quarter' ? 3 : 1),
              1,
            ),
          )
  }
  return ticks
}

function getDaysBetween(from: Date, to: Date) {
  const utc = (date: Date) =>
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  return Math.round((utc(to) - utc(from)) / DAY)
}

const dayFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

function formatTimelineDate(date: Date) {
  return dayFormatter.format(date)
}

function formatTimelineRange(start: Date, end: Date) {
  return formatDateRange({ end, start })
}

type TimelineStatus = 'done' | 'in-progress' | 'planned' | 'at-risk'

const timelineStatusConfig: Record<
  TimelineStatus,
  { icon: ReactNode; label: string; tone: StatusTone }
> = {
  'at-risk': {
    icon: (
      <IconPlaceholder
        lucide='TriangleAlertIcon'
        tabler='IconAlertTriangle'
        hugeicons='Alert02Icon'
        phosphor='WarningIcon'
        remixicon='RiErrorWarningLine'
        aria-hidden
      />
    ),
    label: 'At risk',
    tone: 'warning',
  },
  done: {
    icon: (
      <IconPlaceholder
        lucide='CircleCheckIcon'
        tabler='IconCircleCheck'
        hugeicons='CheckmarkCircle02Icon'
        phosphor='CheckCircleIcon'
        remixicon='RiCheckboxCircleLine'
        aria-hidden
      />
    ),
    label: 'Done',
    tone: 'good',
  },
  'in-progress': {
    icon: (
      <IconPlaceholder
        lucide='CircleDotIcon'
        tabler='IconCircleDot'
        hugeicons='RecordIcon'
        phosphor='RecordIcon'
        remixicon='RiRecordCircleLine'
        aria-hidden
      />
    ),
    label: 'In progress',
    tone: 'info',
  },
  planned: {
    icon: (
      <IconPlaceholder
        lucide='CircleDashedIcon'
        tabler='IconCircleDashed'
        hugeicons='DashedLineCircleIcon'
        phosphor='CircleDashedIcon'
        remixicon='RiLoaderLine'
        aria-hidden
      />
    ),
    label: 'Planned',
    tone: 'neutral',
  },
}

function TimelineStatusLabel({
  className,
  showLabel = false,
  status,
}: {
  className?: string
  showLabel?: boolean
  status: TimelineStatus
}) {
  const config = timelineStatusConfig[status]
  return (
    <StatusLabel
      className={cn(
        'inline-flex items-center gap-1 text-xs [&_svg]:size-3.5 [&_svg]:shrink-0',
        className,
      )}
      tone={config.tone}
      variant='text'
    >
      {config.icon}
      <span className={cn(!showLabel && 'sr-only')}>{config.label}</span>
    </StatusLabel>
  )
}

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  timeZone: 'UTC',
})

const formatMonth = (date: Date) => monthFormatter.format(date)

const TIMELINE_AXIS_HEIGHT = 20
const TIMELINE_NOW_Z_INDEX = 550

interface TimelineAxisTickProps {
  format?: (date: Date) => string
  payload?: { value: number }
  x?: number
}

function TimelineAxisTick({
  format = formatMonth,
  payload,
  x = 0,
}: TimelineAxisTickProps) {
  if (!payload) return null
  return (
    <g>
      <line stroke='var(--color-border)' x1={x} x2={x} y1={0} y2={TIMELINE_AXIS_HEIGHT} />
      <text fill='var(--color-muted-foreground)' fontSize={11} x={x + 4} y={14}>
        {format(new Date(payload.value))}
      </text>
    </g>
  )
}

interface TimelineNowLabelProps {
  label: string
  viewBox?: { x?: number }
}

function TimelineNowLabel({ label, viewBox }: TimelineNowLabelProps) {
  const x = viewBox?.x ?? 0
  const width = label.length * 6 + 8
  return (
    <g>
      <rect
        fill='var(--color-foreground)'
        height={16}
        rx={3}
        width={width}
        x={x - width / 2}
        y={2}
      />
      <text
        fill='var(--color-background)'
        fontSize={10}
        fontWeight={500}
        textAnchor='middle'
        x={x}
        y={13}
      >
        {label}
      </text>
    </g>
  )
}

interface TimelineBand {
  active: boolean
  height: number
  index: number
  /** Maps a date to its position across the chart, in pixels. */
  x: (date: Date) => number
  y: number
}

interface TimelineChartProps<Row> {
  className?: string
  end: Date
  /** @default month names, e.g. "Sep" */
  formatTick?: (date: Date) => string
  now?: Date
  /** @default 'Today' */
  nowLabel?: string
  /** Draws a row's bars inside its band, in SVG. */
  renderRow: (row: Row, band: TimelineBand) => ReactNode
  /** In pixels; match it in any column drawn beside the chart. */
  rowHeight: number
  rows: Row[]
  start: Date
  ticks: Date[]
  /** The hovered row's tooltip, or `null` for none. */
  tooltip: (row: Row) => ReactNode
}

interface TimelineBarShapeProps {
  height?: number
  index?: number
  payload?: { row: unknown }
  width?: number
  x?: number
  y?: number
}

function TimelineChart<Row>({
  className,
  end,
  formatTick,
  now,
  nowLabel = 'Today',
  renderRow,
  rowHeight,
  rows,
  start,
  ticks,
  tooltip,
}: TimelineChartProps<Row>) {
  const from = start.getTime()
  const to = Math.max(from + DAY, end.getTime())
  const data = rows.map((row, index) => ({ index, range: [from, to], row }))
  const shape =
    (active: boolean) =>
    ({
      height = 0,
      index = 0,
      payload,
      width = 0,
      x = 0,
      y = 0,
    }: TimelineBarShapeProps) => (
      <g>
        {payload &&
          renderRow(payload.row as Row, {
            active,
            height,
            index,
            x: (date) => x + ((date.getTime() - from) / (to - from)) * width,
            y,
          })}
      </g>
    )

  return (
    <div
      aria-hidden
      className={cn('w-full', className)}
      style={{ height: TIMELINE_AXIS_HEIGHT + rows.length * rowHeight }}
    >
      <ResponsiveContainer height='100%' width='100%'>
        <BarChart
          accessibilityLayer={false}
          barCategoryGap={0}
          data={data}
          layout='vertical'
          margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
        >
          <CartesianGrid {...chartTimeGridProps} />
          <XAxis
            allowDataOverflow
            axisLine={false}
            domain={[from, to]}
            height={TIMELINE_AXIS_HEIGHT}
            interval={0}
            orientation='top'
            tick={<TimelineAxisTick format={formatTick} />}
            tickLine={false}
            ticks={ticks.map((tick) => tick.getTime())}
            type='number'
          />
          <YAxis dataKey='index' hide type='category' />
          <Tooltip
            content={({ active, payload }) => {
              const row = payload?.[0]?.payload?.row as Row | undefined
              const body = active && row !== undefined ? tooltip(row) : null
              return body ? <ChartTooltipFrame>{body}</ChartTooltipFrame> : null
            }}
            cursor={false}
          />
          <Bar
            activeBar={shape(true)}
            dataKey='range'
            isAnimationActive={false}
            shape={shape(false)}
          />
          {now && now >= start && now <= end && (
            <ReferenceLine
              ifOverflow='hidden'
              label={<TimelineNowLabel label={nowLabel} />}
              stroke='var(--color-foreground)'
              x={now.getTime()}
              zIndex={TIMELINE_NOW_Z_INDEX}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface TimelineItem {
  /** @default 'var(--color-chart-2)' */
  color?: string
  end: Date
  /** Names a group; consecutive items with the same group sit under one heading. */
  group?: string
  id: string
  label: string
  /** Share done, 0–1. */
  progress?: number
  start: Date
  status?: TimelineStatus
}

interface TimelineProps {
  /** A note under the chart. */
  children?: ReactNode
  className?: string
  describe?: (item: TimelineItem) => string
  end: Date
  formatTick?: (date: Date) => string
  items: TimelineItem[]
  /** Names the sideways scroll region `minWidth` adds. @default 'Timeline' */
  label?: string
  /** Keeps bars legible in narrow containers: below this width the track scrolls sideways. */
  minWidth?: string
  now?: Date
  /** How many rows to sketch while loading. @default 6 */
  placeholderRows?: number
  start: Date
  /** @default 'month' */
  unit?: TimelineUnit
}

const TIMELINE_ROW_HEIGHT = 32
const TIMELINE_BAR_INSET = 6
const TIMELINE_MIN_BAR_WIDTH = 6

const formatProgress = (share: number) =>
  formatPercent(share, { maximumFractionDigits: 0 })

type TimelineRow = { group: string; kind: 'group' } | { item: TimelineItem; kind: 'item' }

function TimelineItemTooltip({ item }: { item: TimelineItem }) {
  return (
    <>
      <span className='font-medium'>{item.label}</span>
      <span className='text-muted-foreground tabular-nums'>
        {formatTimelineRange(item.start, item.end)}
      </span>
      {(item.status || item.progress !== undefined) && (
        <Details>
          {item.status && <TimelineStatusLabel showLabel status={item.status} />}
          {item.progress !== undefined && (
            <span className='tabular-nums'>{formatProgress(item.progress)} done</span>
          )}
        </Details>
      )}
    </>
  )
}

function Timeline({
  children,
  className,
  describe,
  end,
  formatTick,
  items,
  label = 'Timeline',
  minWidth,
  now,
  placeholderRows = 6,
  start,
  unit = 'month',
}: TimelineProps) {
  const id = useChartId()
  const state = useBlockState()

  if (state) {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        {state === 'loading' ? (
          <ChartPlaceholder
            height={TIMELINE_AXIS_HEIGHT + placeholderRows * TIMELINE_ROW_HEIGHT}
          />
        ) : (
          <BlockStateRows />
        )}
        {state === 'loading' && children && (
          <p className='text-muted-foreground text-sm'>{children}</p>
        )}
      </div>
    )
  }

  const ticks = getTimelineTicks(start, end, unit)
  const describeItem =
    describe ??
    ((item: TimelineItem) =>
      [
        `${item.label}: ${formatTimelineRange(item.start, item.end)}`,
        item.status && timelineStatusConfig[item.status].label.toLowerCase(),
        item.progress !== undefined && `${formatProgress(item.progress)} done`,
      ]
        .filter(Boolean)
        .join(', '))
  const rows = items.flatMap<TimelineRow>((item, index) =>
    item.group && item.group !== items[index - 1]?.group
      ? [
          { group: item.group, kind: 'group' },
          { item, kind: 'item' },
        ]
      : [{ item, kind: 'item' }],
  )

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div
        role={minWidth ? 'region' : undefined}
        aria-label={minWidth ? label : undefined}
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrolling region must be focusable so keyboard users can reach the columns that don't fit
        tabIndex={minWidth ? 0 : undefined}
        className={cn(
          minWidth &&
            'focus-visible:ring-ring/50 -my-1 overflow-x-auto py-1 rounded-sm outline-none focus-visible:ring-3',
        )}
      >
        <div
          className='grid grid-cols-[minmax(6rem,11rem)_minmax(0,1fr)] gap-x-3'
          style={{ minWidth }}
        >
          <ul
            className={cn(
              'flex flex-col',
              minWidth && 'bg-background sticky left-0 z-20',
            )}
          >
            <li aria-hidden style={{ height: TIMELINE_AXIS_HEIGHT }} />
            {rows.map((row) =>
              row.kind === 'group' ? (
                <li
                  key={`group-${row.group}`}
                  className='text-muted-foreground flex items-end pb-1 text-xs font-medium'
                  style={{ height: TIMELINE_ROW_HEIGHT }}
                >
                  {row.group}
                </li>
              ) : (
                <li
                  key={row.item.id}
                  className='flex min-w-0 items-center gap-1.5 text-sm'
                  style={{ height: TIMELINE_ROW_HEIGHT }}
                >
                  {row.item.status && <TimelineStatusLabel status={row.item.status} />}
                  <span className='truncate'>{row.item.label}</span>
                  <span className='sr-only'>, {describeItem(row.item)}</span>
                </li>
              ),
            )}
          </ul>
          <TimelineChart
            end={end}
            formatTick={formatTick}
            now={now}
            renderRow={(row, band) => {
              if (row.kind === 'group') return null
              const { item } = row
              const color = item.color ?? 'var(--color-chart-2)'
              const planned = item.status === 'planned'
              const left = band.x(item.start)
              const width = Math.max(TIMELINE_MIN_BAR_WIDTH, band.x(item.end) - left)
              const top = band.y + TIMELINE_BAR_INSET
              const height = band.height - 2 * TIMELINE_BAR_INSET
              const progress = Math.min(1, Math.max(0, item.progress ?? 0))
              const key = `${id}-${band.index}`
              return (
                <>
                  <defs>
                    <clipPath id={`${key}-clip`}>
                      <rect height={height} rx={6} width={width} x={left} y={top} />
                    </clipPath>
                    <linearGradient id={`${key}-fill`} x1='0' x2='1' y1='0' y2='0'>
                      <stop
                        offset='0%'
                        style={{
                          stopColor: `color-mix(in oklab, ${color} 55%, var(--color-background))`,
                        }}
                      />
                      <stop offset='100%' style={{ stopColor: color }} />
                    </linearGradient>
                  </defs>
                  <rect
                    height={height}
                    rx={6}
                    style={{
                      fill: `color-mix(in oklab, ${color} ${planned ? 10 : 22}%, var(--color-background))`,
                      stroke: planned ? 'var(--color-border)' : 'none',
                    }}
                    strokeDasharray={planned ? '3 3' : undefined}
                    width={width}
                    x={left}
                    y={top}
                  />
                  {progress > 0 && (
                    <rect
                      clipPath={`url(#${key}-clip)`}
                      fill={`url(#${key}-fill)`}
                      height={height}
                      width={width * progress}
                      x={left}
                      y={top}
                    />
                  )}
                  {band.active && (
                    <rect
                      fill='none'
                      height={height + 4}
                      rx={8}
                      stroke='var(--color-foreground)'
                      strokeWidth={2}
                      width={width + 4}
                      x={left - 2}
                      y={top - 2}
                    />
                  )}
                </>
              )
            }}
            rowHeight={TIMELINE_ROW_HEIGHT}
            rows={rows}
            start={start}
            ticks={ticks}
            tooltip={(row) =>
              row.kind === 'group' ? null : describe ? (
                describe(row.item)
              ) : (
                <TimelineItemTooltip item={row.item} />
              )
            }
          />
        </div>
      </div>
      {children && <p className='text-muted-foreground text-sm'>{children}</p>}
    </div>
  )
}

export {
  Timeline,
  TimelineAxisTick,
  TimelineChart,
  TimelineNowLabel,
  TimelineStatusLabel,
  TIMELINE_AXIS_HEIGHT,
  TIMELINE_NOW_Z_INDEX,
  formatTimelineDate,
  formatTimelineRange,
  getDaysBetween,
  getTimelineScale,
  getTimelineTicks,
  timelineStatusConfig,
}

export type {
  TimelineAxisTickProps,
  TimelineBand,
  TimelineChartProps,
  TimelineNowLabelProps,
  TimelineItem,
  TimelineProps,
  TimelineStatus,
  TimelineUnit,
}
