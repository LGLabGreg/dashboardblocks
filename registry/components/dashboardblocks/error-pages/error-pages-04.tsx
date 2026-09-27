'use client'

import {
  ErrorPageLayout,
  formatDuration,
  formatTime,
} from '@/registry/components/dashboardblocks/error-pages'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type FormEvent, type ReactNode, useId, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface MaintenanceUpdate {
  at: Date
  id: string
  text: string
}

interface ErrorPages4Props {
  brand?: ReactNode
  /** When the work is expected to finish. */
  endsAt: Date
  /** Pass a fixed date, so the page renders the same on the server and in the browser. */
  now: Date
  /** Called with an email address to tell when it's back. Leave out to hide the form. */
  onSubscribe?: (email: string) => void
  /** When the work started. */
  startsAt: Date
  statusHref?: string
  /** Newest first. */
  updates: MaintenanceUpdate[]
  /** What's being done, in a sentence. */
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
  const elapsed = Math.min(Math.max(now.getTime() - startsAt.getTime(), 0), total)
  const percent = total > 0 ? Math.round((elapsed / total) * 100) : 0
  const overrun = now.getTime() > endsAt.getTime()

  const subscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const address = email.trim()
    if (!EMAIL.test(address)) return setError('Enter an email address.')
    setError(null)
    setSubscribed(true)
    onSubscribe?.(address)
  }

  return (
    <ErrorPageLayout
      brand={brand}
      icon={
        <IconPlaceholder
          lucide='WrenchIcon'
          tabler='IconTool'
          hugeicons='Wrench01Icon'
          phosphor='WrenchIcon'
          remixicon='RiToolsLine'
        />
      }
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
      <div className='flex flex-col gap-2 text-left'>
        <div className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm'>
          <span className='font-medium'>
            {overrun ? (
              'Taking longer than planned'
            ) : (
              <>
                Back by <time dateTime={endsAt.toISOString()}>{formatTime(endsAt)}</time>
              </>
            )}
          </span>
          <span className='text-muted-foreground'>
            {overrun
              ? 'We’ll post an update soon'
              : `${formatDuration(endsAt.getTime() - now.getTime())} left`}
          </span>
        </div>
        <div
          role='progressbar'
          aria-label='Maintenance progress'
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${percent}% of the planned time has passed`}
          className='bg-muted h-2 overflow-hidden rounded-full'
        >
          <div
            className={overrun ? 'h-full bg-amber-500' : 'bg-primary h-full'}
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className='text-muted-foreground text-xs'>
          Started <time dateTime={startsAt.toISOString()}>{formatTime(startsAt)}</time>
        </p>
      </div>

      {updates.length > 0 && (
        <section
          aria-labelledby={`${id}-updates`}
          className='flex flex-col gap-3 text-left'
        >
          <h2 id={`${id}-updates`} className='text-sm font-medium'>
            Updates
          </h2>
          <ol className='flex flex-col gap-3 border-l pl-4'>
            {updates.map((update, index) => (
              <li key={update.id} className='relative flex flex-col gap-0.5 text-sm'>
                <span
                  aria-hidden
                  className={
                    index === 0
                      ? 'bg-primary absolute top-1.5 -left-[21px] size-2 rounded-full'
                      : 'bg-muted-foreground/40 absolute top-1.5 -left-[21px] size-2 rounded-full'
                  }
                />
                <time
                  dateTime={update.at.toISOString()}
                  className='text-muted-foreground text-xs'
                >
                  {formatTime(update.at)}
                </time>
                <span>{update.text}</span>
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
          <form noValidate onSubmit={subscribe} className='flex flex-col gap-2 text-left'>
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
