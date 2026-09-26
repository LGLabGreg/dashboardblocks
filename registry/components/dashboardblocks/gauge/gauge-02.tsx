'use client'

import {
  Gauge,
  type GaugeBand,
  GaugeLegend,
  GaugeToneBadge,
  gaugeToneConfig,
  getGaugeBand,
  getWeightedScore,
} from '@/registry/components/dashboardblocks/gauge'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface HealthFactor {
  /** What drives the score, e.g. "312 of 350 seats active". */
  detail: string
  label: string
  /** 0–100. */
  score: number
  /** Share of the overall score. Weights are normalised, so they don't need to add up to 1. */
  weight: number
}

interface Gauge2Props {
  /** Bands from 0 to 100, in order. */
  bands: GaugeBand[]
  description: string
  factors: HealthFactor[]
  title: string
}

const exampleProps: Gauge2Props = {
  bands: [
    { from: 0, label: 'Poor', to: 40, tone: 'critical' },
    { from: 40, label: 'Fair', to: 70, tone: 'caution' },
    { from: 70, label: 'Good', to: 100, tone: 'positive' },
  ],
  description: 'Northwind Traders · Enterprise · renews 14 Dec',
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

const Gauge2 = (props: Gauge2Props) => {
  const { bands, description, factors, title } = props
  const score = Math.round(getWeightedScore(factors))
  const band = getGaugeBand(score, bands)
  const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0) || 1

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='grid gap-6 @xl:grid-cols-[14rem_1fr] @xl:items-start'>
        <div className='flex flex-col items-center gap-4'>
          <Gauge
            bands={bands}
            className='w-full max-w-52'
            indicator='marker'
            label={title}
            sweep={270}
            value={score}
            valueText={`${score} out of 100${band ? `, ${band.label.toLowerCase()}` : ''}`}
          >
            <span className='text-4xl font-semibold tracking-tight tabular-nums'>
              {score}
            </span>
            <span className='text-muted-foreground mb-1.5 text-xs'>out of 100</span>
            {band && <GaugeToneBadge label={band.label} tone={band.tone} />}
          </Gauge>
          <GaugeLegend bands={bands} className='justify-center' />
        </div>
        <div className='flex min-w-0 flex-col gap-2'>
          <h3 className='text-muted-foreground text-xs font-medium'>
            Contributing factors
          </h3>
          <ul className='flex flex-col divide-y'>
            {factors.map((factor) => {
              const factorBand = getGaugeBand(factor.score, bands)
              const config = factorBand ? gaugeToneConfig[factorBand.tone] : undefined
              const Icon = config?.icon
              return (
                <li key={factor.label} className='flex flex-col gap-1.5 py-2.5'>
                  <div className='flex items-baseline justify-between gap-3'>
                    <span className='truncate text-sm font-medium'>{factor.label}</span>
                    <span className='flex shrink-0 items-center gap-1.5 text-sm'>
                      <span className='font-medium tabular-nums'>{factor.score}</span>
                      {factorBand && config && Icon && (
                        <span
                          className={cn(
                            'flex items-center gap-1 self-center text-xs',
                            config.text,
                          )}
                        >
                          <Icon aria-hidden className='size-3.5' />
                          {factorBand.label}
                        </span>
                      )}
                    </span>
                  </div>
                  <div aria-hidden className='bg-muted h-1.5 w-full rounded-full'>
                    <div
                      className={cn(
                        'h-full rounded-full',
                        config?.swatch ?? 'bg-primary',
                      )}
                      style={{ width: `${Math.min(100, Math.max(0, factor.score))}%` }}
                    />
                  </div>
                  <span className='text-muted-foreground text-xs'>
                    {factor.detail} · weight{' '}
                    {Math.round((factor.weight / totalWeight) * 100)}%
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export { Gauge2, exampleProps as gauge2ExampleProps, type Gauge2Props }
