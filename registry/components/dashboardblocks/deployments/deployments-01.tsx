'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
} from '@/registry/components/dashboardblocks/block-state'
import {
  type DeployStatus,
  DeployStatusLabel,
  deployStatusConfig,
  formatDuration,
  shortSha,
} from '@/registry/components/dashboardblocks/deployments'
import { Details } from '@/registry/components/dashboardblocks/details'
import { PersonAvatar } from '@/registry/components/dashboardblocks/team'

interface Deployment {
  author: string
  authorAvatar?: string
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
  /** Leave out, or pass none, to show the empty state. */
  deployments?: Deployment[]
  /** Defaults to a sentence counting the deploys and any that need a look. */
  description?: string
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  status?: BlockStatus
  title: string
}

const NOW = new Date(Date.UTC(2026, 8, 26, 15, 0))
const minutesAgo = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000)

const exampleProps: Deployments1Props = {
  deployments: [
    {
      author: 'Ana Lima',
      authorAvatar: '/images/avatar-01.webp',
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
      authorAvatar: '/images/avatar-01.webp',
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
      authorAvatar: '/images/avatar-04.webp',
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
      authorAvatar: '/images/avatar-05.webp',
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
      authorAvatar: '/images/avatar-05.webp',
      duration: 143,
      environment: 'Preview',
      id: 'd5',
      message: 'Upgrade image pipeline',
      sha: 'c07d9e412',
      startedAt: minutesAgo(155),
      status: 'failed',
    },
  ],
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

const summarize = (deployments: Deployment[], now: Date) => {
  if (deployments.length === 0) return 'Nothing deployed yet.'
  const oldest = Math.min(
    ...deployments.map((deployment) => deployment.startedAt.getTime()),
  )
  const hours = Math.max(1, Math.ceil((now.getTime() - oldest) / 3_600_000))
  const span =
    hours <= 48
      ? `${hours} ${hours === 1 ? 'hour' : 'hours'}`
      : `${Math.ceil(hours / 24)} days`
  const count = `${deployments.length} ${deployments.length === 1 ? 'deploy' : 'deploys'} in the last ${span}.`
  const notable = (['running', 'failed', 'rolled-back'] as const)
    .map((status) => {
      const matching = deployments.filter(
        (deployment) => deployment.status === status,
      ).length
      return matching > 0
        ? `${matching} ${deployStatusConfig[status].label.toLowerCase()}`
        : null
    })
    .filter(Boolean)
  return notable.length > 0 ? `${count} ${notable.join(', ')}.` : `${count} All ready.`
}

const Deployments1 = (props: Deployments1Props) => {
  const { deployments = [], now, status, title } = props
  const { description = summarize(deployments, now) } = props

  return (
    <BlockStateProvider status={status} empty={deployments.length === 0}>
      <section className='@container flex flex-col gap-3'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        <div className='border-t'>
          <BlockStateRows rows={5} />
          <ul className='flex flex-col empty:hidden'>
            {!status &&
              deployments.map((deployment) => (
                <li
                  key={deployment.id}
                  className='flex items-start gap-3 border-b py-2.5'
                >
                  <PersonAvatar
                    className='mt-0.5'
                    person={{ avatar: deployment.authorAvatar, name: deployment.author }}
                    size='sm'
                  />
                  <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                    <div className='flex items-baseline justify-between gap-3'>
                      <span className='truncate text-sm font-medium'>
                        {deployment.message}
                      </span>
                      <DeployStatusLabel
                        className='shrink-0'
                        status={deployment.status}
                      />
                    </div>
                    <div className='flex items-baseline justify-between gap-3 text-xs'>
                      <p className='text-muted-foreground min-w-0'>
                        <span className='text-foreground me-2'>
                          {deployment.environment}
                        </span>
                        <Details>
                          <span className='font-mono'>{shortSha(deployment.sha)}</span>
                          {deployment.author}
                          <time dateTime={deployment.startedAt.toISOString()}>
                            {formatStarted(deployment.startedAt, now)}
                          </time>
                        </Details>
                      </p>
                      <span className='text-muted-foreground shrink-0 tabular-nums'>
                        <span className='sr-only'>
                          {deployment.status === 'running' ? 'Building for ' : 'Took '}
                        </span>
                        {formatDuration(deployment.duration)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </section>
    </BlockStateProvider>
  )
}

export {
  Deployments1,
  exampleProps as deployments1ExampleProps,
  type Deployment,
  type Deployments1Props,
}
