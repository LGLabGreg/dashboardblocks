'use client'

import { Progress as UIProgress } from '@/components/ui/progress'

import { cn } from '@/lib/utils'

export interface ProgressBarProps {
  className?: string
  label?: string
  percentage: number
  progressClassName?: string
  target?: string
}

export const ProgressBar = ({
  className,
  label,
  percentage,
  progressClassName,
  target,
}: ProgressBarProps) => {
  const safePercentage = Number.isFinite(percentage) ? percentage : 0
  const normalized = Math.min(100, Math.max(0, safePercentage))

  return (
    <div className={cn('space-y-1', className)}>
      <div className='flex items-center justify-between text-sm text-muted-foreground'>
        <span>
          <span className='font-semibold text-foreground'>{Math.round(normalized)}%</span>
          {label ? ` ${label}` : null}
        </span>
        <span className='text-sm font-semibold text-foreground'>{target}</span>
      </div>
      <UIProgress value={normalized} className={cn('bg-muted', progressClassName)} />
    </div>
  )
}
