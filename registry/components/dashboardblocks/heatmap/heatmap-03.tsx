'use client'

import {
  HeatmapGrid,
  HeatmapLegend,
  type HeatmapValue,
} from '@/registry/components/dashboardblocks/heatmap'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Heatmap3Props {
  /** One value per day, oldest first, ending on `endDate`. */
  daily: number[]
  description: string
  endDate: Date
  title: string
  /** Unit for the readout, e.g. "deploys". */
  unit: string
}

const DAY = 86_400_000
const WEEKS = 52
const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]
const ROW_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', '']

const exampleProps: Heatmap3Props = {
  daily: Array.from({ length: 360 }, (_, day) => {
    const weekday = (day + 3) % 7
    const weekend = weekday >= 5
    const busy = Math.sin(day / 9) * 2.4 + Math.sin(day / 3.1) * 1.6 + day / 90
    const value = weekend ? Math.max(0, busy - 3) : 3 + busy
    return (day * 37) % 23 === 0 ? 0 : Math.max(0, Math.round(value))
  }),
  description: 'Production deploys per day, last 12 months',
  endDate: new Date(Date.UTC(2026, 8, 25)),
  title: 'Deploys',
  unit: 'deploys',
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
})
const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  timeZone: 'UTC',
})

const Heatmap3 = (props: Heatmap3Props) => {
  const { daily, description, endDate, title, unit } = props
  // Columns are weeks starting on Monday; the last column holds `endDate`.
  const endWeekday = (endDate.getUTCDay() + 6) % 7
  const start = endDate.getTime() - ((WEEKS - 1) * 7 + endWeekday) * DAY
  const dateAt = (row: number, column: number) =>
    new Date(start + (column * 7 + row) * DAY)
  const firstDay = endDate.getTime() - (daily.length - 1) * DAY

  const values: HeatmapValue[][] = DAY_NAMES.map((_, row) =>
    Array.from({ length: WEEKS }, (_, column) => {
      const time = dateAt(row, column).getTime()
      if (time > endDate.getTime() || time < firstDay) return null
      return daily[Math.round((time - firstDay) / DAY)] ?? null
    }),
  )
  // Label the first week of each month, skipping a partial first month
  // whose label would collide with the next one.
  const startsMonth = (column: number) =>
    column === 0 ||
    dateAt(0, column).getUTCMonth() !== dateAt(0, column - 1).getUTCMonth()
  const columns = Array.from({ length: WEEKS }, (_, column) => {
    if (!startsMonth(column)) return ''
    if (column === 0 && [1, 2].some(startsMonth)) return ''
    return monthFormatter.format(dateAt(0, column))
  })
  const total = daily.reduce((sum, value) => sum + value, 0)
  const activeDays = daily.filter((value) => value > 0).length

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <HeatmapGrid
          minWidth='40rem'
          cellClassName='aspect-square min-h-0'
          columns={columns}
          describe={({ column, row }, value) => {
            const date = dateAt(row, column)
            return value === null
              ? `${DAY_NAMES[row]}, ${dateFormatter.format(date)}: no data`
              : `${DAY_NAMES[row]}, ${dateFormatter.format(date)}: ${value} ${unit}`
          }}
          footer={<HeatmapLegend />}
          label={`${title}: ${description}`}
          rowHeader='Day'
          rowLabelClassName='text-[10px] leading-none'
          rowNames={DAY_NAMES}
          rows={ROW_LABELS}
          values={values}
        >
          {`${total.toLocaleString()} ${unit} on ${activeDays} days`}
        </HeatmapGrid>
      </CardContent>
    </Card>
  )
}

export { Heatmap3, exampleProps as heatmap3ExampleProps, type Heatmap3Props }
