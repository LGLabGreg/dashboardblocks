'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ChartPlaceholder,
  ChartTooltipFrame,
  chartTimeGridProps,
} from '@/registry/components/dashboardblocks/chart'
import { Details } from '@/registry/components/dashboardblocks/details'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import {
  TIMELINE_AXIS_HEIGHT,
  TIMELINE_NOW_Z_INDEX,
  TimelineAxisTick,
  TimelineNowLabel,
  formatTimelineDate,
  getDaysBetween,
  getTimelineTicks,
} from '@/registry/components/dashboardblocks/timeline'
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { cn } from '@/lib/utils'

type ReleaseKind = 'major' | 'minor' | 'patch'

interface Release {
  date: Date
  kind: ReleaseKind
  version: string
  summary?: string
}

interface Timeline3Props {
  /** Defaults to a sentence about the median gap and when the next release is due. */
  description?: string
  end: Date
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  /** Oldest first. Leave out, or pass none, to show the empty state. */
  releases?: Release[]
  start: Date
  status?: BlockStatus
  title: string
}

const date = (month: number, day: number) => new Date(Date.UTC(2026, month - 1, day))

const exampleProps: Timeline3Props = {
  end: date(10, 31),
  now: date(9, 26),
  releases: [
    {
      date: date(4, 8),
      kind: 'minor',
      summary: 'Saved views',
      version: 'v2.4.0',
    },
    { date: date(4, 16), kind: 'patch', version: 'v2.4.1' },
    { date: date(4, 29), kind: 'patch', version: 'v2.4.2' },
    {
      date: date(5, 20),
      kind: 'minor',
      summary: 'Scheduled reports',
      version: 'v2.5.0',
    },
    { date: date(6, 3), kind: 'patch', version: 'v2.5.1' },
    {
      date: date(6, 24),
      kind: 'minor',
      summary: 'Webhooks',
      version: 'v2.6.0',
    },
    { date: date(7, 1), kind: 'patch', version: 'v2.6.1' },
    { date: date(7, 9), kind: 'patch', version: 'v2.6.2' },
    {
      date: date(8, 5),
      kind: 'major',
      summary: 'New editor and API v3',
      version: 'v3.0.0',
    },
    { date: date(8, 12), kind: 'patch', version: 'v3.0.1' },
    { date: date(8, 19), kind: 'patch', version: 'v3.0.2' },
    {
      date: date(9, 9),
      kind: 'minor',
      summary: 'Team spaces',
      version: 'v3.1.0',
    },
    { date: date(9, 22), kind: 'patch', version: 'v3.1.1' },
  ],
  start: date(3, 25),
  title: 'Release cadence',
}

const KINDS: { kind: ReleaseKind; label: string }[] = [
  { kind: 'major', label: 'Major' },
  { kind: 'minor', label: 'Minor' },
  { kind: 'patch', label: 'Patch' },
]
const markerClass: Record<ReleaseKind, string> = {
  major: 'size-4 bg-foreground ring-2 ring-background',
  minor: 'size-3 bg-chart-2 ring-2 ring-background',
  patch: 'size-2 border-[1.5px] border-muted-foreground bg-background',
}

const DAY = 86_400_000
const PLOT_HEIGHT = 60
const BASELINE = 0.5
const MARKER_RADIUS: Record<ReleaseKind, number> = { major: 8, minor: 6, patch: 4 }

interface Point {
  release?: Release
  x: number
  y: number
}

interface MarkerProps {
  active?: boolean
  cx?: number
  cy?: number
  payload?: Point
}

function ActiveRing({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <circle
      cx={cx}
      cy={cy}
      fill='none'
      r={r + 3}
      stroke='var(--color-foreground)'
      strokeWidth={2}
    />
  )
}

