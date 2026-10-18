'use client'

import { useBlockState } from '@/registry/components/dashboardblocks/block-state'
import {
  ChartPlaceholder,
  ChartTooltipFrame,
  ChartTooltipItem,
  chartAxisProps,
  chartBarCursor,
  chartReferenceProps,
} from '@/registry/components/dashboardblocks/chart'
import { ChartPanelLegend } from '@/registry/components/dashboardblocks/chart-panel'
import {
  formatNumber,
  formatPercent,
  formatSigned,
  joinDetails,
} from '@/registry/lib/dashboardblocks/format'
import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

import { cn } from '@/lib/utils'

/** The average and share of each rating from counts, where `counts[0]` is the number of 1-star ratings. */
function getRatingSummary(counts: number[]) {
  const total = counts.reduce((sum, count) => sum + count, 0)
  const average =
    total > 0
      ? counts.reduce((sum, count, index) => sum + count * (index + 1), 0) / total
      : 0
  return {
    average,
    shares: counts.map((count) => (total > 0 ? count / total : 0)),
    total,
  }
}

/** Customer satisfaction: the share of ratings in the top two of a 1–5 scale (4 and 5), as usually reported. */
function getCsat(counts: number[]) {
  const total = counts.reduce((sum, count) => sum + count, 0)
  const satisfied = counts.slice(-2).reduce((sum, count) => sum + count, 0)
  return total > 0 ? satisfied / total : 0
}

interface SentimentCounts {
  negative: number
  neutral: number
  positive: number
}

/** Positive minus negative, as a share of all mentions: −1 to 1. */
function getNetSentiment({ negative, neutral, positive }: SentimentCounts) {
  const total = negative + neutral + positive
  return total > 0 ? (positive - negative) / total : 0
}

/** Net sentiment as points from −100 to +100. */
function formatNetSentiment(net: number) {
  return formatSigned(Math.round(net * 100), (value) => formatNumber(value))
}

const STAR_PATH =
  'M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96L12 2.5z'

interface StarRatingProps {
  className?: string
  /** @default 5 */
  max?: number
  /** Fractions fill part of a star, e.g. */
  value: number
}

