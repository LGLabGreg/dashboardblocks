'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  type Metric,
  MetricList,
  MetricTargetBar,
  MetricTargetKey,
  TargetStatusLabel,
  formatMetricValue,
  getTargetStatus,
} from '@/registry/components/dashboardblocks/metric-list'

interface TargetMetric extends Omit<Metric, 'history' | 'previous'> {
  domain?: [number, number]
  /** A floor when `goodDirection` is `up` (the default), a ceiling when it is `down`. */
  target: number
  tolerance?: number
}

interface MetricList3Props extends BlockStateProps {
  description: string
  /** Leave out, or pass none, to show the empty state. */
  metrics?: TargetMetric[]
  title: string
}

const exampleProps: MetricList3Props = {
  description: 'Q3 so far, against the targets set in July.',
  metrics: [
    {
      format: 'percent',
      key: 'activation',
      label: 'Activation rate',
      target: 40,
      value: 38.4,
    },
    {
      format: 'percent',
      key: 'trial',
      label: 'Trial to paid',
      target: 18,
      value: 21.3,
    },
    {
      domain: [-100, 100],
      key: 'nps',
      label: 'NPS',
      target: 50,
      value: 44,
    },
    {
      format: 'percent',
      goodDirection: 'down',
      key: 'churn',
      label: 'Logo churn',
      target: 2,
      value: 2.4,
    },
    {
      format: 'milliseconds',
      goodDirection: 'down',
      key: 'latency',
      label: 'p95 API latency',
      target: 500,
      value: 412,
    },
    {
      domain: [99, 100],
      format: 'percent',
      key: 'uptime',
      label: 'Uptime',
      target: 99.9,
      value: 99.97,
    },
  ],
  title: 'Targets',
}

const MetricList3 = (props: MetricList3Props) => {
  const { description, metrics = [], errorMessage, status, title } = props
  const state = getBlockState(status, metrics)
  const statuses = metrics.map((metric) => getTargetStatus(metric))
  const met = statuses.filter((status) => status === 'met').length

  const missed = statuses.filter((status) => status === 'missed').length

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>
              {description}{' '}
              <span className='tabular-nums'>
                {met} of {metrics.length}
              </span>{' '}
              on target
              {missed > 0 && (
                <>
                  , <span className='tabular-nums'>{missed}</span> off it
                </>
              )}
              .
            </p>
          </BlockReady>
        </header>
        <BlockStateRows
          className='border-t data-[slot=block-state-rows]:border-b'
          rows={5}
        />
        {!state && (
          <MetricList className='border-y'>
            {metrics.map((metric, index) => {
              const floor = (metric.goodDirection ?? 'up') === 'up'
              return (
                <li
                  key={metric.key}
                  className='grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 py-2.5 @xl:grid-cols-[minmax(0,1fr)_minmax(5rem,8rem)_6.5rem_6.5rem] @xl:gap-x-4'
                >
                  <span className='col-start-1 row-start-1 text-sm'>{metric.label}</span>
                  <MetricTargetBar
                    className='col-span-2 row-start-2 @xl:col-span-1 @xl:col-start-2 @xl:row-start-1'
                    domain={metric.domain}
                    target={metric.target}
                    value={metric.value}
                  />
                  <p className='col-span-2 row-start-3 flex items-baseline gap-1.5 text-xs whitespace-nowrap tabular-nums @xl:col-span-1 @xl:col-start-3 @xl:row-start-1 @xl:flex-col @xl:items-end @xl:gap-0'>
                    <span className='text-sm font-medium'>
                      {formatMetricValue(metric, metric.value)}
                    </span>
                    <span className='text-muted-foreground'>
                      Target <span aria-hidden>{floor ? '≥' : '≤'}</span>
                      <span className='sr-only'>
                        {floor ? 'at least' : 'at most'}
                      </span>{' '}
                      {formatMetricValue(metric, metric.target)}
                    </span>
                  </p>
                  <TargetStatusLabel
                    className='col-start-2 row-start-1 justify-self-end text-xs @xl:col-start-4'
                    status={statuses[index]}
                  />
                </li>
              )
            })}
          </MetricList>
        )}
        {state !== 'empty' && state !== 'error' && <MetricTargetKey />}
      </section>
    </BlockStateProvider>
  )
}

export { MetricList3, exampleProps as metricList3ExampleProps, type MetricList3Props }