const Timeline3 = (props: Timeline3Props) => {
  const { end, now, releases = [], start, status, title } = props
  const state = getBlockState(status, releases.length === 0)
  const ticks = getTimelineTicks(start, end, 'month')
  const gaps = releases
    .slice(1)
    .map((release, index) => getDaysBetween(releases[index].date, release.date))
  const sortedGaps = [...gaps].sort((a, b) => a - b)
  const median = sortedGaps.length
    ? sortedGaps[Math.floor((sortedGaps.length - 1) / 2)]
    : 0
  const last = releases[releases.length - 1]
  const sinceLast = last ? getDaysBetween(last.date, now) : 0
  const nextDue = last && median > 0 ? new Date(last.date.getTime() + median * DAY) : null
  const dueIn = nextDue ? getDaysBetween(now, nextDue) : 0
  const {
    description = releases.length < 2
      ? 'Too few releases yet for a typical gap.'
      : `A release every ${median} days, so the next one is ${dueIn < 0 ? `${-dueIn} ${dueIn === -1 ? 'day' : 'days'} overdue` : `due ${nextDue ? formatTimelineDate(nextDue) : ''}`}.`,
  } = props
  const describe = (release: Release) =>
    `${release.version}, ${formatTimelineDate(release.date)}, ${release.kind}${release.summary ? `: ${release.summary}` : ''}`

  const points: Point[] = [
    ...releases.map((release) => ({ release, x: release.date.getTime(), y: BASELINE })),
    ...(nextDue && nextDue <= end ? [{ x: nextDue.getTime(), y: BASELINE }] : []),
  ]
  const nextDueNearEnd =
    nextDue !== null &&
    (nextDue.getTime() - start.getTime()) / (end.getTime() - start.getTime()) > 0.92

  const marker = ({ active = false, cx = 0, cy = 0, payload }: MarkerProps) => {
    if (!payload?.release)
      return (
        <g>
          <circle
            cx={cx}
            cy={cy}
            fill='var(--color-background)'
            r={6}
            stroke='var(--color-muted-foreground)'
            strokeDasharray='2 2'
            strokeWidth={1.5}
          />
          <text
            fill='var(--color-muted-foreground)'
            fontSize={11}
            textAnchor={nextDueNearEnd ? 'end' : 'middle'}
            x={nextDueNearEnd ? cx + 6 : cx}
            y={cy + 20}
          >
            Next due
          </text>
          {active && <ActiveRing cx={cx} cy={cy} r={6} />}
        </g>
      )
    const { kind, version } = payload.release
    const r = MARKER_RADIUS[kind]
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          fill={
            kind === 'major'
              ? 'var(--color-foreground)'
              : kind === 'minor'
                ? 'var(--color-chart-2)'
                : 'var(--color-background)'
          }
          r={r}
          stroke={
            kind === 'patch' ? 'var(--color-muted-foreground)' : 'var(--color-background)'
          }
          strokeWidth={kind === 'patch' ? 1.5 : 2}
        />
        {kind === 'major' && (
          <text
            fill='var(--color-foreground)'
            fontSize={11}
            fontWeight={500}
            textAnchor='middle'
            x={cx}
            y={cy - r - 4}
          >
            {version}
          </text>
        )}
        {active && <ActiveRing cx={cx} cy={cy} r={r} />}
      </g>
    )
  }

  return (
    <BlockStateProvider status={status} empty={releases.length === 0}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        {(state === 'error' || state === 'empty') && (
          <div className='border-t pt-4'>
            <KPIValue className='text-2xl' />
          </div>
        )}
        {state !== 'error' && state !== 'empty' && (
          <dl className='grid grid-cols-3 gap-4 border-t pt-4'>
            <div className='flex flex-col gap-0.5'>
              <dt className='text-muted-foreground text-sm'>Releases</dt>
              <dd className='text-2xl font-light tracking-tight tabular-nums'>
                {state === 'loading' ? (
                  <SkeletonText className='w-[2em]' />
                ) : (
                  releases.length
                )}
              </dd>
            </div>
            <div className='flex flex-col gap-0.5'>
              <dt className='text-muted-foreground text-sm'>Median gap</dt>
              <dd className='text-2xl font-light tracking-tight tabular-nums'>
                {state === 'loading' ? (
                  <SkeletonText className='w-[3em]' />
                ) : (
                  <>
                    {median}
                    <span className='text-muted-foreground ml-1 text-base font-normal tracking-normal'>
                      days
                    </span>
                  </>
                )}
              </dd>
            </div>
            <div className='flex flex-col gap-0.5'>
              <dt className='text-muted-foreground text-sm'>Since last</dt>
              <dd className='text-2xl font-light tracking-tight tabular-nums'>
                {state === 'loading' ? (
                  <SkeletonText className='w-[3em]' />
                ) : (
                  <>
                    {sinceLast}
                    <span className='text-muted-foreground ml-1 text-base font-normal tracking-normal'>
                      days
                    </span>
                  </>
                )}
              </dd>
            </div>
          </dl>
        )}
        {state && <ChartPlaceholder height={TIMELINE_AXIS_HEIGHT + PLOT_HEIGHT} />}
        {!state && (
          <div aria-hidden style={{ height: TIMELINE_AXIS_HEIGHT + PLOT_HEIGHT }}>
            <ResponsiveContainer height='100%' width='100%'>
              <ScatterChart
                accessibilityLayer={false}
                margin={{ bottom: 0, left: 8, right: 8, top: 0 }}
              >
                <CartesianGrid {...chartTimeGridProps} />
                <XAxis
                  allowDataOverflow
                  axisLine={false}
                  dataKey='x'
                  domain={[start.getTime(), end.getTime()]}
                  height={TIMELINE_AXIS_HEIGHT}
                  interval={0}
                  orientation='top'
                  tick={<TimelineAxisTick />}
                  tickLine={false}
                  ticks={ticks.map((tick) => tick.getTime())}
                  type='number'
                />
                <YAxis dataKey='y' domain={[0, 1]} hide type='number' />
                <ReferenceLine stroke='var(--color-border)' y={BASELINE} />
                {last && nextDue && nextDue <= end && (
                  <ReferenceLine
                    segment={[
                      { x: last.date.getTime(), y: BASELINE },
                      { x: nextDue.getTime(), y: BASELINE },
                    ]}
                    stroke='var(--color-muted-foreground)'
                    strokeDasharray='3 3'
                  />
                )}
                {now >= start && now <= end && (
                  <ReferenceLine
                    label={<TimelineNowLabel label='Now' />}
                    stroke='var(--color-foreground)'
                    x={now.getTime()}
                    zIndex={TIMELINE_NOW_Z_INDEX}
                  />
                )}
                <Tooltip
                  content={({ active, payload }) => {
                    const point = payload?.[0]?.payload as Point | undefined
                    if (!active || !point) return null
                    if (!point.release)
                      return (
                        <ChartTooltipFrame>
                          <span className='font-medium'>Next due</span>
                          <span className='text-muted-foreground tabular-nums'>
                            {formatTimelineDate(new Date(point.x))}, if the {median}-day
                            gap holds
                          </span>
                        </ChartTooltipFrame>
                      )
                    const { release } = point
                    return (
                      <ChartTooltipFrame>
                        <span className='font-medium tabular-nums'>
                          {release.version}
                        </span>
                        <Details className='text-muted-foreground'>
                          {formatTimelineDate(release.date)}
                          {KINDS.find((entry) => entry.kind === release.kind)?.label}
                        </Details>
                        {release.summary && <span>{release.summary}</span>}
                      </ChartTooltipFrame>
                    )
                  }}
                  cursor={false}
                />
                <Scatter
                  activeShape={(props: MarkerProps) => marker({ ...props, active: true })}
                  data={points}
                  isAnimationActive={false}
                  shape={(props: MarkerProps) => marker(props)}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
        {state !== 'error' && state !== 'empty' && (
          <ul
            aria-hidden
            className='text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs'
          >
            {KINDS.map((entry) => (
              <li key={entry.kind} className='flex items-center gap-1.5'>
                <span
                  className={cn('block rounded-full', markerClass[entry.kind], 'ring-0')}
                />
                {entry.label}
              </li>
            ))}
          </ul>
        )}
        {!state && (
          <ul className='sr-only'>
            {releases.map((release) => (
              <li key={release.version}>{describe(release)}</li>
            ))}
          </ul>
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  Timeline3,
  exampleProps as timeline3ExampleProps,
  type Release,
  type Timeline3Props,
}
