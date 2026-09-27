'use client'

import { type ReactNode, useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

interface ErrorPageLayoutProps {
  /**
   * Moves focus to the title on mount, so screen readers announce the error
   * after a client-side navigation. Turn it on when the page is a route.
   */
  focusOnMount?: boolean
  /** Below the message, such as buttons, a search box or a form. */
  children?: ReactNode
  className?: string
  /** Your logo and product name, top left. Leave out inside an app shell. */
  brand?: ReactNode
  /** Such as "404" or "Error 500". Shown above the title. */
  code?: string
  description?: ReactNode
  /** Bottom of the page, such as links to help and the status page. */
  footer?: ReactNode
  /** A decorative icon in a tile above the title. */
  icon?: ReactNode
  title: ReactNode
}

/**
 * A full-page frame for errors and interruptions: your brand, a centred
 * message and what to do next.
 */
function ErrorPageLayout({
  focusOnMount = false,
  brand,
  children,
  className,
  code,
  description,
  footer,
  icon,
  title,
}: ErrorPageLayoutProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (focusOnMount) headingRef.current?.focus()
  }, [focusOnMount])

  return (
    <div
      className={cn('bg-background @container/page flex min-h-svh flex-col', className)}
    >
      {brand && (
        <header className='flex h-16 shrink-0 items-center px-4 sm:px-6'>
          <div className='flex min-w-0 items-center gap-2 text-sm font-medium'>
            {brand}
          </div>
        </header>
      )}
      <main className='flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6'>
        <div className='flex w-full max-w-md flex-col items-center gap-6 text-center'>
          {icon && (
            <span
              aria-hidden
              className='bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-xl [&_svg]:size-6'
            >
              {icon}
            </span>
          )}
          <div className='flex flex-col gap-2'>
            {code && (
              <p className='text-muted-foreground font-mono text-sm tabular-nums'>
                {code}
              </p>
            )}
            <h1
              ref={headingRef}
              tabIndex={-1}
              className='text-2xl font-semibold tracking-tight text-balance outline-none'
            >
              {title}
            </h1>
            {description && (
              <p className='text-muted-foreground text-pretty'>{description}</p>
            )}
          </div>
          {children && <div className='flex w-full flex-col gap-6'>{children}</div>}
        </div>
      </main>
      {footer && (
        <footer className='text-muted-foreground flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-6 text-sm'>
          {footer}
        </footer>
      )}
    </div>
  )
}

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'UTC',
  timeZoneName: 'short',
})

/** "2:30 PM UTC", in UTC so it renders the same on server and client. */
function formatTime(date: Date) {
  return timeFormatter.format(date)
}

/** "about 25 minutes", "about 2 hours", "less than a minute". */
function formatDuration(milliseconds: number) {
  const minutes = Math.round(milliseconds / 60_000)
  if (minutes < 1) return 'less than a minute'
  if (minutes < 60) return `about ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
  const hours = Math.round(minutes / 60)
  return `about ${hours} ${hours === 1 ? 'hour' : 'hours'}`
}

export { ErrorPageLayout, formatDuration, formatTime }

export type { ErrorPageLayoutProps }
