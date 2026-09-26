'use client'

import {
  formatTokens,
  formatUsd,
  modelPalette,
} from '@/registry/components/dashboardblocks/ai-usage'
import {
  ChartPanelFigure,
  ChartPanelLegend,
  ChartPanelTable,
  ChartPanelTooltip,
  chartAxisProps,
  chartGridProps,
} from '@/registry/components/dashboardblocks/chart-panel'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface ModelUsage {
  /** Cost over the whole period. */
  cost: number
  id: string
  label: string
}

interface UsageDay {
  label: string
  /** Tokens per model id. */
  tokens: Record<string, number>
}

interface AiUsage1Props {
  days: UsageDay[]
  description: string
  /** In legend order; each keeps its colour. */
  models: ModelUsage[]
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
  description: 'Tokens per day by model, last 14 days',
  models: [
    { cost: 1_184, id: 'reasoning', label: 'Reasoning' },
    { cost: 312, id: 'fast', label: 'Fast' },
    { cost: 19, id: 'embeddings', label: 'Embeddings' },
  ],
  title: 'Token usage',
}

const AiUsage1 = (props: AiUsage1Props) => {
  const { days, description, models, title } = props
  const colorOf = (index: number) => modelPalette[index % modelPalette.length]
  const rows = days.map((day) => ({ label: day.label, ...day.tokens }))
  const totals = models.map((model) =>
    days.reduce((sum, day) => sum + (day.tokens[model.id] ?? 0), 0),
  )
  const tokens = totals.reduce((sum, value) => sum + value, 0)
  const cost = models.reduce((sum, model) => sum + model.cost, 0)

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <dl className='grid grid-cols-2 gap-4 @md:grid-cols-3'>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Tokens</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {formatTokens(tokens)}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Cost</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {formatUsd(cost)}
            </dd>
          </div>
          <div className='col-span-2 flex flex-col gap-0.5 @md:col-span-1'>
            <dt className='text-muted-foreground text-xs'>Per million tokens</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {formatUsd(tokens > 0 ? (cost / tokens) * 1_000_000 : 0)}
            </dd>
          </div>
        </dl>
        <ChartPanelLegend
          items={models.map((model, index) => ({
            color: colorOf(index),
            label: model.label,
          }))}
        />
        <ChartPanelFigure className='h-56'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid {...chartGridProps} />
              <XAxis
                {...chartAxisProps}
                dataKey='label'
                interval='preserveStartEnd'
                minTickGap={20}
              />
              <YAxis {...chartAxisProps} tickFormatter={formatTokens} width={52} />
              <Tooltip
                content={(tooltipProps) => (
                  <ChartPanelTooltip {...tooltipProps} valueFormatter={formatTokens} />
                )}
                cursor={{ fill: 'var(--color-muted)', fillOpacity: 0.5 }}
              />
              {models.map((model, index) => (
                <Bar
                  key={model.id}
                  dataKey={model.id}
                  fill={colorOf(index)}
                  name={model.label}
                  radius={index === models.length - 1 ? [3, 3, 0, 0] : 0}
                  stackId='tokens'
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartPanelFigure>
        <ul className='grid grid-cols-3 gap-2 border-t pt-4'>
          {models.map((model, index) => (
            <li key={model.id} className='flex flex-col gap-0.5 text-sm'>
              <span className='flex items-center gap-1.5'>
                <span
                  aria-hidden
                  className='size-2.5 shrink-0 rounded-[3px]'
                  style={{ backgroundColor: colorOf(index) }}
                />
                {model.label}
              </span>
              <span className='text-muted-foreground tabular-nums'>
                {formatTokens(totals[index])} ·{' '}
                <span className='text-foreground font-medium'>
                  {formatUsd(model.cost)}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <ChartPanelTable
          caption={`${title}: ${description}.`}
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
      </CardContent>
    </Card>
  )
}

export {
  AiUsage1,
  exampleProps as aiUsage1ExampleProps,
  type AiUsage1Props,
  type ModelUsage,
  type UsageDay,
}
