'use client'

import {
  formatTokens,
  formatUsd,
  modelPalette,
} from '@/registry/components/dashboardblocks/ai-usage'
import {
  BlockReady,
  BlockStateProvider,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ChartPlaceholder,
  chartAxisProps,
  chartBarCursor,
  chartGridProps,
  chartReferenceProps,
  ChartTooltipContent,
  chartValueAxisWidth,
} from '@/registry/components/dashboardblocks/chart'
import {
  ChartPanelFigure,
  ChartPanelTable,
} from '@/registry/components/dashboardblocks/chart-panel'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface ModelUsage {
  cost: number
  id: string
  label: string
}

interface UsageDay {
  label: string
  tokens: Record<string, number>
}

interface AiUsage1Props extends BlockStateProps {
  /** Leave out, or pass none, to show the empty state. */
  days?: UsageDay[]
  description: string
  models?: ModelUsage[]
  title: string
}

const DAYS = [
  'Sep 13',
  'Sep 14',
  'Sep 15',
  'Sep 16',
  'Sep 17',
  'Sep 18',
  'Sep 19',
  'Sep 20',
  'Sep 21',
  'Sep 22',
  'Sep 23',
  'Sep 24',
  'Sep 25',
  'Sep 26',
]
const WEEKEND = new Set([0, 1, 7, 8])

const exampleProps: AiUsage1Props = {
  days: DAYS.map((label, index) => {
    const load = WEEKEND.has(index) ? 0.45 : 1 + index * 0.03
    return {
      label,
      tokens: {
        embeddings: Math.round(3_100_000 * load),
        fast: Math.round(8_400_000 * load),
        reasoning: Math.round(2_600_000 * load * (index > 9 ? 1.4 : 1)),
      },
    }
  }),
  description: 'Tokens per day by model over the last 14 days.',
  models: [
    { cost: 1_184, id: 'reasoning', label: 'Reasoning' },
    { cost: 312, id: 'fast', label: 'Fast' },
    { cost: 19, id: 'embeddings', label: 'Embeddings' },
  ],
  title: 'Token usage',
}

const AiUsage1 = (props: AiUsage1Props) => {
  const { days = [], description, models = [], errorMessage, status, title } = props
  const state = getBlockState(status, days)
  const colorOf = (index: number) => modelPalette[index % modelPalette.length]
  const rows = days.map((day) => ({ label: day.label, ...day.tokens }))
  const totals = models.map((model) =>
    days.reduce((sum, day) => sum + (day.tokens[model.id] ?? 0), 0),
  )
  const tokens = totals.reduce((sum, value) => sum + value, 0)
  const cost = models.reduce((sum, model) => sum + model.cost, 0)
  const average = days.length > 0 ? tokens / days.length : 0

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <dl className='grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-4 @lg:grid-cols-3'>
          <div className='col-span-2 flex flex-col gap-1 @lg:col-span-1'>
            <dt className='text-muted-foreground text-sm'>Tokens</dt>
            <dd>
              <KPIValue
                className='whitespace-nowrap'
                value={tokens}
                format={formatTokens}
              />
            </dd>
          </div>
          {state !== 'empty' && state !== 'error' && (
            <>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>Cost</dt>
                <dd>
                  <KPIValue className='text-2xl' value={cost} format={formatUsd} />
                </dd>
              </div>
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>Per million tokens</dt>
                <dd>
                  <KPIValue
                    className='text-2xl'
                    value={tokens > 0 ? (cost / tokens) * 1_000_000 : 0}
                    format={formatUsd}
                  />
                </dd>
              </div>
            </>
          )}
        </dl>
        <BlockReady className='text-sm'>
          <div className='flex flex-col gap-1.5'>
            <p
              aria-hidden
              className='text-muted-foreground flex items-center gap-1.5 text-xs'
            >
              All {days.length} days, averaging
              <span className='tabular-nums'>{formatTokens(average)}</span> a day
              <span className='border-foreground/50 w-3 border-t border-dashed' />
            </p>
            <ul className='flex flex-wrap gap-x-6 gap-y-2 text-sm'>
              {models.map((model, index) => (
                <li key={model.id} className='flex items-baseline gap-1.5'>
                  <span
                    aria-hidden
                    className='size-2.5 shrink-0 self-center rounded-[3px]'
                    style={{ backgroundColor: colorOf(index) }}
                  />
                  <span className='text-muted-foreground'>{model.label}</span>
                  <span className='font-medium tabular-nums'>
                    {formatTokens(totals[index])}
                  </span>
                  <span className='text-muted-foreground text-xs tabular-nums'>
                    {formatUsd(model.cost)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </BlockReady>
        {state ? (
          <ChartPlaceholder height={240} />
        ) : (
          <ChartPanelFigure className='h-60'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                aria-label={`${title} chart`}
                data={rows}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid {...chartGridProps} />
                <XAxis
                  {...chartAxisProps}
                  dataKey='label'
                  interval='preserveStartEnd'
                  minTickGap={20}
                />
                <YAxis
                  {...chartAxisProps}
                  tickFormatter={formatTokens}
                  width={chartValueAxisWidth}
                />
                <Tooltip
                  content={(tooltipProps) => (
                    <ChartTooltipContent
                      {...tooltipProps}
                      valueFormatter={formatTokens}
                    />
                  )}
                  cursor={chartBarCursor}
                />
                {models.map((model, index) => (
                  <Bar
                    key={model.id}
                    dataKey={model.id}
                    fill={colorOf(index)}
                    name={model.label}
                    radius={index === models.length - 1 ? [4, 4, 0, 0] : 0}
                    stackId='tokens'
                  />
                ))}
                {average > 0 && <ReferenceLine {...chartReferenceProps} y={average} />}
              </BarChart>
            </ResponsiveContainer>
          </ChartPanelFigure>
        )}
        {!state && (
          <ChartPanelTable
            caption={`${title}: ${description}`}
            columns={[
              { key: 'label', label: 'Day' },
              ...models.map((model) => ({
                format: formatTokens,
                key: model.id,
                label: model.label,
              })),
            ]}
            rows={rows}
          />
        )}
      </section>
    </BlockStateProvider>
  )
}

export {
  AiUsage1,
  exampleProps as aiUsage1ExampleProps,
  type AiUsage1Props,
  type ModelUsage,
  type UsageDay,
}
