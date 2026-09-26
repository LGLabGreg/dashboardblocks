'use client'

import {
  type Metric,
  MetricList,
  MetricTargetBar,
  MetricTargetKey,
  TargetStatusBadge,
  formatMetricValue,
  getTargetStatus,
} from '@/registry/components/dashboardblocks/metric-list'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface TargetMetric extends Omit<Metric, 'history' | 'previous'> {
  /** The range the bar covers. Narrow it for values that sit close together, like uptime. */
  domain?: [number, number]
  /** A floor when `goodDirection` is `up` (the default), a ceiling when it is `down`. */
  target: number
  /** How far short of the target, as a share of it, still counts as near. */
  tolerance?: number
}

interface MetricList3Props {
  description: string
  metrics: TargetMetric[]
  title: string
}

const exampleProps: MetricList3Props = {
  description: 'Q3 so far, against the targets set in July',
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
  const { description, metrics, title } = props
  const statuses = metrics.map((metric) => getTargetStatus(metric))
  const met = statuses.filter((status) => status === 'met').length

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <MetricList className='-my-3'>
          {metrics.map((metric, index) => {
            const floor = (metric.goodDirection ?? 'up') === 'up'
            return (
              <li
                key={metric.key}
                className='grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 py-3 @xl:grid-cols-[minmax(0,1fr)_minmax(5rem,8rem)_6.5rem_7rem] @xl:gap-x-4'
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
                    <span className='sr-only'>{floor ? 'at least' : 'at most'}</span>{' '}
                    {formatMetricValue(metric, metric.target)}
                  </span>
                </p>
                <TargetStatusBadge
                  className='col-start-2 row-start-1 justify-self-end @xl:col-start-4'
                  status={statuses[index]}
                />
              </li>
            )
          })}
        </MetricList>
      </CardContent>
      <CardFooter className='text-muted-foreground flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t text-xs'>
        <MetricTargetKey />
        <span>
          {met} of {metrics.length} on target
        </span>
      </CardFooter>
    </Card>
  )
}

export { MetricList3, exampleProps as metricList3ExampleProps, type MetricList3Props }
