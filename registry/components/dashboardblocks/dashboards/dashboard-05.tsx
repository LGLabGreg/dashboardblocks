'use client'

import {
  Alerts1,
  type Alerts1Props,
} from '@/registry/components/dashboardblocks/alerts/alerts-01'
import {
  BlockBusy,
  BlockStateProvider,
  type BlockStatus,
} from '@/registry/components/dashboardblocks/block-state'
import { ChartPanel6 } from '@/registry/components/dashboardblocks/chart-panel/chart-panel-06'
import {
  type DateRangePreset,
  DateRangePicker,
  ExportMenu,
  FilterChip,
  FilterMenu,
  getDateRange,
  getPreset,
  getPreviousRange,
} from '@/registry/components/dashboardblocks/dashboard-header'
import type { DeployStatus } from '@/registry/components/dashboardblocks/deployments'
import {
  type Deployment,
  Deployments1,
} from '@/registry/components/dashboardblocks/deployments/deployments-01'
import { Deployments3 } from '@/registry/components/dashboardblocks/deployments/deployments-03'
import { Deployments4 } from '@/registry/components/dashboardblocks/deployments/deployments-04'
import { Realtime2 } from '@/registry/components/dashboardblocks/realtime/realtime-02'
import type { StatusLevel, UptimeDay } from '@/registry/components/dashboardblocks/status'
import { Status2 } from '@/registry/components/dashboardblocks/status/status-02'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import {
  formatDate,
  formatDateRange,
  formatNumber,
} from '@/registry/lib/dashboardblocks/format'
import { useEffect, useState } from 'react'

interface Dashboard5Props {
  empty?: boolean
  status?: BlockStatus
  title: string
  /** The last day of every date range. */
  today: Date
}

const exampleProps: Dashboard5Props = {
  title: 'Platform health',
  today: new Date(Date.UTC(2026, 8, 25)),
}

const DAY = 86_400_000
const HOUR = 3_600_000
const MINUTE = 60_000
const NOW_HOURS = 15

const SERVICES = [
  {
    changeFailureRate: 0.06,
    deploysPerDay: 4.2,
    latency: { p50: 48, p95: 128, p99: 246 },
    leadTimeHours: 14,
    name: 'Web app',
    restoreHours: 1.2,
    share: 0.45,
  },
  {
    changeFailureRate: 0.09,
    deploysPerDay: 2.8,
    latency: { p50: 64, p95: 152, p99: 310 },
    leadTimeHours: 22,
    name: 'API',
    restoreHours: 2.1,
    share: 0.35,
  },
  {
    changeFailureRate: 0.04,
    deploysPerDay: 0.6,
    latency: { p50: 96, p95: 262, p99: 488 },
    leadTimeHours: 46,
    name: 'Payments',
    restoreHours: 3.4,
    share: 0.08,
  },
  {
    changeFailureRate: 0.12,
    deploysPerDay: 1.1,
    latency: { p50: 38, p95: 112, p99: 214 },
    leadTimeHours: 30,
    name: 'Webhooks',
    restoreHours: 0.8,
    share: 0.12,
  },
]

type Service = (typeof SERVICES)[number]
type Percentile = keyof Service['latency']

