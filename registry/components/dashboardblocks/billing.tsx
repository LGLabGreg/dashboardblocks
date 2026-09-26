'use client'

import { useInView } from '@/registry/hooks/use-in-view'
import { CircleCheckIcon, CircleXIcon, ClockIcon, TriangleAlertIcon } from 'lucide-react'
import { type RefObject, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

interface CurrencyFormatOptions {
  /** "$182.4K" instead of "$182,400". */
  compact?: boolean
  /** @default 'USD' */
  currency?: string
  /** Fixed number of decimals. Defaults to 0 for whole amounts, 2 otherwise, and 1 at most when compact. */
  fractionDigits?: number
  /** @default 'en-US' */
  locale?: string
  /** Show a + for positive amounts and a true minus sign for negative ones. */
  signed?: boolean
}

const currencyFormatters = new Map<string, Intl.NumberFormat>()

/** Formats an amount of money. Formatters are cached, so it's cheap to call per cell. */
function formatCurrency(value: number, options: CurrencyFormatOptions = {}) {
  const {
    compact = false,
    currency = 'USD',
    fractionDigits,
    locale = 'en-US',
    signed = false,
  } = options
  const digits = fractionDigits ?? (compact ? 1 : Number.isInteger(value) ? 0 : 2)
  const key = [locale, currency, compact, digits, signed].join('|')
  let formatter = currencyFormatters.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      currency,
      maximumFractionDigits: digits,
      minimumFractionDigits: compact ? 0 : digits,
      notation: compact ? 'compact' : 'standard',
      signDisplay: signed ? 'exceptZero' : 'auto',
      style: 'currency',
    })
    currencyFormatters.set(key, formatter)
  }
  return formatter.format(value).replace('-', '−')
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
})

/** "Oct 14, 2026", in UTC so server and client render the same day. */
function formatBillingDate(date: Date) {
  return dateFormatter.format(date)
}

/** Whole days from `now` until `date`, negative once it has passed. */
function getDaysUntil(date: Date, now: Date) {
  return Math.ceil((date.getTime() - now.getTime()) / 86_400_000)
}

interface MrrMovementInput {
  /** Lost from downgrades. A positive amount. */
  contraction: number
  /** Lost from cancelled subscriptions. A positive amount. */
  churn: number
  /** Gained from upgrades and add-ons. */
  expansion: number
  /** Gained from new customers. */
  newBusiness: number
  /** MRR at the start of the period. */
  starting: number
}

type MrrStepName = 'starting' | 'new' | 'expansion' | 'contraction' | 'churn' | 'ending'

interface MrrStep {
  /** The running total before and after this step. Totals run from 0. */
  from: number
  key: MrrStepName
  kind: 'total' | 'increase' | 'decrease'
  label: string
  to: number
  /** Signed: negative for contraction and churn. */
  value: number
}

/** Starting MRR + new + expansion − contraction − churn = ending MRR, step by step. */
function getMrrMovement(input: MrrMovementInput) {
  const { churn, contraction, expansion, newBusiness, starting } = input
  const changes: [MrrStepName, string, number][] = [
    ['new', 'New', newBusiness],
    ['expansion', 'Expansion', expansion],
    ['contraction', 'Contraction', -Math.abs(contraction)],
    ['churn', 'Churn', -Math.abs(churn)],
  ]
  const steps: MrrStep[] = [
    {
      from: 0,
      key: 'starting',
      kind: 'total',
      label: 'Starting MRR',
      to: starting,
      value: starting,
    },
  ]
  let running = starting
  for (const [key, label, value] of changes) {
    steps.push({
      from: running,
      key,
      kind: value < 0 ? 'decrease' : 'increase',
      label,
      to: running + value,
      value,
    })
    running += value
  }
  steps.push({
    from: 0,
    key: 'ending',
    kind: 'total',
    label: 'Ending MRR',
    to: running,
    value: running,
  })
  return { ending: running, net: running - starting, steps }
}

/**
 * Share of starting MRR kept after expansion, contraction and churn, ignoring
 * new customers. Above 1 means existing customers grew revenue on their own.
 */
function getNetRevenueRetention(
  input: Pick<MrrMovementInput, 'churn' | 'contraction' | 'expansion' | 'starting'>,
) {
  const { churn, contraction, expansion, starting } = input
  if (starting <= 0) return 0
  return (starting + expansion - Math.abs(contraction) - Math.abs(churn)) / starting
}

/** ARR is MRR × 12. ARPU is MRR per paying customer. */
function getRevenueMetrics({ customers, mrr }: { customers: number; mrr: number }) {
  return { arpu: customers > 0 ? mrr / customers : 0, arr: mrr * 12 }
}

/**
 * The value axis for a waterfall. Movements are small next to the totals, so
 * the axis starts below the lowest running total rather than at zero. The
 * total bars then show a break, and `floor` should be labelled.
 */
function getWaterfallScale(steps: MrrStep[]) {
  const levels = steps.flatMap((step) =>
    step.kind === 'total' ? [step.to] : [step.from, step.to],
  )
  const lowest = Math.min(...levels, Infinity)
  const highest = Math.max(...levels, 0)
  const span = highest - lowest || highest || 1
  const unit = 10 ** Math.floor(Math.log10(span))
  const floor = Math.max(0, Math.floor((lowest - span * 0.75) / unit) * unit)
  const ceiling = highest + span * 0.1
  return { ceiling, floor }
}

