'use client'

import {
  type DeployStatus,
  DeployStatusLabel,
  formatDuration,
  shortSha,
} from '@/registry/components/dashboardblocks/deployments'
import { PersonAvatar } from '@/registry/components/dashboardblocks/team'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Deployment {
  author: string
  /** Seconds the build and deploy took, or have taken so far. */
  duration: number
  environment: string
  id: string
  message: string
  sha: string
  startedAt: Date
  status: DeployStatus
}

interface Deployments1Props {
  deployments: Deployment[]
  description: string
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  title: string
}

const NOW = new Date(Date.UTC(2026, 8, 26, 15, 0))
const minutesAgo = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000)

const exampleProps: Deployments1Props = {
  deployments: [
    {
      author: 'Ana Lima',
      duration: 94,
      environment: 'Production',
      id: 'd1',
      message: 'Fix currency rounding on invoices',
      sha: '9f3c2a17b',
      startedAt: minutesAgo(2),
      status: 'running',
    },
    {
      author: 'Ana Lima',
      duration: 212,
      environment: 'Preview',
      id: 'd2',
      message: 'Fix currency rounding on invoices',
      sha: '9f3c2a17b',
      startedAt: minutesAgo(14),
      status: 'success',
    },
    {
      author: 'Kenji Mori',
      duration: 187,
      environment: 'Production',
      id: 'd3',
      message: 'Add retry to webhook delivery',
      sha: '41be08d3c',
      startedAt: minutesAgo(52),
      status: 'success',
    },
    {
      author: 'Sara Okafor',
      duration: 66,
      environment: 'Production',
      id: 'd4',
      message: 'Upgrade image pipeline',
      sha: 'c07d9e412',
      startedAt: minutesAgo(130),
      status: 'rolled-back',
    },
    {
      author: 'Sara Okafor',
      duration: 143,
      environment: 'Preview',
      id: 'd5',
      message: 'Upgrade image pipeline',
      sha: 'c07d9e412',
      startedAt: minutesAgo(155),
      status: 'failed',
    },
  ],
  description: 'The latest builds across environments',
  now: NOW,
  title: 'Deployments',
}

const relative = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto', style: 'short' })

function formatStarted(date: Date, now: Date) {
  const minutes = Math.round((now.getTime() - date.getTime()) / 60_000)
  if (minutes < 60) return relative.format(-Math.max(1, minutes), 'minute')
  if (minutes < 60 * 24) return relative.format(-Math.round(minutes / 60), 'hour')
  return relative.format(-Math.round(minutes / 1_440), 'day')
}

const Deployments1 = (props: Deployments1Props) => {
  const { deployments, description, now, title } = props

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className='flex flex-col divide-y'>
          {deployments.map((deployment) => (
            <li
              key={deployment.id}
              className='flex items-start gap-3 py-3 first:pt-0 last:pb-0'
            >
              <PersonAvatar
                className='mt-0.5'
                person={{ name: deployment.author }}
                size='sm'
              />
              <div className='flex min-w-0 flex-1 flex-col gap-1'>
                <div className='flex items-start justify-between gap-3'>
                  <span className='truncate text-sm font-medium'>
                    {deployment.message}
                  </span>
                  <DeployStatusLabel className='shrink-0' status={deployment.status} />
                </div>
                <div className='text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs'>
                  <span className='bg-muted text-foreground rounded px-1.5 py-0.5 font-medium'>
                    {deployment.environment}
                  </span>
                  <span className='font-mono'>{shortSha(deployment.sha)}</span>
                  <span>{deployment.author}</span>
                  <span aria-hidden>·</span>
                  <time dateTime={deployment.startedAt.toISOString()}>
                    {formatStarted(deployment.startedAt, now)}
                  </time>
                  <span aria-hidden>·</span>
                  <span className='tabular-nums'>
                    {deployment.status === 'running' ? 'running for ' : 'took '}
                    {formatDuration(deployment.duration)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export {
  Deployments1,
  exampleProps as deployments1ExampleProps,
  type Deployment,
  type Deployments1Props,
}
