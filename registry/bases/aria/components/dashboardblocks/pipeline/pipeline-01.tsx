// Override of registry/components/dashboardblocks/pipeline/pipeline-01.tsx for React Aria
// source-hash: aea8298e0011

'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  BlockStateText,
  type BlockStateProps,
  Skeleton,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  PipelineCard,
  type PipelineItem,
  type PipelineStage,
  PipelineStageHeader,
  getDaysInStage,
  getStageColor,
  getStageSummaries,
} from '@/registry/components/dashboardblocks/pipeline'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatCurrency } from '@/registry/lib/dashboardblocks/format'
import { useId, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Pipeline1Props extends BlockStateProps {
  /** Defaults to a sentence with the open value and how many items are stuck. */
  description?: string
  /** Leave out, or pass none, to show the empty state. */
  items?: PipelineItem[]
  now: Date
  onMove?: (id: string, stage: string) => void
  stages: PipelineStage[]
  title: string
}

const NOW = Date.UTC(2026, 8, 25, 14, 30)
const noItems: PipelineItem[] = []

const daysAgo = (days: number) => new Date(NOW - days * 86_400_000)

const exampleProps: Pipeline1Props = {
  items: [
    {
      enteredStageAt: daysAgo(5),
      id: 'd1',
      owner: 'Maya Patel',
      ownerAvatar: '/images/avatar-01.webp',
      stage: 'qualified',
      subtitle: 'Fleet analytics rollout',
      title: 'Northwind Logistics',
      value: 42_000,
    },
    {
      enteredStageAt: daysAgo(21),
      id: 'd2',
      owner: 'Luis Romero',
      ownerAvatar: '/images/avatar-06.webp',
      stage: 'qualified',
      subtitle: 'Patient portal pilot',
      title: 'Brightline Health',
      value: 18_500,
    },
    {
      enteredStageAt: daysAgo(3),
      id: 'd3',
      owner: 'Aiko Tanaka',
      ownerAvatar: '/images/avatar-04.webp',
      stage: 'qualified',
      subtitle: 'Supplier dashboard',
      title: 'Orbital Foods',
      value: 27_000,
    },
    {
      enteredStageAt: daysAgo(8),
      id: 'd4',
      owner: 'Jonas Weber',
      ownerAvatar: '/images/avatar-07.webp',
      stage: 'discovery',
      subtitle: 'Risk reporting suite',
      title: 'Kestrel Bank',
      value: 96_000,
    },
    {
      enteredStageAt: daysAgo(16),
      id: 'd5',
      owner: 'Maya Patel',
      ownerAvatar: '/images/avatar-01.webp',
      stage: 'discovery',
      subtitle: 'District licences',
      title: 'Pinecrest Schools',
      value: 31_200,
    },
    {
      enteredStageAt: daysAgo(2),
      id: 'd6',
      owner: 'Luis Romero',
      ownerAvatar: '/images/avatar-06.webp',
      stage: 'discovery',
      subtitle: 'Booking insights',
      title: 'Halcyon Travel',
      value: 54_000,
    },
    {
      enteredStageAt: daysAgo(6),
      id: 'd7',
      owner: 'Aiko Tanaka',
      ownerAvatar: '/images/avatar-04.webp',
      stage: 'proposal',
      subtitle: 'Enterprise plan, 400 seats',
      title: 'Atlas Freight',
      value: 128_000,
    },
    {
      enteredStageAt: daysAgo(12),
      id: 'd8',
      owner: 'Jonas Weber',
      ownerAvatar: '/images/avatar-07.webp',
      stage: 'proposal',
      subtitle: 'Data warehouse sync',
      title: 'Meridian Labs',
      value: 64_500,
    },
    {
      enteredStageAt: daysAgo(4),
      id: 'd9',
      owner: 'Maya Patel',
      ownerAvatar: '/images/avatar-01.webp',
      stage: 'proposal',
      subtitle: 'Usage metering',
      title: 'Solstice Energy',
      value: 39_900,
    },
    {
      enteredStageAt: daysAgo(3),
      id: 'd10',
      owner: 'Jonas Weber',
      ownerAvatar: '/images/avatar-07.webp',
      stage: 'negotiation',
      subtitle: 'Multi-region renewal',
      title: 'Vantage Retail',
      value: 212_000,
    },
    {
      enteredStageAt: daysAgo(11),
      id: 'd11',
      owner: 'Luis Romero',
      ownerAvatar: '/images/avatar-06.webp',
      stage: 'negotiation',
      subtitle: 'Claims analytics',
      title: 'Copperleaf Insurance',
      value: 87_000,
    },
  ],
  now: new Date(NOW),
  stages: [
    { expectedDays: 14, id: 'qualified', label: 'Qualified', probability: 0.1 },
    { expectedDays: 10, id: 'discovery', label: 'Discovery', probability: 0.25 },
    { expectedDays: 10, id: 'proposal', label: 'Proposal', probability: 0.5 },
    { expectedDays: 7, id: 'negotiation', label: 'Negotiation', probability: 0.75 },
  ],
  title: 'Sales pipeline',
}

const compact = (value: number) => formatCurrency(value, { compact: true })

const Pipeline1 = (props: Pipeline1Props) => {
  const {
    items: loadedItems = noItems,
    now,
    onMove,
    stages,
    errorMessage,
    status,
    title,
  } = props
  const id = useId()
  const [moves, setMoves] = useState<{ id: string; stage: string }[]>([])
  const [announcement, setAnnouncement] = useState('')
  const state = getBlockState(status, loadedItems)
  const items = useMemo(
    () =>
      moves.reduce((current, moved) => {
        const item = current.find((other) => other.id === moved.id)
        if (!item) return current
        return [
          { ...item, enteredStageAt: now, stage: moved.stage },
          ...current.filter((other) => other.id !== moved.id),
        ]
      }, loadedItems),
    [loadedItems, moves, now],
  )
  const summaries = getStageSummaries(stages, items, now)
  const total = summaries.reduce((sum, stage) => sum + stage.value, 0)
  const stuck = summaries.reduce((sum, stage) => sum + stage.stuck, 0)
  const {
    description = `${items.length} open ${items.length === 1 ? 'deal' : 'deals'} worth ${compact(total)}; ${stuck === 0 ? 'none' : stuck} past their stage’s time limit.`,
  } = props

  const move = (item: PipelineItem, stage: PipelineStage) => {
    if (item.stage === stage.id) return
    setMoves((current) => [...current, { id: item.id, stage: stage.id }])
    setAnnouncement(`Moved ${item.title} to ${stage.label}`)
    onMove?.(item.id, stage.id)
  }

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        <p role='status' className='sr-only'>
          {announcement}
        </p>
        {(state === 'empty' || state === 'error') && (
          <BlockStateRows className='border-t pt-3' />
        )}
        {(state === undefined || state === 'loading') && (
          <div
            role='region'
            aria-label={`${title} board`}
            // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrolling region must be focusable so keyboard users can reach the columns that don't fit
            tabIndex={0}
            className='focus-visible:ring-ring/50 relative flex snap-x snap-mandatory gap-4 overflow-x-auto outline-none focus-visible:ring-3'
          >
            <BlockStateText className='sr-only' />
            {summaries.map((stage, index) => {
              const headingId = `${id}-${stage.id}`
              const stageItems = items.filter((item) => item.stage === stage.id)
              return (
                <section
                  key={stage.id}
                  aria-labelledby={headingId}
                  className='flex w-64 shrink-0 snap-start flex-col gap-3 border-t pt-3 @4xl:w-auto @4xl:min-w-0 @4xl:flex-1'
                >
                  <PipelineStageHeader
                    color={getStageColor(index, stages.length)}
                    count={state ? undefined : stage.count}
                    id={headingId}
                    label={stage.label}
                    total={state ? undefined : compact(stage.value)}
                  />
                  {state === 'loading' ? (
                    <div className='flex flex-col gap-2'>
                      <Skeleton className='h-24 rounded-xl' />
                      <Skeleton className='h-24 rounded-xl' />
                    </div>
                  ) : stageItems.length > 0 ? (
                    <ul aria-labelledby={headingId} className='flex flex-col gap-2'>
                      {stageItems.map((item) => {
                        const days = getDaysInStage(item.enteredStageAt, now)
                        return (
                          <li key={item.id}>
                            <PipelineCard
                              action={
                                <MoveMenu
                                  item={item}
                                  onMove={(target) => move(item, target)}
                                  stages={stages}
                                />
                              }
                              days={days}
                              expectedDays={stage.expectedDays}
                              owner={item.owner}
                              ownerAvatar={item.ownerAvatar}
                              subtitle={item.subtitle}
                              title={item.title}
                              value={
                                item.value !== undefined ? compact(item.value) : undefined
                              }
                            />
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <p className='text-muted-foreground rounded-xl border border-dashed px-3 py-6 text-center text-xs'>
                      No deals in {stage.label.toLowerCase()}
                    </p>
                  )}
                </section>
              )
            })}
          </div>
        )}
      </section>
    </BlockStateProvider>
  )
}

function MoveMenu({
  item,
  onMove,
  stages,
}: {
  item: PipelineItem
  onMove: (stage: PipelineStage) => void
  stages: PipelineStage[]
}) {
  return (
    <DropdownMenuTrigger>
      <Button aria-label={`Move ${item.title}`} size='icon-xs' variant='ghost'>
        <IconPlaceholder
          lucide='EllipsisIcon'
          tabler='IconDots'
          hugeicons='MoreHorizontalCircle01Icon'
          phosphor='DotsThreeOutlineIcon'
          remixicon='RiMoreLine'
        />
      </Button>
      <DropdownMenu placement='bottom end' className='w-auto min-w-40'>
        <DropdownMenuGroup
          selectionMode='single'
          disallowEmptySelection
          selectedKeys={[item.stage]}
          onSelectionChange={(keys) => {
            const [value] = keys === 'all' ? [] : [...keys]
            const stage = stages.find((candidate) => candidate.id === value)
            if (stage) onMove(stage)
          }}
        >
          <DropdownMenuLabel>Move to</DropdownMenuLabel>
          {stages.map((stage) => (
            <DropdownMenuItem key={stage.id} id={stage.id}>
              {stage.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenu>
    </DropdownMenuTrigger>
  )
}

export { Pipeline1, exampleProps as pipeline1ExampleProps, type Pipeline1Props }
