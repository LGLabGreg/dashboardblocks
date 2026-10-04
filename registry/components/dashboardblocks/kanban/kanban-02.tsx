'use client'

import {
  KanbanAssignees,
  KanbanBoard,
  KanbanCard,
  KanbanCardMenu,
  KanbanCardTitle,
  KanbanColumn,
  type KanbanColumnDef,
  KanbanDueDate,
  type KanbanItem,
  getColumnItems,
  moveItem,
} from '@/registry/components/dashboardblocks/kanban'
import {
  formatCurrency,
  getStageColor,
} from '@/registry/components/dashboardblocks/pipeline'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useState } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Deal extends KanbanItem {
  /** What the deal is for, such as "Enterprise plan, 400 seats". */
  description: string
  /** The next thing to do to move the deal on. */
  nextStep: string
  nextStepAt: Date
  owner: string
  value: number
}

interface Kanban2Props {
  /** The columns for closed deals. They're left out of the open pipeline, and Lost starts collapsed. */
  closedColumns: { lost: string; won: string }
  columns: KanbanColumnDef[]
  deals: Deal[]
  /** Pass a fixed date, so next-step dates render the same on the server and in the browser. */
  now: Date
  /** Called after a deal is moved. `index` counts the column's deals without it. */
  onMove?: (id: string, column: string, index: number) => void
  title: string
}

const NOW = Date.UTC(2026, 8, 28, 10)
const inDays = (days: number) => new Date(NOW + days * 86_400_000)

const exampleProps: Kanban2Props = {
  closedColumns: { lost: 'lost', won: 'won' },
  columns: [
    { color: getStageColor(0, 4), id: 'lead', title: 'Lead' },
    { color: getStageColor(1, 4), id: 'qualified', title: 'Qualified' },
    { color: getStageColor(2, 4), id: 'proposal', title: 'Proposal' },
    { color: getStageColor(3, 4), id: 'negotiation', title: 'Negotiation', wipLimit: 4 },
    { color: 'var(--chart-3)', id: 'won', title: 'Won' },
    { color: 'var(--muted-foreground)', id: 'lost', title: 'Lost' },
  ],
  deals: [
    {
      column: 'lead',
      description: 'Warehouse analytics',
      id: 'd1',
      nextStep: 'Intro call',
      nextStepAt: inDays(1),
      owner: 'Maya Patel',
      title: 'Harbor & Pine',
      value: 18_000,
    },
    {
      column: 'lead',
      description: 'Clinic scheduling',
      id: 'd2',
      nextStep: 'Reply to inbound form',
      nextStepAt: inDays(0),
      owner: 'Luis Romero',
      title: 'Riverside Dental',
      value: 7_500,
    },
    {
      column: 'lead',
      description: 'Franchise reporting',
      id: 'd3',
      nextStep: 'Find the ops lead',
      nextStepAt: inDays(5),
      owner: 'Aiko Tanaka',
      title: 'Sunbeam Bakeries',
      value: 24_000,
    },
    {
      column: 'qualified',
      description: 'Fleet dashboard, 60 depots',
      id: 'd4',
      nextStep: 'Demo for the regional heads',
      nextStepAt: inDays(2),
      owner: 'Jonas Weber',
      title: 'Northwind Logistics',
      value: 42_000,
    },
    {
      column: 'qualified',
      description: 'Patient portal pilot',
      id: 'd5',
      nextStep: 'Send security questionnaire',
      nextStepAt: inDays(-2),
      owner: 'Maya Patel',
      title: 'Brightline Health',
      value: 31_200,
    },
    {
      column: 'proposal',
      description: 'Enterprise plan, 400 seats',
      id: 'd6',
      nextStep: 'Walk through pricing with finance',
      nextStepAt: inDays(1),
      owner: 'Aiko Tanaka',
      title: 'Atlas Freight',
      value: 128_000,
    },
    {
      column: 'proposal',
      description: 'Data warehouse sync',
      id: 'd7',
      nextStep: 'Revise the proposal',
      nextStepAt: inDays(3),
      owner: 'Luis Romero',
      title: 'Meridian Labs',
      value: 64_500,
    },
    {
      column: 'negotiation',
      description: 'Multi-region renewal',
      id: 'd8',
      nextStep: 'Legal review of the MSA',
      nextStepAt: inDays(0),
      owner: 'Jonas Weber',
      title: 'Vantage Retail',
      value: 212_000,
    },
    {
      column: 'negotiation',
      description: 'Claims analytics',
      id: 'd9',
      nextStep: 'Agree the discount',
      nextStepAt: inDays(-1),
      owner: 'Luis Romero',
      title: 'Copperleaf Insurance',
      value: 87_000,
    },
    {
      column: 'won',
      description: 'Risk reporting suite',
      id: 'd10',
      nextStep: 'Kickoff with onboarding',
      nextStepAt: inDays(2),
      owner: 'Maya Patel',
      title: 'Kestrel Bank',
      value: 96_000,
    },
    {
      column: 'lost',
      description: 'Booking insights',
      id: 'd11',
      nextStep: 'Check in next quarter',
      nextStepAt: inDays(84),
      owner: 'Aiko Tanaka',
      title: 'Halcyon Travel',
      value: 54_000,
    },
  ],
  now: new Date(NOW),
  title: 'Deals',
}

