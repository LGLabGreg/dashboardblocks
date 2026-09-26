'use client'

import {
  DoraBadge,
  type DoraInput,
  getDoraLevels,
} from '@/registry/components/dashboardblocks/deployments'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface Deployments3Props {
  current: DoraInput
  description: string
  /** The period before, to show which way each metric moved. */
  previous?: DoraInput
  title: string
}

const exampleProps: Deployments3Props = {
  current: {
    changeFailureRate: 0.08,
    deploysPerDay: 3.4,
    leadTimeHours: 19,
    restoreHours: 2.5,
  },
  description: 'Last 30 days, against the 30 days before',
  previous: {
    changeFailureRate: 0.11,
    deploysPerDay: 2.6,
    leadTimeHours: 27,
    restoreHours: 1.8,
  },
  title: 'Delivery performance',
}

function formatHours(hours: number) {
  if (hours < 1) return `${Math.round(hours * 60)} min`
  if (hours < 48) return `${hours.toFixed(hours < 10 ? 1 : 0)} h`
  return `${(hours / 24).toFixed(1)} days`
}

const METRICS: {
  better: 'up' | 'down'
  format: (value: number) => string
  hint: string
  key: keyof DoraInput
  label: string
}[] = [
  {
    better: 'up',
    format: (value) =>
      value >= 1 ? `${value.toFixed(1)}/day` : `${(value * 7).toFixed(1)}/week`,
    hint: 'How often you ship to production',
    key: 'deploysPerDay',
    label: 'Deployment frequency',
  },
  {
    better: 'down',
    format: formatHours,
    hint: 'Median time from commit to production',
    key: 'leadTimeHours',
    label: 'Lead time for changes',
  },
  {
    better: 'down',
    format: (value) => `${(value * 100).toFixed(0)}%`,
    hint: 'Share of deployments causing a failure',
    key: 'changeFailureRate',
    label: 'Change failure rate',
  },
  {
    better: 'down',
    format: formatHours,
    hint: 'Median time to restore after a failure',
    key: 'restoreHours',
    label: 'Time to restore',
  },
]

const Deployments3 = (props: Deployments3Props) => {
  const { current, description, previous, title } = props
  const levels = getDoraLevels(current)

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className='grid grid-cols-1 gap-3 @sm:grid-cols-2 @3xl:grid-cols-4'>
          {METRICS.map((metric) => {
            const value = current[metric.key]
            const before = previous?.[metric.key]
            const change = before ? value / before - 1 : null
            const improved =
              change === null ? null : metric.better === 'up' ? change > 0 : change < 0
            return (
              <div
                key={metric.key}
                className='flex flex-col gap-1.5 rounded-lg border p-3'
              >
                <dt className='flex items-start justify-between gap-2'>
                  <span className='text-sm font-medium'>{metric.label}</span>
                  <DoraBadge level={levels[metric.key]} />
                </dt>
                <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
                  {metric.format(value)}
                </dd>
                {change !== null && Math.abs(change) >= 0.005 && (
                  <dd
                    className={cn(
                      'text-xs font-medium tabular-nums',
                      improved
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-red-700 dark:text-red-400',
                    )}
                  >
                    {change > 0 ? '↑' : '↓'} {Math.abs(change * 100).toFixed(0)}%{' '}
                    {improved ? 'better' : 'worse'}
                    <span className='text-muted-foreground font-normal'>
                      , was {metric.format(before ?? 0)}
                    </span>
                  </dd>
                )}
                <dd className='text-muted-foreground text-xs'>{metric.hint}</dd>
              </div>
            )
          })}
        </dl>
      </CardContent>
    </Card>
  )
}

export { Deployments3, exampleProps as deployments3ExampleProps, type Deployments3Props }
