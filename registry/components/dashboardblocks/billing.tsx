'use client'

import {
  ChartTooltipFrame,
  ChartTooltipItem,
  type ChartValueFormatter,
  chartAxisProps,
  chartBarCursor,
  chartReferenceLabel,
  chartReferenceProps,
} from '@/registry/components/dashboardblocks/chart'
import { ChartPanelFigure } from '@/registry/components/dashboardblocks/chart-panel'
import {
  StatusLabel,
  type StatusLabelProps,
  type StatusTone,
} from '@/registry/components/dashboardblocks/status-label'
import {
  formatCurrency,
  formatDate,
  formatSigned,
} from '@/registry/lib/dashboardblocks/format'
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

function formatBillingDate(date: Date) {
  return formatDate(date, 'date')
}

function getDaysUntil(date: Date, now: Date) {
  return Math.ceil((date.getTime() - now.getTime()) / 86_400_000)
}

function formatDaysUntil(days: number) {
  if (days > 1) return `in ${days} days`
  if (days === 1) return 'tomorrow'
  return 'today'
}

interface MrrMovementInput {
  contraction: number
  churn: number
  expansion: number
  newBusiness: number
  starting: number
}

type MrrStepName = 'starting' | 'new' | 'expansion' | 'contraction' | 'churn' | 'ending'

interface MrrStep {
  from: number
  key: MrrStepName
  kind: 'total' | 'increase' | 'decrease'
  label: string
  to: number
  /** Signed: negative for contraction and churn. */
  value: number
}

