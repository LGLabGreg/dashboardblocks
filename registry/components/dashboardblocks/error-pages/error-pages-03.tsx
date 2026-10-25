'use client'

import {
  Disclosure,
  DisclosureContent,
  DisclosureTrigger,
} from '@/registry/components/dashboardblocks/disclosure'
import { ErrorPageLayout } from '@/registry/components/dashboardblocks/error-pages'
import { HighlightedCode } from '@/registry/components/dashboardblocks/highlighted-code'
import { CopyButton } from '@/registry/components/dashboardblocks/settings'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatDate } from '@/registry/lib/dashboardblocks/format'
import { type ReactNode, startTransition, useState } from 'react'

import { Button, buttonVariants } from '@/components/ui/button'

interface ErrorPages3Props {
  brand?: ReactNode
  details?: string
  errorId: string
  occurredAt: Date
  onRetry?: () => void | Promise<void>
  statusHref?: string
  supportEmail?: string
}

const exampleProps: ErrorPages3Props = {
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
  details: 'QueryTimeoutError: warehouse query exceeded 30s (dashboard revenue-overview)',
  errorId: 'req_7Hq2kX9mP4vB',
  occurredAt: new Date(Date.UTC(2026, 8, 27, 14, 12)),
  onRetry: () =>
    new Promise((_, reject) => setTimeout(() => reject(new Error('Still failing')), 900)),
  statusHref: '#',
  supportEmail: 'support@acme.co',
}

const ErrorPages3 = (props: ErrorPages3Props) => {
  const { brand, details, errorId, occurredAt, onRetry, statusHref, supportEmail } = props
  const [retrying, setRetrying] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const retry = async () => {
    setRetrying(true)
    try {
      await onRetry?.()
    } catch {
      startTransition(() => setAttempts((count) => count + 1))
    } finally {
      startTransition(() => setRetrying(false))
    }
  }

  return (
    <ErrorPageLayout
      brand={brand}
      code='500'
      title='Something went wrong'
      description='This is on our side, not yours. Your data is safe. Try again in a moment.'
      footer={
        statusHref && (
          <a
            href={statusHref}
            className='hover:text-foreground underline underline-offset-4'
          >
            Check the status page
          </a>
        )
      }
    >
      <div className='flex flex-col gap-2'>
        <div className='flex flex-wrap gap-2'>
          {onRetry && (
            <Button disabled={retrying} onClick={() => void retry()}>
              <IconPlaceholder
                lucide='RefreshCwIcon'
                tabler='IconRefresh'
                hugeicons='RefreshIcon'
                phosphor='ArrowClockwiseIcon'
                remixicon='RiRefreshLine'
                data-icon='inline-start'
                aria-hidden
                className={
                  retrying ? 'animate-spin motion-reduce:animate-none' : undefined
                }
              />
              {retrying ? 'Trying again…' : 'Try again'}
            </Button>
          )}
          {supportEmail && (
            <a
              href={`mailto:${supportEmail}?subject=${encodeURIComponent(`Error ${errorId}`)}`}
              className={buttonVariants({ variant: 'ghost' })}
            >
              Contact support
            </a>
          )}
        </div>
        <p role='status' className='text-muted-foreground min-h-5 text-sm'>
          {attempts > 0 && !retrying
            ? `Still not working after ${attempts} ${attempts === 1 ? 'retry' : 'retries'}. Contact support with the error ID below.`
            : ''}
        </p>
      </div>

      <dl className='flex flex-col divide-y border-y text-sm'>
        <div className='grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 py-2'>
          <dt className='text-muted-foreground text-xs'>Error ID</dt>
          <dd className='truncate font-mono'>{errorId}</dd>
          <dd className='col-start-2 row-span-2 row-start-1'>
            <CopyButton label='Copy error ID' value={errorId} />
          </dd>
        </div>
        <div className='flex flex-col py-2'>
          <dt className='text-muted-foreground text-xs'>Time</dt>
          <dd>
            <time dateTime={occurredAt.toISOString()}>
              {formatDate(occurredAt, 'time-zone')}
            </time>
          </dd>
        </div>
        {details && (
          <div className='py-2'>
            <dt className='sr-only'>Details</dt>
            <dd>
              <Disclosure>
                <DisclosureTrigger className='text-xs font-medium [&_svg]:mt-px [&_svg]:size-3.5'>
                  Details
                </DisclosureTrigger>
                <DisclosureContent>
                  <HighlightedCode
                    code={details}
                    title='Error details'
                    copyLabel='Copy details'
                    wrap
                  />
                </DisclosureContent>
              </Disclosure>
            </dd>
          </div>
        )}
      </dl>
    </ErrorPageLayout>
  )
}

export { ErrorPages3, exampleProps as errorPages3ExampleProps, type ErrorPages3Props }
