'use client'

import {
  StatusLabel,
  type StatusLabelProps,
  type StatusTone,
} from '@/registry/components/dashboardblocks/status-label'
import { useReveal } from '@/registry/hooks/use-reveal'

import { cn } from '@/lib/utils'

type StockStatus = 'out' | 'low' | 'ok' | 'over'

interface StockInput {
  /** Above this is overstock. */
  maxStock?: number
  onHand: number
  /** At or below this, it's time to reorder. */
  reorderPoint: number
}

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
  leadTimeDays: number
  onHand: number
  onOrder?: number
  targetDays?: number
}

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
  days: number
  /** Orders arriving, by days from today. */
  incoming?: { day: number; quantity: number }[]
  onHand: number
}

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
  { color: string; label: string; tone: StatusTone }
> = {
  low: { color: 'var(--color-amber-500)', label: 'Low stock', tone: 'warning' },
  ok: { color: 'var(--color-emerald-500)', label: 'In stock', tone: 'good' },
  out: { color: 'var(--color-red-500)', label: 'Out of stock', tone: 'bad' },
  over: { color: 'var(--color-sky-500)', label: 'Overstock', tone: 'info' },
}

interface StockStatusLabelProps extends Omit<StatusLabelProps, 'children' | 'tone'> {
  status: StockStatus
}

function StockStatusLabel({ status, ...props }: StockStatusLabelProps) {
  const config = stockStatusConfig[status]
  return (
    <StatusLabel tone={config.tone} {...props}>
      {config.label}
    </StatusLabel>
  )
}

interface StockBarProps extends StockInput {
  animated?: boolean
  className?: string
  capacity?: number
}

function StockBar({
  animated = true,
  capacity,
  className,
  maxStock,
  onHand,
  reorderPoint,
}: StockBarProps) {
  const { ref, revealed } = useReveal<HTMLDivElement>(animated)
  const status = getStockStatus({ maxStock, onHand, reorderPoint })
  const top = capacity ?? (Math.max(onHand, reorderPoint, maxStock ?? 0) * 1.1 || 1)
  const at = (value: number) => `${Math.min(100, (Math.max(0, value) / top) * 100)}%`

  return (
    <div ref={ref} aria-hidden className={cn('relative h-2 w-full', className)}>
      <div className='bg-muted h-full w-full overflow-hidden rounded-full'>
        <div
          className='h-full rounded-full transition-[width] duration-1000 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none'
          style={{
            backgroundColor: stockStatusConfig[status].color,
            width: revealed ? at(onHand) : '0%',
          }}
        />
      </div>
      <span
        className='bg-foreground ring-background absolute top-1/2 h-[calc(100%+8px)] w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2'
        style={{ left: at(reorderPoint) }}
      />
    </div>
  )
}

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
  StockStatusLabel,
  getDaysOfCover,
  getReorderQuantity,
  getStockStatus,
  projectStock,
  stockStatusConfig,
}

export type {
  ProjectionInput,
  ReorderInput,
  StockBarProps,
  StockInput,
  StockStatus,
  StockStatusLabelProps,
}
