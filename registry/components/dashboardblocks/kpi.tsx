'use client'

import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'
import { ComponentProps } from 'react'

import { Card, CardContent } from '@/components/ui/card'

import { cn } from '@/lib/utils'

export const KPI = (props: ComponentProps<typeof Card>) => {
  return <Card {...props} />
}

export const KPIContent = (props: ComponentProps<typeof CardContent>) => {
  return (
    <CardContent
      {...props}
      className={cn('flex flex-col flex-1 justify-between', props.className)}
    />
  )
}

interface KPIValueProps {
  animated?: boolean
  className?: string
  formatter?: (value: number) => string
  value: number
}

const defaultFormatter = (value: number): string => value.toLocaleString()

export const KPIValue = ({
  animated = false,
  className = '',
  formatter = defaultFormatter,
  value,
}: KPIValueProps) => {
  const displayValue = animated ? (
    <AnimatedNumber value={value} formatter={formatter} />
  ) : (
    formatter(value)
  )

  return <div className={`text-3xl font-bold ${className}`}>{displayValue}</div>
}

export type { KPIValueProps }
