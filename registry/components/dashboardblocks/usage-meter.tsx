import { cn } from '@/lib/utils'

export interface UsageMeterValueProps {
  children: React.ReactNode
  className?: string
}

export const UsageMeterValue = ({ children, className }: UsageMeterValueProps) => {
  return (
    <span className={cn('text-2xl font-semibold tracking-tight', className)}>
      {children}
    </span>
  )
}

export interface UsageMeterLimitProps {
  children: React.ReactNode
  className?: string
}

export const UsageMeterLimit = ({ children, className }: UsageMeterLimitProps) => {
  return (
    <span className={cn('text-sm text-muted-foreground', className)}>{children}</span>
  )
}

export interface UsageMeterBarProps {
  className?: string
  fillClassName?: string
  percentage: number
  showWarning?: boolean
  warningThreshold?: number
}

export const UsageMeterBar = ({
  className,
  fillClassName,
  percentage,
  showWarning = true,
  warningThreshold = 80,
}: UsageMeterBarProps) => {
  const safePercentage = Number.isFinite(percentage) ? percentage : 0
  const normalized = Math.min(100, Math.max(0, safePercentage))
  const isWarning = showWarning && normalized >= warningThreshold
  const isCritical = showWarning && normalized >= 95

  return (
    <div className={cn('h-2 w-full rounded-full bg-muted', className)}>
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500 ease-out',
          isCritical ? 'bg-destructive' : isWarning ? 'bg-amber-500' : 'bg-primary',
          fillClassName,
        )}
        style={{ width: `${normalized}%` }}
      />
    </div>
  )
}

export interface UsageMeterSegmentedBarProps {
  className?: string
  segments: Array<{
    color?: string
    label?: string
    value: number
  }>
  total: number
}

export const UsageMeterSegmentedBar = ({
  className,
  segments,
  total,
}: UsageMeterSegmentedBarProps) => {
  const safeTotal = total > 0 ? total : 1

  return (
    <div
      className={cn('flex h-2 w-full overflow-hidden rounded-full bg-muted', className)}
    >
      {segments.map((segment, index) => {
        const percentage = (segment.value / safeTotal) * 100
        return (
          <div
            key={segment.label || index}
            className='h-full transition-all duration-500 ease-out first:rounded-l-full last:rounded-r-full'
            style={{
              width: `${percentage}%`,
              backgroundColor: segment.color || 'hsl(var(--primary))',
            }}
            title={segment.label ? `${segment.label}: ${segment.value}` : undefined}
          />
        )
      })}
    </div>
  )
}

export interface UsageMeterStatusProps {
  children?: React.ReactNode
  className?: string
  percentage: number
  warningThreshold?: number
}

export const UsageMeterStatus = ({
  children,
  className,
  percentage,
  warningThreshold = 80,
}: UsageMeterStatusProps) => {
  const safePercentage = Number.isFinite(percentage) ? percentage : 0
  const normalized = Math.min(100, Math.max(0, safePercentage))
  const isCritical = normalized >= 95
  const isWarning = normalized >= warningThreshold

  const defaultMessage = isCritical ? 'Critical' : isWarning ? 'Warning' : 'Normal'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        isCritical
          ? 'bg-destructive/10 text-destructive'
          : isWarning
            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500'
            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500',
        className,
      )}
    >
      {children ?? defaultMessage}
    </span>
  )
}