function sumValue(deals: Deal[]) {
  return deals.reduce((sum, deal) => sum + deal.value, 0)
}

const Kanban2 = (props: Kanban2Props) => {
  const { closedColumns, columns, deals: initialDeals, now, onMove, title } = props
  const [deals, setDeals] = useState(initialDeals)
  const [collapsed, setCollapsed] = useState<string[]>([closedColumns.lost])
  const closed = [closedColumns.won, closedColumns.lost]
  const open = deals.filter((deal) => !closed.includes(deal.column))
  const won = getColumnItems(deals, closedColumns.won)

  return (
    <Card className='gap-0 pb-0'>
      <CardHeader className='border-b'>
        <CardTitle>{title}</CardTitle>
        <CardDescription aria-live='polite'>
          {open.length} open · {formatCurrency(sumValue(open))} in pipeline ·{' '}
          {formatCurrency(sumValue(won))} won
        </CardDescription>
      </CardHeader>
      <CardContent className='px-0'>
        <KanbanBoard
          className='scroll-px-6 px-6 py-4'
          columns={columns}
          itemName={{ one: 'deal', other: 'deals' }}
          items={deals}
          label={`${title} board`}
          onMove={(id, column, index) => {
            setDeals((current) => moveItem(current, id, column, index))
            onMove?.(id, column, index)
          }}
        >
          {columns.map((column) => {
            const columnDeals = getColumnItems(deals, column.id)
            const isClosed = closed.includes(column.id)
            return (
              <KanbanColumn
                key={column.id}
                collapsed={collapsed.includes(column.id)}
                column={column}
                onCollapsedChange={
                  isClosed
                    ? (value) =>
                        setCollapsed((current) =>
                          value
                            ? [...current, column.id]
                            : current.filter((other) => other !== column.id),
                        )
                    : undefined
                }
                summary={
                  <>
                    <span className='sr-only'>Total </span>
                    {formatCurrency(sumValue(columnDeals))}
                  </>
                }
              >
                {columnDeals.map((deal) => (
                  <KanbanCard key={deal.id} item={deal}>
                    <div className='flex items-start gap-2'>
                      <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                        <KanbanCardTitle />
                        <p className='text-muted-foreground truncate text-xs'>
                          {deal.description}
                        </p>
                      </div>
                      <KanbanCardMenu className='-my-1 -mr-1' />
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium tabular-nums'>
                        {formatCurrency(deal.value, { compact: false })}
                      </span>
                      <KanbanAssignees className='ml-auto' names={[deal.owner]} />
                    </div>
                    {!isClosed && (
                      <div className='bg-muted/50 flex flex-wrap items-start gap-x-2 gap-y-1 rounded-md px-2 py-1.5 text-xs'>
                        <span className='text-muted-foreground py-px [&_svg]:size-3.5'>
                          <IconPlaceholder
                            lucide='ArrowRightIcon'
                            tabler='IconArrowRight'
                            hugeicons='ArrowRight01Icon'
                            phosphor='ArrowRightIcon'
                            remixicon='RiArrowRightLine'
                            aria-hidden
                          />
                        </span>
                        <p className='min-w-0 flex-1 basis-24'>
                          <span className='sr-only'>Next step: </span>
                          {deal.nextStep}
                        </p>
                        <KanbanDueDate
                          className='-my-0.5 -mr-1 ml-auto shrink-0'
                          date={deal.nextStepAt}
                          now={now}
                        />
                      </div>
                    )}
                  </KanbanCard>
                ))}
              </KanbanColumn>
            )
          })}
        </KanbanBoard>
      </CardContent>
    </Card>
  )
}

export { Kanban2, exampleProps as kanban2ExampleProps, type Kanban2Props }
