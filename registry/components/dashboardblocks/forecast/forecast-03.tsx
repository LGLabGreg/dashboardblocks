'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ForecastLegend,
  ForecastStatusLabel,
  ProjectionBar,
  getProjectionStatus,
  getRunRate,
} from '@/registry/components/dashboardblocks/forecast'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from '@/registry/lib/dashboardblocks/format'

interface Forecast3Props {
  /** Leave out to show the empty state. */
  current?: number
  description: string
  elapsed: number
  formatter?: (value: number) => string
  status?: BlockStatus
  target: number
  title: string
  total: number
}

const exampleProps: Forecast3Props = {
  current: 38_420,
  description: 'Month to date through Sep 25, projected at the daily run-rate.',
  elapsed: 25,
  formatter: (value) => formatCurrency(value),
  target: 48_000,
  title: 'September revenue',
  total: 30,
}

const Forecast3 = (props: Forecast3Props) => {
  const {
    current = 0,
    description,
    elapsed,
    formatter = (value) => formatNumber(value, { maximumFractionDigits: 0 }),
    status: blockStatus,
    target,
    title,
    total,
  } = props
  const state = getBlockState(blockStatus, props.current)

  const { projected, rate, remaining, required } = getRunRate({
    current,
    elapsed,
    target,
    total,
  })
  const status = current >= target ? 'reached' : getProjectionStatus(projected, target)
  const gap = projected - target
  const share = formatPercent(target > 0 ? projected / target : 0, {
    maximumFractionDigits: 0,
  })

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex items-start justify-between gap-4'>
          <div className='flex flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </div>
          <ForecastStatusLabel status={status} />
        </header>
        <dl className='flex flex-wrap items-end gap-x-10 gap-y-3 border-t pt-4'>
          <div className='flex flex-col gap-1'>
            <dt className='text-muted-foreground text-sm'>
              So far, day {elapsed} of {total}
            </dt>
            <dd>
              <KPIValue value={props.current} format={formatter} />
            </dd>
          </div>
          {state !== 'empty' && state !== 'error' && (
            <div className='flex flex-col gap-1'>
              <dt className='text-muted-foreground text-sm'>Projected</dt>
              <dd>
                <KPIValue className='text-2xl' value={projected} format={formatter} />
              </dd>
              <dd className='text-muted-foreground text-xs tabular-nums'>
                <BlockReady className='text-xs'>
                  {share} of {formatter(target)}
                </BlockReady>
              </dd>
            </div>
          )}
        </dl>
        <div className='flex flex-col gap-2'>
          <ProjectionBar
            current={current}
            max={Math.max(projected, target) * 1.05}
            projected={projected}
            target={target}
          />
          <ForecastLegend
            items={[
              { label: 'So far', shape: 'bar' },
              { label: 'Projected', shape: 'striped' },
              { label: 'Target', shape: 'marker' },
            ]}
          />
        </div>
        <BlockReady className='text-sm'>
          <p className='text-sm text-pretty'>
            {status === 'reached'
              ? `Target met with ${remaining} ${remaining === 1 ? 'day' : 'days'} to go, at ${formatter(rate)} a day.`
              : `At ${formatter(rate)} a day the month ends ${formatter(Math.abs(gap))} ${gap >= 0 ? 'over' : 'short'}.`}
            {status !== 'reached' && required !== null && required > 0 && (
              <span className='text-muted-foreground'>
                {` Hitting the target takes ${formatter(required)} a day for the last ${remaining} ${remaining === 1 ? 'day' : 'days'}.`}
              </span>
            )}
          </p>
        </BlockReady>
      </section>
    </BlockStateProvider>
  )
}

export { Forecast3, exampleProps as forecast3ExampleProps, type Forecast3Props }
