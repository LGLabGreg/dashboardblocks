'use client'

import {
  type ChartValueFormatter,
  TinyBarChart,
} from '@/registry/components/dashboardblocks/chart'
import { StatusLabel } from '@/registry/components/dashboardblocks/status-label'
import { formatNumber } from '@/registry/lib/dashboardblocks/format'
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
    <StatusLabel
      tone={paused ? 'neutral' : 'good'}
      className={className}
      indicator={
        <span aria-hidden className='relative flex size-1.5 shrink-0'>
          {!paused && (
            <span className='absolute inline-flex size-full rounded-full bg-current opacity-60 motion-safe:animate-ping' />
          )}
          <span className='relative inline-flex size-1.5 rounded-full bg-current' />
        </span>
      }
    >
      {paused ? 'Paused' : label}
    </StatusLabel>
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
  format = (value) => formatNumber(Math.round(value)),
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
  /** @default 'var(--color-chart-2)' */
  color?: string
  formatter?: ChartValueFormatter
  /** @default 64 */
  height?: number
  /** Draws the newest bar in full colour and the rest faded. @default true */
  highlightLatest?: boolean
  /** Names each bar in its tooltip, in the same order as `values`. */
  labels?: string[]
  /** Oldest first; the newest bar is on the right. */
  values: number[]
}

function RollingBars({
  className,
  color = 'var(--color-chart-2)',
  formatter,
  height = 64,
  highlightLatest = true,
  labels,
  values,
}: RollingBarsProps) {
  return (
    <div aria-hidden className={cn('w-full', className)}>
      <TinyBarChart
        accessibilityLayer={false}
        bars={[
          {
            dataKey: 'value',
            fill: color,
            isAnimationActive: false,
            radius: [2, 2, 0, 0],
          },
        ]}
        data={values.map((value, index) => ({ label: labels?.[index], value }))}
        formatter={formatter}
        height={height}
        highlightIndex={highlightLatest ? values.length - 1 : undefined}
        highlightLabel={false}
      />
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
