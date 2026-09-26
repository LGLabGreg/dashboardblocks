'use client'

import {
  type TokenCounts,
  TokenSplitBar,
  formatTokens,
  formatUsd,
  tokenPartColors,
} from '@/registry/components/dashboardblocks/ai-usage'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface FeatureUsage {
  cost: number
  label: string
  requests: number
  tokens: TokenCounts
}

interface AiUsage2Props {
  description: string
  features: FeatureUsage[]
  title: string
}

const exampleProps: AiUsage2Props = {
  description: 'Model spend by product feature, this month',
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

const AiUsage2 = (props: AiUsage2Props) => {
  const { description, features, title } = props
  const total = features.reduce((sum, feature) => sum + feature.cost, 0) || 1
  const sorted = [...features].sort((a, b) => b.cost - a.cost)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <ul className='flex flex-col divide-y'>
          {sorted.map((feature) => {
            const all =
              feature.tokens.input + (feature.tokens.cached ?? 0) + feature.tokens.output
            return (
              <li
                key={feature.label}
                className='flex flex-col gap-2 py-3 first:pt-0 last:pb-0'
              >
                <div className='flex items-baseline justify-between gap-3'>
                  <span className='text-sm font-medium'>{feature.label}</span>
                  <span className='text-sm tabular-nums'>
                    <span className='font-semibold'>{formatUsd(feature.cost)}</span>
                    <span className='text-muted-foreground ml-1.5 text-xs'>
                      {Math.round((feature.cost / total) * 100)}%
                    </span>
                  </span>
                </div>
                <TokenSplitBar tokens={feature.tokens} />
                <div className='text-muted-foreground flex flex-wrap justify-between gap-x-3 gap-y-0.5 text-xs tabular-nums'>
                  <span>
                    {formatTokens(all)} tokens, {formatTokens(feature.requests)} requests
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
        <ul
          aria-hidden
          className='text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-xs'
        >
          <li className='flex items-center gap-1.5'>
            <span
              className='size-2.5 rounded-[3px]'
              style={{ backgroundColor: tokenPartColors.input }}
            />
            Input
          </li>
          <li className='flex items-center gap-1.5'>
            <span
              className='size-2.5 rounded-[3px]'
              style={{ backgroundColor: tokenPartColors.cached }}
            />
            Cached input
          </li>
          <li className='flex items-center gap-1.5'>
            <span
              className='size-2.5 rounded-[3px]'
              style={{ backgroundColor: tokenPartColors.output }}
            />
            Output
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}

export {
  AiUsage2,
  exampleProps as aiUsage2ExampleProps,
  type AiUsage2Props,
  type FeatureUsage,
}
