'use client'

import {
  BlockStateProvider,
  BlockStateText,
  type BlockStateProps,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  chartAxisProps,
  chartGridProps,
  chartReferenceLabel,
  chartReferenceProps,
  chartValueAxisWidth,
} from '@/registry/components/dashboardblocks/chart'
import {
  ChartPanelFigure,
  ChartPanelLegend,
  ChartPanelTable,
} from '@/registry/components/dashboardblocks/chart-panel'
import {
  ScatterTooltipContent,
  scatterPalette,
} from '@/registry/components/dashboardblocks/scatter'
import { formatCurrency, formatPercent } from '@/registry/lib/dashboardblocks/format'
import {
  CartesianGrid,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'

interface Campaign {
  channel: string
  cpa: number
  /** Conversion rate, 0–1. */
  conversion: number
  label: string
  spend: number
}

interface Scatter3Props extends BlockStateProps {
  /** Leave out, or pass none, to show the empty state. */
  campaigns?: Campaign[]
  channels: string[]
  description: string
  /** A cost per acquisition to stay under, drawn as a line. */
  status?: BlockStatus
  target?: { label: string; value: number }
  title: string
}

const exampleProps: Scatter3Props = {
  campaigns: [
    {
      channel: 'Search',
      conversion: 0.061,
      cpa: 38,
      label: 'Brand terms',
      spend: 18_400,
    },
    {
      channel: 'Search',
      conversion: 0.034,
      cpa: 72,
      label: 'Competitor terms',
      spend: 26_900,
    },
    {
      channel: 'Search',
      conversion: 0.029,
      cpa: 96,
      label: 'Generic terms',
      spend: 41_200,
    },
    {
      channel: 'Social',
      conversion: 0.018,
      cpa: 64,
      label: 'Retargeting',
      spend: 12_300,
    },
    {
      channel: 'Social',
      conversion: 0.009,
      cpa: 141,
      label: 'Lookalikes',
      spend: 22_700,
    },
    {
      channel: 'Social',
      conversion: 0.006,
      cpa: 188,
      label: 'Video awareness',
      spend: 30_100,
    },
    {
      channel: 'Partners',
      conversion: 0.047,
      cpa: 52,
      label: 'Affiliates',
      spend: 9_800,
    },
    {
      channel: 'Partners',
      conversion: 0.022,
      cpa: 118,
      label: 'Sponsorships',
      spend: 15_600,
    },
  ],
  channels: ['Search', 'Social', 'Partners'],
  description: 'Each bubble is a campaign from last quarter, sized by what it spent.',
  target: { label: 'Target', value: 100 },
  title: 'Campaign efficiency',
}

const money = (value: number) => formatCurrency(value, { compact: value >= 1_000 })
const percent = (value: number) => formatPercent(value, { minimumFractionDigits: 1 })

const Scatter3 = (props: Scatter3Props) => {
  const {
    campaigns = [],
    channels,
    description,
    errorMessage,
    status,
    target,
    title,
  } = props
  const state = getBlockState(status, campaigns)
  const colorOf = (channel: string) =>
    scatterPalette[Math.max(0, channels.indexOf(channel)) % scatterPalette.length]
  const totalSpend = campaigns.reduce((sum, campaign) => sum + campaign.spend, 0)
  const best = [...campaigns].sort((a, b) => a.cpa - b.cpa)[0]
  const worst = [...campaigns].sort((a, b) => b.cpa - a.cpa)[0]
  const overTarget = target
    ? campaigns.filter((campaign) => campaign.cpa > target.value)
    : []

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        {state ? (
          <div className='border-t pt-4'>
            <BlockStateText className='text-sm' />
          </div>
        ) : (
          best &&
          worst && (
            <p className='text-muted-foreground border-t pt-4 text-sm'>
              <span className='text-foreground font-medium'>{best.label}</span> acquires
              at {money(best.cpa)} and{' '}
              <span className='text-foreground font-medium'>{worst.label}</span> at{' '}
              {money(worst.cpa)}.
              {target &&
                ` ${overTarget.length} of ${campaigns.length} campaigns cost more than the ${money(target.value)} ${target.label.toLowerCase()}.`}{' '}
              Further left and higher up is better.
            </p>
          )
        )}
        {state !== 'empty' && state !== 'error' && (
          <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-2'>
            <ChartPanelLegend
              items={channels.map((channel) => ({
                color: colorOf(channel),
                label: channel,
              }))}
            />
            <span className='text-muted-foreground flex items-center gap-1.5 text-xs'>
              <span aria-hidden className='flex items-end gap-0.5'>
                <span className='border-muted-foreground size-1.5 rounded-full border' />
                <span className='border-muted-foreground size-2.5 rounded-full border' />
                <span className='border-muted-foreground size-3.5 rounded-full border' />
              </span>
              Size is spend
            </span>
          </div>
        )}
        <ChartPanelFigure className='h-72'>
          <ResponsiveContainer width='100%' height='100%'>
            <ScatterChart
              aria-label={`${title} chart`}
              margin={{ top: 12, right: 16, bottom: 16, left: 0 }}
            >
              <CartesianGrid {...chartGridProps} />
              <XAxis
                {...chartAxisProps}
                dataKey='cpa'
                domain={[0, 'auto']}
                label={{
                  fill: 'var(--color-muted-foreground)',
                  fontSize: 11,
                  offset: -12,
                  position: 'insideBottom',
                  value: 'Cost per acquisition',
                }}
                name='Cost per acquisition'
                tickFormatter={money}
                type='number'
              />
              <YAxis
                {...chartAxisProps}
                dataKey='conversion'
                domain={[0, 'auto']}
                name='Conversion'
                tickFormatter={percent}
                type='number'
                width={chartValueAxisWidth}
              />
              <ZAxis dataKey='spend' name='Spend' range={[80, 1_200]} />
              {target && (
                <ReferenceLine
                  {...chartReferenceProps}
                  x={target.value}
                  label={{
                    ...chartReferenceLabel,
                    value: `${target.label} ${money(target.value)}`,
                    position: 'insideTopRight',
                  }}
                />
              )}
              <Tooltip
                content={({ active, payload }) => {
                  const campaign = payload?.[0]?.payload as Campaign | undefined
                  if (!active || !campaign) return null
                  return (
                    <ScatterTooltipContent
                      color={colorOf(campaign.channel)}
                      rows={[
                        { label: 'Spend', value: money(campaign.spend) },
                        { label: 'Cost per acquisition', value: money(campaign.cpa) },
                        { label: 'Conversion', value: percent(campaign.conversion) },
                      ]}
                      title={campaign.label}
                    />
                  )
                }}
                cursor={false}
              />
              {channels.map((channel) => (
                <Scatter
                  key={channel}
                  data={campaigns.filter((campaign) => campaign.channel === channel)}
                  fill={colorOf(channel)}
                  fillOpacity={0.55}
                  name={channel}
                  stroke={colorOf(channel)}
                  strokeWidth={1.5}
                >
                  <LabelList
                    dataKey='label'
                    content={({ value, width, x, y }) =>
                      value === best?.label || value === worst?.label ? (
                        <text
                          x={Number(x) + Number(width ?? 0) / 2}
                          y={Number(y) - 4}
                          textAnchor='middle'
                          fontSize={11}
                          fontWeight={500}
                          fill='var(--color-foreground)'
                        >
                          {value}
                        </text>
                      ) : null
                    }
                  />
                </Scatter>
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </ChartPanelFigure>
        <ChartPanelTable
          caption={`${title}: ${description}. ${money(totalSpend)} spent in total.`}
          columns={[
            { key: 'label', label: 'Campaign' },
            { key: 'channel', label: 'Channel' },
            { format: money, key: 'spend', label: 'Spend' },
            { format: money, key: 'cpa', label: 'Cost per acquisition' },
            { format: percent, key: 'conversion', label: 'Conversion' },
          ]}
          rows={campaigns}
        />
      </section>
    </BlockStateProvider>
  )
}

export {
  Scatter3,
  exampleProps as scatter3ExampleProps,
  type Campaign,
  type Scatter3Props,
}