function StarRating({ className, max = 5, value }: StarRatingProps) {
  return (
    <span
      data-slot='star-rating'
      className={cn('inline-flex items-center gap-0.5 text-amber-500', className)}
    >
      <span className='sr-only'>
        {formatNumber(value)} out of {max} stars
      </span>
      {Array.from({ length: max }, (_, index) => {
        const fill = Math.min(1, Math.max(0, value - index))
        return (
          <span key={index} aria-hidden className='relative inline-flex shrink-0'>
            <svg viewBox='0 0 24 24' className='size-4'>
              <path d={STAR_PATH} className='fill-muted' />
            </svg>
            {fill > 0 && (
              <span
                className='absolute inset-y-0 left-0 overflow-hidden'
                style={{ width: `${fill * 100}%` }}
              >
                <svg viewBox='0 0 24 24' className='size-4 max-w-none'>
                  <path d={STAR_PATH} fill='currentColor' />
                </svg>
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}

const sentimentColors = {
  negative: 'var(--sentiment-negative, var(--color-red-500))',
  neutral: 'color-mix(in oklab, var(--color-muted-foreground) 35%, transparent)',
  positive: 'var(--sentiment-positive, var(--color-emerald-600))',
} as const

const sentimentLabels: Record<keyof SentimentCounts, string> = {
  negative: 'Negative',
  neutral: 'Neutral',
  positive: 'Positive',
}

interface SentimentTopic extends SentimentCounts {
  label: string
}

interface SentimentRow {
  counts: SentimentTopic
  label: string
  negative: number
  net: number
  neutralAbove: number
  neutralBelow: number
  positive: number
}

const ROW_HEIGHT = 40
const AXIS_HEIGHT = 28

function toSentimentRow(topic: SentimentTopic): SentimentRow {
  const total = topic.negative + topic.neutral + topic.positive || 1
  return {
    counts: topic,
    label: topic.label,
    negative: -topic.negative / total,
    net: getNetSentiment(topic),
    neutralAbove: topic.neutral / 2 / total,
    neutralBelow: -topic.neutral / 2 / total,
    positive: topic.positive / total,
  }
}

function SentimentTooltipContent({
  active,
  payload,
}: Partial<Pick<TooltipContentProps<ValueType, NameType>, 'active' | 'payload'>>) {
  const row = payload?.[0]?.payload as SentimentRow | undefined
  if (!active || !row) return null
  const total = row.counts.negative + row.counts.neutral + row.counts.positive
  return (
    <ChartTooltipFrame>
      <span className='font-medium'>{row.label}</span>
      {(['positive', 'neutral', 'negative'] as const).map((sentiment) => (
        <ChartTooltipItem
          key={sentiment}
          color={sentimentColors[sentiment]}
          name={sentimentLabels[sentiment]}
          value={joinDetails(
            formatNumber(row.counts[sentiment]),
            formatPercent(total > 0 ? row.counts[sentiment] / total : 0, {
              maximumFractionDigits: 0,
            }),
          )}
        />
      ))}
      <ChartTooltipItem name='Net' value={formatNetSentiment(row.net)} />
    </ChartTooltipFrame>
  )
}

const NET_AXIS_WIDTH = 48

interface NetTickProps {
  netByLabel: Map<string, number>
  payload?: { value?: string }
  x?: number | string
  y?: number | string
}

function NetTick({ netByLabel, payload, x, y }: NetTickProps) {
  const net = netByLabel.get(payload?.value ?? '') ?? 0
  return (
    <text
      x={Number(x)}
      y={Number(y)}
      dy={4}
      textAnchor='start'
      fontSize={14}
      fontWeight={500}
      className={cn(
        'tabular-nums',
        net > 0.05
          ? 'fill-emerald-700 dark:fill-emerald-400'
          : net < -0.05
            ? 'fill-red-700 dark:fill-red-400'
            : 'fill-muted-foreground',
      )}
    >
      {formatNetSentiment(net)}
    </text>
  )
}

interface SentimentChartProps {
  className?: string
  /** Names the chart for keyboard and screen reader users. */
  label: string
  /** How many topics to sketch while loading. @default 5 */
  placeholderRows?: number
  /** Drawn in this order; sort them first, such as by net sentiment. */
  topics: SentimentTopic[]
}

function SentimentChart({
  className,
  label,
  placeholderRows = 5,
  topics,
}: SentimentChartProps) {
  const state = useBlockState()
  const wrapperClassName = cn(
    'flex flex-col gap-3 [--sentiment-negative:var(--color-red-500)] [--sentiment-positive:var(--color-emerald-600)] dark:[--sentiment-negative:var(--color-red-400)] dark:[--sentiment-positive:var(--color-emerald-500)]',
    className,
  )
  const legend = (
    <ChartPanelLegend
      items={(['negative', 'neutral', 'positive'] as const).map((sentiment) => ({
        color: sentimentColors[sentiment],
        label: sentimentLabels[sentiment],
      }))}
    />
  )

  if (state) {
    return (
      <div data-slot='sentiment-chart' className={wrapperClassName}>
        {state === 'loading' && legend}
        <ChartPlaceholder height={placeholderRows * ROW_HEIGHT + AXIS_HEIGHT} />
      </div>
    )
  }

  const rows = topics.map(toSentimentRow)
  const netByLabel = new Map(rows.map((row) => [row.label, row.net]))
  const widest = Math.max(
    0.1,
    ...rows.map((row) =>
      Math.max(-row.negative - row.neutralBelow, row.positive + row.neutralAbove),
    ),
  )
  const extent = Math.min(1, Math.ceil(widest * 5) / 5)
  const ticks = [-extent, -extent / 2, 0, extent / 2, extent]

  return (
    <div data-slot='sentiment-chart' className={wrapperClassName}>
      {legend}
      <div
        className='w-full tabular-nums'
        style={{ height: rows.length * ROW_HEIGHT + AXIS_HEIGHT }}
      >
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart
            accessibilityLayer
            aria-label={label}
            barCategoryGap={12}
            data={rows}
            layout='vertical'
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            stackOffset='sign'
          >
            <XAxis
              {...chartAxisProps}
              domain={[-extent, extent]}
              tickFormatter={(value: number) =>
                formatPercent(Math.abs(value), { maximumFractionDigits: 0 })
              }
              ticks={ticks}
              type='number'
            />
            <YAxis
              {...chartAxisProps}
              dataKey='label'
              type='category'
              width={104}
              yAxisId='topic'
            />
            <YAxis
              {...chartAxisProps}
              dataKey='label'
              orientation='right'
              tick={(tick: Omit<NetTickProps, 'netByLabel'>) => (
                <NetTick {...tick} netByLabel={netByLabel} />
              )}
              type='category'
              width={NET_AXIS_WIDTH}
              yAxisId='net'
            />
            <Tooltip content={<SentimentTooltipContent />} cursor={chartBarCursor} />
            <ReferenceLine {...chartReferenceProps} x={0} yAxisId='topic' />
            <Bar
              dataKey='neutralBelow'
              fill={sentimentColors.neutral}
              name='Neutral'
              stackId='sentiment'
              yAxisId='topic'
            />
            <Bar
              dataKey='negative'
              fill={sentimentColors.negative}
              name='Negative'
              stackId='sentiment'
              yAxisId='topic'
            />
            <Bar
              dataKey='neutralAbove'
              fill={sentimentColors.neutral}
              name='Neutral'
              stackId='sentiment'
              yAxisId='topic'
            />
            <Bar
              dataKey='positive'
              fill={sentimentColors.positive}
              name='Positive'
              stackId='sentiment'
              yAxisId='topic'
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export {
  SentimentChart,
  StarRating,
  formatNetSentiment,
  getCsat,
  getNetSentiment,
  getRatingSummary,
  sentimentColors,
}

export type { SentimentChartProps, SentimentCounts, SentimentTopic, StarRatingProps }
