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

interface Cohort {
  label: string
  /** Share of the cohort still active in each week after signup, in percent. */
  retention: number[]
  size: number
}

interface Heatmap2Props {
  cohorts: Cohort[]
  description: string
  title: string
  weeks: number
}

const WEEKS = 7

const exampleProps: Heatmap2Props = {
  cohorts: ['Aug 3', 'Aug 10', 'Aug 17', 'Aug 24', 'Aug 31', 'Sep 7', 'Sep 14'].map(
    (label, index) => ({
      label,
      retention: Array.from({ length: WEEKS - index }, (_, week) =>
        Math.round((58 + index * 1.5) * Math.exp(-week * 0.24) + 14 - week * 0.6),
      ),
      size: [1_204, 1_318, 1_156, 1_402, 1_377, 1_511, 1_463][index],
    }),
  ),
  description: 'Share of each weekly signup cohort still active, by week since signup',
  title: 'Retention by cohort',
  weeks: WEEKS,
}

const Heatmap2 = (props: Heatmap2Props) => {
  const { cohorts, description, title, weeks } = props
  const columns = Array.from({ length: weeks }, (_, week) => `W${week + 1}`)
  const rows = cohorts.map((cohort) => cohort.label)
  const values: HeatmapValue[][] = cohorts.map((cohort) =>
    columns.map((_, week) => cohort.retention[week] ?? null),
  )
  const firstWeek = cohorts.map((cohort) => cohort.retention[0]).filter(Boolean)
  const average =
    firstWeek.reduce((sum, value) => sum + value, 0) / (firstWeek.length || 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <HeatmapGrid
          cellClassName='h-8'
          cellLabels
          columns={columns}
          describe={({ column, row }, value) => {
            const cohort = cohorts[row]
            return value === null
              ? `${cohort.label} cohort: week ${column + 1} not reached yet`
              : `${cohort.label} cohort (${cohort.size.toLocaleString()} signups): ${value}% active in week ${column + 1}`
          }}
          footer={<HeatmapLegend low='Lower' high='Higher' />}
          format={(value) => `${value}%`}
          label={`${title}: ${description}`}
          rowHeader='Cohort'
          rowLabelClassName='tabular-nums'
          rows={rows}
          values={values}
        >
          {`Week 1 retention averages ${average.toFixed(0)}%`}
        </HeatmapGrid>
      </CardContent>
    </Card>
  )
}

export { Heatmap2, exampleProps as heatmap2ExampleProps, type Heatmap2Props }