const INCIDENTS: {
  daysAgo: number
  note: string
  service: string
  slowdown: number
  status: StatusLevel
  uptime: number
}[] = [
  {
    daysAgo: 0,
    note: 'Elevated error rate in eu-west-1',
    service: 'API',
    slowdown: 1.15,
    status: 'partial',
    uptime: 99.2,
  },
  {
    daysAgo: 0,
    note: 'Slow responses in us-east-1',
    service: 'Web app',
    slowdown: 2.2,
    status: 'degraded',
    uptime: 99.8,
  },
  {
    daysAgo: 3,
    note: 'Elevated 5xx errors for 42 min',
    service: 'API',
    slowdown: 1.9,
    status: 'partial',
    uptime: 97.1,
  },
  {
    daysAgo: 4,
    note: 'Increased latency',
    service: 'API',
    slowdown: 1.3,
    status: 'degraded',
    uptime: 99.6,
  },
  {
    daysAgo: 12,
    note: 'Slow page loads in EU for 25 min',
    service: 'Web app',
    slowdown: 1.4,
    status: 'degraded',
    uptime: 99.4,
  },
  {
    daysAgo: 20,
    note: 'Delayed deliveries for 18 min',
    service: 'Webhooks',
    slowdown: 1.5,
    status: 'degraded',
    uptime: 99.7,
  },
  {
    daysAgo: 31,
    note: 'Full outage for 1 h 6 min',
    service: 'API',
    slowdown: 2.4,
    status: 'major',
    uptime: 95.4,
  },
  {
    daysAgo: 38,
    note: 'Card processor timeouts for 31 min',
    service: 'Payments',
    slowdown: 2.1,
    status: 'partial',
    uptime: 97.9,
  },
  {
    daysAgo: 47,
    note: 'Scheduled database upgrade',
    service: 'Web app',
    slowdown: 1,
    status: 'maintenance',
    uptime: 100,
  },
  {
    daysAgo: 66,
    note: 'Increased latency',
    service: 'API',
    slowdown: 1.3,
    status: 'degraded',
    uptime: 99.8,
  },
]

const ALERTS: (Omit<NonNullable<Alerts1Props['alerts']>[number], 'firedAt'> & {
  minutesAgo: number
})[] = [
  {
    id: 'a1',
    minutesAgo: 4,
    service: 'API',
    region: 'eu-west-1',
    severity: 'critical',
    title: 'Error rate above 5% for 10 minutes',
  },
  {
    id: 'a2',
    minutesAgo: 18,
    service: 'Payments',
    severity: 'critical',
    title: 'Queue backlog over 10,000 jobs',
  },
  {
    id: 'a3',
    minutesAgo: 52,
    service: 'Web app',
    region: 'us-east-1',
    severity: 'warning',
    title: 'p95 response time above 250 ms',
  },
  {
    acknowledged: true,
    id: 'a4',
    minutesAgo: 135,
    service: 'API',
    severity: 'warning',
    title: 'Disk usage above 80%',
  },
  {
    id: 'a5',
    minutesAgo: 210,
    service: 'Webhooks',
    severity: 'warning',
    title: 'Retry queue growing for 30 minutes',
  },
  {
    id: 'a6',
    minutesAgo: 310,
    service: 'Payments',
    severity: 'info',
    title: 'Nightly invoice run took 2× longer than usual',
  },
]

const PIPELINES = [
  {
    medianDuration: 412,
    name: 'web-app',
    runs: 'sssssfsssssssssssssfssssssssss',
    service: 'Web app',
  },
  {
    medianDuration: 2_904,
    name: 'web-e2e',
    runs: 'ssfssffsssfsssssffssssfsssfsss',
    service: 'Web app',
  },
  {
    medianDuration: 538,
    name: 'api',
    runs: 'sssssssssfssssssssssssssssssss',
    service: 'API',
  },
  {
    medianDuration: 1_126,
    name: 'api-e2e',
    runs: 'ssssssssssssssssssffssssssssss',
    service: 'API',
  },
  {
    medianDuration: 1_386,
    name: 'payments',
    runs: 'sssssssssssssssssssssssssssssr',
    service: 'Payments',
  },
  {
    medianDuration: 244,
    name: 'webhooks',
    runs: 'sssfssssssssssfssssssssssfssss',
    service: 'Webhooks',
  },
]

const RUN_STATUS: Record<string, DeployStatus> = {
  f: 'failed',
  r: 'running',
  s: 'success',
}

