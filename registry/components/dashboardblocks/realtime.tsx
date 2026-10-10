'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

/** Calls `callback` every `delay` ms; `null` pauses it. */
function useInterval(callback: () => void, delay: number | null) {
  const saved = useRef(callback)

  useEffect(() => {
    saved.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return
    const id = setInterval(() => saved.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}

function createRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296
  }
}

function pushWindow<T>(values: T[], value: T, size: number) {
  const next = [...values, value]
  return next.length > size ? next.slice(next.length - size) : next
}

interface LiveBadgeProps {
  className?: string
  /** @default 'Live' */
  label?: string
  paused?: boolean
}

function LiveBadge({ className, label = 'Live', paused = false }: LiveBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
        className,
      )}
    >
      <span aria-hidden className='relative flex size-2'>
        {!paused && (
          <span className='absolute inline-flex size-full rounded-full bg-emerald-500 opacity-60 motion-safe:animate-ping' />
        )}
        <span
          className={cn(
            'relative inline-flex size-2 rounded-full',
            paused ? 'bg-muted-foreground' : 'bg-emerald-500',
          )}
        />
      </span>
      {paused ? 'Paused' : label}
    </span>
  )
}

interface LiveNumberProps {
  className?: string
  /** @default 600 */
  duration?: number
  format?: (value: number) => ReactNode
  value: number
}

function LiveNumber({
  className,
  duration = 600,
  format = (value) => Math.round(value).toLocaleString(),
  value,
}: LiveNumberProps) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)

  useEffect(() => {
    const start = from.current
    if (start === value) return
    const length = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 0
      : duration
    let frame = 0
    const began = performance.now()
    const step = (time: number) => {
      const t = length > 0 ? Math.min(1, (time - began) / length) : 1
      const eased = 1 - (1 - t) ** 3
      const current = start + (value - start) * eased
      from.current = current
      setShown(current)
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [duration, value])

  return <span className={cn('tabular-nums', className)}>{format(shown)}</span>
}

interface RollingBarsProps {
  className?: string
  /** @default 'var(--chart-2)' */
  color?: string
  highlightLatest?: boolean
  max?: number
  /** Oldest first; the newest bar is on the right. */
  values: number[]
}

function RollingBars({
  className,
  color = 'var(--chart-2)',
  highlightLatest = true,
  max,
  values,
}: RollingBarsProps) {
  const top = max ?? Math.max(1, ...values)
  return (
    <div aria-hidden className={cn('flex h-16 items-end gap-px', className)}>
      {values.map((value, index) => (
        <span
          key={index}
          className='min-w-0 flex-1 rounded-t-[2px] transition-[height] duration-300 ease-out motion-reduce:transition-none'
          style={{
            backgroundColor:
              highlightLatest && index < values.length - 1
                ? `color-mix(in oklab, ${color} 55%, var(--card))`
                : color,
            height: `${Math.max(2, (value / top) * 100)}%`,
          }}
        />
      ))}
    </div>
  )
}

const relativeTime = new Intl.RelativeTimeFormat('en-US', {
  numeric: 'auto',
  style: 'narrow',
})

function formatAgo(date: Date, now: Date) {
  const seconds = Math.max(0, Math.round((now.getTime() - date.getTime()) / 1000))
  if (seconds < 5) return 'now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return relativeTime.format(-minutes, 'minute')
  return relativeTime.format(-Math.round(minutes / 60), 'hour')
}

export {
  LiveBadge,
  LiveNumber,
  RollingBars,
  createRandom,
  formatAgo,
  pushWindow,
  useInterval,
}

export type { LiveBadgeProps, LiveNumberProps, RollingBarsProps }
