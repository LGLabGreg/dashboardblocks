'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  KanbanAddCard,
  KanbanAssignees,
  KanbanBoard,
  KanbanCard,
  KanbanCardMenu,
  KanbanCardTitle,
  KanbanColumn,
  type KanbanColumnDef,
  type KanbanItem,
  KanbanPriority,
  type KanbanPriorityLevel,
  getColumnItems,
  moveItem,
} from '@/registry/components/dashboardblocks/kanban'
import { StatusLabel } from '@/registry/components/dashboardblocks/status-label'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useMemo, useState } from 'react'

interface Ticket extends KanbanItem {
  assignee?: string
  channel: 'chat' | 'email'
  customer?: string
  number: number
  priority: KanbanPriorityLevel
  slaDueAt: Date
}

interface Kanban3Props extends BlockStateProps {
  columns: KanbanColumnDef[]
  /** Pass a fixed date, so SLA times render the same on the server and in the browser. */
  now: Date
  onAdd?: (ticket: Ticket) => Promise<void>
  onMove?: (id: string, column: string, index: number) => void
  pausedColumns: string[]
  slaHours: number
  /** Leave out, or pass none, to show the empty state. */
  tickets?: Ticket[]
  title: string
}

const NOW = Date.UTC(2026, 8, 28, 10)
const noTickets: Ticket[] = []

const inMinutes = (minutes: number) => new Date(NOW + minutes * 60_000)

const exampleProps: Kanban3Props = {
  columns: [
    { color: 'var(--color-chart-3)', id: 'new', title: 'New' },
    { color: 'var(--color-chart-2)', id: 'open', title: 'Open', wipLimit: 5 },
    { color: 'var(--color-chart-5)', id: 'waiting', title: 'Waiting on customer' },
    {
      color: 'var(--color-destructive)',
      id: 'escalated',
      title: 'Escalated',
      wipLimit: 2,
    },
    { color: 'var(--color-chart-4)', id: 'solved', title: 'Solved' },
  ],
  now: new Date(NOW),
  pausedColumns: ['waiting', 'solved'],
  slaHours: 8,
  tickets: [
    {
      channel: 'email',
      column: 'new',
      customer: 'Grace Liu, Fernway',
      id: 't4829',
      number: 4829,
      priority: 'high',
      slaDueAt: inMinutes(35),
      title: 'Invoices show the wrong VAT rate',
    },
    {
      channel: 'chat',
      column: 'new',
      customer: 'Omar Haddad, Lumen Studio',
      id: 't4831',
      number: 4831,
      priority: 'medium',
      slaDueAt: inMinutes(210),
      title: 'How do I add a second admin?',
    },
    {
      assignee: 'Sofia Marin',
      channel: 'email',
      column: 'open',
      customer: 'Dan Whitaker, Northwind',
      id: 't4812',
      number: 4812,
      priority: 'urgent',
      slaDueAt: inMinutes(-25),
      title: 'SSO login loops back to the sign-in page',
    },
    {
      assignee: 'Kwame Asante',
      channel: 'chat',
      column: 'open',
      customer: 'Ines Duarte, Copperleaf',
      id: 't4818',
      number: 4818,
      priority: 'high',
      slaDueAt: inMinutes(50),
      title: 'Export to Sheets stopped syncing',
    },
    {
      assignee: 'Sofia Marin',
      channel: 'email',
      column: 'open',
      customer: 'Helen Park, Brightline',
      id: 't4820',
      number: 4820,
      priority: 'low',
      slaDueAt: inMinutes(1_440),
      title: 'Request for a copy of our DPA',
    },
    {
      assignee: 'Kwame Asante',
      channel: 'email',
      column: 'waiting',
      customer: 'Ravi Menon, Atlas Freight',
      id: 't4806',
      number: 4806,
      priority: 'medium',
      slaDueAt: inMinutes(300),
      title: 'Webhook retries after a 200 response',
    },
    {
      assignee: 'Mei Chen',
      channel: 'chat',
      column: 'escalated',
      customer: 'Tom Byrne, Vantage Retail',
      id: 't4801',
      number: 4801,
      priority: 'urgent',
      slaDueAt: inMinutes(-90),
      title: 'Orders missing from yesterday’s report',
    },
    {
      assignee: 'Mei Chen',
      channel: 'email',
      column: 'escalated',
      customer: 'Ana Souza, Kestrel Bank',
      id: 't4809',
      number: 4809,
      priority: 'high',
      slaDueAt: inMinutes(95),
      title: 'Audit log gaps on Sep 26',
    },
    {
      assignee: 'Sofia Marin',
      channel: 'chat',
      column: 'solved',
      customer: 'Leo Grant, Halcyon Travel',
      id: 't4797',
      number: 4797,
      priority: 'medium',
      slaDueAt: inMinutes(-600),
      title: 'Change the billing email',
    },
  ],
  title: 'Support queue',
}

async function saveTicket() {
  await new Promise((resolve) => setTimeout(resolve, 300))
}

function formatSpan(minutes: number) {
  if (minutes < 60) return `${minutes}m`
  if (minutes < 1_440) return `${Math.round(minutes / 60)}h`
  return `${Math.round(minutes / 1_440)}d`
}