function getMrrMovement(input: MrrMovementInput) {
  const { churn, contraction, expansion, newBusiness, starting } = input
  const changes: [MrrStepName, string, number, MrrStep['kind']][] = [
    ['new', 'New', newBusiness, 'increase'],
    ['expansion', 'Expansion', expansion, 'increase'],
    ['contraction', 'Contraction', -Math.abs(contraction), 'decrease'],
    ['churn', 'Churn', -Math.abs(churn), 'decrease'],
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
  for (const [key, label, value, kind] of changes) {
    steps.push({
      from: running,
      key,
      kind,
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

function getNetRevenueRetention(
  input: Pick<MrrMovementInput, 'churn' | 'contraction' | 'expansion' | 'starting'>,
) {
  const { churn, contraction, expansion, starting } = input
  if (starting <= 0) return 0
  return (starting + expansion - Math.abs(contraction) - Math.abs(churn)) / starting
}

function getRevenueMetrics({ customers, mrr }: { customers: number; mrr: number }) {
  return { arpu: customers > 0 ? mrr / customers : 0, arr: mrr * 12 }
}

const MAX_WATERFALL_TICKS = 5

function getWaterfallScale(steps: MrrStep[]) {
  const levels = steps.flatMap((step) =>
    step.kind === 'total' ? [step.to] : [step.from, step.to],
  )
  const lowest = Math.min(...levels, Infinity)
  const highest = Math.max(...levels, 0)
  const span = highest - lowest || highest || 1
  let unit = 10 ** Math.floor(Math.log10(span))
  const floorFor = (step: number) =>
    Math.max(0, Math.floor((lowest - span * 0.75) / step) * step)
  while ((highest - floorFor(unit)) / unit > MAX_WATERFALL_TICKS) unit *= 2
  const floor = floorFor(unit)
  const ceiling = floor + Math.ceil((highest - floor) / unit) * unit
  const ticks: number[] = []
  for (let tick = floor; tick <= ceiling; tick += unit) ticks.push(tick)
  return { ceiling, floor, ticks }
}

const mrrStepColors: Record<MrrStep['kind'], string> = {
  decrease: 'var(--color-red-500)',
  increase: 'var(--color-emerald-500)',
  total: 'var(--color-chart-2)',
}

interface MrrWaterfallRow extends MrrStep {
  display: string
  range: [number, number]
}

type MrrWaterfallTooltipProps = Partial<
  Pick<TooltipContentProps<ValueType, NameType>, 'active' | 'payload'>
> & {
  formatter: ChartValueFormatter
}

function MrrWaterfallTooltip({ active, formatter, payload }: MrrWaterfallTooltipProps) {
  const step = payload?.[0]?.payload as MrrWaterfallRow | undefined
  if (!active || !step) return null
  return (
    <ChartTooltipFrame>
      <span className='font-medium'>{step.label}</span>
      {step.kind !== 'total' && (
        <ChartTooltipItem
          color={mrrStepColors[step.kind]}
          name='Change'
          value={formatSigned(step.value, formatter)}
        />
      )}
      <ChartTooltipItem
        color={step.kind === 'total' ? mrrStepColors.total : undefined}
        name='MRR'
        value={formatter(step.to)}
      />
    </ChartTooltipFrame>
  )
}

interface MrrWaterfallProps {
  /** @default true */
  animated?: boolean
  className?: string
  /** Formats the axis and the labels beside each bar. */
  formatter?: ChartValueFormatter
  label: string
  steps: MrrStep[]
  /** Formats the values in the tooltip. */
  tooltipFormatter?: ChartValueFormatter
}

function MrrWaterfall({
  animated = true,
  className,
  formatter = (value) => formatCurrency(value, { compact: true }),
  label,
  steps,
  tooltipFormatter = (value) => formatCurrency(value),
}: MrrWaterfallProps) {
  const { ceiling, floor, ticks } = getWaterfallScale(steps)
  const starting = steps.find((step) => step.key === 'starting')
  const rows: MrrWaterfallRow[] = steps.map((step) => ({
    ...step,
    display:
      step.kind === 'total' ? formatter(step.to) : formatSigned(step.value, formatter),
    range:
      step.kind === 'total'
        ? [floor, step.to]
        : [Math.min(step.from, step.to), Math.max(step.from, step.to)],
  }))

  return (
    <ChartPanelFigure className={className}>
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart
          accessibilityLayer
          aria-label={label}
          data={rows}
          layout='vertical'
          margin={{ top: 20, right: 56, bottom: 0, left: 0 }}
          barCategoryGap='30%'
        >
          <XAxis
            {...chartAxisProps}
            allowDataOverflow
            domain={[floor, ceiling]}
            tickFormatter={formatter}
            ticks={ticks}
            type='number'
          />
          <YAxis {...chartAxisProps} dataKey='label' type='category' width={104} />
          <Tooltip
            content={(tooltipProps) => (
              <MrrWaterfallTooltip {...tooltipProps} formatter={tooltipFormatter} />
            )}
            cursor={chartBarCursor}
          />
          {starting && (
            <ReferenceLine
              {...chartReferenceProps}
              x={starting.to}
              label={{ ...chartReferenceLabel, position: 'top', value: 'Start' }}
            />
          )}
          <Bar dataKey='range' isAnimationActive={animated} name='MRR' radius={3}>
            {rows.map((row) => (
              <Cell key={row.key} fill={mrrStepColors[row.kind]} />
            ))}
            <LabelList
              dataKey='display'
              position='right'
              fill='var(--color-muted-foreground)'
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartPanelFigure>
  )
}

type InvoiceStatus =
  | 'draft'
  | 'due'
  | 'failed'
  | 'overdue'
  | 'paid'
  | 'uncollectible'
  | 'void'

const invoiceStatusConfig: Record<InvoiceStatus, { label: string; tone: StatusTone }> = {
  draft: { label: 'Draft', tone: 'neutral' },
  due: { label: 'Due', tone: 'neutral' },
  failed: { label: 'Failed', tone: 'bad' },
  overdue: { label: 'Overdue', tone: 'warning' },
  paid: { label: 'Paid', tone: 'good' },
  uncollectible: { label: 'Uncollectible', tone: 'bad' },
  void: { label: 'Void', tone: 'neutral' },
}

interface InvoiceStatusLabelProps extends Omit<StatusLabelProps, 'children' | 'tone'> {
  status: InvoiceStatus
}

function InvoiceStatusLabel({ status, ...props }: InvoiceStatusLabelProps) {
  const config = invoiceStatusConfig[status]
  return (
    <StatusLabel tone={config.tone} {...props}>
      {config.label}
    </StatusLabel>
  )
}

export {
  InvoiceStatusLabel,
  MrrWaterfall,
  formatBillingDate,
  formatDaysUntil,
  getDaysUntil,
  getMrrMovement,
  getNetRevenueRetention,
  getRevenueMetrics,
  getWaterfallScale,
  invoiceStatusConfig,
  mrrStepColors,
}

export type {
  InvoiceStatus,
  InvoiceStatusLabelProps,
  MrrMovementInput,
  MrrStep,
  MrrStepName,
  MrrWaterfallProps,
}
