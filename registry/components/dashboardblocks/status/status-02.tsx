'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { LogoTile } from '@/registry/components/dashboardblocks/brand-logos'
import { Details } from '@/registry/components/dashboardblocks/details'
import {
  type StatusLevel,
  StatusLegend,
  UptimeBar,
  type UptimeDay,
  formatUptime,
  getUptime,
  statusConfig,
} from '@/registry/components/dashboardblocks/status'
import { StatusLabel } from '@/registry/components/dashboardblocks/status-label'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import {
  formatDate,
  formatList,
  formatNumber,
} from '@/registry/lib/dashboardblocks/format'
import type { ReactNode } from 'react'

import { Card, CardContent } from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface ServiceUptime {
  /** Oldest first, today last. */
  days: UptimeDay[]
  /** A short line under the name, such as its regions or how many models it serves. */
  detail?: string
  /** The service's logo or icon, drawn in a tile beside its name. */
  icon?: ReactNode
  name: string
  /** Its status now, written under its name after `detail`. */
  status?: StatusLevel
}

interface Status2Props extends BlockStateProps {
  /** Sits right of the title, such as a link to every service. */
  action?: ReactNode
  /** Defaults to a sentence naming the services not running normally, or the one with the lowest uptime. */
  description?: ReactNode
  /** Leave out, or pass none, to show the empty state. */
  services?: ServiceUptime[]
  title: string
}

const PLACEHOLDER_SERVICES = 3

const END_DATE = Date.UTC(2026, 8, 25)
const DAY = 86_400_000

const exampleDays = (
  events: Record<number, Partial<Omit<UptimeDay, 'label'>>>,
): UptimeDay[] =>
  Array.from({ length: 90 }, (_, index) => {
    const daysAgo = 89 - index
    return {
      label: formatDate(new Date(END_DATE - daysAgo * DAY), 'date'),
      status: 'operational',
      uptime: 100,
      ...events[daysAgo],
    }
  })

const exampleProps: Status2Props = {
  services: [
    {
      days: exampleDays({
        12: {
          note: 'Slow page loads in EU for 25 min',
          status: 'degraded',
          uptime: 99.4,
        },
        47: {
          note: 'Scheduled database upgrade',
          status: 'maintenance',
          uptime: 100,
        },
      }),
      detail: '3 regions',
      icon: (
        <IconPlaceholder
          lucide='MonitorIcon'
          tabler='IconDeviceDesktop'
          hugeicons='ComputerIcon'
          phosphor='MonitorIcon'
          remixicon='RiComputerLine'
        />
      ),
      name: 'Web app',
      status: 'operational',
    },
    {
      days: exampleDays({
        0: {
          note: 'Slow responses in eu-west-1 for the last 40 min',
          status: 'degraded',
          uptime: 99.7,
        },
        3: {
          note: 'Elevated 5xx errors for 42 min',
          status: 'partial',
          uptime: 97.1,
        },
        4: { note: 'Increased latency', status: 'degraded', uptime: 99.6 },
        31: {
          note: 'Full outage for 1 h 6 min',
          status: 'major',
          uptime: 95.4,
        },
        66: { note: 'Increased latency', status: 'degraded', uptime: 99.8 },
      }),
      detail: '3 regions',
      icon: (
        <IconPlaceholder
          lucide='ServerIcon'
          tabler='IconServer'
          hugeicons='ServerStack01Icon'
          phosphor='HardDrivesIcon'
          remixicon='RiServerLine'
        />
      ),
      name: 'API',
      status: 'degraded',
    },
    {
      days: exampleDays({
        ...Object.fromEntries(
          Array.from({ length: 14 }, (_, index) => [
            76 + index,
            { status: 'unknown' as const },
          ]),
        ),
        20: {
          note: 'Delayed deliveries for 18 min',
          status: 'degraded',
          uptime: 99.7,
        },
      }),
      detail: '2 regions',
      icon: (
        <IconPlaceholder
          lucide='ZapIcon'
          tabler='IconBolt'
          hugeicons='FlashIcon'
          phosphor='LightningIcon'
          remixicon='RiFlashlightLine'
        />
      ),
      name: 'Webhooks',
      status: 'operational',
    },
  ],
  title: 'Uptime',
}

