'use client'

import { useInView } from '@/registry/hooks/use-in-view'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type ReactNode, type RefObject, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

type UsageStatus = 'ok' | 'warning' | 'critical' | 'over'

interface UsageThresholds {
  /** Share of the limit, in percent, from which usage is critical. @default 95 */
  critical?: number
  /** Share of the limit, in percent, from which usage is nearing it. @default 80 */
  warning?: number
}

/** Used over the limit, in percent. Not capped, so overage reads as over 100. */
function getUsageShare(used: number, limit: number) {
  if (!Number.isFinite(used) || !Number.isFinite(limit) || limit <= 0) return 0
  return (Math.max(0, used) / limit) * 100
}

/** Within limit, nearing it, critical or over it. */
function getUsageStatus(
  used: number,
  limit: number,
  { critical = 95, warning = 80 }: UsageThresholds = {},
): UsageStatus {
  const share = getUsageShare(used, limit)
  if (share > 100) return 'over'
  if (share >= critical) return 'critical'
  if (share >= warning) return 'warning'
  return 'ok'
}

interface UsageProjectionInput {
  /** Days of the billing period so far. */
  daysElapsed: number
  /** Days in the whole billing period. */
  daysInPeriod: number
  used: number
}

/** Usage by the end of the period at the average daily rate so far. */
function projectUsage({ daysElapsed, daysInPeriod, used }: UsageProjectionInput) {
  if (daysElapsed <= 0) return used
  return (used / daysElapsed) * daysInPeriod
}

/**
 * Days until a balance runs out at a daily burn; `Infinity` with no burn.
 * Use it for prepaid credits, or with `limit - used` for a quota.
 */
function getDaysLeft(remaining: number, dailyBurn: number) {
  return dailyBurn > 0 ? Math.max(0, remaining) / dailyBurn : Infinity
}

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })
const compactFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  notation: 'compact',
})

/**
 * "7,234" or, with `compact`, "7.2K". Adds the unit when given: "78 GB".
 * In en-US, so the server and the browser render the same.
 */
function formatUsage(value: number, unit?: string, { compact = false } = {}) {
  const number = (compact ? compactFormatter : numberFormatter).format(value)
  return unit ? `${number} ${unit}` : number
}

interface UsageStatusConfig {
  /** CSS colour for bars and rings. */
  color: string
  icon: ReactNode
  label: string
  /** Tinted background with readable text, for badges. */
  soft: string
  /** Text colour for inline labels. */
  text: string
}

/** Status colours are for usage status only, and always come with an icon and a label. */
const usageStatusConfig: Record<UsageStatus, UsageStatusConfig> = {
  critical: {
    color: 'var(--destructive)',
    icon: (
      <IconPlaceholder
        lucide='OctagonAlertIcon'
        tabler='IconAlertOctagon'
        hugeicons='AlertDiamondIcon'
        phosphor='WarningOctagonIcon'
        remixicon='RiAlarmWarningLine'
        aria-hidden
      />
    ),
    label: 'Critical',
    soft: 'bg-red-500/10 text-red-700 dark:text-red-400',
    text: 'text-red-700 dark:text-red-400',
  },
  ok: {
    color: 'var(--primary)',
    icon: (
      <IconPlaceholder
        lucide='CircleCheckIcon'
        tabler='IconCircleCheck'
        hugeicons='CheckmarkCircle02Icon'
        phosphor='CheckCircleIcon'
        remixicon='RiCheckboxCircleLine'
        aria-hidden
      />
    ),
    label: 'Within limit',
    soft: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  over: {
    color: 'var(--destructive)',
    icon: (
      <IconPlaceholder
        lucide='CircleXIcon'
        tabler='IconCircleX'
        hugeicons='CancelCircleIcon'
        phosphor='XCircleIcon'
        remixicon='RiCloseCircleLine'
        aria-hidden
      />
    ),
    label: 'Over limit',
    soft: 'bg-red-500/10 text-red-700 dark:text-red-400',
    text: 'text-red-700 dark:text-red-400',
  },
  warning: {
    color: 'var(--color-amber-500)',
    icon: (
      <IconPlaceholder
        lucide='TriangleAlertIcon'
        tabler='IconAlertTriangle'
        hugeicons='Alert02Icon'
        phosphor='WarningIcon'
        remixicon='RiErrorWarningLine'
        aria-hidden
      />
    ),
    label: 'Nearing limit',
    soft: 'bg-amber-500/10 text-amber-800 dark:text-amber-400',
    text: 'text-amber-800 dark:text-amber-400',
  },
}

/** The usage status with its icon and label. */
function UsageStatusBadge({
  className,
  label,
  status,
}: {
  className?: string
  /** Replaces the default label, e.g. "3 days left". */
  label?: string
  status: UsageStatus
}) {
  const config = usageStatusConfig[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0',
        config.soft,
        className,
      )}
    >
      {config.icon}
      {label ?? config.label}
    </span>
  )
}

