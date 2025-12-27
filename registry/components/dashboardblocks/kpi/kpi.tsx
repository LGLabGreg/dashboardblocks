'use client'

import { type LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

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