const DEPLOYMENTS: (Omit<Deployment, 'environment' | 'startedAt'> & {
  environment: string
  minutesAgo: number
  service: string
})[] = [
  {
    author: 'Ana Lima',
    duration: 94,
    environment: 'Production',
    id: 'd1',
    message: 'Fix currency rounding on invoices',
    minutesAgo: 2,
    service: 'Payments',
    sha: '9f3c2a17b',
    status: 'running',
  },
  {
    author: 'Kenji Mori',
    duration: 187,
    environment: 'Production',
    id: 'd2',
    message: 'Add retry to webhook delivery',
    minutesAgo: 38,
    service: 'Webhooks',
    sha: '41be08d3c',
    status: 'success',
  },
  {
    author: 'Sara Okafor',
    duration: 66,
    environment: 'Production',
    id: 'd3',
    message: 'Upgrade image pipeline',
    minutesAgo: 95,
    service: 'Web app',
    sha: 'c07d9e412',
    status: 'rolled-back',
  },
  {
    author: 'Diego Alvarez',
    duration: 241,
    environment: 'Staging',
    id: 'd4',
    message: 'Paginate the audit log endpoint',
    minutesAgo: 130,
    service: 'API',
    sha: '7a21f0c95',
    status: 'failed',
  },
  {
    author: 'Sara Okafor',
    duration: 143,
    environment: 'Production',
    id: 'd5',
    message: 'Cache pricing page for 60 seconds',
    minutesAgo: 205,
    service: 'Web app',
    sha: 'e5d8b3a01',
    status: 'success',
  },
  {
    author: 'Mei Tanaka',
    duration: 198,
    environment: 'Production',
    id: 'd6',
    message: 'Rate limit token refresh',
    minutesAgo: 280,
    service: 'API',
    sha: '3c9e17d44',
    status: 'success',
  },
  {
    author: 'Kenji Mori',
    duration: 172,
    environment: 'Staging',
    id: 'd7',
    message: 'Sign webhook payloads with rotating keys',
    minutesAgo: 410,
    service: 'Webhooks',
    sha: 'b82f6e0d7',
    status: 'success',
  },
  {
    author: 'Ana Lima',
    duration: 305,
    environment: 'Production',
    id: 'd8',
    message: 'Retry declined cards once after 3DS',
    minutesAgo: 1_520,
    service: 'Payments',
    sha: '5e0a93c62',
    status: 'success',
  },
]

interface Query {
  preset: DateRangePreset
  service: string | null
}

const LATENCY_SLO_MS = 200

const ms = (value: number) => `${formatNumber(value, { maximumFractionDigits: 0 })} ms`

function weigh(services: Service[], value: (service: Service) => number) {
  const total = services.reduce((sum, service) => sum + service.share, 0)
  return (
    services.reduce((sum, service) => sum + service.share * value(service), 0) / total
  )
}

function latencyAt(
  service: Service,
  percentile: Percentile,
  daysAgo: number,
  hour?: number,
) {
  const incident = INCIDENTS.find(
    (item) => item.service === service.name && item.daysAgo === daysAgo,
  )
  const load =
    hour === undefined
      ? 1 + Math.sin(daysAgo / 4 + service.share * 10) * 0.07
      : 0.82 + Math.sin(((hour - 8) / 24) * Math.PI * 2) * 0.18
  const drift = 1 + daysAgo * 0.0012
  return service.latency[percentile] * load * drift * (incident?.slowdown ?? 1)
}

function deliveryAt(service: Service, daysAgo: number, today: Date) {
  const weekday = new Date(today.getTime() - daysAgo * DAY).getUTCDay()
  const weekend = weekday === 0 || weekday === 6
  const wobble = Math.sin(daysAgo / 6 + service.share * 7)
  const drift = 1 + daysAgo * 0.004
  const deploys = service.deploysPerDay * (weekend ? 0.2 : 1.32) * (1 + wobble * 0.15)
  return {
    changeFailureRate: service.changeFailureRate * (1 + wobble * 0.2) * drift,
    deploys,
    leadTimeHours: service.leadTimeHours * (1 - wobble * 0.1) * drift,
    restoreHours: service.restoreHours * (1 + wobble * 0.25) * drift,
  }
}

function doraFor(services: Service[], days: number, shift: number, today: Date) {
  let deploys = 0
  let failures = 0
  let leadTime = 0
  let restore = 0
  for (const service of services) {
    for (let daysAgo = shift; daysAgo < shift + days; daysAgo++) {
      const day = deliveryAt(service, daysAgo, today)
      deploys += day.deploys
      failures += day.deploys * day.changeFailureRate
      leadTime += day.deploys * day.leadTimeHours
      restore += day.deploys * day.changeFailureRate * day.restoreHours
    }
  }
  return {
    changeFailureRate: failures / deploys,
    deploysPerDay: deploys / days,
    leadTimeHours: leadTime / deploys,
    restoreHours: restore / failures,
  }
}

