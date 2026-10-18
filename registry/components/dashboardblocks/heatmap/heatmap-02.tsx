'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { HeatmapLegend } from '@/registry/components/dashboardblocks/heatmap'
import {
  CohortTable,
  type RetentionCohort,
  getAverageRetention,
} from '@/registry/components/dashboardblocks/retention'
import { formatPercent } from '@/registry/lib/dashboardblocks/format'

interface Heatmap2Props {
  /** Oldest first, one per signup week. Leave out, or pass none, to show the empty state. */
  cohorts?: RetentionCohort[]
  /** Defaults to a sentence about week 1 retention. */
  description?: string
  status?: BlockStatus
  title: string
}

const COHORT_SIZES = [1_204, 1_318, 1_156, 1_402, 1_377, 1_511, 1_463]

const exampleProps: Heatmap2Props = {
  cohorts: ['Aug 3', 'Aug 10', 'Aug 17', 'Aug 24', 'Aug 31', 'Sep 7', 'Sep 14'].map(
    (label, index) => {
      const size = COHORT_SIZES[index]
      return {
        label,
        retained: [
          size,
          ...Array.from({ length: COHORT_SIZES.length - index - 1 }, (_, week) => {
            const share = (58 + index * 1.5) * Math.exp(-week * 0.24) + 14 - week * 0.6
            return Math.round((size * share) / 100)
          }),
        ],
        size,
      }
    },
  ),
  title: 'Retention by cohort',
}

const Heatmap2 = (props: Heatmap2Props) => {
  const { cohorts = [], status, title } = props
  const state = getBlockState(status, cohorts)
  const averages = getAverageRetention(cohorts)
  const firstWeek = averages[1]
  const {
    description = firstWeek == null
      ? 'No cohort has reached its first week yet.'
      : `${formatPercent(firstWeek, { maximumFractionDigits: 0 })} of each weekly signup cohort is still active a week later, on average.`,
  } = props

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        {state ? (
          <div className='border-t pt-4'>
            <BlockStateRows rows={7} />
          </div>
        ) : (
          <CohortTable
            caption={`${title}: the share of each weekly signup cohort still active, by week since signup. The last row is the average, weighted by cohort size.`}
            className='border-t pt-4'
            cohorts={cohorts}
            footer={<HeatmapLegend low='Fewer' high='More retained' />}
            minWidth='32rem'
            periodName='Week'
            sizeHeader='Signups'
          />
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Heatmap2, exampleProps as heatmap2ExampleProps, type Heatmap2Props }
