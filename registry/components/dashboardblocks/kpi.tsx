'use client'

import { AnimatedNumber } from '@/registry/components/dashboardblocks/animated-number'

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
