'use client'

import {
  type TokenCounts,
  TokenSplitBar,
  formatTokens,
  formatUsd,
  tokenPartColors,
} from '@/registry/components/dashboardblocks/ai-usage'
import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  BlockStateText,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { formatPercent, joinDetails } from '@/registry/lib/dashboardblocks/format'

interface FeatureUsage {
  cost: number
  label: string
  requests: number
  tokens: TokenCounts
}

interface AiUsage2Props {
  /** Defaults to a sentence naming the feature that costs the most. */
  description?: string
  /** Leave out, or pass none, to show the empty state. */
  features?: FeatureUsage[]
  /** Ends the sentence under the total. @default 'this month' */
  period?: string
  status?: BlockStatus
  title: string
}

const exampleProps: AiUsage2Props = {
  features: [
    {
      cost: 842,
      label: 'Research agent',
      requests: 18_400,
      tokens: { cached: 21_000_000, input: 64_000_000, output: 9_800_000 },
    },
    {
      cost: 391,
      label: 'Chat assistant',
      requests: 212_000,
      tokens: { cached: 58_000_000, input: 41_000_000, output: 12_600_000 },
    },
    {
      cost: 144,
      label: 'Ticket summaries',
      requests: 96_500,
      tokens: { cached: 4_000_000, input: 38_000_000, output: 3_100_000 },
    },
    {
      cost: 27,
      label: 'Search embeddings',
      requests: 1_480_000,
      tokens: { input: 54_000_000, output: 0 },
    },
  ],
  title: 'Cost by feature',
}

const tokenParts = [
  { color: tokenPartColors.input, label: 'Input' },
  { color: tokenPartColors.cached, label: 'Cached input' },
  { color: tokenPartColors.output, label: 'Output' },
]

const describe = (sorted: FeatureUsage[], total: number) => {
  const top = sorted[0]
  if (!top || total <= 0) return 'No model spend yet.'
  return `${top.label} takes ${formatPercent(top.cost / total, { maximumFractionDigits: 0 })} of the spend.`
}

const AiUsage2 = (props: AiUsage2Props) => {
  const { features = [], period = 'this month', status, title } = props
  const state = getBlockState(status, features)
  const total = features.reduce((sum, feature) => sum + feature.cost, 0)
  const sorted = [...features].sort((a, b) => b.cost - a.cost)
  const { description = describe(sorted, total) } = props

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        <div className='flex flex-col gap-1 border-t pt-4'>
          <KPIValue value={total} format={formatUsd} />
          {state === 'loading' ? (
            <BlockStateText className='text-sm' />
          ) : state ? null : (
            <p className='text-muted-foreground text-sm'>
              Spent on models across {features.length}{' '}
              {features.length === 1 ? 'feature' : 'features'} {period}.
            </p>
          )}
        </div>
        {state !== 'empty' && state !== 'error' && (
          <ul
            aria-hidden
            className='text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs'
          >
            {tokenParts.map((part) => (
              <li key={part.label} className='flex items-center gap-1.5'>
                <span
                  className='size-2.5 rounded-[3px]'
                  style={{ backgroundColor: part.color }}
                />
                {part.label}
              </li>
            ))}
          </ul>
        )}
        {state === 'loading' && <BlockStateRows className='border-t' rows={4} />}
        {!state && (
          <ul className='flex flex-col border-t'>
            {sorted.map((feature) => {
              const all =
                feature.tokens.input +
                (feature.tokens.cached ?? 0) +
                feature.tokens.output
              return (
                <li key={feature.label} className='flex flex-col gap-2 border-b py-3'>
                  <div className='flex items-baseline justify-between gap-3'>
                    <span className='text-sm font-medium'>{feature.label}</span>
                    <span className='text-sm tabular-nums'>
                      <span className='font-medium'>{formatUsd(feature.cost)}</span>
                      <span className='text-muted-foreground ml-1.5 inline-block w-8 text-right text-xs'>
                        {formatPercent(total > 0 ? feature.cost / total : 0, {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </span>
                  </div>
                  <TokenSplitBar tokens={feature.tokens} />
                  <div className='text-muted-foreground flex flex-wrap justify-between gap-x-3 gap-y-0.5 text-xs tabular-nums'>
                    <span>
                      {joinDetails(
                        `${formatTokens(all)} tokens`,
                        `${formatTokens(feature.requests)} requests`,
                      )}
                    </span>
                    <span>
                      {formatUsd((feature.cost / (feature.requests || 1)) * 1_000)} per 1K
                      requests
                    </span>
                  </div>
                  <span className='sr-only'>
                    {`${formatTokens(feature.tokens.input)} input, ${formatTokens(feature.tokens.cached ?? 0)} cached input and ${formatTokens(feature.tokens.output)} output tokens.`}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  AiUsage2,
  exampleProps as aiUsage2ExampleProps,
  type AiUsage2Props,
  type FeatureUsage,
}
