'use client'

import {
  Alerts1,
  type Alerts1Props,
} from '@/registry/components/dashboardblocks/alerts/alerts-01'
import { BlockBusy } from '@/registry/components/dashboardblocks/block-state'
import { ChartPanel6 } from '@/registry/components/dashboardblocks/chart-panel/chart-panel-06'
import {
  type DateRangePreset,
  DateRangePicker,
  ExportMenu,
  FilterChip,
  FilterMenu,
  formatDateRange,
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
import { useEffect, useState } from 'react'

/*
 * A DevOps dashboard: the service filter scopes every block but live
 * throughput, which covers all services. The date range scopes delivery
 * performance and response times. Uptime covers the last 90 days, and alerts,
 * builds and deployments are as of now, so the date range doesn't apply to
 * them. Swap `buildOpsData` for your own queries.
 */

interface Dashboard5Props {
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
/** Alerts and deployments are measured back from 3pm today. */
const NOW_HOURS = 15

/**
 * Each service's share of requests, response time percentiles in ms, and
 * delivery: deploys a day, lead time and time to restore in hours, and the
 * share of deploys that fail.
 */
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

/** Incidents in the last 90 days. They show on the uptime bars and slow responses that day. */
const INCIDENTS: {
  daysAgo: number
  note: string
  service: string
  slowdown: number
  status: StatusLevel
  uptime: number
}[] = [
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

/** Open alerts, newest first, in minutes before 3pm today. */
const ALERTS: (Omit<Alerts1Props['alerts'][number], 'firedAt'> & {
  minutesAgo: number
  service: string
})[] = [
  {
    id: 'a1',
    minutesAgo: 4,
    service: 'API',
    severity: 'critical',
    source: 'api · eu-west-1',
    title: 'Error rate above 5% for 10 minutes',
  },
  {
    id: 'a2',
    minutesAgo: 18,
    service: 'Payments',
    severity: 'critical',
    source: 'payments-worker',
    title: 'Queue backlog over 10,000 jobs',
  },
  {
    id: 'a3',
    minutesAgo: 52,
    service: 'Web app',
    severity: 'warning',
    source: 'web · us-east-1',
    title: 'p95 response time above 800 ms',
  },
  {
    acknowledged: true,
    id: 'a4',
    minutesAgo: 135,
    service: 'API',
    severity: 'warning',
    source: 'postgres-primary',
    title: 'Disk usage above 80%',
  },
  {
    id: 'a5',
    minutesAgo: 210,
    service: 'Webhooks',
    severity: 'warning',
    source: 'webhooks · retries',
    title: 'Retry queue growing for 30 minutes',
  },
  {
    id: 'a6',
    minutesAgo: 310,
    service: 'Payments',
    severity: 'info',
    source: 'billing-cron',
    title: 'Nightly invoice run took 2× longer than usual',
  },
]

/** The last 30 runs of each pipeline, oldest first: s passed, f failed, r running. */
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
    runs: 'sssssssssfsssssssssssssssssssr',
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
    runs: 'ssssssssssssssssssssssssssssss',
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

/** Recent deployments, newest first, in minutes before 3pm today. */
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

const ms = (value: number) => `${Math.round(value)} ms`

/** Weights each service by its share of requests, so the mix adds up to one. */
function weigh(services: Service[], value: (service: Service) => number) {
  const total = services.reduce((sum, service) => sum + service.share, 0)
  return (
    services.reduce((sum, service) => sum + service.share * value(service), 0) / total
  )
}

/**
 * A service's percentile on the day `daysAgo`, or at `hour` of it. Traffic
 * peaks in the afternoon and incidents slow responses down.
 */
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
  // Responses got a little faster over the last quarter.
  const drift = 1 + daysAgo * 0.0012
  return service.latency[percentile] * load * drift * (incident?.slowdown ?? 1)
}

/** A service's delivery on the day `daysAgo`. Weekends see fewer deploys. */
function deliveryAt(service: Service, daysAgo: number, today: Date) {
  const weekday = new Date(today.getTime() - daysAgo * DAY).getUTCDay()
  const weekend = weekday === 0 || weekday === 6
  const wobble = Math.sin(daysAgo / 6 + service.share * 7)
  // Delivery improved over time, so older days are a little slower.
  const drift = 1 + daysAgo * 0.004
  const deploys = service.deploysPerDay * (weekend ? 0.2 : 1.32) * (1 + wobble * 0.15)
  return {
    changeFailureRate: service.changeFailureRate * (1 + wobble * 0.2) * drift,
    deploys,
    leadTimeHours: service.leadTimeHours * (1 - wobble * 0.1) * drift,
    restoreHours: service.restoreHours * (1 + wobble * 0.25) * drift,
  }
}

/** The four DORA metrics over `days` days, ending `shift` days ago. */
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

/** Ninety days of status for one service, oldest first. */
function uptimeDays(service: string, today: Date): UptimeDay[] {
  return Array.from({ length: 90 }, (_, index) => {
    const daysAgo = 89 - index
    const incident = INCIDENTS.find(
      (item) => item.service === service && item.daysAgo === daysAgo,
    )
    return {
      label: new Date(today.getTime() - daysAgo * DAY).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        timeZone: 'UTC',
        year: 'numeric',
      }),
      note: incident?.note,
      status: incident?.status ?? 'operational',
      uptime: incident?.uptime ?? 100,
    }
  })
}

