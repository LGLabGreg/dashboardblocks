'use client'

import {
  Gauge,
  type GaugeBand,
  GaugeLegend,
  gaugeToneConfig,
  getGaugeBand,
} from '@/registry/components/dashboardblocks/gauge'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface Resource {
  /** e.g. "25.0 of 32 GB". */
  detail: string
  label: string
  /** Percent used, 0–100. */
  value: number
}

interface Gauge3Props {
  description: string
  resources: Resource[]
  /** Percent used at which each resource turns to warning, then critical. */
  thresholds: { critical: number; warning: number }
  title: string
}

const exampleProps: Gauge3Props = {
  description: 'prod-web-03 · us-east-1 · last 5 minutes',
  resources: [
    { detail: '8 cores, load 5.1', label: 'CPU', value: 64 },
    { detail: '25.0 of 32 GB', label: 'Memory', value: 78 },
    { detail: '465 of 500 GB', label: 'Disk', value: 93 },
  ],
  thresholds: { critical: 90, warning: 70 },
  title: 'System load',
}

const Gauge3 = (props: Gauge3Props) => {
  const { description, resources, thresholds, title } = props
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

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className='grid grid-cols-3 gap-3 @md:gap-6'>
          {resources.map((resource) => {
            const band = getGaugeBand(resource.value, bands)
            const config = band ? gaugeToneConfig[band.tone] : undefined
            const Icon = config?.icon
            return (
              <li
                key={resource.label}
                className='flex min-w-0 flex-col items-center gap-1.5 text-center'
              >
                <Gauge
                  bands={bands}
                  className='w-full max-w-32'
                  colorByBand
                  label={resource.label}
                  sweep={270}
                  thickness={11}
                  value={resource.value}
                  valueText={`${resource.value}%${band ? `, ${band.label.toLowerCase()}` : ''}`}
                >
                  <span className='text-base font-semibold tracking-tight tabular-nums @sm:text-lg @md:text-2xl'>
                    {resource.value}%
                  </span>
                </Gauge>
                <span className='text-sm font-medium'>{resource.label}</span>
                {band && config && Icon && (
                  <span
                    className={cn(
                      'flex items-center gap-1 text-xs font-medium',
                      config.text,
                    )}
                  >
                    <Icon aria-hidden className='size-3.5 shrink-0' />
                    {band.label}
                  </span>
                )}
                <span className='text-muted-foreground text-xs text-balance'>
                  {resource.detail}
                </span>
              </li>
            )
          })}
        </ul>
      </CardContent>
      <CardFooter className='border-t'>
        <GaugeLegend bands={bands} format={(value) => `${value}%`} />
      </CardFooter>
    </Card>
  )
}

export { Gauge3, exampleProps as gauge3ExampleProps, type Gauge3Props }
