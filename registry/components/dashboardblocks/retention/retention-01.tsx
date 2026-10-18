'use client'

import {
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { HeatmapLegend } from '@/registry/components/dashboardblocks/heatmap'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import {
  CohortTable,
  type RetentionCohort,
  getAverageRetention,
} from '@/registry/components/dashboardblocks/retention'
import { formatPercent } from '@/registry/lib/dashboardblocks/format'

interface Retention1Props {
  /** Oldest first. Leave out, or pass none, to show the empty state. */
  cohorts?: RetentionCohort[]
  description: string
  mode?: 'percent' | 'count'
  /** @default 'Month' */
  periodName?: string
  status?: BlockStatus
  title: string
}

const COHORT_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
const COHORT_SIZES = [1_184, 1_246, 1_402, 1_318, 1_527, 1_611, 1_489, 1_702, 1_836]

const exampleProps: Retention1Props = {
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
  description:
    'Share of each monthly signup cohort still active, by months since signup.',
  periodName: 'Month',
  title: 'Cohort retention',
}

const Retention1 = (props: Retention1Props) => {
  const {
    cohorts = [],
    description,
    mode = 'percent',
    periodName = 'Month',
    status,
    title,
  } = props
  const state = getBlockState(status, cohorts.length === 0)
  const averages = getAverageRetention(cohorts)
  const unit = periodName.toLowerCase()
  const milestone = state ? 3 : Math.min(3, averages.length - 1)
  const milestoneRate = milestone > 0 ? averages[milestone] : null
  const reached = cohorts.filter((cohort) => cohort.retained.length > milestone)
  const best = reached.reduce<RetentionCohort | null>(
    (top, cohort) =>
      top === null ||
      cohort.retained[milestone] / (cohort.size || 1) >
        top.retained[milestone] / (top.size || 1)
        ? cohort
        : top,
    null,
  )

  return (
    <BlockStateProvider status={status} empty={cohorts.length === 0}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        {(state || (milestoneRate !== null && milestoneRate !== undefined)) && (
          <dl className='flex flex-wrap items-end gap-x-10 gap-y-3 border-t pt-4'>
            <div className='flex flex-col gap-1'>
              <dt className='text-muted-foreground text-sm'>
                Still active in {unit} {milestone}, on average
              </dt>
              <dd>
                <KPIValue
                  value={milestoneRate ?? undefined}
                  format={(value) => formatPercent(value, { maximumFractionDigits: 0 })}
                />
              </dd>
            </div>
            {state === 'loading' && (
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>Best cohort</dt>
                <dd>
                  <KPIValue className='text-2xl' value={undefined} />
                </dd>
              </div>
            )}
            {!state && best && (
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>Best cohort</dt>
                <dd className='text-2xl font-light tracking-tight tabular-nums'>
                  {best.label}
                  <span className='text-muted-foreground ml-2 text-sm'>
                    {formatPercent(best.retained[milestone] / (best.size || 1), {
                      maximumFractionDigits: 0,
                    })}{' '}
                    in {unit} {milestone}
                  </span>
                </dd>
              </div>
            )}
          </dl>
        )}
        {state === 'loading' && <BlockStateRows className='border-t' rows={6} />}
        {!state && (
          <CohortTable
            caption={`${title}: ${description} The last row is the average, weighted by cohort size.`}
            cohorts={cohorts}
            footer={<HeatmapLegend low='Fewer' high='More retained' />}
            minWidth='36rem'
            mode={mode}
            periodName={periodName}
          />
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Retention1, exampleProps as retention1ExampleProps, type Retention1Props }