/** Everything the blocks show for one query. Replace with your own data fetching. */
function buildOpsData({ preset, service }: Query, today: Date) {
  const hourly = preset === 'today'
  const days = getPreset(preset).days
  const range = getDateRange(preset, today)
  const previousRange = getPreviousRange(range)
  const services = service ? SERVICES.filter((item) => item.name === service) : SERVICES
  const serviceLabel = service ? `, ${service}` : ', all services'
  const scope = `${hourly ? 'Today' : formatDateRange(range)}${serviceLabel}`

  const point = (daysAgo: number, hour?: number) => ({
    p50: Math.round(weigh(services, (item) => latencyAt(item, 'p50', daysAgo, hour))),
    p95: Math.round(weigh(services, (item) => latencyAt(item, 'p95', daysAgo, hour))),
    p99: Math.round(weigh(services, (item) => latencyAt(item, 'p99', daysAgo, hour))),
  })
  const latency = hourly
    ? Array.from({ length: 24 }, (_, hour) => ({
        label: `${String(hour).padStart(2, '0')}:00`,
        ...point(0, hour),
      }))
    : Array.from({ length: days }, (_, index) => {
        const daysAgo = days - 1 - index
        return {
          label: new Date(today.getTime() - daysAgo * DAY).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            timeZone: 'UTC',
          }),
          ...point(daysAgo),
        }
      })
  const meanP95 = (from: number) =>
    Array.from({ length: days }, (_, index) => point(from + index).p95).reduce(
      (sum, value) => sum + value,
      0,
    ) / days
  const latencyTrend = hourly
    ? ((point(0).p95 - point(1).p95) / point(1).p95) * 100
    : ((meanP95(0) - meanP95(days)) / meanP95(days)) * 100

  const now = new Date(today.getTime() + NOW_HOURS * HOUR)
  const matches = (item: { service: string }) => !service || item.service === service

  return {
    alerts: ALERTS.filter(matches)
      .slice(0, 4)
      .map(({ minutesAgo, service: _service, ...alert }) => ({
        ...alert,
        firedAt: new Date(now.getTime() - minutesAgo * MINUTE),
      })),
    deployments: DEPLOYMENTS.filter(matches)
      .slice(0, 6)
      .map(({ environment, minutesAgo, service: name, ...deployment }) => ({
        ...deployment,
        environment: service ? environment : `${name} · ${environment}`,
        startedAt: new Date(now.getTime() - minutesAgo * MINUTE),
      })),
    dora: {
      current: doraFor(services, days, 0, today),
      previous: doraFor(services, days, days, today),
    },
    latency,
    latencyTrend: Number(latencyTrend.toFixed(1)),
    now,
    pipelines: PIPELINES.filter(matches).map((pipeline) => ({
      medianDuration: pipeline.medianDuration,
      name: pipeline.name,
      runs: pipeline.runs.split('').map((run) => RUN_STATUS[run]),
    })),
    previousLabel: hourly ? 'yesterday' : formatDateRange(previousRange),
    scope,
    serviceLabel,
    uptime: services.map((item) => ({
      days: uptimeDays(item.name, today),
      name: item.name,
    })),
  }
}

