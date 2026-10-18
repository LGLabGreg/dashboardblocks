'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  Gauge,
  GaugeTargetKey,
  GaugeToneLabel,
  GaugeValue,
} from '@/registry/components/dashboardblocks/gauge'
import { KPIChange } from '@/registry/components/dashboardblocks/kpi'
import {
  formatNumber,
  formatPercent,
  formatPoints,
} from '@/registry/lib/dashboardblocks/format'

interface Gauge4Props {
  /** Follows the previous value in the change, such as `in August`. */
  comparison: string
  description: string
  footnote?: string
  formatter?: (value: number) => string
  /** @default 100 */
  max?: number
  /** @default 0 */
  min?: number
  previous?: number
  scaleFormatter?: (value: number) => string
  status?: BlockStatus
  target: number
  title: string
  /** Leave out to show the empty state. */
  value?: number
}

const exampleProps: Gauge4Props = {
  comparison: 'in August',
  description: 'Share of 4 and 5 star ratings in September, from 2,318 surveys.',
  formatter: (value) => formatPercent(value / 100, { minimumFractionDigits: 1 }),
  previous: 81.2,
  scaleFormatter: (value) => formatPercent(value / 100),
  target: 85,
  title: 'Customer satisfaction',
  value: 83.6,
}

const Gauge4 = (props: Gauge4Props) => {
  const {
    comparison,
    description,
    footnote,
    formatter = (value) => formatNumber(value),
    max = 100,
    min = 0,
    previous,
    scaleFormatter = formatter,
    status,
    target,
    title,
  } = props
  const empty = props.value === undefined
  const state = getBlockState(status, empty)
  const value = props.value ?? min
  const gap = Math.abs(value - target)
  const met = value >= target

  return (
    <BlockStateProvider status={status} empty={empty}>
      <section className='@container flex flex-col gap-4 [--gauge-surface:var(--color-background)]'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </div>
          {!state && (
            <GaugeToneLabel
              className='mt-0.5'
              label={met ? 'Target met' : 'Below target'}
              tone={met ? 'positive' : 'caution'}
            />
          )}
        </header>
        <div className='flex flex-col items-center gap-6 border-t pt-5 @md:flex-row @md:items-end'>
          <Gauge
            className='w-full max-w-56 @md:w-52'
            formatScale={scaleFormatter}
            label={title}
            max={max}
            min={min}
            target={target}
            value={value}
            valueText={`${formatter(value)}, target ${formatter(target)}`}
          >
            <GaugeValue className='text-4xl'>{formatter(value)}</GaugeValue>
          </Gauge>
          <div className='flex w-full min-w-0 flex-col gap-3 @md:pb-6'>
            <KPIChange
              changeType='points'
              comparison={comparison}
              format={formatter}
              previous={previous}
              value={value}
            />
            <BlockReady className='text-sm'>
              <p className='text-sm'>
                <span className='font-medium tabular-nums'>
                  {formatPoints(gap, { minimumFractionDigits: 1 })}
                </span>{' '}
                <span className='text-muted-foreground'>
                  {met ? 'above' : 'to go to'} the{' '}
                  <span className='tabular-nums'>{formatter(target)}</span> target.
                </span>
              </p>
            </BlockReady>
            <GaugeTargetKey />
          </div>
        </div>
        {footnote && (!state || state === 'loading') && (
          <div className='border-t pt-3'>
            <BlockReady className='text-xs'>
              <p className='text-muted-foreground text-xs'>{footnote}</p>
            </BlockReady>
          </div>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Gauge4, exampleProps as gauge4ExampleProps, type Gauge4Props }