/** A striped fill for projected usage, in the given colour. */
function projectedFill(color: string) {
  return `repeating-linear-gradient(-45deg, color-mix(in oklab, ${color} 55%, transparent) 0 2px, color-mix(in oklab, ${color} 18%, transparent) 2px 5px)`
}

interface UsageBarProps extends UsageThresholds {
  animated?: boolean
  className?: string
  /** Replaces the status colour of the fill. */
  color?: string
  limit: number
  /** Colour of usage past the limit. @default 'var(--destructive)' */
  overColor?: string
  /** Adds a striped segment from used to the projected total. */
  projected?: number
  /** @default 'md' */
  size?: 'sm' | 'md'
  used: number
}

/**
 * Usage against a limit, filled in its status colour. Usage or a projection
 * past the limit extends the scale and marks the limit with a tick.
 * Decorative: show the values as text beside it.
 */
function UsageBar({
  animated = true,
  className,
  color,
  critical,
  limit,
  overColor = 'var(--destructive)',
  projected,
  size = 'md',
  used,
  warning,
}: UsageBarProps) {
  const { isInView, ref } = useInView({ threshold: 0.3 })
  const [revealed, setRevealed] = useState(!animated)

  useEffect(() => {
    if (!animated || !isInView) return
    const frame = requestAnimationFrame(() => setRevealed(true))
    return () => cancelAnimationFrame(frame)
  }, [animated, isInView])

  const status = getUsageStatus(Math.min(used, limit), limit, { critical, warning })
  const fill = color ?? usageStatusConfig[status].color
  const top = Math.max(limit, used, projected ?? 0)
  const pastLimit = top > limit
  const scale = (pastLimit ? top * 1.04 : top) || 1
  const at = (value: number) => `${(Math.max(0, value) / scale) * 100}%`
  const withinLimit = Math.min(used, limit)
  const overage = Math.max(0, used - limit)
  const projectedExtra = projected !== undefined ? Math.max(0, projected - used) : 0

  return (
    <div
      ref={ref as RefObject<HTMLDivElement>}
      aria-hidden
      className={cn('relative w-full', size === 'md' ? 'h-2.5' : 'h-1.5', className)}
    >
      <div
        className='bg-muted flex h-full w-full overflow-hidden rounded-full transition-[clip-path] duration-1000 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none'
        style={{ clipPath: `inset(0 ${revealed ? 0 : 100}% 0 0)` }}
      >
        <span
          className='h-full'
          style={{ backgroundColor: fill, width: at(withinLimit) }}
        />
        {overage > 0 && (
          <span
            className='h-full'
            style={{ backgroundColor: overColor, width: at(overage) }}
          />
        )}
        {projectedExtra > 0 && (
          <span
            className='h-full'
            style={{
              background: projectedFill(used + projectedExtra > limit ? overColor : fill),
              width: at(projectedExtra),
            }}
          />
        )}
      </div>
      {pastLimit && (
        <span
          className='bg-foreground ring-card absolute top-1/2 h-[calc(100%+8px)] w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2'
          style={{ left: at(limit) }}
        />
      )}
    </div>
  )
}

type UsageKeyShape = 'used' | 'projected' | 'over' | 'limit'

/** A legend swatch matching a `UsageBar` mark. */
function UsageKey({
  className,
  color = 'var(--primary)',
  shape,
}: {
  className?: string
  color?: string
  shape: UsageKeyShape
}) {
  if (shape === 'limit') {
    return (
      <span
        aria-hidden
        className={cn(
          'bg-foreground inline-block h-3 w-0.5 shrink-0 rounded-full',
          className,
        )}
      />
    )
  }
  return (
    <span
      aria-hidden
      className={cn('inline-block size-2.5 shrink-0 rounded-[3px]', className)}
      style={{ background: shape === 'projected' ? projectedFill(color) : color }}
    />
  )
}

function UsageMeterValue({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span className={cn('text-2xl font-semibold tracking-tight tabular-nums', className)}>
      {children}
    </span>
  )
}

function UsageMeterLimit({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span className={cn('text-muted-foreground text-sm', className)}>{children}</span>
  )
}

export {
  UsageBar,
  UsageKey,
  UsageMeterLimit,
  UsageMeterValue,
  UsageStatusBadge,
  formatUsage,
  getDaysLeft,
  getUsageShare,
  getUsageStatus,
  projectUsage,
  projectedFill,
  usageStatusConfig,
}

export type {
  UsageBarProps,
  UsageKeyShape,
  UsageProjectionInput,
  UsageStatus,
  UsageStatusConfig,
  UsageThresholds,
}
