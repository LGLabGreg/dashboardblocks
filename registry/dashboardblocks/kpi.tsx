'use client'

import {
  ArrowDown,
  ArrowUp,
  type LucideIcon,
  Minus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { ReactNode } from 'react'
import {
  Area,
  AreaChart,
  AreaProps,
  Bar,
  BarChart,
  BarProps,
  Line,
  LineChart,
  LineProps,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
} from 'recharts'
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

import { Progress } from '@/components/ui/progress'

import { cn } from '@/lib/utils'

export const KPIValue = ({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) => {
  return <div className={`text-3xl font-bold ${className}`}>{children}</div>
}

export const KPIIcon = ({
  className = '',
  icon: Icon,
}: {
  className?: string
  icon: LucideIcon
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-md bg-muted p-3 aspect-square w-12',
        className,
      )}
    >
      <Icon />
    </div>
  )
}

export const KPITrend = ({
  className = '',
  trend = 'neutral',
  trendIcon = 'trend',
  value,
  variant = 'default',
}: {
  className?: string
  trend?: 'up' | 'down' | 'neutral'
  trendIcon?: 'arrow' | 'trend'
  value: string
  variant?: 'default' | 'icon-only' | 'badge'
}) => {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500',
  }

  const badgeColors = {
    up: 'bg-green-100 text-green-800 border-green-200',
    down: 'bg-red-100 text-red-800 border-red-200',
    neutral: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const ArrowIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus
  const Icon = trendIcon === 'arrow' ? ArrowIcon : TrendIcon

  if (variant === 'icon-only') {
    return <Icon className={`h-4 w-4 ${trendColors[trend]} ${className}`} />
  }

  if (variant === 'badge') {
    return (
      <div
        className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeColors[trend]} ${className}`}
      >
        <Icon className='h-3 w-3' />
        {value}
      </div>
    )
  }

  return (
    <div
      className={`flex items-center text-sm font-medium ${trendColors[trend]} ${className}`}
    >
      <Icon className='mr-1 h-4 w-4' />
      {value}
    </div>
  )
}

export interface KPIProgressProps {
  className?: string
  label?: string
  percentage: number
  progressClassName?: string
  target?: string
}
export const KPIProgress = ({
  className,
  label,
  percentage,
  progressClassName,
  target,
}: KPIProgressProps) => {
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
      <Progress value={normalized} className={cn('bg-muted', progressClassName)} />
    </div>
  )
}

export interface KPIRingProps {
  ariaLabel?: string
  children?: ReactNode
  className?: string
  percentage: number
  radius?: number
  ringColor?: string
  ringTrackColor?: string
  strokeWidth?: number
}

export const KPIRing = ({
  ariaLabel,
  children,
  className = '',
  percentage,
  radius = 40,
  ringColor = 'var(--color-primary)',
  ringTrackColor = 'var(--color-muted)',
  strokeWidth = 12,
}: KPIRingProps) => {
  const safePercentage = Number.isFinite(percentage) ? percentage : 0
  const normalized = Math.min(100, Math.max(0, safePercentage))
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (normalized / 100) * circumference

  return (
    <div
      className={cn('relative shrink-0', className)}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
    >
      <svg className='h-full w-full -rotate-90' viewBox='0 0 100 100'>
        <circle
          cx='50'
          cy='50'
          r={radius}
          fill='none'
          stroke={ringTrackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx='50'
          cy='50'
          r={radius}
          fill='none'
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap='round'
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className='transition-all duration-500 ease-out'
        />
      </svg>
      <div className='absolute inset-0 flex items-center justify-center'>
        {children ?? (
          <span className='text-sm font-semibold'>{Math.round(normalized)}%</span>
        )}
      </div>
    </div>
  )
}

const ChartTooltipContent = ({ payload }: TooltipContentProps<ValueType, NameType>) => {
  if (!payload || payload.length === 0) return null

  const resolveDisplayValue = (entry: NonNullable<typeof payload>[number]) => {
    const dataKey =
      typeof entry.dataKey === 'string' || typeof entry.dataKey === 'number'
        ? entry.dataKey
        : undefined
    const row = entry.payload as Record<string, unknown> & {
      displayValues?: Record<string | number, ReactNode>
    }

    if (dataKey !== undefined && row) {
      const displayValues = row.displayValues
      if (displayValues && displayValues[dataKey] !== undefined) {
        return displayValues[dataKey]
      }

      const keyedDisplay = row[`${String(dataKey)}DisplayValue`]
      if (keyedDisplay !== undefined) {
        return keyedDisplay as ReactNode
      }

      if (row[String(dataKey)] !== undefined) {
        return row[String(dataKey)] as ReactNode
      }
    }

    if (row?.displayValue !== undefined) {
      return row.displayValue as ReactNode
    }

    return entry.value
  }

  return (
    <div className='border-border/50 bg-background grid min-w-32 items-start gap-1.5 rounded-md border px-2.5 py-1.5 text-xs shadow-xl'>
      <span className='font-medium'>{payload?.[0].payload.label}</span>

      {payload.map((item, index) => {
        const itemColor =
          (item.color as string | undefined) ??
          (item.fill as string | undefined) ??
          'var(--color-foreground)'

        return (
          <div
            key={
              typeof item.dataKey === 'string' || typeof item.dataKey === 'number'
                ? item.dataKey
                : index
            }
            className='flex items-center gap-1'
          >
            <div
              className='h-2.5 w-2.5 shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)'
              style={
                {
                  '--color-bg': itemColor,
                  '--color-border': itemColor,
                } as React.CSSProperties
              }
            />
            {resolveDisplayValue(item)}
          </div>
        )
      })}
    </div>
  )
}

export interface KPIBarChartProps {
  bars: BarProps[]
  className?: string
  data: unknown[]
  height?: number
}

export const KPIBarChart = ({
  bars,
  className = '',
  data,
  height = 180,
}: KPIBarChartProps) => {
  const safeData = Array.isArray(data) ? data : []
  const resolvedBars = Array.isArray(bars) && bars.length > 0 ? bars : []

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart data={safeData}>
          <Tooltip content={ChartTooltipContent} />
          {resolvedBars.map((barProps, index) => {
            const dataKey =
              typeof barProps.dataKey === 'string' || typeof barProps.dataKey === 'number'
                ? barProps.dataKey
                : index

            return (
              <Bar
                key={String(dataKey)}
                radius={barProps.radius ?? [4, 4, 0, 0]}
                {...barProps}
              />
            )
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export interface KPILineChartProps {
  className?: string
  data: unknown[]
  height?: number
  lines: LineProps[]
}

export const KPILineChart = ({
  className = '',
  data,
  height = 180,
  lines,
}: KPILineChartProps) => {
  const safeData = Array.isArray(data) ? data : []
  const resolvedLines = Array.isArray(lines) && lines.length > 0 ? lines : []

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart data={safeData}>
          <Tooltip content={ChartTooltipContent} />
          {resolvedLines.map((lineProps, index) => {
            const dataKey =
              typeof lineProps.dataKey === 'string' ||
              typeof lineProps.dataKey === 'number'
                ? lineProps.dataKey
                : index

            return (
              <Line
                key={String(dataKey)}
                type={lineProps.type ?? 'monotone'}
                strokeWidth={lineProps.strokeWidth ?? 2}
                dot={lineProps.dot ?? { r: 4 }}
                {...lineProps}
              />
            )
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export interface KPIAreaChartProps {
  areas: AreaProps[]
  className?: string
  data: unknown[]
  height?: number
}

export const KPIAreaChart = ({
  areas,
  className = '',
  data,
  height = 180,
}: KPIAreaChartProps) => {
  const safeData = Array.isArray(data) ? data : []
  const resolvedAreas = Array.isArray(areas) && areas.length > 0 ? areas : []

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width='100%' height='100%'>
        <AreaChart data={safeData}>
          <Tooltip content={ChartTooltipContent} />
          {resolvedAreas.map((areaProps, index) => {
            const dataKey =
              typeof areaProps.dataKey === 'string' ||
              typeof areaProps.dataKey === 'number'
                ? areaProps.dataKey
                : index

            return (
              <Area
                key={String(dataKey)}
                type={areaProps.type ?? 'monotone'}
                {...areaProps}
              />
            )
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
