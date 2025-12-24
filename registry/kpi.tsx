'use client'

import { ArrowDown, ArrowUp, Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
} from 'recharts'
import type { Props as BarProps } from 'recharts/types/cartesian/Bar'
import type { Props as LineProps } from 'recharts/types/cartesian/Line'
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
        'flex items-center justify-center rounded-md bg-gray-100 p-3 aspect-square',
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
  value,
  variant = 'default',
}: {
  className?: string
  trend?: 'up' | 'down' | 'neutral'
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

  if (variant === 'icon-only') {
    return <TrendIcon className={`h-4 w-4 ${trendColors[trend]} ${className}`} />
  }

  if (variant === 'badge') {
    const ArrowIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus
    return (
      <div
        className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeColors[trend]} ${className}`}
      >
        <ArrowIcon className='h-3 w-3' />
        {value}
      </div>
    )
  }

  return (
    <div
      className={`flex items-center text-sm font-medium ${trendColors[trend]} ${className}`}
    >
      <TrendIcon className='mr-1 h-4 w-4' />
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
      <Progress value={normalized} className={progressClassName} />
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
