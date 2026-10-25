'use client'

import {
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  Gauge,
  type GaugeBand,
  GaugeLegend,
  GaugeToneLabel,
  GaugeValue,
  getGaugeBand,
} from '@/registry/components/dashboardblocks/gauge'
import { formatPercent } from '@/registry/lib/dashboardblocks/format'

interface Resource {
  detail: string
  label: string
  /** Percent used, 0–100. */
  value: number
}

interface Gauge3Props extends BlockStateProps {
  description: string
  /** How many gauges to sketch while loading. @default 3 */
  placeholders?: number
  /** Leave out, or pass none, to show the empty state. */
  resources?: Resource[]
  /** Percent used at which each resource turns to warning, then critical. */
  thresholds: { critical: number; warning: number }
  title: string
}

const exampleProps: Gauge3Props = {
  description: 'prod-web-03 in us-east-1, over the last 5 minutes.',
  resources: [
    { detail: '8 cores, load 5.1', label: 'CPU', value: 64 },
    { detail: '25.0 of 32 GB', label: 'Memory', value: 78 },
    { detail: '465 of 500 GB', label: 'Disk', value: 93 },
  ],
  thresholds: { critical: 90, warning: 70 },
  title: 'System load',
}

const formatShare = (value: number) => formatPercent(value / 100)

const Gauge3 = (props: Gauge3Props) => {
  const {
    description,
    placeholders = 3,
    resources = [],
    errorMessage,
    status,
    thresholds,
    title,
  } = props
  const state = getBlockState(status, resources)
  const bands: GaugeBand[] = [
    { from: 0, label: 'Normal', to: thresholds.warning, tone: 'positive' },
    {
      from: thresholds.warning,
      label: 'Warning',
      to: thresholds.critical,
      tone: 'caution',
    },
    { from: thresholds.critical, label: 'Critical', to: 100, tone: 'critical' },
  ]
  const busiest = resources.reduce<Resource | undefined>(
    (top, resource) => (!top || resource.value > top.value ? resource : top),
    undefined,
  )
  const worst = busiest ? getGaugeBand(busiest.value, bands) : undefined

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </div>
          {!state && busiest && worst && worst.tone !== 'positive' && (
            <GaugeToneLabel
              className='mt-0.5'
              label={`${busiest.label} ${worst.label.toLowerCase()}`}
              tone={worst.tone}
            />
          )}
        </header>
        {state === 'loading' && (
          <ul aria-hidden className='grid grid-cols-3 gap-3 border-t pt-5 @md:gap-6'>
            {Array.from({ length: placeholders }, (_, index) => (
              <li
                key={index}
                className='flex min-w-0 flex-col items-center gap-1 text-center'
              >
                <Gauge
                  className='mb-1 w-full max-w-32'
                  label=''
                  sweep={270}
                  thickness={11}
                  value={0}
                >
                  <GaugeValue className='text-lg @sm:text-2xl'>0</GaugeValue>
                </Gauge>
                <span className='w-full text-sm'>
                  <SkeletonText className='w-1/2' />
                </span>
                <span className='w-full text-xs'>
                  <SkeletonText className='w-2/3' />
                </span>
              </li>
            ))}
          </ul>
        )}
        {(state === 'empty' || state === 'error') && (
          <BlockStateRows className='border-t pt-4' />
        )}
        {!state && (
          <ul className='grid grid-cols-3 gap-3 border-t pt-5 @md:gap-6'>
            {resources.map((resource) => {
              const band = getGaugeBand(resource.value, bands)
              return (
                <li
                  key={resource.label}
                  className='flex min-w-0 flex-col items-center gap-1 text-center'
                >
                  <Gauge
                    bands={bands}
                    className='mb-1 w-full max-w-32'
                    colorByBand
                    label={resource.label}
                    sweep={270}
                    thickness={11}
                    value={resource.value}
                    valueText={`${formatShare(resource.value)}${band ? `, ${band.label.toLowerCase()}` : ''}`}
                  >
                    <GaugeValue className='text-lg @sm:text-2xl'>
                      {formatShare(resource.value)}
                    </GaugeValue>
                  </Gauge>
                  <span className='text-sm font-medium'>{resource.label}</span>
                  {band && (
                    <GaugeToneLabel
                      className='text-xs'
                      label={band.label}
                      tone={band.tone}
                    />
                  )}
                  <span className='text-muted-foreground text-xs text-balance tabular-nums'>
                    {resource.detail}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
        <GaugeLegend bands={bands} className='border-t pt-4' format={formatShare} />
      </section>
    </BlockStateProvider>
  )
}

export { Gauge3, exampleProps as gauge3ExampleProps, type Gauge3Props }
