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
import {
  BlockReady,
  BlockStateProvider,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  KPI,
  KPIChange,
  KPITitle,
  KPIValue,
} from '@/registry/components/dashboardblocks/kpi'

interface AiUsage4Props extends BlockStateProps {
  /** Follows the previous hit rate in the sentence. @default 'last month' */
  comparison?: string
  description: string
  /** Hit rate for the period before, 0–1, to show the change. */
  previousHitRate?: number
  prices: TokenPrices
  title: string
  /** Leave out to show the empty state. */
  tokens?: TokenCounts
}

const exampleProps: AiUsage4Props = {
  description: 'All requests this month. Cached input costs a tenth of the input price.',
  previousHitRate: 0.24,
  prices: { cached: 0.3, input: 3, output: 15 },
  title: 'Prompt caching',
  tokens: { cached: 83_000_000, input: 197_000_000, output: 25_500_000 },
}

const tokenParts = [
  { key: 'input', label: 'Input' },
  { key: 'cached', label: 'Cached' },
  { key: 'output', label: 'Output' },
] as const

const AiUsage4 = (props: AiUsage4Props) => {
  const {
    comparison = 'last month',
    description,
    previousHitRate,
    prices,
    errorMessage,
    status,
    title,
    tokens = { input: 0, output: 0 },
  } = props
  const state = getBlockState(status, props.tokens)
  const hitRate = getCacheHitRate(tokens)
  const saved = getCacheSavings(tokens.cached ?? 0, prices)
  const cost = getTokenCost(tokens, prices)
  const asPercent = (rate: number) => Math.round(rate * 1_000) / 10

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <KPI className='gap-1 pt-4'>
          <KPITitle>Input tokens served from the cache</KPITitle>
          <KPIValue value={asPercent(hitRate)} format='percent' animated />
          {previousHitRate !== undefined && (
            <KPIChange
              changeType='points'
              comparison={comparison}
              format='percent'
              previous={asPercent(previousHitRate)}
              value={asPercent(hitRate)}
            />
          )}
        </KPI>
        {state !== 'empty' && state !== 'error' && (
          <>
            <dl className='grid grid-cols-2 gap-4 border-t pt-4'>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>Saved by caching</dt>
                <dd>
                  <KPIValue className='text-2xl' value={saved} format={formatUsd} />
                </dd>
              </div>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>Spent on tokens</dt>
                <dd>
                  <KPIValue className='text-2xl' value={cost} format={formatUsd} />
                </dd>
                <dd className='text-muted-foreground text-xs'>
                  <BlockReady className='text-xs'>
                    {formatUsd(cost + saved)} without the cache
                  </BlockReady>
                </dd>
              </div>
            </dl>
            <div className='flex flex-col gap-2'>
              <TokenSplitBar tokens={tokens} />
              <BlockReady className='text-xs'>
                <ul className='text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs tabular-nums'>
                  {tokenParts.map((part) => (
                    <li key={part.key} className='flex items-center gap-1.5'>
                      <span
                        aria-hidden
                        className='size-2.5 rounded-[3px]'
                        style={{ backgroundColor: tokenPartColors[part.key] }}
                      />
                      {part.label}
                      <span className='text-foreground font-medium'>
                        {formatTokens(tokens[part.key] ?? 0)}
                      </span>
                    </li>
                  ))}
                </ul>
              </BlockReady>
            </div>
          </>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { AiUsage4, exampleProps as aiUsage4ExampleProps, type AiUsage4Props }
