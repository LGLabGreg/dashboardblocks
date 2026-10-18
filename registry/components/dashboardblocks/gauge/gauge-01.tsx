'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  Skeleton,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  Gauge,
  GaugeValue,
  type NpsResponses,
  getNps,
} from '@/registry/components/dashboardblocks/gauge'
import { KPIChange } from '@/registry/components/dashboardblocks/kpi'
import {
  formatNumber,
  formatPercent,
  formatSigned,
} from '@/registry/lib/dashboardblocks/format'

import { cn } from '@/lib/utils'

interface Gauge1Props {
  /** Follows the response count in the description, such as `over the last 90 days`. */
  period: string
  previous?: number
  /** Leave out to show the empty state. */
  responses?: NpsResponses
  status?: BlockStatus
  title: string
}

const exampleProps: Gauge1Props = {
  period: 'over the last 90 days, across all plans',
  previous: 31,
  responses: { detractors: 211, passives: 381, promoters: 692 },
  title: 'Net Promoter Score',
}

const formatScore = (value: number) => formatSigned(value)
const formatShare = (share: number) => formatPercent(share, { maximumFractionDigits: 0 })

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
  const { period, previous, responses, status, title } = props
  const state = getBlockState(status, responses)
  const counts = responses ?? { detractors: 0, passives: 0, promoters: 0 }
  const nps = getNps(counts)

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4 [--gauge-surface:var(--color-background)]'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>
              {formatNumber(nps.total)} responses {period}.
            </p>
          </BlockReady>
        </header>
        <div className='flex flex-col items-center gap-2 border-t pt-5'>
          <Gauge
            className='w-full max-w-60'
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
            <GaugeValue className='text-4xl'>{formatScore(nps.score)}</GaugeValue>
          </Gauge>
          {(state === 'loading' || previous !== undefined) && (
            <KPIChange
              changeType='points'
              comparison='last period'
              format={formatScore}
              previous={previous}
              value={nps.score}
            />
          )}
        </div>
        {state === 'loading' && (
          <div className='flex flex-col gap-3 border-t pt-4'>
            <Skeleton className='h-2 w-full rounded-full' />
            <ul aria-hidden className='grid grid-cols-3 gap-2'>
              {GROUPS.map((group) => (
                <li key={group.key} className='flex min-w-0 flex-col gap-0.5'>
                  <span className='text-muted-foreground truncate text-xs'>
                    {group.label}
                  </span>
                  <span className='text-2xl font-light'>
                    <SkeletonText className='w-[2.5em]' />
                  </span>
                  <span className='text-xs'>
                    <SkeletonText className='w-2/3' />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {!state && (
          <div className='flex flex-col gap-3 border-t pt-4'>
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
                  <span className='text-2xl font-light tracking-tight tabular-nums'>
                    {formatShare(nps[group.key])}
                  </span>
                  <span className='text-muted-foreground text-xs tabular-nums'>
                    {formatNumber(counts[group.key])} scored {group.range}
                  </span>
                </li>
              ))}
            </ul>
            <p className='text-muted-foreground text-xs'>
              NPS is the share of promoters minus the share of detractors:{' '}
              <span className='tabular-nums'>
                {formatShare(nps.promoters)} − {formatShare(nps.detractors)}
              </span>
              .
            </p>
          </div>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Gauge1, exampleProps as gauge1ExampleProps, type Gauge1Props }
