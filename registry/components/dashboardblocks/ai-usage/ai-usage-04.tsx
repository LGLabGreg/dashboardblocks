'use client'

import {
  type TokenCounts,
  type TokenPrices,
  TokenSplitBar,
  formatTokens,
  formatUsd,
  getCacheHitRate,
  getCacheSavings,
  getTokenCost,
  tokenPartColors,
} from '@/registry/components/dashboardblocks/ai-usage'
import { Ring } from '@/registry/components/dashboardblocks/ring'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface AiUsage4Props {
  description: string
  /** Hit rate for the period before, 0–1, to show the change. */
  previousHitRate?: number
  prices: TokenPrices
  title: string
  tokens: TokenCounts
}

const exampleProps: AiUsage4Props = {
  description: 'Prompt caching across all requests, this month',
  previousHitRate: 0.24,
  prices: { cached: 0.3, input: 3, output: 15 },
  title: 'Prompt caching',
  tokens: { cached: 83_000_000, input: 197_000_000, output: 25_500_000 },
}

const AiUsage4 = (props: AiUsage4Props) => {
  const { description, previousHitRate, prices, title, tokens } = props
  const hitRate = getCacheHitRate(tokens)
  const saved = getCacheSavings(tokens.cached ?? 0, prices)
  const cost = getTokenCost(tokens, prices)
  const change = previousHitRate !== undefined ? hitRate - previousHitRate : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <div className='flex items-center gap-4'>
          <Ring
            ariaLabel={`${Math.round(hitRate * 100)}% of input tokens served from the cache`}
            className='size-20'
            percentage={hitRate * 100}
            ringColor={tokenPartColors.cached}
            strokeWidth={9}
          >
            <span aria-hidden className='text-lg font-semibold tabular-nums'>
              {Math.round(hitRate * 100)}%
            </span>
          </Ring>
          <div className='flex flex-col gap-0.5'>
            <span className='text-sm font-medium'>Cache hit rate</span>
            <span className='text-muted-foreground text-sm'>of input tokens</span>
            {change !== null && (
              <span
                className={
                  change >= 0
                    ? 'text-xs font-medium text-green-700 dark:text-green-400'
                    : 'text-xs font-medium text-red-700 dark:text-red-400'
                }
              >
                {change >= 0 ? '↑' : '↓'} {Math.abs(change * 100).toFixed(1)} pts on last
                month
              </span>
            )}
          </div>
        </div>
        <dl className='grid grid-cols-2 gap-4 border-t pt-4'>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Saved by caching</dt>
            <dd className='text-2xl font-semibold tracking-tight text-green-700 tabular-nums dark:text-green-400'>
              {formatUsd(saved)}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Spent on tokens</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {formatUsd(cost)}
            </dd>
            <dd className='text-muted-foreground text-xs'>
              would be {formatUsd(cost + saved)} without the cache
            </dd>
          </div>
        </dl>
        <div className='flex flex-col gap-2'>
          <TokenSplitBar tokens={tokens} />
          <ul className='text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs tabular-nums'>
            <li className='flex items-center gap-1.5'>
              <span
                aria-hidden
                className='size-2.5 rounded-[3px]'
                style={{ backgroundColor: tokenPartColors.input }}
              />
              Input {formatTokens(tokens.input)}
            </li>
            <li className='flex items-center gap-1.5'>
              <span
                aria-hidden
                className='size-2.5 rounded-[3px]'
                style={{ backgroundColor: tokenPartColors.cached }}
              />
              Cached {formatTokens(tokens.cached ?? 0)}
            </li>
            <li className='flex items-center gap-1.5'>
              <span
                aria-hidden
                className='size-2.5 rounded-[3px]'
                style={{ backgroundColor: tokenPartColors.output }}
              />
              Output {formatTokens(tokens.output)}
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export { AiUsage4, exampleProps as aiUsage4ExampleProps, type AiUsage4Props }
