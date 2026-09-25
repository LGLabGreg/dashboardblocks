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

interface Heatmap1Props {
  description: string
  /** Seven rows, Monday first, of 24 hourly values. */
  values: number[][]
  title: string
  /** Unit for the readout, e.g. "sessions". */
  unit: string
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0'))

const exampleProps: Heatmap1Props = {
  description: 'Average sessions by weekday and hour, last 4 weeks',
  title: 'When people visit',
  unit: 'sessions',
  values: DAYS.map((_, day) =>
    HOURS.map((_, hour) => {
      const weekend = day >= 5
      const workday = Math.exp(-((hour - 14) ** 2) / 18) * (weekend ? 0.45 : 1)
      const evening = Math.exp(-((hour - 21) ** 2) / 6) * (weekend ? 0.8 : 0.5)
      const night = hour < 6 ? 0.04 : 0
      return Math.round(40 + 1_240 * (workday + evening + night) * (1 - day * 0.03))
    }),
  ),
}

const Heatmap1 = (props: Heatmap1Props) => {
  const { description, title, unit, values } = props
  const peak = getPeak(values)
  const hourRange = (hour: number) =>
    `${HOURS[hour]}:00–${String((hour + 1) % 24).padStart(2, '0')}:00`

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <HeatmapGrid
          cellClassName='h-5'
          columnLabelEvery={3}
          columns={HOURS}
          footer={<HeatmapLegend />}
          describe={({ column, row }, value) =>
            `${DAYS[row]}, ${hourRange(column)}: ${value?.toLocaleString() ?? 'no data'} ${unit}`
          }
          label={`${title}: ${description}`}
          rowHeader='Day'
          rows={DAYS}
          values={values}
        >
          {peak &&
            `Busiest: ${DAYS[peak.row]}, ${hourRange(peak.column)}, with ${peak.value.toLocaleString()} ${unit}`}
        </HeatmapGrid>
      </CardContent>
    </Card>
  )
}

export { Heatmap1, exampleProps as heatmap1ExampleProps, type Heatmap1Props }
