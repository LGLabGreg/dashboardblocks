'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  DataTableStateRows,
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

interface Pipeline3Props {
  /** Defaults to a sentence counting the stuck items and naming the one waiting longest. */
  description?: string
  /** Leave out, or pass none, to show the empty state. */
  items?: PipelineItem[]
  noun?: string
  now: Date
  stages: PipelineStage[]
  status?: BlockStatus
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
      ownerAvatar: '/images/avatar-02.webp',
      stage: 'screen',
      subtitle: 'Senior frontend engineer',
      title: 'Daniel Okafor',
    },
    {
      enteredStageAt: daysAgo(9),
      id: 'c2',
      owner: 'Priya Nair',
      ownerAvatar: '/images/avatar-02.webp',
      stage: 'screen',
      subtitle: 'Product designer',
      title: 'Sofia Lindqvist',
    },
    {
      enteredStageAt: daysAgo(4),
      id: 'c3',
      owner: 'Tom Becker',
      ownerAvatar: '/images/avatar-07.webp',
      stage: 'interview',
      subtitle: 'Data engineer',
      title: 'Ravi Menon',
    },
    {
      enteredStageAt: daysAgo(15),
      id: 'c4',
      owner: 'Tom Becker',
      ownerAvatar: '/images/avatar-07.webp',
      stage: 'interview',
      subtitle: 'Senior frontend engineer',
      title: 'Hannah Cole',
    },
    {
      enteredStageAt: daysAgo(11),
      id: 'c5',
      owner: 'Grace Kim',
      ownerAvatar: '/images/avatar-04.webp',
      stage: 'interview',
      subtitle: 'Engineering manager',
      title: 'Marco Bianchi',
    },
    {
      enteredStageAt: daysAgo(6),
      id: 'c6',
      owner: 'Grace Kim',
      ownerAvatar: '/images/avatar-04.webp',
      stage: 'feedback',
      subtitle: 'Product designer',
      title: 'Amara Diallo',
    },
    {
      enteredStageAt: daysAgo(1),
      id: 'c7',
      owner: 'Tom Becker',
      ownerAvatar: '/images/avatar-07.webp',
      stage: 'feedback',
      subtitle: 'Data engineer',
      title: 'Leo Martins',
    },
    {
      enteredStageAt: daysAgo(8),
      id: 'c8',
      owner: 'Priya Nair',
      ownerAvatar: '/images/avatar-02.webp',
      stage: 'offer',
      subtitle: 'Support lead',
      title: 'Nora Haddad',
    },
    {
      enteredStageAt: daysAgo(3),
      id: 'c9',
      owner: 'Grace Kim',
      ownerAvatar: '/images/avatar-04.webp',
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
  const { items = [], noun = 'items', now, stages, status, title } = props
  const state = getBlockState(status, items)
  const stageById = new Map(stages.map((stage) => [stage.id, stage]))

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

  const longest = stuck[0]
  const {
    description = longest
      ? `${stuck.length} of ${items.length} ${noun} past their stage’s time limit; ${longest.item.title} is ${formatAge(longest.days - (longest.stage?.expectedDays ?? 0), 'long')} over.`
      : `All ${items.length} ${noun} are within their stage’s time limit.`,
  } = props

  return (
    <BlockStateProvider state={state}>
      <section className='@container/data-table flex flex-col gap-3 [--data-table-inset:0px]'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        {!state && stuck.length === 0 ? (
          <p className='text-muted-foreground flex items-center gap-2 border-t pt-4 text-sm'>
            <IconPlaceholder
              lucide='CircleCheckIcon'
              tabler='IconCircleCheck'
              hugeicons='CheckmarkCircle02Icon'
              phosphor='CheckCircleIcon'
              remixicon='RiCheckboxCircleLine'
              aria-hidden
              className='size-4 text-emerald-700 dark:text-emerald-400'
            />
            Nothing is stuck.
          </p>
        ) : (
          <DataTable>
            <caption className='sr-only'>{`${title}: ${description}`}</caption>
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
              <DataTableStateRows colSpan={5} rows={3} />
              {!state &&
                stuck.map(({ days, item, stage }) => {
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
                        <span className='inline-flex flex-wrap items-baseline gap-x-1.5'>
                          <PipelineAge days={days} expectedDays={expected} />
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
                        <PipelineOwner
                          avatar={item.ownerAvatar}
                          name={item.owner ?? 'Unassigned'}
                          showName
                        />
                      </DataTableCell>
                    </DataTableRow>
                  )
                })}
            </DataTableBody>
          </DataTable>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Pipeline3, exampleProps as pipeline3ExampleProps, type Pipeline3Props }
