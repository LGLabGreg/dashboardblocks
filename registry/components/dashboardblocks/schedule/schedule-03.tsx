'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  UrgencyLabel,
  formatCountdown,
  formatDay,
  getDay,
  getDayOffset,
  getUrgency,
} from '@/registry/components/dashboardblocks/schedule'
import { formatCurrency } from '@/registry/lib/dashboardblocks/format'

interface Deadline {
  /** What is owed or renewed, in dollars. */
  amount?: number
  /** Shows the amount as a recurring price, such as `a year`. */
  billed?: 'month' | 'year'
  detail?: string
  due: Date
  id: string
  title: string
}

interface Schedule3Props {
  /** Leave out, or pass none, to show the empty state. */
  deadlines?: Deadline[]
  now: Date
  soonDays?: number
  status?: BlockStatus
  /** @default 'UTC' */
  timeZone?: string
  title: string
}

const NOW = Date.UTC(2026, 8, 28, 9, 40)
const inDays = (days: number) => new Date(NOW + days * 86_400_000)

const exampleProps: Schedule3Props = {
  deadlines: [
    {
      amount: 4_200,
      detail: 'Invoice INV-2291',
      due: inDays(-2),
      id: 'd1',
      title: 'Payment to Cloudline Hosting',
    },
    {
      detail: 'api.example.com',
      due: inDays(0),
      id: 'd2',
      title: 'TLS certificate expires',
    },
    {
      amount: 12_480,
      billed: 'year',
      detail: 'Contract renewal',
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
      amount: 38_000,
      billed: 'year',
      detail: 'Contract renewal',
      due: inDays(17),
      id: 'd5',
      title: 'Datadog Pro',
    },
    {
      amount: 24,
      billed: 'year',
      detail: 'Domain renewal',
      due: inDays(41),
      id: 'd6',
      title: 'example.com',
    },
  ],
  now: new Date(NOW),
  title: 'Deadlines and renewals',
}

const Schedule3 = (props: Schedule3Props) => {
  const { deadlines = [], now, soonDays = 7, status, timeZone = 'UTC', title } = props
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
  const hasAmounts = rows.some((row) => row.amount !== undefined)

  return (
    <BlockStateProvider state={getBlockState(status, deadlines)}>
      <section className='@container flex flex-col gap-3'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>
              {overdue === 0 ? 'Nothing overdue' : `${overdue} overdue`}, and {soon} due
              in the next {soonDays} days.
            </p>
          </BlockReady>
        </header>
        <div className='border-t'>
          <BlockStateRows rows={5} />
          <ul className='empty:hidden'>
            {!status &&
              rows.map((row) => {
                const countdown =
                  row.urgency === 'overdue'
                    ? `${-row.offset} ${row.offset === -1 ? 'day' : 'days'} overdue`
                    : row.urgency === 'today'
                      ? 'Due today'
                      : `Due ${formatCountdown(row.due, now, timeZone)}`
                return (
                  <li key={row.id} className='flex items-start gap-4 border-b py-2.5'>
                    <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                      <span className='text-sm font-medium break-words'>{row.title}</span>
                      {row.detail && (
                        <span className='text-muted-foreground truncate text-sm'>
                          {row.detail}
                        </span>
                      )}
                    </div>
                    {hasAmounts && (
                      <p className='flex w-20 shrink-0 flex-col items-end gap-0.5 text-right text-sm tabular-nums'>
                        {row.amount !== undefined && (
                          <>
                            <span>{formatCurrency(row.amount)}</span>
                            {row.billed && (
                              <span className='text-muted-foreground'>
                                a {row.billed}
                              </span>
                            )}
                          </>
                        )}
                      </p>
                    )}
                    <p className='flex shrink-0 flex-col items-end gap-0.5 text-right'>
                      <UrgencyLabel urgency={row.urgency} label={countdown} />
                      <time
                        dateTime={getDay(row.due, timeZone).toISOString().slice(0, 10)}
                        className='text-muted-foreground text-sm whitespace-nowrap tabular-nums'
                      >
                        {formatDay(getDay(row.due, timeZone))}
                      </time>
                    </p>
                  </li>
                )
              })}
          </ul>
        </div>
      </section>
    </BlockStateProvider>
  )
}

export { Schedule3, exampleProps as schedule3ExampleProps, type Schedule3Props }
