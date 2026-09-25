'use client'

import { LoaderCircleIcon } from 'lucide-react'
import {
  type ComponentProps,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import { cn } from '@/lib/utils'

/** A placeholder shape for content that is still loading. Pulses unless reduced motion is on. */
function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden
      className={cn(
        'bg-muted animate-pulse rounded-md motion-reduce:animate-none',
        className,
      )}
      {...props}
    />
  )
}

interface BlockBusyProps {
  busy: boolean
  children: ReactNode
  className?: string
  /** Announced while busy, e.g. "Updating revenue". */
  label: string
}

/**
 * Keeps the previous content in place while it refreshes, dimmed and inert,
 * so the layout doesn't jump. Announces the update to screen readers.
 */
function BlockBusy({ busy, children, className, label }: BlockBusyProps) {
  return (
    <div
      aria-busy={busy}
      inert={busy}
      className={cn(
        'transition-opacity duration-200 motion-reduce:transition-none',
        busy && 'opacity-50',
        className,
      )}
    >
      {children}
      <span role='status' className='sr-only'>
        {busy ? `${label}…` : ''}
      </span>
    </div>
  )
}

/** A small spinner with a visible label, for a card header while it updates. */
function BlockBusyIndicator({
  className,
  label = 'Updating',
}: {
  className?: string
  label?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'text-muted-foreground inline-flex items-center gap-1.5 text-xs',
        className,
      )}
    >
      <LoaderCircleIcon className='size-3.5 animate-spin motion-reduce:animate-none' />
      {label}
    </span>
  )
}

interface BlockMessageProps {
  action?: ReactNode
  className?: string
  description?: ReactNode
  icon?: ReactNode
  title: string
  /** `error` tints the icon. The title and description carry the meaning. */
  tone?: 'default' | 'error'
}

/** The body of an empty or error state: an icon, a title, a description and an action. */
function BlockMessage({
  action,
  className,
  description,
  icon,
  title,
  tone = 'default',
}: BlockMessageProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-10 text-center',
        className,
      )}
    >
      {icon && (
        <span
          aria-hidden
          className={cn(
            'flex size-10 items-center justify-center rounded-full [&_svg]:size-5',
            tone === 'error'
              ? 'bg-destructive/10 text-destructive'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {icon}
        </span>
      )}
      <div className='flex max-w-xs flex-col gap-1'>
        <p className='text-sm font-medium'>{title}</p>
        {description && (
          <p className='text-muted-foreground text-sm text-pretty'>{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}

type LoadStatus = 'idle' | 'loading' | 'refreshing' | 'success' | 'error'

/**
 * Runs `load` on mount and on `reload`. Keeps the last data while it
 * refreshes (status `refreshing`), and only shows `loading` when there is no
 * data yet, so callers can pick a skeleton or a dimmed frame.
 */
function useBlockData<T>(load: () => Promise<T>, { keepData = true } = {}) {
  const [data, setData] = useState<T | undefined>(undefined)
  const [error, setError] = useState<unknown>(undefined)
  const [status, setStatus] = useState<LoadStatus>('idle')
  const hasData = useRef(false)
  const loadRef = useRef(load)

  useEffect(() => {
    loadRef.current = load
  }, [load])

  const reload = useCallback(
    async (options: { clear?: boolean } = {}) => {
      const refresh = keepData && hasData.current && !options.clear
      if (options.clear) {
        hasData.current = false
        setData(undefined)
      }
      setStatus(refresh ? 'refreshing' : 'loading')
      setError(undefined)
      try {
        const next = await loadRef.current()
        hasData.current = true
        setData(next)
        setStatus('success')
      } catch (caught) {
        setError(caught)
        setStatus('error')
      }
    },
    [keepData],
  )

  // Load once on mount. The ref stops Strict Mode's second effect run from
  // sending a duplicate request.
  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true
    void reload()
  }, [reload])

  return { data, error, reload, status }
}

export { BlockBusy, BlockBusyIndicator, BlockMessage, Skeleton, useBlockData }

export type { BlockBusyProps, BlockMessageProps, LoadStatus }