function SlaLabel({ due, now, paused }: { due: Date; now: Date; paused: boolean }) {
  const minutes = Math.round((due.getTime() - now.getTime()) / 60_000)
  if (paused)
    return (
      <StatusLabel variant='text' className='text-xs' tone='neutral'>
        SLA paused
      </StatusLabel>
    )
  if (minutes < 0)
    return (
      <StatusLabel variant='text' className='text-xs tabular-nums' tone='bad'>
        {formatSpan(-minutes)} over SLA
      </StatusLabel>
    )
  return (
    <StatusLabel
      variant='text'
      className='text-xs tabular-nums'
      tone={minutes < 60 ? 'warning' : 'neutral'}
    >
      {formatSpan(minutes)} to SLA
    </StatusLabel>
  )
}

const channelIcons = {
  chat: (
    <IconPlaceholder
      lucide='MessageSquareIcon'
      tabler='IconMessage'
      hugeicons='MessageIcon'
      phosphor='ChatCircleIcon'
      remixicon='RiChat1Line'
      aria-hidden
    />
  ),
  email: (
    <IconPlaceholder
      lucide='MailIcon'
      tabler='IconMail'
      hugeicons='MailIcon'
      phosphor='EnvelopeIcon'
      remixicon='RiMailLine'
      aria-hidden
    />
  ),
}

const Kanban3 = (props: Kanban3Props) => {
  const {
    columns,
    now,
    onAdd = saveTicket,
    onMove,
    pausedColumns,
    slaHours,
    errorMessage,
    status,
    tickets: loadedTickets = noTickets,
    title,
  } = props
  const [added, setAdded] = useState<Ticket[]>([])
  const [moves, setMoves] = useState<{ column: string; id: string; index: number }[]>([])
  const tickets = useMemo(
    () =>
      moves.reduce(
        (current, move) => moveItem(current, move.id, move.column, move.index),
        [...added, ...loadedTickets],
      ),
    [added, loadedTickets, moves],
  )
  const state = getBlockState(status, tickets)
  const unsolved = tickets.filter((ticket) => !pausedColumns.includes(ticket.column))
  const breached = unsolved.filter((ticket) => ticket.slaDueAt < now).length
  const [firstColumn] = columns

  async function add(ticketTitle: string) {
    const number = Math.max(0, ...tickets.map((ticket) => ticket.number)) + 1
    const ticket: Ticket = {
      channel: 'email',
      column: firstColumn.id,
      id: `t${number}`,
      number,
      priority: 'medium',
      slaDueAt: new Date(now.getTime() + slaHours * 3_600_000),
      title: ticketTitle,
    }
    setAdded((current) => [ticket, ...current])
    await onAdd(ticket)
  }

  const addTicket = (
    <KanbanAddCard
      label='Add ticket'
      onAdd={(value) => void add(value)}
      placeholder='Subject'
    />
  )

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-3'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>
              {unsolved.length} {unsolved.length === 1 ? 'ticket needs' : 'tickets need'}{' '}
              a reply
              {breached > 0 ? (
                <>
                  , and{' '}
                  <StatusLabel variant='text' tone='bad'>
                    {breached} {breached === 1 ? 'is' : 'are'} over SLA
                  </StatusLabel>
                  .
                </>
              ) : (
                ', all within SLA.'
              )}
            </p>
          </BlockReady>
        </header>
        {state === 'error' && <BlockStateRows className='border-t pt-3' />}
        {state === 'empty' && (
          <div className='flex flex-col gap-2 border-t pt-3'>
            <BlockStateRows className='py-0' />
            <div className='w-72 max-w-full'>{addTicket}</div>
          </div>
        )}
        {(state === undefined || state === 'loading') && (
          <KanbanBoard
            className='pb-2'
            columns={columns}
            itemName={{ one: 'ticket', other: 'tickets' }}
            items={tickets}
            label={`${title} board`}
            onMove={(id, column, index) => {
              setMoves((current) => [...current, { column, id, index }])
              onMove?.(id, column, index)
            }}
            wipLimitMode='block'
          >
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                empty={column.id === 'escalated' ? 'Nothing escalated' : undefined}
                footer={column.id === firstColumn.id && addTicket}
              >
                {getColumnItems(tickets, column.id).map((ticket) => (
                  <KanbanCard key={ticket.id} item={ticket}>
                    <div className='text-muted-foreground flex min-h-6 items-center gap-2 pr-7 text-xs [&_svg]:size-3.5'>
                      {channelIcons[ticket.channel]}
                      <span className='sr-only'>By {ticket.channel}, </span>
                      <span className='font-mono'>#{ticket.number}</span>
                      <KanbanPriority priority={ticket.priority} showLabel />
                    </div>
                    <div className='flex flex-col gap-0.5'>
                      <KanbanCardTitle />
                      <p className='text-muted-foreground truncate text-xs'>
                        {ticket.customer ?? 'Added on the board'}
                      </p>
                    </div>
                    <KanbanCardMenu className='absolute top-3 right-2' />
                    {column.id !== 'solved' && (
                      <div className='flex min-h-6 items-center gap-2'>
                        <SlaLabel
                          due={ticket.slaDueAt}
                          now={now}
                          paused={pausedColumns.includes(column.id)}
                        />
                        {ticket.assignee ? (
                          <KanbanAssignees
                            className='ml-auto'
                            names={[ticket.assignee]}
                          />
                        ) : (
                          <span className='text-muted-foreground ml-auto text-xs'>
                            Unassigned
                          </span>
                        )}
                      </div>
                    )}
                  </KanbanCard>
                ))}
              </KanbanColumn>
            ))}
          </KanbanBoard>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Kanban3, exampleProps as kanban3ExampleProps, type Kanban3Props }