const stepColor: Record<MrrStep['kind'], string> = {
  decrease: 'bg-red-600 dark:bg-red-500',
  increase: 'bg-emerald-600 dark:bg-emerald-500',
  total: 'bg-muted-foreground',
}

/** A legend swatch in the colour of a step's bar. */
function MrrStepSwatch({
  className,
  kind,
}: {
  className?: string
  kind: MrrStep['kind']
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block size-2.5 shrink-0 rounded-[3px]',
        stepColor[kind],
        className,
      )}
    />
  )
}

interface MrrWaterfallProps {
  animated?: boolean
  className?: string
  /** Formats the axis floor note. */
  formatter?: (value: number) => string
  steps: MrrStep[]
}

/**
 * Totals stand on the axis, movements float between the running totals before
 * and after them, joined by dashed connectors. Decorative: list the steps as
 * text or in a table beside it.
 */
function MrrWaterfall({
  animated = true,
  className,
  formatter = (value) => formatCurrency(value, { compact: true }),
  steps,
}: MrrWaterfallProps) {
  const { isInView, ref } = useInView({ threshold: 0.3 })
  const [revealed, setRevealed] = useState(!animated)

  useEffect(() => {
    if (!animated || !isInView) return
    const frame = requestAnimationFrame(() => setRevealed(true))
    return () => cancelAnimationFrame(frame)
  }, [animated, isInView])

  const { ceiling, floor } = getWaterfallScale(steps)
  const range = ceiling - floor || 1
  const position = (value: number) => ((Math.max(value, floor) - floor) / range) * 100

  return (
    <div
      ref={ref as RefObject<HTMLDivElement>}
      aria-hidden
      className={cn('flex flex-col gap-1.5', className)}
    >
      <div
        className='grid h-full min-h-0 flex-1 border-b'
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      >
        {steps.map((step, index) => {
          const low = step.kind === 'total' ? floor : Math.min(step.from, step.to)
          const high = step.kind === 'total' ? step.to : Math.max(step.from, step.to)
          const next = steps[index + 1]
          return (
            <div key={step.key} className='relative'>
              <span
                className={cn(
                  'absolute inset-x-[18%] origin-bottom rounded-[3px] transition-transform duration-700 ease-out motion-reduce:transition-none',
                  step.kind === 'total' && 'rounded-b-none',
                  stepColor[step.kind],
                )}
                style={{
                  bottom: `${position(low)}%`,
                  height: `max(2px, ${position(high) - position(low)}%)`,
                  transform: `scaleY(${revealed ? 1 : 0})`,
                  transitionDelay: `${index * 90}ms`,
                }}
              >
                {step.kind === 'total' && floor > 0 && (
                  <span className='bg-card absolute inset-x-0 bottom-2 h-1 -skew-y-12' />
                )}
              </span>
              {next && (
                <span
                  className='border-muted-foreground/60 absolute left-[82%] w-[36%] border-t border-dashed transition-opacity duration-300 motion-reduce:transition-none'
                  style={{
                    bottom: `${position(step.to)}%`,
                    opacity: revealed ? 1 : 0,
                    transitionDelay: `${(index + 1) * 90 + 400}ms`,
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
      {floor > 0 && (
        <span className='text-muted-foreground text-[11px]'>
          Axis starts at {formatter(floor)}
        </span>
      )}
    </div>
  )
}

type InvoiceStatus = 'paid' | 'due' | 'overdue' | 'failed'

interface InvoiceStatusConfig {
  className: string
  icon: typeof CircleCheckIcon
  label: string
}

/** Every status has an icon and a label, so colour never carries it alone. */
const invoiceStatusConfig: Record<InvoiceStatus, InvoiceStatusConfig> = {
  due: {
    className: 'bg-muted text-muted-foreground',
    icon: ClockIcon,
    label: 'Due',
  },
  failed: {
    className: 'bg-red-500/10 text-red-700 dark:text-red-400',
    icon: CircleXIcon,
    label: 'Failed',
  },
  overdue: {
    className: 'bg-amber-500/10 text-amber-800 dark:text-amber-400',
    icon: TriangleAlertIcon,
    label: 'Overdue',
  },
  paid: {
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    icon: CircleCheckIcon,
    label: 'Paid',
  },
}

function InvoiceStatusBadge({
  className,
  status,
}: {
  className?: string
  status: InvoiceStatus
}) {
  const config = invoiceStatusConfig[status]
  const Icon = config.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        config.className,
        className,
      )}
    >
      <Icon aria-hidden className='size-3.5' />
      {config.label}
    </span>
  )
}

export {
  InvoiceStatusBadge,
  MrrStepSwatch,
  MrrWaterfall,
  formatBillingDate,
  formatCurrency,
  getDaysUntil,
  getMrrMovement,
  getNetRevenueRetention,
  getRevenueMetrics,
  getWaterfallScale,
  invoiceStatusConfig,
}

export type {
  CurrencyFormatOptions,
  InvoiceStatus,
  InvoiceStatusConfig,
  MrrMovementInput,
  MrrStep,
  MrrStepName,
  MrrWaterfallProps,
}
