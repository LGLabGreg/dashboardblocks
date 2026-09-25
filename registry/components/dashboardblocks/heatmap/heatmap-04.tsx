'use client'

import {
  HeatmapGrid,
  HeatmapLegend,
  getPeak,
} from '@/registry/components/dashboardblocks/heatmap'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Heatmap4Props {
  description: string
  endpoints: string[]
  title: string
  /** p95 latency in ms: one row per endpoint, one value per two-hour window. */
  values: number[][]
}

const WINDOWS = Array.from({ length: 12 }, (_, index) =>
  String(index * 2).padStart(2, '0'),
)

const exampleProps: Heatmap4Props = {
  description: 'p95 latency by endpoint, in two-hour windows over the last 24 hours',
  endpoints: [
    'GET /v1/products',
    'GET /v1/orders',
    'POST /v1/checkout',
    'POST /v1/search',
    'GET /v1/account',
    'POST /v1/webhooks',
  ],
  title: 'Latency hot spots',
  values: [
    [110, 1.0],
    [160, 1.3],
    [420, 2.2],
    [260, 1.8],
    [90, 1.1],
    [210, 1.5],
  ].map(([base, load], row) =>
    WINDOWS.map((_, window) => {
      const traffic = Math.exp(-((window - 8) ** 2) / 6)
      const spike = row === 2 && window === 9 ? 1.6 : 1
      return Math.round(base * (1 + traffic * load) * spike)
    }),
  ),
}

const formatMs = (value: number) => `${value.toLocaleString()} ms`
const windowRange = (index: number) =>
  `${WINDOWS[index]}:00–${String((index * 2 + 2) % 24).padStart(2, '0')}:00`

const Heatmap4 = (props: Heatmap4Props) => {
  const { description, endpoints, title, values } = props
  const peak = getPeak(values)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <HeatmapGrid
          cellClassName='h-7'
          columnLabelEvery={2}
          columns={WINDOWS.map((window) => `${window}:00`)}
          describe={({ column, row }, value) =>
            `${endpoints[row]}, ${windowRange(column)}: ${value === null ? 'no data' : formatMs(value)} p95`
          }
          footer={<HeatmapLegend low='Faster' high='Slower' />}
          format={formatMs}
          label={`${title}: ${description}`}
          rowHeader='Endpoint'
          minWidth='32rem'
          rowLabelClassName='font-mono text-[11px]'
          rows={endpoints}
          values={values}
        >
          {peak &&
            `Slowest: ${endpoints[peak.row]}, ${windowRange(peak.column)}, at ${formatMs(peak.value)}`}
        </HeatmapGrid>
      </CardContent>
    </Card>
  )
}

export { Heatmap4, exampleProps as heatmap4ExampleProps, type Heatmap4Props }
