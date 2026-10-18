'use client'

import { useBlockState } from '@/registry/components/dashboardblocks/block-state'
import { formatCompact, formatCurrency } from '@/registry/lib/dashboardblocks/format'

import { cn } from '@/lib/utils'

interface TokenCounts {
  cached?: number
  input: number
  output: number
}

interface TokenPrices {
  /** Per million cached input tokens. */
  cached?: number
  /** Per million input tokens. */
  input: number
  /** Per million output tokens. */
  output: number
}

function getTokenCost({ cached = 0, input, output }: TokenCounts, prices: TokenPrices) {
  return (
    (input * prices.input +
      output * prices.output +
      cached * (prices.cached ?? prices.input)) /
    1_000_000
  )
}

function getCacheSavings(cachedTokens: number, prices: TokenPrices) {
  return (cachedTokens * (prices.input - (prices.cached ?? prices.input))) / 1_000_000
}

/** Share of input tokens served from the cache, 0–1. */
function getCacheHitRate({ cached = 0, input }: TokenCounts) {
  const total = input + cached
  return total > 0 ? cached / total : 0
}

function formatTokens(count: number) {
  return formatCompact(count)
}

function formatUsd(value: number) {
  if (value > 0 && value < 0.01) return `$${value.toPrecision(2)}`
  const digits = value < 10 ? 2 : 0
  return formatCurrency(value, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })
}

const modelPalette = [
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
  'var(--color-chart-1)',
]

const tokenPartColors = {
  cached: 'var(--color-chart-3)',
  input: 'var(--color-chart-2)',
  output: 'var(--color-chart-4)',
} as const

interface TokenSplitBarProps {
  className?: string
  tokens: TokenCounts
}

function TokenSplitBar({ className, tokens }: TokenSplitBarProps) {
  const state = useBlockState()
  if (state === 'loading') {
    return (
      <div
        aria-hidden
        className={cn(
          'bg-muted h-2.5 animate-pulse rounded-full motion-reduce:animate-none',
          className,
        )}
      />
    )
  }
  if (state) return null

  const cached = tokens.cached ?? 0
  const total = tokens.input + cached + tokens.output || 1
  const parts = [
    { color: tokenPartColors.input, value: tokens.input },
    { color: tokenPartColors.cached, value: cached },
    { color: tokenPartColors.output, value: tokens.output },
  ]
  return (
    <div
      aria-hidden
      className={cn('flex h-2.5 gap-0.5 overflow-hidden rounded-full', className)}
    >
      {parts.map((part, index) =>
        part.value > 0 ? (
          <span
            key={index}
            className='h-full'
            style={{
              backgroundColor: part.color,
              width: `${(part.value / total) * 100}%`,
            }}
          />
        ) : null,
      )}
    </div>
  )
}

export {
  TokenSplitBar,
  formatTokens,
  formatUsd,
  getCacheHitRate,
  getCacheSavings,
  getTokenCost,
  modelPalette,
  tokenPartColors,
}

export type { TokenCounts, TokenPrices, TokenSplitBarProps }