const summarize = (services: ServiceUptime[]) => {
  if (services.length === 0) return 'No services yet.'
  const troubled = services.flatMap(({ name, status }) =>
    status && status !== 'operational' && status !== 'unknown'
      ? [`${name} ${statusConfig[status].phrase}`]
      : [],
  )
  if (troubled.length > 0) {
    const running = services.length - troubled.length
    return `${formatNumber(running)} of ${formatNumber(services.length)} running normally. ${formatList(troubled)}.`
  }
  const rated = services.map((service) => ({
    days: service.days.length,
    name: service.name,
    uptime: getUptime(service.days),
  }))
  const lowest = rated.reduce((low, service) =>
    service.uptime < low.uptime ? service : low,
  )
  const period = `over the last ${lowest.days} days`
  if (lowest.uptime >= 100) return `Every service was up the whole time ${period}.`
  return `${lowest.name} had the lowest uptime ${period}, at ${formatUptime(lowest.uptime)}.`
}

const ROWS =
  'grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 @lg:grid-cols-[minmax(0,12rem)_minmax(0,1fr)_3.75rem] @lg:gap-x-5'
const ROW = 'col-span-full grid grid-cols-subgrid items-center gap-y-2.5'
const BAR = 'col-span-full row-start-2 @lg:col-span-1 @lg:row-start-auto'

function ServiceName({ service }: { service: ServiceUptime }) {
  const status = service.status && statusConfig[service.status]
  return (
    <span className='flex min-w-0 items-center gap-3'>
      {service.icon && <LogoTile logo={service.icon} />}
      <span className='flex min-w-0 flex-col'>
        <span className='truncate text-sm font-medium'>{service.name}</span>
        {(service.detail || status) && (
          <Details className='text-muted-foreground truncate text-xs'>
            {service.detail}
            {status && (
              <StatusLabel className='text-xs' tone={status.tone} variant='text'>
                {status.shortLabel}
              </StatusLabel>
            )}
          </Details>
        )}
      </span>
    </span>
  )
}

const Status2 = (props: Status2Props) => {
  const { action, services = [], errorMessage, status, title } = props
  const { description = summarize(services) } = props
  const state = getBlockState(status, services)

  return (
    <Card>
      <CardContent>
        <BlockStateProvider errorMessage={errorMessage} state={state}>
          <section className='@container flex flex-col gap-4'>
            <header className='flex items-start justify-between gap-3'>
              <div className='flex min-w-0 flex-col gap-0.5'>
                <h2 className='font-semibold tracking-tight'>{title}</h2>
                <BlockReady className='text-sm'>
                  <p className='text-muted-foreground text-sm text-pretty'>
                    {description}
                  </p>
                </BlockReady>
              </div>
              {action && <div className='shrink-0'>{action}</div>}
            </header>
            {state === 'loading' && (
              <ul aria-hidden className={ROWS}>
                {Array.from({ length: PLACEHOLDER_SERVICES }, (_, index) => (
                  <li key={index} className={cn(ROW, 'border-t py-3')}>
                    <SkeletonText className='w-28 text-sm' />
                    <UptimeBar className={BAR} days={[]} label='' />
                    <SkeletonText className='w-12 justify-self-end text-sm' />
                  </li>
                ))}
              </ul>
            )}
            {(state === 'error' || state === 'empty') && (
              <div className='border-t'>
                <BlockStateRows />
              </div>
            )}
            {!state && (
              <ul className={ROWS}>
                {services.map((service) => (
                  <li key={service.name} className={cn(ROW, 'border-t py-3')}>
                    <ServiceName service={service} />
                    <UptimeBar className={BAR} days={service.days} label={service.name} />
                    <span className='text-right text-sm font-medium tabular-nums'>
                      {formatUptime(getUptime(service.days))}
                      <span className='sr-only'> uptime</span>
                    </span>
                  </li>
                ))}
                <li aria-hidden className={cn(ROW, 'text-muted-foreground pt-1 text-xs')}>
                  <span className='col-span-full flex justify-between @lg:col-span-1 @lg:col-start-2'>
                    <span>{services[0]?.days.length ?? 0} days ago</span>
                    <span>Today</span>
                  </span>
                </li>
              </ul>
            )}
            {state !== 'error' && state !== 'empty' && (
              <StatusLegend
                statuses={['operational', 'degraded', 'partial', 'major', 'maintenance']}
              />
            )}
          </section>
        </BlockStateProvider>
      </CardContent>
    </Card>
  )
}

export {
  Status2,
  exampleProps as status2ExampleProps,
  type ServiceUptime,
  type Status2Props,
}
