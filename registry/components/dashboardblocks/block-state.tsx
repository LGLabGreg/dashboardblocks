'use client'

import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import {
  type ComponentProps,
  type ReactNode,
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

function SkeletonText({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      className={cn(
        'bg-muted inline-block h-[0.8em] max-w-full animate-pulse rounded-sm align-middle motion-reduce:animate-none',
        className,
      )}
      {...props}
    />
  )
}

type BlockStatus = 'loading' | 'error'

type BlockState = BlockStatus | 'empty'

type BlockData = readonly unknown[] | string | number | object | null | undefined

interface BlockStateProps {
  /**
   * Shown under "Couldn’t load" while `status` is `'error'`: one sentence for people on
   * what went wrong and what to do, such as `The query took too long. Try a shorter range.`
   * Never the raw error.
   */
  errorMessage?: string
  status?: BlockStatus
}

const BlockStateContext = createContext<{ errorMessage?: string; state?: BlockState }>({})

/** `data` is empty when it's left out, `null`, `''` or `[]`. */
function getBlockState(status: BlockStatus | undefined, data: BlockData) {
  if (status) return status
  const empty =
    data === undefined ||
    data === null ||
    data === '' ||
    (Array.isArray(data) && data.length === 0)
  return empty ? ('empty' as const) : undefined
}

interface BlockStateProviderProps {
  children: ReactNode
  errorMessage?: string
  state?: BlockState
}

function BlockStateProvider({ children, errorMessage, state }: BlockStateProviderProps) {
  const outer = useContext(BlockStateContext)
  const message = errorMessage ?? outer.errorMessage
  const value = useMemo(() => ({ errorMessage: message, state }), [message, state])
  return <BlockStateContext.Provider value={value}>{children}</BlockStateContext.Provider>
}

function useBlockState() {
  return useContext(BlockStateContext).state
}

const blockStateMessages = {
  empty: 'No data',
  error: 'Couldn’t load',
}

interface BlockStateTextProps {
  className?: string
  /** Says what belongs here when there's nothing yet, in place of "No data". */
  emptyMessage?: string
  /** Shows this state instead of the block's own. */
  state?: BlockState
  /** `short` sizes the loading placeholder to fit beside a title. @default 'sentence' */
  variant?: 'sentence' | 'short'
}

function BlockStateText({
  className,
  emptyMessage,
  state: shown,
  variant = 'sentence',
}: BlockStateTextProps) {
  const { errorMessage, state: blockState } = useContext(BlockStateContext)
  const state = shown ?? blockState
  if (!state) return null

  if (state === 'loading') {
    return (
      <span data-slot='block-state-text' className={cn('block', className)}>
        <SkeletonText className={variant === 'short' ? 'w-16' : 'w-48'} />
        <span className='sr-only'>Loading</span>
      </span>
    )
  }

  return (
    <span
      data-slot='block-state-text'
      className={cn(
        'block',
        state === 'error' ? 'text-red-700 dark:text-red-400' : 'text-muted-foreground',
        className,
        'text-xl font-light tracking-normal',
      )}
    >
      {state === 'error' && errorMessage ? (
        <>
          <span className='block'>{blockStateMessages.error}</span>
          <span className='text-muted-foreground mt-1 block max-w-prose text-sm font-normal text-pretty whitespace-normal'>
            {errorMessage}
          </span>
        </>
      ) : state === 'empty' && emptyMessage ? (
        emptyMessage
      ) : (
        blockStateMessages[state]
      )}
    </span>
  )
}

interface BlockReadyProps {
  children: ReactNode
  /** Sizes the placeholder line shown while loading, such as `text-xs`. */
  className?: string
}

function BlockReady({ children, className }: BlockReadyProps) {
  const state = useBlockState()
  if (!state) return children
  if (state !== 'loading') return null
  return (
    <span className={cn('block', className)}>
      <SkeletonText className='w-2/3' />
    </span>
  )
}

interface BlockStateRowsProps {
  className?: string
  /** Says what belongs here when there's nothing yet, in place of "No data". */
  emptyMessage?: string
  /** How many rows to sketch while loading. @default 4 */
  rows?: number
}

function BlockStateRows({ className, emptyMessage, rows = 4 }: BlockStateRowsProps) {
  const state = useBlockState()
  if (!state) return null

  if (state !== 'loading') {
    return (
      <BlockStateText
        className={cn('py-2.5 text-sm', className)}
        emptyMessage={emptyMessage}
      />
    )
  }

  return (
    <div data-slot='block-state-rows' className={className}>
      <span className='sr-only'>Loading</span>
      <ul aria-hidden className='flex flex-col'>
        {Array.from({ length: rows }, (_, index) => (
          <li
            key={index}
            className='flex items-center gap-4 border-b py-2.5 text-sm last:border-b-0'
          >
            <SkeletonText className='w-1/3' />
            <SkeletonText className='ml-auto w-16' />
          </li>
        ))}
      </ul>
    </div>
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
        startTransition(() => {
          setData(next)
          setStatus('success')
        })
      } catch (caught) {
        startTransition(() => {
          setError(caught)
          setStatus('error')
        })
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

export {
  BlockBusy,
  BlockBusyIndicator,
  BlockMessage,
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  BlockStateText,
  Skeleton,
  SkeletonText,
  getBlockState,
  useBlockData,
  useBlockState,
}

export type {
  BlockBusyProps,
  BlockData,
  BlockMessageProps,
  BlockReadyProps,
  BlockState,
  BlockStateProps,
  BlockStateProviderProps,
  BlockStateRowsProps,
  BlockStateTextProps,
  BlockStatus,
  LoadStatus,
}
