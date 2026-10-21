'use client'

import {
  ErrorPageLayout,
  formatDuration,
} from '@/registry/components/dashboardblocks/error-pages'
import { UsageBar } from '@/registry/components/dashboardblocks/usage-meter'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatDate } from '@/registry/lib/dashboardblocks/format'
import { type FormEvent, type ReactNode, useId, useState } from 'react'
import { flushSync } from 'react-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface MaintenanceUpdate {
  at: Date
  id: string
  text: string
}

interface ErrorPages4Props {
  brand?: ReactNode
  endsAt: Date
  /** Pass a fixed date, so the page renders the same on the server and in the browser. */
  now: Date
  onSubscribe?: (email: string) => void
  startsAt: Date
  statusHref?: string
  /** Newest first. */
  updates: MaintenanceUpdate[]
  work: string
}

const START = Date.UTC(2026, 8, 27, 14, 0)
const minutesIn = (minutes: number) => new Date(START + minutes * 60_000)

const exampleProps: ErrorPages4Props = {
  brand: (
    <>
      <span className='bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md [&_svg]:size-4'>
        <IconPlaceholder
          lucide='BlocksIcon'
          tabler='IconCube'
          hugeicons='CubeIcon'
          phosphor='CubeIcon'
          remixicon='RiBox3Line'
        />
      </span>
      Acme Analytics
    </>
  ),
  endsAt: minutesIn(60),
  now: minutesIn(35),
  onSubscribe: () => {},
  startsAt: minutesIn(0),
  statusHref: '#',
  updates: [
    {
      at: minutesIn(32),
      id: 'u3',
      text: 'Data is copied. Checking that every dashboard matches.',
    },
    { at: minutesIn(12), id: 'u2', text: 'Copying data to the new warehouse.' },
    { at: minutesIn(0), id: 'u1', text: 'Maintenance started. Dashboards are offline.' },
  ],
  work: 'We’re moving your data to a faster warehouse. Dashboards, reports and alerts are paused, and no data is lost.',
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ErrorPages4 = (props: ErrorPages4Props) => {
  const { brand, endsAt, now, onSubscribe, startsAt, statusHref, updates, work } = props
  const id = useId()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [subscribed, setSubscribed] = useState(false)

  const total = endsAt.getTime() - startsAt.getTime()
  const elapsed = Math.max(now.getTime() - startsAt.getTime(), 0)
  const percent = total > 0 ? Math.round((Math.min(elapsed, total) / total) * 100) : 0
  const overrun = now.getTime() > endsAt.getTime()

  const subscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const address = email.trim()
    if (!EMAIL.test(address)) {
      flushSync(() => setError('Enter an email address.'))
      document.getElementById(`${id}-email`)?.focus()
      return
    }
    setError(null)
    setSubscribed(true)
    onSubscribe?.(address)
  }

  return (
    <ErrorPageLayout
      brand={brand}
      title='Down for maintenance'
      description={work}
      footer={
        statusHref && (
          <a
            href={statusHref}
            className='hover:text-foreground underline underline-offset-4'
          >
            Follow along on the status page
          </a>
        )
      }
    >
      <div className='flex flex-col gap-3 border-t pt-6'>
        <div className='flex flex-col gap-1'>
          <p className='text-muted-foreground text-sm'>
            {overrun ? 'Planned to be back by' : 'Back by'}
          </p>
          <p className='text-4xl font-light tracking-tight tabular-nums'>
            <time dateTime={endsAt.toISOString()}>{formatDate(endsAt, 'time-zone')}</time>
          </p>
          <p className='text-muted-foreground text-sm'>
            {overrun
              ? 'It’s taking longer than planned. We’ll post an update soon.'
              : `Started ${formatDate(startsAt, 'time-zone')}, with ${formatDuration(endsAt.getTime() - now.getTime())} to go.`}
          </p>
        </div>
        <div
          role='progressbar'
          aria-label='Maintenance progress'
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={
            overrun
              ? 'Past the planned time'
              : `${percent}% of the planned time has passed`
          }
        >
          <UsageBar
            color='var(--color-chart-2)'
            limit={total}
            overColor='var(--color-orange-500)'
            size='sm'
            used={elapsed}
          />
        </div>
      </div>

      {updates.length > 0 && (
        <section aria-labelledby={`${id}-updates`} className='flex flex-col gap-2'>
          <h2 id={`${id}-updates`} className='text-sm font-medium'>
            Updates
          </h2>
          <ol className='flex flex-col divide-y border-y'>
            {updates.map((update, index) => (
              <li
                key={update.id}
                className='grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 py-2.5 text-sm'
              >
                <time
                  dateTime={update.at.toISOString()}
                  className='text-muted-foreground tabular-nums'
                >
                  {formatDate(update.at, 'time-zone')}
                </time>
                <span className={index === 0 ? 'font-medium' : undefined}>
                  {update.text}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {onSubscribe &&
        (subscribed ? (
          <p role='status' className='text-muted-foreground text-sm'>
            We’ll email {email.trim()} when everything is back.
          </p>
        ) : (
          <form
            method='post'
            noValidate
            onSubmit={subscribe}
            className='flex flex-col gap-2'
          >
            <label htmlFor={`${id}-email`} className='text-sm font-medium'>
              Get an email when it’s back
            </label>
            <div className='flex gap-2'>
              <Input
                id={`${id}-email`}
                type='email'
                autoComplete='email'
                placeholder='name@company.com'
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
              />
              <Button type='submit' variant='outline'>
                Notify me
              </Button>
            </div>
            {error && (
              <p id={`${id}-error`} className='text-destructive text-sm'>
                {error}
              </p>
            )}
          </form>
        ))}
    </ErrorPageLayout>
  )
}

export {
  ErrorPages4,
  exampleProps as errorPages4ExampleProps,
  type ErrorPages4Props,
  type MaintenanceUpdate,
}
