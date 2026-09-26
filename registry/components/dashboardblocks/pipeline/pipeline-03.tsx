'use client'

import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from '@/registry/components/dashboardblocks/data-table'
import {
  PipelineAge,
  type PipelineItem,
  PipelineOwner,
  type PipelineStage,
  formatAge,
  getDaysInStage,
  isStuck,
} from '@/registry/components/dashboardblocks/pipeline'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Pipeline3Props {
  items: PipelineItem[]
  /** What the items are called, such as "candidates". */
  noun?: string
  /** The time days in stage are measured from. */
  now: Date
  /** Stages with the days an item is expected to spend in each. */
  stages: PipelineStage[]
  title: string
}

const NOW = Date.UTC(2026, 8, 25, 14, 30)
const daysAgo = (days: number) => new Date(NOW - days * 86_400_000)

const exampleProps: Pipeline3Props = {
  items: [
    {
      enteredStageAt: daysAgo(2),
      id: 'c1',
      owner: 'Priya Nair',
      stage: 'screen',
      subtitle: 'Senior frontend engineer',
      title: 'Daniel Okafor',
    },
    {
      enteredStageAt: daysAgo(9),
      id: 'c2',
      owner: 'Priya Nair',
      stage: 'screen',
      subtitle: 'Product designer',
      title: 'Sofia Lindqvist',
    },
    {
      enteredStageAt: daysAgo(4),
      id: 'c3',
      owner: 'Tom Becker',
      stage: 'interview',
      subtitle: 'Data engineer',
      title: 'Ravi Menon',
    },
    {
      enteredStageAt: daysAgo(15),
      id: 'c4',
      owner: 'Tom Becker',
      stage: 'interview',
      subtitle: 'Senior frontend engineer',
      title: 'Hannah Cole',
    },
    {
      enteredStageAt: daysAgo(11),
      id: 'c5',
      owner: 'Grace Kim',
      stage: 'interview',
      subtitle: 'Engineering manager',
      title: 'Marco Bianchi',
    },
    {
      enteredStageAt: daysAgo(6),
      id: 'c6',
      owner: 'Grace Kim',
      stage: 'feedback',
      subtitle: 'Product designer',
      title: 'Amara Diallo',
    },
    {
      enteredStageAt: daysAgo(1),
      id: 'c7',
      owner: 'Tom Becker',
      stage: 'feedback',
      subtitle: 'Data engineer',
      title: 'Leo Martins',
    },
    {
      enteredStageAt: daysAgo(8),
      id: 'c8',
      owner: 'Priya Nair',
      stage: 'offer',
      subtitle: 'Support lead',
      title: 'Nora Haddad',
    },
    {
      enteredStageAt: daysAgo(3),
      id: 'c9',
      owner: 'Grace Kim',
      stage: 'offer',
      subtitle: 'Senior frontend engineer',
      title: 'Ethan Brooks',
    },
  ],
  noun: 'candidates',
  now: new Date(NOW),
  stages: [
    { expectedDays: 5, id: 'screen', label: 'Phone screen' },
    { expectedDays: 10, id: 'interview', label: 'Interviews' },
    { expectedDays: 3, id: 'feedback', label: 'Feedback' },
    { expectedDays: 5, id: 'offer', label: 'Offer out' },
  ],
  title: 'Stuck candidates',
}

const Pipeline3 = (props: Pipeline3Props) => {
  const { items, noun = 'items', now, stages, title } = props
  const stageById = new Map(stages.map((stage) => [stage.id, stage]))

  // Longest over their limit first, relative to the limit.
  const stuck = items
    .map((item) => {
      const stage = stageById.get(item.stage)
      const days = getDaysInStage(item.enteredStageAt, now)
      return { days, item, stage }
    })
    .filter(({ days, stage }) => stage && isStuck(days, stage.expectedDays))
    .sort(
      (a, b) =>
        b.days / (b.stage?.expectedDays || 1) - a.days / (a.stage?.expectedDays || 1),
    )

  return (
    <Card className='@container/data-table gap-0 pb-0'>
      <CardHeader className='border-b'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {stuck.length} of {items.length} {noun} over their expected time in stage
        </CardDescription>
      </CardHeader>
      {stuck.length === 0 ? (
        <p className='text-muted-foreground flex items-center gap-2 px-6 py-6 text-sm'>
          <IconPlaceholder
            lucide='CircleCheckIcon'
            tabler='IconCircleCheck'
            hugeicons='CheckmarkCircle02Icon'
            phosphor='CheckCircleIcon'
            remixicon='RiCheckboxCircleLine'
            aria-hidden
            className='size-4 text-emerald-700 dark:text-emerald-400'
          />
          Nothing is stuck: all {items.length} {noun} are within their expected time.
        </p>
      ) : (
        <DataTable>
          <caption className='sr-only'>{title}</caption>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Name</DataTableHead>
              <DataTableHead>Stage</DataTableHead>
              <DataTableHead>In stage</DataTableHead>
              <DataTableHead>Over by</DataTableHead>
              <DataTableHead>Owner</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
          <DataTableBody>
            {stuck.map(({ days, item, stage }) => {
              const expected = stage?.expectedDays ?? 0
              return (
                <DataTableRow key={item.id}>
                  <DataTableCell primary truncate>
                    <span className='block truncate'>{item.title}</span>
                    {item.subtitle && (
                      <span className='text-muted-foreground block truncate text-xs font-normal'>
                        {item.subtitle}
                      </span>
                    )}
                  </DataTableCell>
                  <DataTableCell label='Stage' className='whitespace-nowrap'>
                    {stage?.label}
                  </DataTableCell>
                  <DataTableCell label='In stage'>
                    <span className='inline-flex flex-wrap items-center gap-x-1.5'>
                      <PipelineAge
                        className='-ml-1.5'
                        days={days}
                        expectedDays={expected}
                      />
                      <span
                        aria-hidden
                        className='text-muted-foreground text-xs whitespace-nowrap'
                      >
                        of {expected}d
                      </span>
                    </span>
                  </DataTableCell>
                  <DataTableCell
                    label='Over by'
                    className='whitespace-nowrap tabular-nums'
                  >
                    {formatAge(days - expected, 'long')}
                  </DataTableCell>
                  <DataTableCell label='Owner'>
                    <PipelineOwner name={item.owner ?? 'Unassigned'} showName />
                  </DataTableCell>
                </DataTableRow>
              )
            })}
          </DataTableBody>
        </DataTable>
      )}
    </Card>
  )
}

export { Pipeline3, exampleProps as pipeline3ExampleProps, type Pipeline3Props }
