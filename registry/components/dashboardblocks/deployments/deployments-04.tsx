'use client'

import {
  DeployHistory,
  type DeployStatus,
  deployStatusConfig,
  formatDuration,
} from '@/registry/components/dashboardblocks/deployments'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface Pipeline {
  /** Median seconds per run. */
  medianDuration: number
  name: string
  /** Oldest first. */
  runs: DeployStatus[]
}

interface Deployments4Props {
  description: string
  pipelines: Pipeline[]
  title: string
}

/** Expands a compact pattern like "sssfs" into statuses, for the example. */
const pattern = (runs: string) =>
  runs
    .split('')
    .map(
      (run) =>
        ({ f: 'failed', q: 'queued', r: 'running', s: 'success' })[run] as DeployStatus,
    )

const exampleProps: Deployments4Props = {
  description: 'The last 30 runs of each pipeline, oldest on the left',
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

const Deployments4 = (props: Deployments4Props) => {
  const { description, pipelines, title } = props

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <ul className='flex flex-col gap-4'>
          {pipelines.map((pipeline) => {
            const finished = pipeline.runs.filter(
              (run) => run === 'success' || run === 'failed',
            )
            const passed = finished.filter((run) => run === 'success').length
            const rate = finished.length > 0 ? passed / finished.length : 0
            const failed = finished.length - passed
            return (
              <li key={pipeline.name} className='flex flex-col gap-1.5'>
                <div className='flex items-baseline justify-between gap-3 text-sm'>
                  <span className='font-mono font-medium'>{pipeline.name}</span>
                  <span className='text-muted-foreground text-xs tabular-nums'>
                    <span
                      className={cn(
                        'text-sm font-medium',
                        rate >= 0.95
                          ? 'text-foreground'
                          : rate >= 0.8
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-red-700 dark:text-red-400',
                      )}
                    >
                      {Math.round(rate * 100)}%
                    </span>{' '}
                    passed · {formatDuration(pipeline.medianDuration)} median
                  </span>
                </div>
                <DeployHistory
                  runs={pipeline.runs.map((status, index) => ({
                    id: `${pipeline.name}-${index}`,
                    status,
                  }))}
                />
                <span className='sr-only'>
                  {`${passed} of ${finished.length} finished runs passed, ${failed} failed${pipeline.runs.some((run) => run === 'running') ? ', one is running' : ''}.`}
                </span>
              </li>
            )
          })}
        </ul>
        <ul
          aria-hidden
          className='text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-xs'
        >
          {LEGEND.map((status) => (
            <li key={status} className='flex items-center gap-1.5'>
              <span
                className={cn('size-2.5 rounded-[2px]', deployStatusConfig[status].cell)}
              />
              {status === 'success' ? 'Passed' : deployStatusConfig[status].label}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export {
  Deployments4,
  exampleProps as deployments4ExampleProps,
  type Deployments4Props,
  type Pipeline,
}
