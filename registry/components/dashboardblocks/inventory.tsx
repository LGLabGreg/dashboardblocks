'use client'

import { useInView } from '@/registry/hooks/use-in-view'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type ReactNode, type RefObject, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

type StockStatus = 'out' | 'low' | 'ok' | 'over'

interface StockInput {
  /** Above this is overstock. */
  maxStock?: number
  onHand: number
  /** At or below this, it's time to reorder. */
  reorderPoint: number
}

/** Out of stock, low (at or below the reorder point), in stock or overstocked. */
function getStockStatus({ maxStock, onHand, reorderPoint }: StockInput): StockStatus {
  if (onHand <= 0) return 'out'
  if (onHand <= reorderPoint) return 'low'
  if (maxStock !== undefined && onHand > maxStock) return 'over'
  return 'ok'
}

/** Days until stock runs out at the current daily demand; `Infinity` with no demand. */
function getDaysOfCover(onHand: number, dailyDemand: number) {
  return dailyDemand > 0 ? Math.max(0, onHand) / dailyDemand : Infinity
}

interface ReorderInput {
  dailyDemand: number
  /** Days from ordering to arrival. */
  leadTimeDays: number
  onHand: number
  /** Already ordered and on the way. @default 0 */
  onOrder?: number
  /** Days of stock to hold once the order arrives. @default 30 */
  targetDays?: number
}

/**
 * How much to order now to cover the lead time plus `targetDays`, less what's
 * on hand and on order. 0 when no order is needed.
 */
function getReorderQuantity({
  dailyDemand,
  leadTimeDays,
  onHand,
  onOrder = 0,
  targetDays = 30,
}: ReorderInput) {
  return Math.max(
    0,
    Math.ceil(dailyDemand * (leadTimeDays + targetDays) - onHand - onOrder),
  )
}

interface ProjectionInput {
  dailyDemand: number
  /** Days ahead to project. */
  days: number
  /** Orders arriving, by days from today. */
  incoming?: { day: number; quantity: number }[]
  onHand: number
}

/**
 * Stock at the end of each day from today (day 0) to `days`: demand comes
 * off, incoming orders land. Levels go below zero once stock runs out; the
 * first such day is `stockoutDay`, or `null` if it doesn't run out.
 */
function projectStock({ dailyDemand, days, incoming = [], onHand }: ProjectionInput) {
  const levels = [onHand]
  for (let day = 1; day <= days; day++) {
    const arriving = incoming
      .filter((order) => order.day === day)
      .reduce((sum, order) => sum + order.quantity, 0)
    levels.push(levels[day - 1] - dailyDemand + arriving)
  }
  const stockout = levels.findIndex((level) => level <= 0)
  return { levels, stockoutDay: stockout === -1 ? null : stockout }
}

const stockStatusConfig: Record<
  StockStatus,
  { bar: string; className: string; icon: ReactNode; label: string }
> = {
  low: {
    bar: 'bg-amber-500',
    className: 'bg-amber-500/10 text-amber-800 dark:text-amber-400',
    icon: (
      <IconPlaceholder
        lucide='TriangleAlertIcon'
        tabler='IconAlertTriangle'
        hugeicons='Alert02Icon'
        phosphor='WarningIcon'
        remixicon='RiErrorWarningLine'
        aria-hidden
      />
    ),
    label: 'Low stock',
  },
  ok: {
    bar: 'bg-emerald-600 dark:bg-emerald-500',
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    icon: (
      <IconPlaceholder
        lucide='CircleCheckIcon'
        tabler='IconCircleCheck'
        hugeicons='CheckmarkCircle02Icon'
        phosphor='CheckCircleIcon'
        remixicon='RiCheckboxCircleLine'
        aria-hidden
      />
    ),
    label: 'In stock',
  },
  out: {
    bar: 'bg-red-600 dark:bg-red-500',
    className: 'bg-red-500/10 text-red-700 dark:text-red-400',
    icon: (
      <IconPlaceholder
        lucide='CircleXIcon'
        tabler='IconCircleX'
        hugeicons='CancelCircleIcon'
        phosphor='XCircleIcon'
        remixicon='RiCloseCircleLine'
        aria-hidden
      />
    ),
    label: 'Out of stock',
  },
  over: {
    bar: 'bg-sky-500',
    className: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
    icon: (
      <IconPlaceholder
        lucide='LayersIcon'
        tabler='IconStack2'
        hugeicons='Layers01Icon'
        phosphor='StackIcon'
        remixicon='RiStackLine'
        aria-hidden
      />
    ),
    label: 'Overstock',
  },
}

/** The stock status with its icon and label. */
function StockStatusBadge({
  className,
  status,
}: {
  className?: string
  status: StockStatus
}) {
  const config = stockStatusConfig[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0',
        config.className,
        className,
      )}
    >
      {config.icon}
      {config.label}
    </span>
  )
}

interface StockBarProps extends StockInput {
  animated?: boolean
  className?: string
  /** The top of the scale, e.g. shelf capacity. Defaults to the largest value shown. */
  capacity?: number
}

/**
 * Stock on hand as a bar in its status colour, with a tick at the reorder
 * point. Decorative: show the numbers as text beside it.
 */
function StockBar({
  animated = true,
  capacity,
  className,
  maxStock,
  onHand,
  reorderPoint,
}: StockBarProps) {
  const { isInView, ref } = useInView({ threshold: 0.3 })
  const [revealed, setRevealed] = useState(!animated)

  useEffect(() => {
    if (!animated || !isInView) return
    const frame = requestAnimationFrame(() => setRevealed(true))
    return () => cancelAnimationFrame(frame)
  }, [animated, isInView])

  const status = getStockStatus({ maxStock, onHand, reorderPoint })
  const top = capacity ?? (Math.max(onHand, reorderPoint, maxStock ?? 0) * 1.1 || 1)
  const at = (value: number) => `${Math.min(100, (Math.max(0, value) / top) * 100)}%`

  return (
    <div
      ref={ref as RefObject<HTMLDivElement>}
      aria-hidden
      className={cn('relative h-2 w-full', className)}
    >
      <div className='bg-muted h-full w-full overflow-hidden rounded-full'>
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-1000 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none',
            stockStatusConfig[status].bar,
          )}
          style={{ width: revealed ? at(onHand) : '0%' }}
        />
      </div>
      <span
        className='bg-foreground ring-card absolute top-1/2 h-[calc(100%+8px)] w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2'
        style={{ left: at(reorderPoint) }}
      />
    </div>
  )
}

/** A legend entry for the `StockBar` reorder point tick. */
function ReorderPointKey({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'text-muted-foreground inline-flex items-center gap-1.5 text-xs',
        className,
      )}
    >
      <span aria-hidden className='bg-foreground h-3 w-0.5 rounded-full' />
      Reorder point
    </span>
  )
}

export {
  ReorderPointKey,
  StockBar,
  StockStatusBadge,
  getDaysOfCover,
  getReorderQuantity,
  getStockStatus,
  projectStock,
  stockStatusConfig,
}

export type { ProjectionInput, ReorderInput, StockBarProps, StockInput, StockStatus }
