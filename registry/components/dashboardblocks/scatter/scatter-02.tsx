'use client'

import {
  ChartPanelFigure,
  ChartPanelTable,
  chartAxisProps,
  chartGridProps,
} from '@/registry/components/dashboardblocks/chart-panel'
import {
  ScatterTooltipContent,
  getMedian,
} from '@/registry/components/dashboardblocks/scatter'
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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface QuadrantItem {
  label: string
  x: number
  y: number
}

interface Scatter2Props {
  description: string
  items: QuadrantItem[]
  /** Names for the four quadrants: top left, top right, bottom left, bottom right. */
  quadrants: [string, string, string, string]
  title: string
  /** Where to split. Defaults to the medians. */
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
  description: 'Share of accounts using each feature against their satisfaction with it',
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
    format: (value) => `${Math.round(value)}%`,
    label: 'Usage',
    ticks: [0, 25, 50, 75, 100],
  },
  y: {
    domain: [2, 5],
    format: (value) => value.toFixed(1),
    label: 'Satisfaction',
    ticks: [2, 3, 4, 5],
  },
}

const Scatter2 = (props: Scatter2Props) => {
  const { description, items, quadrants, title, x, y } = props
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
  ) => ({
    fill: 'var(--color-muted-foreground)',
    fontSize: 11,
    fontWeight: 500,
    position,
    value,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <ChartPanelFigure className='h-80'>
          <ResponsiveContainer width='100%' height='100%'>
            <ScatterChart margin={{ top: 8, right: 16, bottom: 16, left: 0 }}>
              <CartesianGrid {...chartGridProps} vertical />
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
              <ReferenceLine
                stroke='var(--color-muted-foreground)'
                strokeDasharray='4 4'
                x={split.x}
              />
              <ReferenceLine
                stroke='var(--color-muted-foreground)'
                strokeDasharray='4 4'
                y={split.y}
              />
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
                width={36}
              />
              <Tooltip
                content={({ active, payload }) => {
                  const item = payload?.[0]?.payload as QuadrantItem | undefined
                  if (!active || !item) return null
                  return (
                    <ScatterTooltipContent
                      color='var(--chart-1)'
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
                fill='var(--chart-1)'
                stroke='var(--color-card)'
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
        <p className='text-muted-foreground text-xs'>
          {`Split at the median: ${x.format(split.x)} ${x.label.toLowerCase()} and ${y.format(split.y)} ${y.label.toLowerCase()}.`}
        </p>
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
      </CardContent>
    </Card>
  )
}

export {
  Scatter2,
  exampleProps as scatter2ExampleProps,
  type QuadrantItem,
  type Scatter2Props,
}
