'use client'

import {
  TimelineAxis,
  TimelineGridLines,
  TimelineToday,
  formatTimelineDate,
  getDaysBetween,
  getTimelineScale,
  getTimelineTicks,
} from '@/registry/components/dashboardblocks/timeline'
import { useState } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

type ReleaseKind = 'major' | 'minor' | 'patch'

interface Release {
  date: Date
  kind: ReleaseKind
  /** e.g. "v2.4.0". */
  version: string
  /** One line on what shipped. */
  summary?: string
}

interface Timeline3Props {
  description: string
  end: Date
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  /** Oldest first. */
  releases: Release[]
  start: Date
  title: string
}

const date = (month: number, day: number) => new Date(Date.UTC(2026, month - 1, day))

const exampleProps: Timeline3Props = {
  description: 'Every release in the last six months',
  end: date(9, 30),
  now: date(9, 26),
  releases: [
    { date: date(4, 8), kind: 'minor', summary: 'Saved views', version: 'v2.4.0' },
    { date: date(4, 16), kind: 'patch', version: 'v2.4.1' },
    { date: date(4, 29), kind: 'patch', version: 'v2.4.2' },
    { date: date(5, 20), kind: 'minor', summary: 'Scheduled reports', version: 'v2.5.0' },
    { date: date(6, 3), kind: 'patch', version: 'v2.5.1' },
    { date: date(6, 24), kind: 'minor', summary: 'Webhooks', version: 'v2.6.0' },
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
    { date: date(9, 9), kind: 'minor', summary: 'Team spaces', version: 'v3.1.0' },
    { date: date(9, 22), kind: 'patch', version: 'v3.1.1' },
  ],
  start: date(4, 1),
  title: 'Release cadence',
}

const KINDS: { kind: ReleaseKind; label: string }[] = [
  { kind: 'major', label: 'Major' },
  { kind: 'minor', label: 'Minor' },
  { kind: 'patch', label: 'Patch' },
]
const markerClass: Record<ReleaseKind, string> = {
  major: 'size-4 bg-foreground ring-2 ring-card',
  minor: 'size-3 bg-[var(--chart-1)] ring-2 ring-card',
  patch: 'size-2 border-[1.5px] border-muted-foreground bg-card',
}

const Timeline3 = (props: Timeline3Props) => {
  const { description, end, now, releases, start, title } = props
  const [active, setActive] = useState<number | null>(null)
  const position = getTimelineScale(start, end)
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
  const describe = (release: Release) =>
    `${release.version}, ${formatTimelineDate(release.date)}, ${release.kind}${release.summary ? `: ${release.summary}` : ''}`

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <dl className='grid grid-cols-3 gap-4'>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Releases</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {releases.length}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Median gap</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {median}{' '}
              <span className='text-muted-foreground text-sm font-normal'>days</span>
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Since last</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {sinceLast}{' '}
              <span className='text-muted-foreground text-sm font-normal'>days</span>
            </dd>
          </div>
        </dl>
        <div className='flex flex-col gap-1' onPointerLeave={() => setActive(null)}>
          <TimelineAxis end={end} start={start} ticks={ticks} />
          <div className='relative h-12'>
            <TimelineGridLines end={end} start={start} ticks={ticks} />
            <span aria-hidden className='bg-border absolute inset-x-0 top-1/2 h-px' />
            <TimelineToday end={end} label='Now' now={now} start={start} />
            {releases.map((release, index) => (
              <span
                key={release.version}
                aria-hidden
                className='absolute top-1/2 flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center'
                style={{ left: `${position(release.date)}%` }}
                onPointerEnter={() => setActive(index)}
                onPointerDown={() => setActive(index)}
              >
                <span
                  className={cn(
                    'block rounded-full',
                    markerClass[release.kind],
                    active === index && 'outline-foreground outline-2 outline-offset-2',
                  )}
                />
              </span>
            ))}
          </div>
        </div>
        <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-2'>
          <p className='text-muted-foreground min-h-5 text-sm'>
            {active !== null ? (
              <span className='text-foreground'>{describe(releases[active])}</span>
            ) : (
              'Hover a release for its version and date.'
            )}
          </p>
          <ul
            aria-hidden
            className='text-muted-foreground flex items-center gap-3 text-xs'
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
        </div>
        <ul className='sr-only'>
          {releases.map((release) => (
            <li key={release.version}>{describe(release)}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export {
  Timeline3,
  exampleProps as timeline3ExampleProps,
  type Release,
  type Timeline3Props,
}
