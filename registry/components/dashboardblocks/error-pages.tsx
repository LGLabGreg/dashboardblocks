'use client'

import { type ReactNode, useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

interface ErrorPageLayoutProps {
  /** `start` keeps the content at the top, for a page whose parts come and go while it's open. @default 'center' */
  align?: 'center' | 'start'
  /** Centres the visual, title and description over the content. */
  centered?: boolean
  /** Moves focus to the title on mount, so screen readers announce the error after a client-side navigation. */
  focusOnMount?: boolean
  children?: ReactNode
  className?: string
  brand?: ReactNode
  code?: string
  description?: ReactNode
  footer?: ReactNode
  title: ReactNode
  /** The title's id, so the page can move focus to it. */
  titleId?: string
  /** Shown above the code and title, such as a countdown. */
  visual?: ReactNode
  /** A wider column, for a page that sets two panels side by side. */
  wide?: boolean
}

function ErrorPageLayout({
  align = 'center',
  centered = false,
  focusOnMount = false,
  brand,
  children,
  className,
  code,
  description,
  footer,
  title,
  titleId,
  visual,
  wide = false,
}: ErrorPageLayoutProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const focused = useRef(false)

  useEffect(() => {
    if (!focusOnMount || focused.current) return
    focused.current = true
    headingRef.current?.focus()
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
      <main
        className={cn(
          'flex flex-1 flex-col items-center px-4 py-12 sm:px-6',
          align === 'center' && 'justify-center',
        )}
      >
        <div
          className={cn(
            'flex w-full flex-col gap-6',
            wide ? 'max-w-xl' : 'max-w-lg',
            centered && 'items-center',
          )}
        >
          {visual}
          <div
            className={cn('flex flex-col gap-2', centered && 'items-center text-center')}
          >
            {code && (
              <p className='text-muted-foreground text-5xl font-light tracking-tight tabular-nums'>
                {code}
              </p>
            )}
            <h1
              id={titleId}
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
        <footer className='text-muted-foreground flex justify-center px-4 py-6 text-sm sm:px-6'>
          <div className='flex w-full max-w-lg flex-wrap items-center gap-x-4 gap-y-1'>
            {footer}
          </div>
        </footer>
      )}
    </div>
  )
}

function formatDuration(milliseconds: number) {
  const minutes = Math.round(milliseconds / 60_000)
  if (minutes < 1) return 'less than a minute'
  if (minutes < 60) return `about ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
  const hours = Math.round(minutes / 60)
  return `about ${hours} ${hours === 1 ? 'hour' : 'hours'}`
}

export { ErrorPageLayout, formatDuration }

export type { ErrorPageLayoutProps }
