'use client'

import {
  Gauge,
  type NpsResponses,
  getNps,
} from '@/registry/components/dashboardblocks/gauge'
import { Trend } from '@/registry/components/dashboardblocks/trend'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface Gauge1Props {
  description: string
  /** Last period's score, for the change. */
  previous?: number
  responses: NpsResponses
  title: string
}

const exampleProps: Gauge1Props = {
  description: 'Last 90 days, all plans',
  previous: 31,
  responses: { detractors: 211, passives: 381, promoters: 692 },
  title: 'Net Promoter Score',
}

const formatScore = (value: number) =>
  `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value)}`
const formatShare = (share: number) => `${Math.round(share * 100)}%`

const GROUPS = [
  { className: 'bg-emerald-600', key: 'promoters', label: 'Promoters', range: '9–10' },
  {
    className: 'bg-muted-foreground/40',
    key: 'passives',
    label: 'Passives',
    range: '7–8',
  },
  { className: 'bg-red-600', key: 'detractors', label: 'Detractors', range: '0–6' },
] as const

const Gauge1 = (props: Gauge1Props) => {
  const { description, previous, responses, title } = props
  const nps = getNps(responses)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description} · {nps.total.toLocaleString('en-US')} responses
        </CardDescription>
        {previous !== undefined && (
          <CardAction>
            <Trend
              variant='badge'
              trend={nps.score - previous}
              formatter={(value) => `${formatScore(value)} pts`}
            />
          </CardAction>
        )}
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <Gauge
          className='mx-auto w-full max-w-60'
          formatScale={formatScore}
          label={title}
          max={100}
          min={-100}
          origin={0}
          value={nps.score}
          valueText={`${formatScore(nps.score)}${
            previous !== undefined ? `, ${formatScore(previous)} last period` : ''
          }`}
        >
          <span className='text-4xl font-semibold tracking-tight tabular-nums'>
            {formatScore(nps.score)}
          </span>
          <span className='text-muted-foreground text-xs'>
            {previous !== undefined ? `${formatScore(previous)} last period` : 'NPS'}
          </span>
        </Gauge>
        <div className='flex flex-col gap-3'>
          <div aria-hidden className='flex h-2 w-full gap-0.5'>
            {GROUPS.map((group) => (
              <span
                key={group.key}
                className={cn(
                  'h-full first:rounded-l-full last:rounded-r-full',
                  group.className,
                )}
                style={{ width: `${nps[group.key] * 100}%` }}
              />
            ))}
          </div>
          <ul className='grid grid-cols-3 gap-2'>
            {GROUPS.map((group) => (
              <li key={group.key} className='flex min-w-0 flex-col gap-0.5'>
                <span className='text-muted-foreground flex items-center gap-1.5 text-xs'>
                  <span
                    aria-hidden
                    className={cn('size-2 shrink-0 rounded-full', group.className)}
                  />
                  <span className='truncate'>{group.label}</span>
                </span>
                <span className='text-sm font-medium tabular-nums'>
                  {formatShare(nps[group.key])}
                  <span className='text-muted-foreground font-normal'>
                    {' '}
                    · {responses[group.key].toLocaleString('en-US')}
                  </span>
                </span>
                <span className='text-muted-foreground text-xs'>
                  Scores {group.range}
                </span>
              </li>
            ))}
          </ul>
          <p className='text-muted-foreground border-t pt-3 text-xs'>
            NPS is the share of promoters minus the share of detractors:{' '}
            {formatShare(nps.promoters)} − {formatShare(nps.detractors)}.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export { Gauge1, exampleProps as gauge1ExampleProps, type Gauge1Props }
