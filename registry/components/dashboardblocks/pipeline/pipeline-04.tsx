'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  BlockStateText,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  GoalProgress,
  GoalProgressKey,
} from '@/registry/components/dashboardblocks/goals'
import {
  PipelineOwner,
  type PipelineStage,
} from '@/registry/components/dashboardblocks/pipeline'
import { StatusLabel } from '@/registry/components/dashboardblocks/status-label'
import {
  formatCurrency,
  formatPercent,
  joinDetails,
} from '@/registry/lib/dashboardblocks/format'

interface OwnerPipeline {
  avatar?: string
  closed: number
  deals: { stage: string; value: number }[]
  name: string
  quota: number
}

interface Pipeline4Props {
  /** Defaults to a sentence counting who is on course for quota. */
  description?: string
  /** Leave out, or pass none, to show the empty state. */
  owners?: OwnerPipeline[]
  stages: PipelineStage[]
  status?: BlockStatus
  title: string
}

const deals = (stage: string, ...values: number[]) =>
  values.map((value) => ({ stage, value }))

const exampleProps: Pipeline4Props = {
  owners: [
    {
      closed: 286_000,
      deals: [
        ...deals('qualified', 42_000, 31_200),
        ...deals('proposal', 39_900, 58_000),
        ...deals('negotiation', 74_000),
      ],
      name: 'Maya Patel',
      avatar: '/images/avatar-01.webp',
      quota: 400_000,
    },
    {
      closed: 198_000,
      deals: [
        ...deals('discovery', 96_000),
        ...deals('proposal', 64_500),
        ...deals('negotiation', 212_000),
      ],
      name: 'Jonas Weber',
      avatar: '/images/avatar-07.webp',
      quota: 400_000,
    },
    {
      closed: 142_000,
      deals: [
        ...deals('qualified', 27_000),
        ...deals('discovery', 48_000),
        ...deals('proposal', 128_000),
      ],
      name: 'Aiko Tanaka',
      avatar: '/images/avatar-04.webp',
      quota: 350_000,
    },
    {
      closed: 121_000,
      deals: [
        ...deals('qualified', 18_500),
        ...deals('discovery', 54_000),
        ...deals('negotiation', 87_000),
      ],
      name: 'Luis Romero',
      avatar: '/images/avatar-06.webp',
      quota: 300_000,
    },
  ],
  stages: [
    { id: 'qualified', label: 'Qualified', probability: 0.1 },
    { id: 'discovery', label: 'Discovery', probability: 0.25 },
    { id: 'proposal', label: 'Proposal', probability: 0.5 },
    { id: 'negotiation', label: 'Negotiation', probability: 0.75 },
  ],
  title: 'Weighted pipeline',
}

const compact = (value: number) => formatCurrency(value, { compact: true })

const Pipeline4 = (props: Pipeline4Props) => {
  const { owners = [], stages, status, title } = props
  const state = getBlockState(status, owners)
  const ready = state === undefined || state === 'loading'
  const probability = new Map(stages.map((stage) => [stage.id, stage.probability ?? 0]))
  const rows = owners.map((owner) => {
    const weighted = owner.deals.reduce(
      (sum, deal) => sum + deal.value * (probability.get(deal.stage) ?? 0),
      0,
    )
    return { ...owner, forecast: owner.closed + weighted, weighted }
  })
  const teamForecast = rows.reduce((sum, row) => sum + row.forecast, 0)
  const teamQuota = rows.reduce((sum, row) => sum + row.quota, 0)
  const covered = rows.filter((row) => row.forecast >= row.quota).length
  const {
    description = `Closed deals plus open ones weighted by stage; ${covered} of ${rows.length} reps ${covered === 1 ? 'is' : 'are'} on course for quota.`,
  } = props

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        <div className='flex flex-col gap-3 border-t pt-4 @md:flex-row @md:items-end @md:justify-between'>
          <p className='flex flex-wrap items-baseline gap-x-2'>
            <span className='text-4xl font-light tracking-tight tabular-nums'>
              {state ? <BlockStateText variant='short' /> : compact(teamForecast)}
            </span>
            {!state && (
              <span className='text-muted-foreground text-sm'>
                of {compact(teamQuota)} team quota,{' '}
                {formatPercent(teamQuota > 0 ? teamForecast / teamQuota : 0, {
                  maximumFractionDigits: 0,
                })}
              </span>
            )}
          </p>
          {ready && (
            <div className='flex flex-wrap gap-x-4 gap-y-1'>
              <GoalProgressKey label='Closed' shape='progress' />
              <GoalProgressKey label='Weighted open' shape='projected' />
            </div>
          )}
        </div>
        {state === 'loading' && <BlockStateRows rows={owners.length || 4} />}
        {!state && (
          <ul className='flex flex-col'>
            {rows.map((row) => {
              const gap = row.quota - row.forecast
              return (
                <li
                  key={row.name}
                  className='flex flex-col gap-2 border-b py-3 first:pt-0'
                >
                  <div className='flex flex-wrap items-center justify-between gap-x-3 gap-y-1'>
                    <PipelineOwner
                      avatar={row.avatar}
                      className='font-medium'
                      name={row.name}
                      showName
                    />
                    <span className='text-sm whitespace-nowrap tabular-nums'>
                      {compact(row.forecast)}
                      <span className='text-muted-foreground'>
                        {' '}
                        of {compact(row.quota)}
                      </span>
                    </span>
                  </div>
                  <GoalProgress
                    current={row.closed}
                    projected={row.forecast}
                    target={row.quota}
                  />
                  <p className='text-muted-foreground flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs tabular-nums'>
                    <span>
                      {joinDetails(
                        `${compact(row.closed)} closed`,
                        `${compact(row.weighted)} weighted open`,
                      )}
                    </span>
                    <StatusLabel className='text-xs' tone={gap <= 0 ? 'good' : 'warning'}>
                      {gap <= 0
                        ? `Covers quota by ${compact(-gap)}`
                        : `Short ${compact(gap)}`}
                    </StatusLabel>
                  </p>
                </li>
              )
            })}
          </ul>
        )}
        {ready && (
          <p className='text-muted-foreground text-xs'>
            Weighted at{' '}
            {stages
              .map(
                (stage) =>
                  `${stage.label} ${formatPercent(stage.probability ?? 0, { maximumFractionDigits: 0 })}`,
              )
              .join(', ')}
            .
          </p>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Pipeline4, exampleProps as pipeline4ExampleProps, type Pipeline4Props }