function uptimeDays(service: string, today: Date): UptimeDay[] {
  return Array.from({ length: 90 }, (_, index) => {
    const daysAgo = 89 - index
    const incident = INCIDENTS.find(
      (item) => item.service === service && item.daysAgo === daysAgo,
    )
    return {
      label: formatDate(new Date(today.getTime() - daysAgo * DAY), 'date'),
      note: incident?.note,
      status: incident?.status ?? 'operational',
      uptime: incident?.uptime ?? 100,
    }
  })
}

function buildOpsData({ preset, service }: Query, today: Date) {
  const hourly = preset === 'today'
  const days = getPreset(preset).days
  const range = getDateRange(preset, today)
  const previousRange = getPreviousRange(range)
  const services = service ? SERVICES.filter((item) => item.name === service) : SERVICES

  const point = (daysAgo: number, hour?: number) => ({
    p50: Math.round(weigh(services, (item) => latencyAt(item, 'p50', daysAgo, hour))),
    p95: Math.round(weigh(services, (item) => latencyAt(item, 'p95', daysAgo, hour))),
    p99: Math.round(weigh(services, (item) => latencyAt(item, 'p99', daysAgo, hour))),
  })
  const latency = hourly
    ? Array.from({ length: NOW_HOURS + 1 }, (_, hour) => ({
        label: `${String(hour).padStart(2, '0')}:00`,
        ...point(0, hour),
      }))
    : Array.from({ length: days }, (_, index) => {
        const daysAgo = days - 1 - index
        return {
          label: formatDate(new Date(today.getTime() - daysAgo * DAY), 'day'),
          ...point(daysAgo),
        }
      })
  const latencyPrevious = hourly ? point(1, NOW_HOURS).p95 : point(1).p95

  const now = new Date(today.getTime() + NOW_HOURS * HOUR)
  const matches = (item: { service: string }) => !service || item.service === service

  return {
    alerts: ALERTS.filter(matches).map(({ minutesAgo, ...alert }) => ({
      ...alert,
      firedAt: new Date(now.getTime() - minutesAgo * MINUTE),
    })),
    deployments: DEPLOYMENTS.filter(matches)
      .slice(0, 6)
      .map(({ environment, minutesAgo, service: name, ...deployment }) => ({
        ...deployment,
        environment: service ? environment : `${name} ${environment.toLowerCase()}`,
        startedAt: new Date(now.getTime() - minutesAgo * MINUTE),
      })),
    dora: {
      current: doraFor(services, days, 0, today),
      previous: doraFor(services, days, days, today),
    },
    latency,
    latencyPrevious,
    now,
    pipelines: PIPELINES.filter(matches).map((pipeline) => ({
      medianDuration: pipeline.medianDuration,
      name: pipeline.name,
      runs: pipeline.runs.split('').map((run) => RUN_STATUS[run]),
    })),
    previousLabel: hourly ? 'yesterday' : formatDateRange(previousRange),
    uptime: services.map((item) => ({
      days: uptimeDays(item.name, today),
      name: item.name,
    })),
  }
}

const THROUGHPUT = Array.from({ length: 60 }, (_, index) => {
  const wave = index % 28 < 14 ? index % 14 : 14 - (index % 14)
  const requests = 780 + wave * 16 + ((index * 37) % 11) * 9
  return { errors: Math.round(requests * (index % 17 === 5 ? 0.021 : 0.0018)), requests }
})

