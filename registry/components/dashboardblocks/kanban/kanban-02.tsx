'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
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
import { getStageColor } from '@/registry/components/dashboardblocks/pipeline'
import { formatCurrency } from '@/registry/lib/dashboardblocks/format'
import { useMemo, useState } from 'react'

interface Deal extends KanbanItem {
  description: string
  nextStep: string
  nextStepAt: Date
  owner: string
  value: number
}

interface Kanban2Props {
  closedColumns: { lost: string; won: string }
  columns: KanbanColumnDef[]
  /** Leave out, or pass none, to show the empty state. */
  deals?: Deal[]
  /** Pass a fixed date, so next-step dates render the same on the server and in the browser. */
  now: Date
  onMove?: (id: string, column: string, index: number) => void
  status?: BlockStatus
  title: string
}

const NOW = Date.UTC(2026, 8, 28, 10)
const noDeals: Deal[] = []

const inDays = (days: number) => new Date(NOW + days * 86_400_000)

const exampleProps: Kanban2Props = {
  closedColumns: { lost: 'lost', won: 'won' },
  columns: [
    { color: getStageColor(0, 4), id: 'lead', title: 'Lead' },
    { color: getStageColor(1, 4), id: 'qualified', title: 'Qualified' },
    { color: getStageColor(2, 4), id: 'proposal', title: 'Proposal' },
    { color: getStageColor(3, 4), id: 'negotiation', title: 'Negotiation', wipLimit: 4 },
    { color: 'var(--color-chart-3)', id: 'won', title: 'Won' },
    { color: 'var(--color-muted-foreground)', id: 'lost', title: 'Lost' },
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
  const {
    closedColumns,
    columns,
    deals: loadedDeals = noDeals,
    now,
    onMove,
    status,
    title,
  } = props
  const [moves, setMoves] = useState<{ column: string; id: string; index: number }[]>([])
  const deals = useMemo(
    () =>
      moves.reduce(
        (current, move) => moveItem(current, move.id, move.column, move.index),
        loadedDeals,
      ),
    [loadedDeals, moves],
  )
  const state = getBlockState(status, loadedDeals)
  const [collapsed, setCollapsed] = useState<string[]>([closedColumns.lost])
  const closed = [closedColumns.won, closedColumns.lost]
  const open = deals.filter((deal) => !closed.includes(deal.column))
  const won = getColumnItems(deals, closedColumns.won)

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-3'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm' aria-live='polite'>
              {open.length} open {open.length === 1 ? 'deal' : 'deals'} worth{' '}
              {formatCurrency(sumValue(open), { compact: true })}, and{' '}
              {formatCurrency(sumValue(won), { compact: true })} won.
            </p>
          </BlockReady>
        </header>
        {(state === 'empty' || state === 'error') && (
          <BlockStateRows className='border-t pt-3' />
        )}
        {(state === undefined || state === 'loading') && (
          <KanbanBoard
            className='pb-2'
            columns={columns}
            itemName={{ one: 'deal', other: 'deals' }}
            items={deals}
            label={`${title} board`}
            onMove={(id, column, index) => {
              setMoves((current) => [...current, { column, id, index }])
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
                      {formatCurrency(sumValue(columnDeals), { compact: true })}
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
                          {formatCurrency(deal.value)}
                        </span>
                        <KanbanAssignees className='ml-auto' names={[deal.owner]} />
                      </div>
                      {!isClosed && (
                        <div className='flex flex-wrap items-baseline gap-x-2 gap-y-0.5 border-t pt-2.5 text-xs'>
                          <p className='min-w-0 flex-1 basis-32'>
                            <span className='text-muted-foreground'>Next: </span>
                            {deal.nextStep}
                          </p>
                          <KanbanDueDate
                            className='ml-auto shrink-0'
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
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Kanban2, exampleProps as kanban2ExampleProps, type Kanban2Props }
