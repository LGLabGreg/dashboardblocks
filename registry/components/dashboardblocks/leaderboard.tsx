'use client'

import { useReveal } from '@/registry/hooks/use-reveal'
import { type VariantProps, cva } from 'class-variance-authority'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

const itemVariants = cva('relative isolate flex items-center rounded-md text-sm', {
  variants: {
    size: {
      default: 'gap-3 px-2 py-1.5',
      lg: 'gap-3 px-2 py-2',
      sm: 'gap-2 px-1.5 py-1',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

const rankVariants = cva(
  'inline-flex shrink-0 items-center justify-center text-xs font-medium tabular-nums',
  {
    variants: {
      variant: {
        badge: 'size-6 rounded-full bg-muted text-foreground',
        plain: 'w-5 text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'plain',
    },
  },
)

const medalStyles: Record<number, string> = {
  1: 'bg-[color-mix(in_oklab,var(--color-chart-2)_35%,transparent)] text-foreground',
  2: 'bg-[color-mix(in_oklab,var(--color-chart-2)_20%,transparent)] text-foreground',
  3: 'bg-[color-mix(in_oklab,var(--color-chart-2)_10%,transparent)] text-foreground',
}

type LeaderboardProps = {
  children: ReactNode
  className?: string
}

type LeaderboardItemProps = {
  children: ReactNode
  className?: string
  size?: VariantProps<typeof itemVariants>['size']
}

interface LeaderboardRankProps extends VariantProps<typeof rankVariants> {
  className?: string
  medal?: boolean
  rank: number
}

type LeaderboardBarProps = {
  animated?: boolean
  className?: string
  delay?: number
  value: number
}

type LeaderboardRankChangeProps = {
  change: number | 'new'
  className?: string
}

function Leaderboard({ children, className }: LeaderboardProps) {
  return <ol className={cn('flex flex-col gap-1', className)}>{children}</ol>
}

function LeaderboardItem({
  children,
  className,
  size = 'default',
}: LeaderboardItemProps) {
  return <li className={cn(itemVariants({ size }), className)}>{children}</li>
}

function LeaderboardRank({
  className,
  medal = false,
  rank,
  variant = 'plain',
}: LeaderboardRankProps) {
  return (
    <span
      className={cn(
        rankVariants({ variant }),
        medal && variant === 'badge' && medalStyles[rank],
        className,
      )}
    >
      <span className='sr-only'>Rank </span>
      {rank}
    </span>
  )
}

function LeaderboardBar({
  animated = true,
  className,
  delay = 0,
  value,
}: LeaderboardBarProps) {
  const { ref, revealed } = useReveal(animated)

  const safeValue = Number.isFinite(value) ? value : 0
  const normalized = Math.min(100, Math.max(0, safeValue))

  return (
    <div
      ref={ref}
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]'
    >
      <div
        className={cn(
          'h-full rounded-[inherit] bg-[color-mix(in_oklab,var(--color-chart-2)_18%,transparent)] transition-[width] duration-1000 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none',
          className,
        )}
        style={{
          transitionDelay: animated ? `${delay}ms` : undefined,
          width: `${!animated || revealed ? normalized : 0}%`,
        }}
      />
    </div>
  )
}

function LeaderboardLabel({ children, className }: LeaderboardProps) {
  return <div className={cn('min-w-0 flex-1', className)}>{children}</div>
}

function LeaderboardValue({ children, className }: LeaderboardProps) {
  return (
    <div className={cn('shrink-0 text-end font-medium tabular-nums', className)}>
      {children}
    </div>
  )
}

function LeaderboardRankChange({ change, className }: LeaderboardRankChangeProps) {
  if (change === 'new') {
    return (
      <span
        className={cn('text-xs font-medium text-sky-700 dark:text-sky-400', className)}
      >
        New
      </span>
    )
  }

  if (change === 0) {
    return (
      <span
        className={cn(
          'text-xs font-medium whitespace-nowrap text-muted-foreground',
          className,
        )}
      >
        No change
      </span>
    )
  }

  const isUp = change > 0

  return (
    <span
      className={cn(
        'text-xs font-medium whitespace-nowrap tabular-nums',
        isUp
          ? 'text-emerald-700 dark:text-emerald-400'
          : 'text-red-700 dark:text-red-400',
        className,
      )}
    >
      {isUp ? 'Up' : 'Down'} {Math.abs(change)}
      <span className='sr-only'> {Math.abs(change) === 1 ? 'place' : 'places'}</span>
    </span>
  )
}

export {
  Leaderboard,
  LeaderboardBar,
  LeaderboardItem,
  LeaderboardLabel,
  LeaderboardRank,
  LeaderboardRankChange,
  LeaderboardValue,
  rankVariants,
}
export type {
  LeaderboardBarProps,
  LeaderboardItemProps,
  LeaderboardRankChangeProps,
  LeaderboardRankProps,
}
