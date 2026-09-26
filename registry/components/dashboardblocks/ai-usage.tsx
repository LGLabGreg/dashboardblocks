'use client'

import { cn } from '@/lib/utils'

interface TokenCounts {
  /** Input tokens read from the prompt cache, billed at the cached rate. */
  cached?: number
  input: number
  output: number
}

interface TokenPrices {
  /** Per million cached input tokens. Defaults to the input price. */
  cached?: number
  /** Per million input tokens. */
  input: number
  /** Per million output tokens. */
  output: number
}

/** The cost of tokens at per-million prices. `input` excludes cached tokens. */
function getTokenCost({ cached = 0, input, output }: TokenCounts, prices: TokenPrices) {
  return (
    (input * prices.input +
      output * prices.output +
      cached * (prices.cached ?? prices.input)) /
    1_000_000
  )
}

/**
 * What caching saved: the cached tokens at the full input price, less what
 * they cost at the cached price.
 */
function getCacheSavings(cachedTokens: number, prices: TokenPrices) {
  return (cachedTokens * (prices.input - (prices.cached ?? prices.input))) / 1_000_000
}

/** Share of input tokens served from the cache, 0–1. */
function getCacheHitRate({ cached = 0, input }: TokenCounts) {
  const total = input + cached
  return total > 0 ? cached / total : 0
}

const tokenFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  notation: 'compact',
})

/** "12.4M tokens" style counts: "12.4M". */
function formatTokens(count: number) {
  return tokenFormatter.format(count)
}

/** Dollars with cents under $10 and whole dollars above, e.g. "$0.0042" for tiny amounts. */
function formatUsd(value: number) {
  if (value > 0 && value < 0.01) return `$${value.toPrecision(2)}`
  return value.toLocaleString('en-US', {
    currency: 'USD',
    maximumFractionDigits: value < 10 ? 2 : 0,
    minimumFractionDigits: value < 10 ? 2 : 0,
    style: 'currency',
  })
}

/** Colours for models in a fixed order, so a model keeps its colour. */
const modelPalette = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

/** Colours for the parts of a token count. */
const tokenPartColors = {
  cached: 'var(--chart-2)',
  input: 'var(--chart-1)',
  output: 'var(--chart-3)',
} as const

interface TokenSplitBarProps {
  className?: string
  tokens: TokenCounts
}

/** Input, cached input and output as one bar. Decorative: give the numbers as text. */
function TokenSplitBar({ className, tokens }: TokenSplitBarProps) {
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
