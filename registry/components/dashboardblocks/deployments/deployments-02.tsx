'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateText,
  type BlockStateProps,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  type DeployStatus,
  DeployStatusLabel,
  shortSha,
} from '@/registry/components/dashboardblocks/deployments'
import { Details } from '@/registry/components/dashboardblocks/details'
import { formatRelativeTime } from '@/registry/lib/dashboardblocks/format'

interface Environment {
  deployedAt: Date
  deployedBy: string
  id: string
  name: string
  sha: string
  status: DeployStatus
  version: string
}

interface Deployments2Props extends BlockStateProps {
  /** How many commits each environment is ahead of the next, in order. */
  ahead?: number[]
  /** Defaults to a sentence naming what the last environment runs and what is waiting. */
  description?: string
  /** In promotion order, ending with the one customers use. Leave out, or pass none, to show the empty state. */
  environments?: Environment[]
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  title: string
}

const NOW = new Date(Date.UTC(2026, 8, 26, 15, 0))
const hoursAgo = (hours: number) => new Date(NOW.getTime() - hours * 3_600_000)

const exampleProps: Deployments2Props = {
  ahead: [4, 2],
  environments: [
    {
      deployedAt: hoursAgo(0.3),
      deployedBy: 'Ana Lima',
      id: 'dev',
      name: 'Development',
      sha: '9f3c2a17b',
      status: 'success',
      version: 'v3.2.0-rc.4',
    },
    {
      deployedAt: hoursAgo(5),
      deployedBy: 'Kenji Mori',
      id: 'staging',
      name: 'Staging',
      sha: '41be08d3c',
      status: 'success',
      version: 'v3.2.0-rc.2',
    },
    {
      deployedAt: hoursAgo(28),
      deployedBy: 'Sara Okafor',
      id: 'production',
      name: 'Production',
      sha: '7a21c5e90',
      status: 'success',
      version: 'v3.1.4',
    },
  ],
  now: NOW,
  title: 'Environments',
}

const summarize = (environments: Environment[], ahead: number[]) => {
  const live = environments[environments.length - 1]
  if (!live) return 'No environments yet.'
  const waiting = ahead.reduce((sum, count) => sum + count, 0)
  const runs = `${live.name} runs ${live.version}`
  if (waiting === 0) return `${runs}, the same build as every other environment.`
  return `${runs}, with ${waiting} ${waiting === 1 ? 'commit' : 'commits'} waiting to reach it.`
}

const Deployments2 = (props: Deployments2Props) => {
  const { ahead = [], environments = [], now, errorMessage, status, title } = props
  const { description = summarize(environments, ahead) } = props
  const state = getBlockState(status, environments)

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        {state === 'loading' && (
          <div className='grid gap-x-6 gap-y-5 @xl:auto-cols-fr @xl:grid-flow-col'>
            <span className='sr-only'>Loading</span>
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                aria-hidden
                className='flex min-w-0 flex-col gap-1 border-t pt-3'
              >
                <span className='text-sm'>
                  <SkeletonText className='w-24' />
                </span>
                <span className='text-2xl'>
                  <SkeletonText className='w-28' />
                </span>
                <span className='text-xs'>
                  <SkeletonText className='w-32' />
                </span>
              </div>
            ))}
          </div>
        )}
        {(state === 'empty' || state === 'error') && (
          <div className='border-t pt-3'>
            <BlockStateText
              className='text-2xl font-light tracking-tight'
              variant='short'
            />
          </div>
        )}
        {!state && (
          <ol className='grid gap-x-6 gap-y-5 @xl:auto-cols-fr @xl:grid-flow-col'>
            {environments.map((environment, index) => {
              const next = environments[index + 1]
              const waiting = ahead[index] ?? 0
              return (
                <li
                  key={environment.id}
                  className='flex min-w-0 flex-col gap-1 border-t pt-3'
                >
                  <div className='flex items-baseline justify-between gap-2'>
                    <span className='text-muted-foreground text-sm'>
                      {environment.name}
                    </span>
                    <DeployStatusLabel status={environment.status} />
                  </div>
                  <span className='truncate text-2xl font-light tracking-tight tabular-nums'>
                    {environment.version}
                  </span>
                  <Details className='text-muted-foreground text-xs'>
                    <span className='font-mono'>{shortSha(environment.sha)}</span>
                    {environment.deployedBy}
                    <time dateTime={environment.deployedAt.toISOString()}>
                      {formatRelativeTime(environment.deployedAt, now, { style: 'long' })}
                    </time>
                  </Details>
                  {next && (
                    <p className='text-muted-foreground mt-2 text-sm'>
                      <span
                        className={
                          waiting > 0
                            ? 'text-foreground font-medium tabular-nums'
                            : 'tabular-nums'
                        }
                      >
                        {waiting} {waiting === 1 ? 'commit' : 'commits'}
                      </span>{' '}
                      ahead of {next.name}
                    </p>
                  )}
                </li>
              )
            })}
          </ol>
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  Deployments2,
  exampleProps as deployments2ExampleProps,
  type Deployments2Props,
  type Environment,
}
