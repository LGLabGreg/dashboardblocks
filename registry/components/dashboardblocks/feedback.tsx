'use client'

import { useInView } from '@/registry/hooks/use-in-view'
import { type RefObject, useEffect, useId, useState } from 'react'

import { cn } from '@/lib/utils'

/**
 * The average and share of each rating from counts, where `counts[0]` is the
 * number of 1-star ratings. Works for any scale, e.g. 1–5 or 1–10.
 */
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

/**
 * Customer satisfaction: the share of ratings in the top two of a 1–5 scale
 * (4 and 5), as usually reported.
 */
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

const STAR_PATH =
  'M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96L12 2.5z'

interface StarRatingProps {
  className?: string
  /** @default 5 */
  max?: number
  /** Fractions fill part of a star, e.g. 4.3. */
  value: number
}

/** Stars filled to `value`, with the rating as text for screen readers. */
function StarRating({ className, max = 5, value }: StarRatingProps) {
  const id = useId()
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-amber-500', className)}>
      <span className='sr-only'>
        {Math.round(value * 10) / 10} out of {max} stars
      </span>
      {Array.from({ length: max }, (_, index) => {
        const fill = Math.min(1, Math.max(0, value - index))
        const clip = `${id}-${index}`
        return (
          <svg key={index} aria-hidden viewBox='0 0 24 24' className='size-4 shrink-0'>
            <defs>
              <clipPath id={clip}>
                <rect x='0' y='0' width={24 * fill} height='24' />
              </clipPath>
            </defs>
            <path d={STAR_PATH} className='fill-muted stroke-none' />
            <path d={STAR_PATH} clipPath={`url(#${clip})`} fill='currentColor' />
          </svg>
        )
      })}
    </span>
  )
}

const sentimentColors = {
  negative: 'bg-red-500 dark:bg-red-400',
  neutral: 'bg-muted-foreground/35',
  positive: 'bg-emerald-600 dark:bg-emerald-500',
} as const

interface SentimentBarProps {
  animated?: boolean
  className?: string
  counts: SentimentCounts
  /**
   * For 'diverging': the share of mentions each half of the bar spans. Pass
   * the largest side of all rows (negative plus half the neutral, or positive
   * plus half the neutral), so rows share one scale. @default 1
   */
  extent?: number
  /**
   * 'stacked' fills one bar with negative, neutral and positive. 'diverging'
   * puts negative left and positive right of a centre line, with neutral split
   * across it, so rows line up on the centre.
   * @default 'stacked'
   */
  variant?: 'stacked' | 'diverging'
}

/** Negative, neutral and positive shares as a bar. Decorative. */
function SentimentBar({
  animated = true,
  className,
  counts,
  extent = 1,
  variant = 'stacked',
}: SentimentBarProps) {
  const { isInView, ref } = useInView({ threshold: 0.3 })
  const [revealed, setRevealed] = useState(!animated)

  useEffect(() => {
    if (!animated || !isInView) return
    const frame = requestAnimationFrame(() => setRevealed(true))
    return () => cancelAnimationFrame(frame)
  }, [animated, isInView])

  const total = counts.negative + counts.neutral + counts.positive || 1
  const share = (value: number) => (value / total) * 100
  const segment =
    'h-full transition-[width] duration-700 ease-out motion-reduce:transition-none'

  if (variant === 'diverging') {
    // Width within one half of the bar, which spans `extent` of all mentions.
    const half = (value: number) =>
      `${revealed ? Math.min(100, share(value) / (extent || 1)) : 0}%`
    return (
      <div
        ref={ref as RefObject<HTMLDivElement>}
        aria-hidden
        className={cn('relative flex h-3 w-full', className)}
      >
        <div className='flex h-full w-1/2 justify-end gap-px overflow-hidden'>
          <span
            className={cn(segment, 'rounded-l-sm', sentimentColors.negative)}
            style={{ width: half(counts.negative) }}
          />
          <span
            className={cn(segment, sentimentColors.neutral)}
            style={{ width: half(counts.neutral / 2) }}
          />
        </div>
        <span className='bg-foreground absolute inset-y-[-3px] left-1/2 w-px' />
        <div className='flex h-full w-1/2 gap-px overflow-hidden'>
          <span
            className={cn(segment, sentimentColors.neutral)}
            style={{ width: half(counts.neutral / 2) }}
          />
          <span
            className={cn(segment, 'rounded-r-sm', sentimentColors.positive)}
            style={{ width: half(counts.positive) }}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      ref={ref as RefObject<HTMLDivElement>}
      aria-hidden
      className={cn(
        'bg-muted flex h-2.5 w-full gap-px overflow-hidden rounded-full',
        className,
      )}
    >
      <span
        className={cn(segment, sentimentColors.positive)}
        style={{ width: `${revealed ? share(counts.positive) : 0}%` }}
      />
      <span
        className={cn(segment, sentimentColors.neutral)}
        style={{ width: `${revealed ? share(counts.neutral) : 0}%` }}
      />
      <span
        className={cn(segment, sentimentColors.negative)}
        style={{ width: `${revealed ? share(counts.negative) : 0}%` }}
      />
    </div>
  )
}

/** A legend swatch for a sentiment. */
function SentimentKey({
  className,
  sentiment,
}: {
  className?: string
  sentiment: keyof SentimentCounts
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block size-2.5 shrink-0 rounded-[3px]',
        sentimentColors[sentiment],
        className,
      )}
    />
  )
}

export {
  SentimentBar,
  SentimentKey,
  StarRating,
  getCsat,
  getNetSentiment,
  getRatingSummary,
  sentimentColors,
}

export type { SentimentBarProps, SentimentCounts, StarRatingProps }
