'use client'

import { HeatmapLegend } from '@/registry/components/dashboardblocks/heatmap'
import {
  CohortTable,
  type RetentionCohort,
  formatRetention,
  getAverageRetention,
} from '@/registry/components/dashboardblocks/retention'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Retention1Props {
  /** Oldest first. `retained[0]` is period 0, usually the whole cohort. */
  cohorts: RetentionCohort[]
  description: string
  /** Shows each cell as a share of the cohort or as a count. @default 'percent' */
  mode?: 'percent' | 'count'
  /** @default 'Month' */
  periodName?: string
  title: string
}

const COHORT_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
const COHORT_SIZES = [1_184, 1_246, 1_402, 1_318, 1_527, 1_611, 1_489, 1_702, 1_836]

const exampleProps: Retention1Props = {
  // Retention drops fast, then levels off; newer cohorts level off a little higher.
  cohorts: COHORT_NAMES.map((name, index) => {
    const size = COHORT_SIZES[index]
    const floor = 0.21 + index * 0.012
    const periods = COHORT_NAMES.length - index
    return {
      label: `${name} 2026`,
      retained: Array.from({ length: periods }, (_, month) => {
        if (month === 0) return size
        const rate = floor + (0.62 - floor) * Math.exp(-(month - 1) / 1.4)
        const wobble = Math.sin(index * 2.3 + month * 1.7) * 0.012
        return Math.round(size * (rate + wobble))
      }),
      size,
    }
  }),
  description: 'Share of each monthly signup cohort still active, by months since signup',
  periodName: 'Month',
  title: 'Cohort retention',
}

const Retention1 = (props: Retention1Props) => {
  const { cohorts, description, mode = 'percent', periodName = 'Month', title } = props
  const averages = getAverageRetention(cohorts)
  const unit = periodName.toLowerCase()
  const milestone = Math.min(3, averages.length - 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <CohortTable
          caption={`${title}: ${description}. The last row is the average, weighted by cohort size.`}
          cohorts={cohorts}
          footer={<HeatmapLegend low='Fewer' high='More retained' />}
          minWidth='36rem'
          mode={mode}
          periodName={periodName}
        >
          {milestone > 0 && averages[milestone] !== null
            ? `On average, ${formatRetention(averages[milestone] ?? 0)} are still active in ${unit} ${milestone}`
            : null}
        </CohortTable>
      </CardContent>
    </Card>
  )
}

export { Retention1, exampleProps as retention1ExampleProps, type Retention1Props }
