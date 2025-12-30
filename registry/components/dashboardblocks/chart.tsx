'use client'

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

const ChartTooltipContent = ({
  payload,
  formatter,
}: TooltipContentProps<ValueType, NameType>) => {
  if (!payload || payload.length === 0) return null

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
            {formatter
              ? formatter(item.value, item.name, item, index, payload)
              : item.value}
          </div>
        )
      })}
    </div>
  )
}

export interface TinyBarChartProps {
  bars: BarProps[]
  className?: string
  data: unknown[]
  formatter?: RechartsTooltipFormatter
  height?: number
}

export const TinyBarChart = ({
  bars,
  className = '',
  data,
  formatter,
  height = 180,
}: TinyBarChartProps) => {
  const safeData = Array.isArray(data) ? data : []
  const resolvedBars = Array.isArray(bars) && bars.length > 0 ? bars : []

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart data={safeData}>
          <Tooltip
            content={(props) => <ChartTooltipContent {...props} formatter={formatter} />}
          />
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

export interface TinyLineChartProps {
  className?: string
  data: unknown[]
  formatter?: RechartsTooltipFormatter
  height?: number
  lines: LineProps[]
}

export const TinyLineChart = ({
  className = '',
  data,
  formatter,
  height = 180,
  lines,
}: TinyLineChartProps) => {
  const safeData = Array.isArray(data) ? data : []
  const resolvedLines = Array.isArray(lines) && lines.length > 0 ? lines : []

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart data={safeData}>
          <Tooltip
            content={(props) => <ChartTooltipContent {...props} formatter={formatter} />}
          />
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

export interface TinyAreaChartProps {
  areas: AreaProps[]
  className?: string
  data: unknown[]
  formatter?: RechartsTooltipFormatter
  height?: number
}

export const TinyAreaChart = ({
  areas,
  className = '',
  data,
  formatter,
  height = 180,
}: TinyAreaChartProps) => {
  const safeData = Array.isArray(data) ? data : []
  const resolvedAreas = Array.isArray(areas) && areas.length > 0 ? areas : []

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width='100%' height='100%'>
        <AreaChart data={safeData}>
          <Tooltip
            content={(props) => <ChartTooltipContent {...props} formatter={formatter} />}
          />
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

export type RechartsTooltipFormatter = TooltipContentProps<
  ValueType,
  NameType
>['formatter']
