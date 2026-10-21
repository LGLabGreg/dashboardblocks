'use client'

import {
  BlockStateText,
  SkeletonText,
  useBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  StatusLabel,
  type StatusLabelProps,
  type StatusTone,
} from '@/registry/components/dashboardblocks/status-label'
import { useReveal } from '@/registry/hooks/use-reveal'
import { formatCompact, formatNumber } from '@/registry/lib/dashboardblocks/format'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type UsageStatus = 'ok' | 'warning' | 'critical' | 'over'

interface UsageThresholds {
  /** Share of the limit, in percent, from which usage is critical. */
  critical?: number
  /** Share of the limit, in percent, from which usage is nearing it. */
  warning?: number
}

function getUsageShare(used: number, limit: number) {
  if (!Number.isFinite(used) || !Number.isFinite(limit) || limit <= 0) return 0
  return (Math.max(0, used) / limit) * 100
}

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
  daysElapsed: number
  daysInPeriod: number
  used: number
}

function projectUsage({ daysElapsed, daysInPeriod, used }: UsageProjectionInput) {
  if (daysElapsed <= 0) return used
  return (used / daysElapsed) * daysInPeriod
}

/** Days until a balance runs out at a daily burn; `Infinity` with no burn. */
function getDaysLeft(remaining: number, dailyBurn: number) {
  return dailyBurn > 0 ? Math.max(0, remaining) / dailyBurn : Infinity
}

function formatUsage(value: number, unit?: string, { compact = false } = {}) {
  const number = compact ? formatCompact(value) : formatNumber(value)
  return unit ? `${number} ${unit}` : number
}

interface UsageStatusConfig {
  color: string
  label: string
  tone: StatusTone
}

const usageStatusConfig: Record<UsageStatus, UsageStatusConfig> = {
  critical: {
    color: 'var(--color-destructive)',
    label: 'Critical',
    tone: 'bad',
  },
  ok: {
    color: 'var(--color-chart-2)',
    label: 'Within limit',
    tone: 'good',
  },
  over: {
    color: 'var(--color-destructive)',
    label: 'Over limit',
    tone: 'bad',
  },
  warning: {
    color: 'var(--color-orange-500)',
    label: 'Nearing limit',
    tone: 'warning',
  },
}

function UsageStatusLabel({
  className,
  label,
  status,
  variant,
}: {
  className?: string
  label?: string
  status: UsageStatus
  variant?: StatusLabelProps['variant']
}) {
  const state = useBlockState()
  if (state) return null
  const config = usageStatusConfig[status]
  return (
    <StatusLabel className={className} tone={config.tone} variant={variant}>
      {label ?? config.label}
    </StatusLabel>
  )
}

function projectedFill(color: string) {
  return `repeating-linear-gradient(-45deg, color-mix(in oklab, ${color} 55%, transparent) 0 2px, color-mix(in oklab, ${color} 18%, transparent) 2px 5px)`
}

interface UsageBarProps extends UsageThresholds {
  animated?: boolean
  className?: string
  color?: string
  limit: number
  overColor?: string
  projected?: number
  /** @default 'md' */
  size?: 'sm' | 'md'
  used: number
}

function UsageBar({
  animated = true,
  className,
  color,
  critical,
  limit,
  overColor = 'var(--color-destructive)',
  projected,
  size = 'md',
  used,
  warning,
}: UsageBarProps) {
  const { ref, revealed } = useReveal(animated)
  const state = useBlockState()

  if (state) {
    return (
      <div
        aria-hidden
        className={cn(
          'bg-muted w-full rounded-full',
          size === 'md' ? 'h-2.5' : 'h-1.5',
          state === 'loading' && 'animate-pulse motion-reduce:animate-none',
          className,
        )}
      />
    )
  }

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
      ref={ref}
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
          className='bg-foreground ring-background absolute top-1/2 h-[calc(100%+8px)] w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2'
          style={{ left: at(limit) }}
        />
      )}
    </div>
  )
}

type UsageKeyShape = 'used' | 'projected' | 'over' | 'limit'

function UsageKey({
  className,
  color = 'var(--color-chart-2)',
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
  children?: ReactNode
  className?: string
}) {
  const state = useBlockState()

  return (
    <span className={cn('text-4xl font-light tracking-tight tabular-nums', className)}>
      {state === 'loading' ? (
        <SkeletonText className='w-[4.5em]' />
      ) : state ? (
        <BlockStateText className='inline' variant='short' />
      ) : (
        children
      )}
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
  const state = useBlockState()
  if (state) return null
  return (
    <span className={cn('text-muted-foreground text-sm', className)}>{children}</span>
  )
}

export {
  UsageBar,
  UsageKey,
  UsageMeterLimit,
  UsageMeterValue,
  UsageStatusLabel,
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
