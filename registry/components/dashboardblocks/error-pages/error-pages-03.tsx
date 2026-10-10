'use client'

import {
  ErrorPageLayout,
  formatTime,
} from '@/registry/components/dashboardblocks/error-pages'
import { CopyButton } from '@/registry/components/dashboardblocks/settings'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type ReactNode, useState } from 'react'

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
      setAttempts((count) => count + 1)
    } finally {
      setRetrying(false)
    }
  }

  return (
    <ErrorPageLayout
      brand={brand}
      code='500'
      icon={
        <IconPlaceholder
          lucide='TriangleAlertIcon'
          tabler='IconAlertTriangle'
          hugeicons='Alert02Icon'
          phosphor='WarningIcon'
          remixicon='RiErrorWarningLine'
        />
      }
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
      <div className='flex flex-col items-center gap-2'>
        <div className='flex flex-wrap justify-center gap-2'>
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

      <div className='flex flex-col gap-3 rounded-xl border p-4 text-left text-sm'>
        <div className='flex items-center gap-2'>
          <div className='flex min-w-0 flex-1 flex-col'>
            <span className='text-muted-foreground text-xs'>Error ID</span>
            <code className='truncate font-mono'>{errorId}</code>
          </div>
          <CopyButton label='Copy error ID' value={errorId} />
        </div>
        <div className='flex flex-col'>
          <span className='text-muted-foreground text-xs'>Time</span>
          <time dateTime={occurredAt.toISOString()}>{formatTime(occurredAt)}</time>
        </div>
        {details && (
          <details className='group border-t pt-3'>
            <summary className='text-muted-foreground hover:text-foreground flex cursor-pointer list-none items-center gap-1 text-xs font-medium [&::-webkit-details-marker]:hidden'>
              <IconPlaceholder
                lucide='ChevronRightIcon'
                tabler='IconChevronRight'
                hugeicons='ArrowRight01Icon'
                phosphor='CaretRightIcon'
                remixicon='RiArrowRightSLine'
                aria-hidden
                className='size-3.5 transition-transform group-open:rotate-90'
              />
              Details
            </summary>
            <pre className='bg-muted mt-2 overflow-x-auto rounded-md p-3 font-mono text-xs whitespace-pre-wrap'>
              {details}
            </pre>
          </details>
        )}
      </div>
    </ErrorPageLayout>
  )
}

export { ErrorPages3, exampleProps as errorPages3ExampleProps, type ErrorPages3Props }
