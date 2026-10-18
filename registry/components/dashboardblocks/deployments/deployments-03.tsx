'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  DoraLabel,
  type DoraInput,
  getDoraLevels,
} from '@/registry/components/dashboardblocks/deployments'
import { Details } from '@/registry/components/dashboardblocks/details'
import {
  Stat,
  StatChange,
  StatGroup,
  StatLabel,
  type StatMetric,
  StatValue,
} from '@/registry/components/dashboardblocks/stat-group'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'

interface Deployments3Props {
  /** Follows the previous value in each change, such as `the 30 days before`. */
  comparison?: string
  /** Leave out to show the empty state. */
  current?: DoraInput
  /** Defaults to a sentence counting the elite metrics and naming any that got worse. */
  description?: string
  previous?: DoraInput
  status?: BlockStatus
  title: string
}

const exampleProps: Deployments3Props = {
  comparison: 'the 30 days before',
  current: {
    changeFailureRate: 0.08,
    deploysPerDay: 3.4,
    leadTimeHours: 19,
    restoreHours: 2.5,
  },
  previous: {
    changeFailureRate: 0.11,
    deploysPerDay: 2.6,
    leadTimeHours: 27,
    restoreHours: 1.8,
  },
  title: 'Delivery performance',
}

function formatHours(hours: number) {
  if (hours < 1) return `${formatNumber(hours * 60, { maximumFractionDigits: 0 })} min`
  if (hours < 48)
    return `${formatNumber(hours, { maximumFractionDigits: hours < 10 ? 1 : 0 })} h`
  return `${formatNumber(hours / 24)} days`
}

const formatFrequency = (perDay: number) =>
  perDay >= 1 ? `${formatNumber(perDay)} a day` : `${formatNumber(perDay * 7)} a week`

interface DoraMetric {
  goodDirection: 'up' | 'down'
  hint: string
  key: keyof DoraInput
  label: string
  toStat: (value: number) => Pick<StatMetric, 'changeType' | 'formatter' | 'value'>
}

const METRICS: DoraMetric[] = [
  {
    goodDirection: 'up',
    hint: 'How often you ship to production',
    key: 'deploysPerDay',
    label: 'Deployment frequency',
    toStat: (value) => ({ formatter: formatFrequency, value }),
  },
  {
    goodDirection: 'down',
    hint: 'From commit to production',
    key: 'leadTimeHours',
    label: 'Lead time for changes',
    toStat: (value) => ({ formatter: formatHours, value }),
  },
  {
    goodDirection: 'down',
    hint: 'Deploys that caused a failure',
    key: 'changeFailureRate',
    label: 'Change failure rate',
    toStat: (value) => ({
      changeType: 'points',
      formatter: (percent) => formatPercent(percent / 100),
      value: value * 100,
    }),
  },
  {
    goodDirection: 'down',
    hint: 'To restore service after a failure',
    key: 'restoreHours',
    label: 'Time to restore',
    toStat: (value) => ({ formatter: formatHours, value }),
  },
]

const summarize = (current: DoraInput, previous: DoraInput | undefined) => {
  const levels = getDoraLevels(current)
  const elite = METRICS.filter((metric) => levels[metric.key] === 'elite').length
  const worse = previous
    ? METRICS.filter((metric) => {
        const change = current[metric.key] - previous[metric.key]
        return metric.goodDirection === 'up' ? change < 0 : change > 0
      })
    : []
  const lead = `Elite on ${elite} of the ${METRICS.length} DORA metrics.`
  if (worse.length === 0) return lead
  const names = worse.map((metric) => metric.label.toLowerCase()).join(' and ')
  return `${lead} ${names.charAt(0).toUpperCase()}${names.slice(1)} got worse.`
}

const Deployments3 = (props: Deployments3Props) => {
  const { comparison = 'the period before', current, previous, status, title } = props
  const { description = current ? summarize(current, previous) : undefined } = props
  const levels = current ? getDoraLevels(current) : undefined

  return (
    <BlockStateProvider state={getBlockState(status, current)}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        <StatGroup className='grid-cols-1 @md:grid-cols-2 @3xl:grid-cols-4'>
          {METRICS.map((metric) => {
            const stat: ReturnType<DoraMetric['toStat']> = current
              ? metric.toStat(current[metric.key])
              : { value: 0 }
            const before = previous?.[metric.key]
            return (
              <Stat key={metric.key}>
                <StatLabel>{metric.label}</StatLabel>
                <StatValue className='text-3xl @2xl:text-4xl'>
                  {stat.formatter?.(stat.value)}
                </StatValue>
                <StatChange
                  comparison={comparison}
                  metric={{
                    ...stat,
                    goodDirection: metric.goodDirection,
                    key: metric.key,
                    label: metric.label,
                    previous:
                      before === undefined ? undefined : metric.toStat(before).value,
                  }}
                />
                <dd className='text-muted-foreground text-xs'>
                  <BlockReady className='text-xs'>
                    {levels && (
                      <Details>
                        <DoraLabel className='text-xs' level={levels[metric.key]} />
                        {metric.hint}
                      </Details>
                    )}
                  </BlockReady>
                </dd>
              </Stat>
            )
          })}
        </StatGroup>
      </section>
    </BlockStateProvider>
  )
}

export { Deployments3, exampleProps as deployments3ExampleProps, type Deployments3Props }
