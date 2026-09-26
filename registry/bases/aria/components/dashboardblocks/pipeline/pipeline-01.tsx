// Override of registry/components/dashboardblocks/pipeline/pipeline-01.tsx for React Aria
// source-hash: 0f4fd67f99c4

'use client'

import {
  PipelineCard,
  type PipelineItem,
  type PipelineStage,
  PipelineStageHeader,
  formatCurrency,
  getDaysInStage,
  getStageColor,
  getStageSummaries,
} from '@/registry/components/dashboardblocks/pipeline'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useId, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Pipeline1Props {
  items: PipelineItem[]
  /** The time days in stage are measured from. */
  now: Date
  /** Called when an item is moved with its menu. There is no drag and drop. */
  onMove?: (id: string, stage: string) => void
  stages: PipelineStage[]
  title: string
}

const NOW = Date.UTC(2026, 8, 25, 14, 30)
const daysAgo = (days: number) => new Date(NOW - days * 86_400_000)

const exampleProps: Pipeline1Props = {
  items: [
    {
      enteredStageAt: daysAgo(5),
      id: 'd1',
      owner: 'Maya Patel',
      stage: 'qualified',
      subtitle: 'Fleet analytics rollout',
      title: 'Northwind Logistics',
      value: 42_000,
    },
    {
      enteredStageAt: daysAgo(21),
      id: 'd2',
      owner: 'Luis Romero',
      stage: 'qualified',
      subtitle: 'Patient portal pilot',
      title: 'Brightline Health',
      value: 18_500,
    },
    {
      enteredStageAt: daysAgo(3),
      id: 'd3',
      owner: 'Aiko Tanaka',
      stage: 'qualified',
      subtitle: 'Supplier dashboard',
      title: 'Orbital Foods',
      value: 27_000,
    },
    {
      enteredStageAt: daysAgo(8),
      id: 'd4',
      owner: 'Jonas Weber',
      stage: 'discovery',
      subtitle: 'Risk reporting suite',
      title: 'Kestrel Bank',
      value: 96_000,
    },
    {
      enteredStageAt: daysAgo(16),
      id: 'd5',
      owner: 'Maya Patel',
      stage: 'discovery',
      subtitle: 'District licences',
      title: 'Pinecrest Schools',
      value: 31_200,
    },
    {
      enteredStageAt: daysAgo(2),
      id: 'd6',
      owner: 'Luis Romero',
      stage: 'discovery',
      subtitle: 'Booking insights',
      title: 'Halcyon Travel',
      value: 54_000,
    },
    {
      enteredStageAt: daysAgo(6),
      id: 'd7',
      owner: 'Aiko Tanaka',
      stage: 'proposal',
      subtitle: 'Enterprise plan, 400 seats',
      title: 'Atlas Freight',
      value: 128_000,
    },
    {
      enteredStageAt: daysAgo(12),
      id: 'd8',
      owner: 'Jonas Weber',
      stage: 'proposal',
      subtitle: 'Data warehouse sync',
      title: 'Meridian Labs',
      value: 64_500,
    },
    {
      enteredStageAt: daysAgo(4),
      id: 'd9',
      owner: 'Maya Patel',
      stage: 'proposal',
      subtitle: 'Usage metering',
      title: 'Solstice Energy',
      value: 39_900,
    },
    {
      enteredStageAt: daysAgo(3),
      id: 'd10',
      owner: 'Jonas Weber',
      stage: 'negotiation',
      subtitle: 'Multi-region renewal',
      title: 'Vantage Retail',
      value: 212_000,
    },
    {
      enteredStageAt: daysAgo(11),
      id: 'd11',
      owner: 'Luis Romero',
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

const Pipeline1 = (props: Pipeline1Props) => {
  const { items: initialItems, now, onMove, stages, title } = props
  const id = useId()
  const [items, setItems] = useState(initialItems)
  const [announcement, setAnnouncement] = useState('')
  const summaries = getStageSummaries(stages, items, now)
  const total = summaries.reduce((sum, stage) => sum + stage.value, 0)

  const move = (item: PipelineItem, stage: PipelineStage) => {
    if (item.stage === stage.id) return
    // Moved items go to the top of their new column, with the clock reset.
    setItems((current) => [
      { ...item, enteredStageAt: now, stage: stage.id },
      ...current.filter((other) => other.id !== item.id),
    ])
    setAnnouncement(`Moved ${item.title} to ${stage.label}`)
    onMove?.(item.id, stage.id)
  }

  return (
    <Card className='@container gap-0 pb-0'>
      <CardHeader className='border-b'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {items.length} open deals · {formatCurrency(total)}
        </CardDescription>
      </CardHeader>
      <CardContent className='px-0'>
        <p role='status' className='sr-only'>
          {announcement}
        </p>
        <div
          role='region'
          aria-label={`${title} board`}
          // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrolling region must be focusable so keyboard users can reach the columns that don't fit
          tabIndex={0}
          className='focus-visible:ring-ring/50 relative flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto px-6 py-4 outline-none focus-visible:ring-3 focus-visible:ring-inset'
        >
          {summaries.map((stage, index) => {
            const headingId = `${id}-${stage.id}`
            const stageItems = items.filter((item) => item.stage === stage.id)
            return (
              <section
                key={stage.id}
                aria-labelledby={headingId}
                className='bg-muted/50 flex w-64 shrink-0 snap-start flex-col gap-3 rounded-xl p-2 @4xl:w-auto @4xl:min-w-0 @4xl:flex-1'
              >
                <PipelineStageHeader
                  className='px-1 pt-1'
                  color={getStageColor(index, stages.length)}
                  count={stage.count}
                  id={headingId}
                  label={stage.label}
                  total={formatCurrency(stage.value)}
                />
                {stageItems.length > 0 ? (
                  <ul aria-labelledby={headingId} className='flex flex-col gap-2'>
                    {stageItems.map((item) => (
                      <li key={item.id}>
                        <PipelineCard
                          action={
                            <MoveMenu
                              item={item}
                              onMove={(target) => move(item, target)}
                              stages={stages}
                            />
                          }
                          days={getDaysInStage(item.enteredStageAt, now)}
                          expectedDays={stage.expectedDays}
                          owner={item.owner}
                          subtitle={item.subtitle}
                          title={item.title}
                          value={
                            item.value !== undefined
                              ? formatCurrency(item.value)
                              : undefined
                          }
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='text-muted-foreground rounded-lg border border-dashed px-3 py-6 text-center text-xs'>
                    No deals in {stage.label.toLowerCase()}
                  </p>
                )}
              </section>
            )
          })}
        </div>
      </CardContent>
    </Card>
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
      <Button
        aria-label={`Move ${item.title}`}
        className='text-muted-foreground'
        size='icon-xs'
        variant='ghost'
      >
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