const Dashboard5 = (props: Dashboard5Props) => {
  const { empty = false, status, title, today } = props
  const [query, setQuery] = useState<Query>({ preset: '30d', service: null })
  const [displayedQuery, setDisplayedQuery] = useState(query)
  const busy = displayedQuery !== query

  useEffect(() => {
    if (displayedQuery === query) return
    const timer = setTimeout(() => setDisplayedQuery(query), 500)
    return () => clearTimeout(timer)
  }, [query, displayedQuery])

  const update = (patch: Partial<Query>) =>
    setQuery((current) => ({ ...current, ...patch }))
  const data = buildOpsData(displayedQuery, today)
  const range = getDateRange(query.preset, today)

  return (
    <BlockStateProvider state={status ?? (empty ? 'empty' : undefined)}>
      <div className='@container flex w-full flex-col gap-8'>
        <header className='flex flex-col gap-3'>
          <div className='flex flex-col gap-2'>
            <div className='flex flex-wrap items-start justify-between gap-3'>
              <h1 className='min-w-0 text-2xl font-semibold tracking-tight'>{title}</h1>
              <ExportMenu disabled={status !== undefined || empty} onExport={() => {}} />
            </div>
            <p className='text-muted-foreground leading-relaxed'>
              Showing{' '}
              <DateRangePicker
                onValueChange={(preset) => update({ preset })}
                today={today}
                value={query.preset}
                variant='inline'
              />
              <span aria-live='polite'>
                , {formatDateRange(range)}, compared with{' '}
                {formatDateRange(getPreviousRange(range))}.
              </span>
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            {query.service && (
              <FilterChip
                field='Service'
                value={query.service}
                onRemove={() => update({ service: null })}
              />
            )}
            <FilterMenu
              allLabel='All services'
              label='Service'
              onValueChange={(service) => update({ service })}
              options={SERVICES.map((item) => item.name)}
              value={query.service}
            >
              <IconPlaceholder
                lucide='ServerIcon'
                tabler='IconServer'
                hugeicons='ServerStack01Icon'
                phosphor='HardDrivesIcon'
                remixicon='RiServerLine'
              />
              {query.service ? 'Change service' : 'Filter by service'}
            </FilterMenu>
          </div>
        </header>
        <Realtime2
          status={status}
          description='Requests per second across every service, over the last 5 minutes.'
          samples={empty ? [] : THROUGHPUT}
          simulate
          title='Throughput'
        />
        <BlockBusy
          busy={busy}
          label='Updating the dashboard'
          className='mt-4 grid gap-x-8 gap-y-12 @4xl:grid-cols-3'
        >
          <div className='@4xl:col-span-3'>
            <Deployments3
              status={status}
              comparison={
                displayedQuery.preset === 'today'
                  ? 'yesterday'
                  : `in the ${getPreset(displayedQuery.preset).days} days before`
              }
              current={empty ? undefined : data.dora.current}
              previous={empty ? undefined : data.dora.previous}
              title='Delivery performance'
            />
          </div>
          <div className='@4xl:col-span-2'>
            <ChartPanel6
              status={status}
              comparison={
                displayedQuery.preset === 'today'
                  ? 'this time yesterday'
                  : 'the day before'
              }
              data={empty ? [] : data.latency}
              description='Half of all requests finish within p50, and all but the slowest 1% within p99.'
              formatter={ms}
              headline='p95'
              labelHeading={displayedQuery.preset === 'today' ? 'Hour' : 'Day'}
              limit={{ label: 'SLO', value: LATENCY_SLO_MS }}
              percentiles={[
                { key: 'p50', label: 'p50' },
                { key: 'p95', label: 'p95' },
                { key: 'p99', label: 'p99' },
              ]}
              previous={empty ? undefined : data.latencyPrevious}
              title='Response time'
            />
          </div>
          <Alerts1
            status={status}
            alerts={empty ? [] : data.alerts}
            now={data.now}
            title='Open alerts'
          />
          <div className='@4xl:col-span-2'>
            <Status2
              status={status}
              services={empty ? [] : data.uptime}
              title='Uptime, last 90 days'
            />
          </div>
          <Deployments4
            status={status}
            pipelines={empty ? [] : data.pipelines}
            title='Build health'
          />
          <div className='@4xl:col-span-3'>
            <Deployments1
              status={status}
              deployments={empty ? [] : data.deployments}
              now={data.now}
              title='Recent deployments'
            />
          </div>
        </BlockBusy>
      </div>
    </BlockStateProvider>
  )
}

export { Dashboard5, exampleProps as dashboard5ExampleProps, type Dashboard5Props }
