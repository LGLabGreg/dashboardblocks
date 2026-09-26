'use client'

import {
  type DeployStatus,
  DeployStatusLabel,
  shortSha,
} from '@/registry/components/dashboardblocks/deployments'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Environment {
  deployedAt: Date
  deployedBy: string
  id: string
  name: string
  sha: string
  status: DeployStatus
  version: string
}

interface Deployments2Props {
  /** How many commits each environment is ahead of the next, in order. */
  ahead: number[]
  description: string
  /** In promotion order, e.g. development, staging, production. */
  environments: Environment[]
  /** Pass a fixed date, so the block renders the same on the server and in the browser. */
  now: Date
  title: string
}

const NOW = new Date(Date.UTC(2026, 8, 26, 15, 0))
const hoursAgo = (hours: number) => new Date(NOW.getTime() - hours * 3_600_000)

const exampleProps: Deployments2Props = {
  ahead: [4, 2],
  description: 'What each environment is running, and what is waiting to be promoted',
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

const relative = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })

function formatDeployed(date: Date, now: Date) {
  const minutes = Math.round((now.getTime() - date.getTime()) / 60_000)
  if (minutes < 60) return relative.format(-Math.max(1, minutes), 'minute')
  if (minutes < 60 * 24) return relative.format(-Math.round(minutes / 60), 'hour')
  return relative.format(-Math.round(minutes / 1_440), 'day')
}

const Deployments2 = (props: Deployments2Props) => {
  const { ahead, description, environments, now, title } = props

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className='flex flex-col gap-2 @xl:flex-row @xl:items-stretch'>
          {environments.map((environment, index) => (
            <li
              key={environment.id}
              className='flex flex-col gap-2 @xl:flex-1 @xl:flex-row @xl:items-center'
            >
              {index > 0 && (
                <div className='text-muted-foreground flex items-center gap-1.5 self-center text-xs @xl:flex-col @xl:gap-0.5 [&_svg]:size-4'>
                  <IconPlaceholder
                    lucide='ArrowRightIcon'
                    tabler='IconArrowRight'
                    hugeicons='ArrowRight01Icon'
                    phosphor='ArrowRightIcon'
                    remixicon='RiArrowRightLine'
                    aria-hidden
                    className='rotate-90 @xl:rotate-0'
                  />
                  <span className='tabular-nums whitespace-nowrap'>
                    {ahead[index - 1] ?? 0}{' '}
                    {(ahead[index - 1] ?? 0) === 1 ? 'commit' : 'commits'}
                    <span className='sr-only'>
                      {' '}
                      waiting to be promoted from {environments[index - 1].name}
                    </span>
                  </span>
                </div>
              )}
              <div className='flex flex-1 flex-col gap-2 rounded-lg border p-3'>
                <div className='flex items-center justify-between gap-2'>
                  <span className='text-sm font-medium'>{environment.name}</span>
                  <DeployStatusLabel showLabel={false} status={environment.status} />
                </div>
                <span className='font-mono text-lg font-semibold tracking-tight'>
                  {environment.version}
                </span>
                <span className='text-muted-foreground flex flex-col text-xs'>
                  <span className='font-mono'>{shortSha(environment.sha)}</span>
                  <span>
                    {environment.deployedBy},{' '}
                    <time dateTime={environment.deployedAt.toISOString()}>
                      {formatDeployed(environment.deployedAt, now)}
                    </time>
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

export {
  Deployments2,
  exampleProps as deployments2ExampleProps,
  type Deployments2Props,
  type Environment,
}
