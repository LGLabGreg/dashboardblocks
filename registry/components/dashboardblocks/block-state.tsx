'use client'

import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import {
  type ComponentProps,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import { cn } from '@/lib/utils'

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
  label: string
}

function BlockBusy({ busy, children, className, label }: BlockBusyProps) {
  return (
    <>
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
      </div>
      {/* Outside the aria-busy element, whose changes screen readers hold back. */}
      <span role='status' className='sr-only'>
        {busy ? `${label}…` : ''}
      </span>
    </>
  )
}

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
      <IconPlaceholder
        lucide='LoaderCircleIcon'
        tabler='IconLoader2'
        hugeicons='Loading03Icon'
        phosphor='CircleNotchIcon'
        remixicon='RiLoader4Line'
        className='size-3.5 animate-spin motion-reduce:animate-none'
      />
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
  tone?: 'default' | 'error'
}

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
