'use client'

import {
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  Gauge,
  type GaugeBand,
  GaugeLegend,
  GaugeToneLabel,
  GaugeValue,
  gaugeToneConfig,
  getGaugeBand,
  getWeightedScore,
} from '@/registry/components/dashboardblocks/gauge'
import { formatPercent } from '@/registry/lib/dashboardblocks/format'

import { cn } from '@/lib/utils'

interface HealthFactor {
  detail: string
  label: string
  /** 0–100. */
  score: number
  weight: number
}

interface Gauge2Props {
  /** Bands from 0 to 100, in order. */
  bands: GaugeBand[]
  description: string
  /** Leave out, or pass none, to show the empty state. */
  factors?: HealthFactor[]
  status?: BlockStatus
  title: string
}

const exampleProps: Gauge2Props = {
  bands: [
    { from: 0, label: 'Poor', to: 40, tone: 'critical' },
    { from: 40, label: 'Fair', to: 70, tone: 'caution' },
    { from: 70, label: 'Good', to: 100, tone: 'positive' },
  ],
  description: 'Northwind Traders, on the Enterprise plan until it renews Dec 14.',
  factors: [
    {
      detail: '312 of 350 seats active this month',
      label: 'Product usage',
      score: 84,
      weight: 0.35,
    },
    {
      detail: 'NPS +32 from 18 responses',
      label: 'Sentiment',
      score: 71,
      weight: 0.2,
    },
    {
      detail: 'Last business review 94 days ago',
      label: 'Engagement',
      score: 66,
      weight: 0.1,
    },
    {
      detail: '14 open tickets, 3 escalated',
      label: 'Support',
      score: 58,
      weight: 0.2,
    },
    {
      detail: 'Invoice 21 days overdue',
      label: 'Billing',
      score: 34,
      weight: 0.15,
    },
  ],
  title: 'Account health',
}

const joinLabels = (labels: string[]) =>
  labels.length < 2
    ? (labels[0] ?? '')
    : `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`

const Gauge2 = (props: Gauge2Props) => {
  const { bands, description, factors = [], status, title } = props
  const state = getBlockState(status, factors.length === 0)
  const exact = getWeightedScore(factors)
  const score = Math.round(exact)
  const band = getGaugeBand(score, bands)
  const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0) || 1
  const drags = factors
    .map((factor) => ({ ...factor, pull: (factor.score - exact) * factor.weight }))
    .filter((factor) => factor.pull < 0)
    .sort((a, b) => a.pull - b.pull)
    .slice(0, 2)
    .map((factor) => factor.label.toLowerCase())

  return (
    <BlockStateProvider status={status} empty={factors.length === 0}>
      <section className='@container flex flex-col gap-4 [--gauge-surface:var(--color-background)]'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </div>
          {!state && band && (
            <GaugeToneLabel className='mt-0.5' label={band.label} tone={band.tone} />
          )}
        </header>
        <div className='grid gap-6 border-t pt-5 @xl:grid-cols-[14rem_1fr] @xl:items-start'>
          <div className='flex flex-col items-center gap-3'>
            <Gauge
              bands={bands}
              className='w-full max-w-52'
              indicator='marker'
              label={title}
              sweep={270}
              value={score}
              valueText={`${score} out of 100${band ? `, ${band.label.toLowerCase()}` : ''}`}
            >
              <GaugeValue className='text-4xl'>{score}</GaugeValue>
              {!state && (
                <span className='text-muted-foreground text-xs'>out of 100</span>
              )}
            </Gauge>
            {!state && drags.length > 0 && (
              <p className='text-muted-foreground text-center text-sm text-balance'>
                {joinLabels(drags).replace(/^./, (first) => first.toUpperCase())}{' '}
                {drags.length === 1 ? 'pulls' : 'pull'} the score down most.
              </p>
            )}
            <GaugeLegend bands={bands} className='justify-center' />
          </div>
          {(state === undefined || state === 'loading') && (
            <div className='flex min-w-0 flex-col gap-1'>
              <h3 className='text-sm font-medium'>What makes up the score</h3>
              <BlockStateRows rows={5} />
              {!state && (
                <ul className='flex flex-col divide-y'>
                  {factors.map((factor) => {
                    const factorBand = getGaugeBand(factor.score, bands)
                    const config = factorBand
                      ? gaugeToneConfig[factorBand.tone]
                      : undefined
                    return (
                      <li key={factor.label} className='flex flex-col gap-1.5 py-2.5'>
                        <div className='flex items-baseline justify-between gap-3'>
                          <span className='truncate text-sm'>{factor.label}</span>
                          <span className='flex shrink-0 items-baseline gap-1.5 text-sm'>
                            <span className='font-medium tabular-nums'>
                              {factor.score}
                            </span>
                            {factorBand && (
                              <GaugeToneLabel
                                className='text-xs'
                                label={factorBand.label}
                                tone={factorBand.tone}
                              />
                            )}
                          </span>
                        </div>
                        <div aria-hidden className='bg-muted h-1.5 w-full rounded-full'>
                          <div
                            className={cn(
                              'h-full rounded-full',
                              config?.swatch ?? 'bg-primary',
                            )}
                            style={{
                              width: `${Math.min(100, Math.max(0, factor.score))}%`,
                            }}
                          />
                        </div>
                        <span className='text-muted-foreground flex items-baseline justify-between gap-3 text-xs'>
                          <span className='min-w-0'>{factor.detail}</span>
                          <span className='shrink-0 tabular-nums'>
                            Weighs{' '}
                            {formatPercent(factor.weight / totalWeight, {
                              maximumFractionDigits: 0,
                            })}
                          </span>
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </section>
    </BlockStateProvider>
  )
}

export { Gauge2, exampleProps as gauge2ExampleProps, type Gauge2Props }