/**
 * Throughput for the last 5 minutes, one sample every 5 seconds, on the same
 * scale as the block's simulated samples. Live, so it isn't filtered.
 */
const THROUGHPUT = Array.from({ length: 60 }, (_, index) => {
  const wave = index % 28 < 14 ? index % 14 : 14 - (index % 14)
  const requests = 780 + wave * 16 + ((index * 37) % 11) * 9
  return { errors: Math.round(requests * (index % 17 === 5 ? 0.021 : 0.0018)), requests }
})

const Dashboard5 = (props: Dashboard5Props) => {
  const { title, today } = props
  const [query, setQuery] = useState<Query>({ preset: '30d', service: null })
  // The query the blocks currently show. It lags behind while "fetching",
  // and the blocks stay in place, dimmed, until the new data arrives.
  const [shown, setShown] = useState(query)
  const busy = shown !== query

  useEffect(() => {
    if (shown === query) return
    const timer = setTimeout(() => setShown(query), 500)
    return () => clearTimeout(timer)
  }, [query, shown])

  const update = (patch: Partial<Query>) =>
    setQuery((current) => ({ ...current, ...patch }))
  const data = buildOpsData(shown, today)
  const range = getDateRange(query.preset, today)

  return (
    <div className='@container flex w-full flex-col gap-6'>
      <header className='flex flex-col gap-4'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h1 className='text-2xl font-semibold tracking-tight'>{title}</h1>
            <p className='text-muted-foreground text-sm' aria-live='polite'>
              {formatDateRange(range)} vs {formatDateRange(getPreviousRange(range))}
              {query.service && ` · ${query.service}`}
            </p>
          </div>
          <ExportMenu onExport={() => {}} />
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <DateRangePicker
            onValueChange={(preset) => update({ preset })}
            today={today}
            value={query.preset}
          />
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
          {query.service && (
            <FilterChip
              field='Service'
              value={query.service}
              onRemove={() => update({ service: null })}
            />
          )}
        </div>
      </header>
      <Realtime2
        description='Requests per second across all services, last 5 minutes'
        samples={THROUGHPUT}
        simulate
        title='Throughput'
      />
      <BlockBusy
        busy={busy}
        label='Updating the dashboard'
        className='grid gap-4 @4xl:grid-cols-3'
      >
        <div className='@4xl:col-span-3'>
          <Deployments3
            current={data.dora.current}
            description={`${data.scope}, compared with ${data.previousLabel}`}
            previous={data.dora.previous}
            title='Delivery performance'
          />
        </div>
        <div className='@4xl:col-span-2'>
          <ChartPanel6
            data={data.latency}
            description={`Response time percentiles, ${data.scope}`}
            formatter={ms}
            headline='p95'
            percentiles={[
              { key: 'p50', label: 'p50' },
              { key: 'p95', label: 'p95' },
              { key: 'p99', label: 'p99' },
            ]}
            title='Response time'
            trend={data.latencyTrend}
          />
        </div>
        <Deployments4
          description={`The last 30 runs of each pipeline, oldest on the left${data.serviceLabel}`}
          pipelines={data.pipelines}
          title='Build health'
        />
        <div className='@4xl:col-span-2'>
          <Status2
            description={`Daily status over the last 90 days${data.serviceLabel}`}
            services={data.uptime}
            title='Uptime'
          />
        </div>
        {/* Keyed by service, so acknowledged alerts reset with the filter. */}
        <Alerts1
          key={shown.service ?? 'all'}
          alerts={data.alerts}
          now={data.now}
          title='Open alerts'
        />
        <div className='@4xl:col-span-3'>
          <Deployments1
            deployments={data.deployments}
            description={`Latest deploys to every environment${data.serviceLabel}`}
            now={data.now}
            title='Recent deployments'
          />
        </div>
      </BlockBusy>
    </div>
  )
}

export { Dashboard5, exampleProps as dashboard5ExampleProps, type Dashboard5Props }
