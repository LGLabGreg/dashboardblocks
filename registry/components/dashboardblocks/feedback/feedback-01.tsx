'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { chartFadedColor } from '@/registry/components/dashboardblocks/chart'
import {
  StarRating,
  getCsat,
  getRatingSummary,
} from '@/registry/components/dashboardblocks/feedback'
import { KPIChange, KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { useReveal } from '@/registry/hooks/use-reveal'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'

interface Feedback1Props {
  /** Follows the previous average in the change sentence, such as `last quarter`. */
  comparison?: string
  /** How many 1, 2, 3, 4 and 5-star ratings. Leave out to show the empty state. */
  counts?: number[]
  description: string
  previousAverage?: number
  status?: BlockStatus
  title: string
}

const exampleProps: Feedback1Props = {
  comparison: 'last quarter',
  counts: [86, 64, 171, 612, 1_491],
  description: 'App Store and Google Play ratings from the last 90 days.',
  previousAverage: 4.31,
  title: 'Ratings',
}

const SATISFIED_COLOR = 'var(--color-chart-2)'

const formatAverage = (value: number) =>
  formatNumber(value, { maximumFractionDigits: 2, minimumFractionDigits: 2 })

const Feedback1 = (props: Feedback1Props) => {
  const {
    comparison = 'last period',
    counts = [],
    description,
    previousAverage,
    status,
    title,
  } = props
  const { average, shares, total } = getRatingSummary(counts)
  const csat = getCsat(counts)
  const { ref, revealed } = useReveal<HTMLDivElement>(true)
  const state = getBlockState(status, counts.length === 0)

  return (
    <BlockStateProvider status={status} empty={counts.length === 0}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <div
          ref={ref}
          className='flex flex-col gap-6 border-t pt-4 @md:flex-row @md:items-center @md:gap-10'
        >
          <div className='flex flex-col gap-1'>
            {state && <KPIValue />}
            {!state && (
              <>
                <p className='flex items-baseline'>
                  <span className='text-4xl font-light tracking-tight tabular-nums'>
                    {formatNumber(average, {
                      maximumFractionDigits: 1,
                      minimumFractionDigits: 1,
                    })}
                  </span>
                  <span className='text-muted-foreground ml-1 text-base font-normal tracking-normal'>
                    out of 5
                  </span>
                </p>
                <StarRating value={average} />
                <p className='text-muted-foreground text-sm tabular-nums'>
                  From {formatNumber(total)} ratings
                </p>
              </>
            )}
            {state === 'loading' && <BlockReady className='text-sm'>{null}</BlockReady>}
            {(state === 'loading' || previousAverage !== undefined) && (
              <KPIChange
                comparison={comparison}
                format={formatAverage}
                previous={previousAverage}
                value={average}
              />
            )}
          </div>
          {state === 'loading' && <BlockStateRows className='flex-1' rows={5} />}
          {!state && (
            <ol className='flex flex-1 flex-col-reverse gap-2'>
              {counts.map((count, index) => (
                <li key={index} className='flex items-center gap-3 text-sm'>
                  <span className='text-muted-foreground w-12 shrink-0 tabular-nums'>
                    {index + 1} {index === 0 ? 'star' : 'stars'}
                  </span>
                  <span
                    aria-hidden
                    className='bg-muted h-2 flex-1 overflow-hidden rounded-full'
                  >
                    <span
                      className='block h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none'
                      style={{
                        backgroundColor:
                          index >= counts.length - 2
                            ? SATISFIED_COLOR
                            : chartFadedColor(SATISFIED_COLOR),
                        width: `${revealed ? shares[index] * 100 : 0}%`,
                      }}
                    />
                  </span>
                  <span className='w-10 shrink-0 text-right font-medium tabular-nums'>
                    {formatPercent(shares[index], { maximumFractionDigits: 0 })}
                  </span>
                  <span className='text-muted-foreground hidden w-12 shrink-0 text-right tabular-nums @md:inline'>
                    {formatNumber(count)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
        {state === 'loading' && (
          <BlockReady className='border-t pt-3 text-sm'>{null}</BlockReady>
        )}
        {!state && (
          <p className='text-muted-foreground border-t pt-3 text-sm'>
            <span className='text-foreground font-medium tabular-nums'>
              {formatPercent(csat, { maximumFractionDigits: 0 })}
            </span>{' '}
            rate it 4 or 5 stars, the share most teams report as CSAT.
          </p>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Feedback1, exampleProps as feedback1ExampleProps, type Feedback1Props }
