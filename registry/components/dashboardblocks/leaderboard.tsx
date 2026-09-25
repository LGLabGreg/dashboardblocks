'use client'

import { useInView } from '@/registry/hooks/use-in-view'
import { type VariantProps, cva } from 'class-variance-authority'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { type ReactNode, useEffect, useState } from 'react'

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
        badge: 'size-6 rounded-full bg-muted text-muted-foreground',
        plain: 'w-5 text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'plain',
    },
  },
)

const medalStyles: Record<number, string> = {
  1: 'bg-[color-mix(in_oklab,var(--color-amber-500)_20%,var(--card))] text-amber-700 dark:text-amber-400',
  2: 'bg-[color-mix(in_oklab,var(--color-zinc-500)_20%,var(--card))] text-zinc-700 dark:text-zinc-300',
  3: 'bg-[color-mix(in_oklab,var(--color-orange-700)_20%,var(--card))] text-orange-800 dark:text-orange-400',
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

function Leaderboard({ children, className = '' }: LeaderboardProps) {
  return <ol className={cn('flex flex-col gap-1', className)}>{children}</ol>
}

function LeaderboardItem({
  children,
  className = '',
  size = 'default',
}: LeaderboardItemProps) {
  return <li className={cn(itemVariants({ size }), className)}>{children}</li>
}

function LeaderboardRank({
  className = '',
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
  className = '',
  delay = 0,
  value,
}: LeaderboardBarProps) {
  const [width, setWidth] = useState(0)
  const { isInView, ref } = useInView()

  const safeValue = Number.isFinite(value) ? value : 0
  const normalized = Math.min(100, Math.max(0, safeValue))

  useEffect(() => {
    if (animated && isInView) {
      // Wait a frame so the bar paints at 0 before growing
      const frame = requestAnimationFrame(() => {
        setWidth(normalized)
      })
      return () => cancelAnimationFrame(frame)
    }
  }, [animated, isInView, normalized])

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]'
    >
      <div
        className={cn(
          'h-full rounded-[inherit] bg-muted transition-[width] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
          className,
        )}
        style={{
          transitionDelay: animated ? `${delay}ms` : undefined,
          width: `${animated ? width : normalized}%`,
        }}
      />
    </div>
  )
}

function LeaderboardLabel({ children, className = '' }: LeaderboardProps) {
  return <div className={cn('min-w-0 flex-1', className)}>{children}</div>
}

function LeaderboardValue({ children, className = '' }: LeaderboardProps) {
  return (
    <div className={cn('shrink-0 text-end font-medium tabular-nums', className)}>
      {children}
    </div>
  )
}

function LeaderboardRankChange({ change, className = '' }: LeaderboardRankChangeProps) {
  if (change === 'new') {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full bg-[color-mix(in_oklab,var(--color-blue-500)_12%,var(--card))] px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-wide text-blue-700 dark:text-blue-400',
          className,
        )}
      >
        New
      </span>
    )
  }

  if (change === 0) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground',
          className,
        )}
      >
        <Minus aria-hidden='true' className='size-3' />
        <span className='sr-only'>No change</span>
      </span>
    )
  }

  const isUp = change > 0
  const ChangeIcon = isUp ? ArrowUp : ArrowDown

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-medium tabular-nums',
        isUp ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500',
        className,
      )}
    >
      <ChangeIcon aria-hidden='true' className='size-3' />
      <span className='sr-only'>{isUp ? 'Up' : 'Down'} </span>
      {Math.abs(change)}
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
