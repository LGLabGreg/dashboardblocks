'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  DeployHistory,
  type DeployStatus,
  deployStatusConfig,
  formatDuration,
} from '@/registry/components/dashboardblocks/deployments'
import {
  StatusLabel,
  type StatusTone,
} from '@/registry/components/dashboardblocks/status-label'
import { formatPercent } from '@/registry/lib/dashboardblocks/format'

import { cn } from '@/lib/utils'

interface Pipeline {
  /** Median seconds per run. */
  medianDuration: number
  name: string
  /** Oldest first. */
  runs: DeployStatus[]
}

interface Deployments4Props {
  /** Defaults to a sentence naming the pipeline that fails most. */
  description?: string
  /** Leave out, or pass none, to show the empty state. */
  pipelines?: Pipeline[]
  status?: BlockStatus
  title: string
}

const pattern = (runs: string) =>
  runs
    .split('')
    .map(
      (run) =>
        ({ f: 'failed', q: 'queued', r: 'running', s: 'success' })[run] as DeployStatus,
    )

const exampleProps: Deployments4Props = {
  pipelines: [
    {
      medianDuration: 412,
      name: 'main',
      runs: pattern('sssssfsssssssssssssfssssssssss'),
    },
    {
      medianDuration: 1_386,
      name: 'release',
      runs: pattern('sssssssssssssssssssssssssssssr'),
    },
    {
      medianDuration: 2_904,
      name: 'nightly e2e',
      runs: pattern('ssfssffsssfsssssffssssfsssfsss'),
    },
    {
      medianDuration: 228,
      name: 'docs',
      runs: pattern('ssssssssssssssssssssssssssssss'),
    },
  ],
  title: 'Build health',
}

const LEGEND: DeployStatus[] = ['success', 'failed', 'running']

const HEALTHY_RATE = 0.95

const passRate = (runs: DeployStatus[]) => {
  const finished = runs.filter((run) => run === 'success' || run === 'failed')
  const passed = finished.filter((run) => run === 'success').length
  return {
    failed: finished.length - passed,
    finished: finished.length,
    passed,
    rate: finished.length > 0 ? passed / finished.length : 0,
  }
}

const rateTone = (rate: number): StatusTone =>
  rate >= HEALTHY_RATE ? 'good' : rate >= 0.8 ? 'warning' : 'bad'

const summarize = (pipelines: Pipeline[]) => {
  if (pipelines.length === 0) return 'No pipelines yet.'
  const rated = pipelines.map((pipeline) => ({
    name: pipeline.name,
    ...passRate(pipeline.runs),
  }))
  const healthy = rated.filter((pipeline) => pipeline.rate >= HEALTHY_RATE).length
  const worst = rated.reduce((low, pipeline) =>
    pipeline.rate < low.rate ? pipeline : low,
  )
  const lead = `${healthy} of ${pipelines.length} pipelines pass ${formatPercent(HEALTHY_RATE)} of runs or more`
  if (worst.rate >= HEALTHY_RATE) return `${lead}.`
  return `${lead}; ${worst.name} passes only ${formatPercent(worst.rate, { maximumFractionDigits: 0 })}.`
}

const Deployments4 = (props: Deployments4Props) => {
  const { pipelines = [], status, title } = props
  const { description = summarize(pipelines) } = props

  return (
    <BlockStateProvider state={getBlockState(status, pipelines)}>
      <section className='@container flex flex-col gap-3'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        <div className='border-t'>
          <BlockStateRows rows={4} />
          <ul className='flex flex-col empty:hidden'>
            {!status &&
              pipelines.map((pipeline) => {
                const { failed, finished, passed, rate } = passRate(pipeline.runs)
                return (
                  <li key={pipeline.name} className='flex flex-col gap-2 border-b py-3'>
                    <div className='flex items-baseline justify-between gap-3'>
                      <span className='truncate font-mono text-sm font-medium'>
                        {pipeline.name}
                      </span>
                      <span className='flex shrink-0 items-baseline gap-4 text-xs tabular-nums'>
                        <StatusLabel variant='text' tone={rateTone(rate)}>
                          {formatPercent(rate, { maximumFractionDigits: 0 })} passed
                        </StatusLabel>
                        <span className='text-muted-foreground w-24 text-right'>
                          {formatDuration(pipeline.medianDuration)} median
                        </span>
                      </span>
                    </div>
                    <DeployHistory
                      runs={pipeline.runs.map((status, index) => ({
                        id: `${pipeline.name}-${index}`,
                        status,
                      }))}
                    />
                    <span className='sr-only'>
                      {`${passed} of ${finished} finished runs passed, ${failed} failed${pipeline.runs.some((run) => run === 'running') ? ', one is running' : ''}.`}
                    </span>
                  </li>
                )
              })}
          </ul>
        </div>
        {pipelines.length > 0 && !status && (
          <ul
            aria-hidden
            className='text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs'
          >
            {LEGEND.map((status) => (
              <li key={status} className='flex items-center gap-1.5'>
                <span
                  className={cn(
                    'size-2.5 rounded-[2px]',
                    deployStatusConfig[status].cell,
                  )}
                />
                {status === 'success' ? 'Passed' : deployStatusConfig[status].label}
              </li>
            ))}
            <li className='ml-auto'>Oldest on the left</li>
          </ul>
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  Deployments4,
  exampleProps as deployments4ExampleProps,
  type Deployments4Props,
  type Pipeline,
}
