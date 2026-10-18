'use client'

import {
  BlockStateProvider,
  BlockStateText,
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
  ChartPanelTable,
} from '@/registry/components/dashboardblocks/chart-panel'
import {
  ScatterTooltipContent,
  getMedian,
} from '@/registry/components/dashboardblocks/scatter'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'
import {
  CartesianGrid,
  LabelList,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface QuadrantItem {
  label: string
  x: number
  y: number
}

interface Scatter2Props {
  description: string
  /** Leave out, or pass none, to show the empty state. */
  items?: QuadrantItem[]
  /** Names for the four quadrants: top left, top right, bottom left, bottom right. */
  quadrants: [string, string, string, string]
  status?: BlockStatus
  title: string
  split?: { x: number; y: number }
  x: {
    domain: [number, number]
    format: (value: number) => string
    label: string
    ticks?: number[]
  }
  y: {
    domain: [number, number]
    format: (value: number) => string
    label: string
    ticks?: number[]
  }
}

const exampleProps: Scatter2Props = {
  description:
    'How many accounts use each feature, against how satisfied they are with it.',
  items: [
    { label: 'Dashboards', x: 86, y: 4.4 },
    { label: 'Alerts', x: 71, y: 4.1 },
    { label: 'Exports', x: 64, y: 3.2 },
    { label: 'API', x: 38, y: 4.5 },
    { label: 'Scheduled reports', x: 29, y: 4.2 },
    { label: 'Sharing', x: 57, y: 2.9 },
    { label: 'Mobile app', x: 22, y: 2.7 },
    { label: 'Annotations', x: 14, y: 3.6 },
    { label: 'Integrations', x: 46, y: 3.9 },
  ],
  quadrants: ['Promote', 'Protect', 'Rethink', 'Fix'],
  title: 'Feature priorities',
  x: {
    domain: [0, 100],
    format: (value) => formatPercent(value / 100, { maximumFractionDigits: 0 }),
    label: 'Usage',
    ticks: [0, 25, 50, 75, 100],
  },
  y: {
    domain: [2, 5],
    format: (value) => formatNumber(value, { minimumFractionDigits: 1 }),
    label: 'Satisfaction',
    ticks: [2, 3, 4, 5],
  },
}

const Scatter2 = (props: Scatter2Props) => {
  const { description, items = [], quadrants, status, title, x, y } = props
  const state = getBlockState(status, items.length === 0)
  const split = props.split ?? {
    x: getMedian(items.map((item) => item.x)),
    y: getMedian(items.map((item) => item.y)),
  }
  const quadrantOf = (item: QuadrantItem) =>
    quadrants[(item.y >= split.y ? 0 : 2) + (item.x >= split.x ? 1 : 0)]
  const label = (
    value: string,
    position:
      | 'insideTopLeft'
      | 'insideTopRight'
      | 'insideBottomLeft'
      | 'insideBottomRight',
  ) => ({ ...chartReferenceLabel, fontWeight: 500, position, value })

  return (
    <BlockStateProvider status={status} empty={items.length === 0}>
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
          <p className='text-muted-foreground border-t pt-4 text-sm'>
            {`Split at ${props.split ? '' : 'the medians, '}${x.format(split.x)} ${x.label.toLowerCase()} and ${y.format(split.y)} ${y.label.toLowerCase()}.`}
          </p>
        )}
        <ChartPanelFigure className='h-80'>
          <ResponsiveContainer width='100%' height='100%'>
            <ScatterChart
              aria-label={`${title} chart`}
              margin={{ top: 8, right: 16, bottom: 16, left: 0 }}
            >
              <CartesianGrid {...chartGridProps} />
              <ReferenceArea
                fill='var(--color-muted)'
                fillOpacity={0.5}
                label={label(quadrants[1], 'insideTopRight')}
                x1={split.x}
                x2={x.domain[1]}
                y1={split.y}
                y2={y.domain[1]}
              />
              <ReferenceArea
                fillOpacity={0}
                label={label(quadrants[0], 'insideTopLeft')}
                x1={x.domain[0]}
                x2={split.x}
                y1={split.y}
                y2={y.domain[1]}
              />
              <ReferenceArea
                fillOpacity={0}
                label={label(quadrants[2], 'insideBottomLeft')}
                x1={x.domain[0]}
                x2={split.x}
                y1={y.domain[0]}
                y2={split.y}
              />
              <ReferenceArea
                fillOpacity={0}
                label={label(quadrants[3], 'insideBottomRight')}
                x1={split.x}
                x2={x.domain[1]}
                y1={y.domain[0]}
                y2={split.y}
              />
              <ReferenceLine {...chartReferenceProps} x={split.x} />
              <ReferenceLine {...chartReferenceProps} y={split.y} />
              <XAxis
                {...chartAxisProps}
                dataKey='x'
                domain={x.domain}
                label={{
                  fill: 'var(--color-muted-foreground)',
                  fontSize: 11,
                  offset: -12,
                  position: 'insideBottom',
                  value: `${x.label} →`,
                }}
                name={x.label}
                tickFormatter={x.format}
                ticks={x.ticks}
                type='number'
              />
              <YAxis
                {...chartAxisProps}
                dataKey='y'
                domain={y.domain}
                name={y.label}
                tickFormatter={y.format}
                ticks={y.ticks}
                type='number'
                width={chartValueAxisWidth}
              />
              <Tooltip
                content={({ active, payload }) => {
                  const item = payload?.[0]?.payload as QuadrantItem | undefined
                  if (!active || !item) return null
                  return (
                    <ScatterTooltipContent
                      color='var(--color-chart-2)'
                      rows={[
                        { label: x.label, value: x.format(item.x) },
                        { label: y.label, value: y.format(item.y) },
                        { label: 'Quadrant', value: quadrantOf(item) },
                      ]}
                      title={item.label}
                    />
                  )
                }}
                cursor={false}
              />
              <Scatter
                data={items}
                fill='var(--color-chart-2)'
                stroke='var(--color-background)'
                strokeWidth={2}
              >
                <LabelList
                  dataKey='label'
                  fill='var(--color-foreground)'
                  fontSize={11}
                  offset={8}
                  position='top'
                />
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartPanelFigure>
        <ChartPanelTable
          caption={`${title}: ${description}.`}
          columns={[
            { key: 'label', label: 'Feature' },
            { format: x.format, key: 'x', label: x.label },
            { format: y.format, key: 'y', label: y.label },
            { key: 'quadrant', label: 'Quadrant' },
          ]}
          rows={items.map((item) => ({ ...item, quadrant: quadrantOf(item) }))}
        />
      </section>
    </BlockStateProvider>
  )
}

export {
  Scatter2,
  exampleProps as scatter2ExampleProps,
  type QuadrantItem,
  type Scatter2Props,
}
