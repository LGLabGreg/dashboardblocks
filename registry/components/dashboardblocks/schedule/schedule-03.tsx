'use client'

import {
  UrgencyBadge,
  formatCountdown,
  formatDay,
  getDay,
  getDayOffset,
  getUrgency,
  urgencyConfig,
} from '@/registry/components/dashboardblocks/schedule'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface Deadline {
  /** The date it's due, renews or expires. */
  due: Date
  id: string
  /** E.g. "Contract renewal" or "$12,480 / year". */
  detail?: string
  title: string
}

interface Schedule3Props {
  deadlines: Deadline[]
  /** The time countdowns are measured from. */
  now: Date
  /** Days ahead that count as due soon. @default 7 */
  soonDays?: number
  /** @default 'UTC' */
  timeZone?: string
  title: string
}

const NOW = Date.UTC(2026, 8, 28, 9, 40)
const inDays = (days: number) => new Date(NOW + days * 86_400_000)

const exampleProps: Schedule3Props = {
  deadlines: [
    {
      detail: 'Invoice INV-2291 · $4,200',
      due: inDays(-2),
      id: 'd1',
      title: 'Payment to Cloudline Hosting',
    },
    {
      detail: 'Certificate · api.example.com',
      due: inDays(0),
      id: 'd2',
      title: 'TLS certificate expires',
    },
    {
      detail: 'Contract renewal · $12,480 / year',
      due: inDays(3),
      id: 'd3',
      title: 'Figma Organization',
    },
    {
      detail: 'Quarterly filing',
      due: inDays(6),
      id: 'd4',
      title: 'VAT return Q3',
    },
    {
      detail: 'Contract renewal · $38,000 / year',
      due: inDays(17),
      id: 'd5',
      title: 'Datadog Pro',
    },
    {
      detail: 'Domain renewal · $24 / year',
      due: inDays(41),
      id: 'd6',
      title: 'example.com',
    },
  ],
  now: new Date(NOW),
  title: 'Deadlines and renewals',
}

const Schedule3 = (props: Schedule3Props) => {
  const { deadlines, now, soonDays = 7, timeZone = 'UTC', title } = props
  const rows = [...deadlines]
    .sort((a, b) => a.due.getTime() - b.due.getTime())
    .map((deadline) => ({
      ...deadline,
      offset: getDayOffset(deadline.due, now, timeZone),
      urgency: getUrgency(deadline.due, now, timeZone, soonDays),
    }))
  const overdue = rows.filter((row) => row.urgency === 'overdue').length
  const soon = rows.filter(
    (row) => row.urgency === 'today' || row.urgency === 'soon',
  ).length

  return (
    <Card className='@container gap-0 pb-0'>
      <CardHeader className='border-b'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {overdue} overdue, {soon} due in the next {soonDays} days
        </CardDescription>
      </CardHeader>
      <CardContent className='px-0'>
        <ul>
          {rows.map((row) => {
            const countdown =
              row.urgency === 'overdue'
                ? `${-row.offset} ${row.offset === -1 ? 'day' : 'days'} overdue`
                : row.urgency === 'today'
                  ? 'Due today'
                  : `Due ${formatCountdown(row.due, now, timeZone)}`
            return (
              <li
                key={row.id}
                className='grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-b px-6 py-3.5 last:border-b-0 @lg:grid-cols-[minmax(0,1fr)_8rem_7rem]'
              >
                <div className='flex min-w-0 flex-col gap-0.5'>
                  <span className='text-sm font-medium break-words'>{row.title}</span>
                  {row.detail && (
                    <span className='text-muted-foreground truncate text-xs'>
                      {row.detail}
                    </span>
                  )}
                </div>
                <p className='col-start-1 row-start-2 flex flex-wrap gap-x-2 text-xs @lg:col-start-2 @lg:row-start-1 @lg:flex-col @lg:text-right'>
                  <span
                    className={cn(
                      'font-medium',
                      row.urgency === 'later'
                        ? 'text-foreground'
                        : urgencyConfig[row.urgency].text,
                    )}
                  >
                    {countdown}
                  </span>
                  <time
                    dateTime={getDay(row.due, timeZone).toISOString().slice(0, 10)}
                    className='text-muted-foreground whitespace-nowrap tabular-nums'
                  >
                    {formatDay(getDay(row.due, timeZone))}
                  </time>
                </p>
                <UrgencyBadge
                  className='col-start-2 row-span-2 row-start-1 justify-self-end @lg:col-start-3 @lg:row-span-1'
                  urgency={row.urgency}
                />
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

export { Schedule3, exampleProps as schedule3ExampleProps, type Schedule3Props }
