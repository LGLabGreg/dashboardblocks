'use client'

import {
  ChartPanelFigure,
  ChartPanelLegend,
  ChartPanelTable,
  chartAxisProps,
  chartGridProps,
} from '@/registry/components/dashboardblocks/chart-panel'
import {
  ScatterTooltipContent,
  scatterPalette,
} from '@/registry/components/dashboardblocks/scatter'
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Campaign {
  channel: string
  /** Cost per acquisition. */
  cpa: number
  /** Conversion rate, 0–1. */
  conversion: number
  label: string
  spend: number
}

interface Scatter3Props {
  campaigns: Campaign[]
  /** In legend order; each keeps its colour. */
  channels: string[]
  description: string
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
  description: 'Each bubble is a campaign, sized by spend, last quarter',
  title: 'Campaign efficiency',
}

const money = (value: number) =>
  value >= 1_000 ? `$${(value / 1_000).toFixed(1)}K` : `$${Math.round(value)}`
const percent = (value: number) => `${(value * 100).toFixed(1)}%`

const Scatter3 = (props: Scatter3Props) => {
  const { campaigns, channels, description, title } = props
  const colorOf = (channel: string) =>
    scatterPalette[Math.max(0, channels.indexOf(channel)) % scatterPalette.length]
  const totalSpend = campaigns.reduce((sum, campaign) => sum + campaign.spend, 0)
  // Cheapest acquisitions first, as the campaigns to grow.
  const best = [...campaigns].sort((a, b) => a.cpa - b.cpa)[0]
  const worst = [...campaigns].sort((a, b) => b.cpa - a.cpa)[0]

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
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
        <ChartPanelFigure className='h-72'>
          <ResponsiveContainer width='100%' height='100%'>
            <ScatterChart margin={{ top: 12, right: 16, bottom: 16, left: 0 }}>
              <CartesianGrid {...chartGridProps} vertical />
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
                width={48}
              />
              <ZAxis dataKey='spend' name='Spend' range={[80, 1_200]} />
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
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </ChartPanelFigure>
        {best && worst && (
          <p className='text-muted-foreground text-sm'>
            <span className='text-foreground font-medium'>{best.label}</span> acquires at{' '}
            {money(best.cpa)},{' '}
            <span className='text-foreground font-medium'>{worst.label}</span> at{' '}
            {money(worst.cpa)}. Further left and higher up is better.
          </p>
        )}
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
      </CardContent>
    </Card>
  )
}

export {
  Scatter3,
  exampleProps as scatter3ExampleProps,
  type Campaign,
  type Scatter3Props,
}
