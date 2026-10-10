'use client'

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
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useState } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface Ticket extends KanbanItem {
  assignee?: string
  channel: 'chat' | 'email'
  customer?: string
  number: number
  priority: KanbanPriorityLevel
  slaDueAt: Date
}

interface Kanban3Props {
  columns: KanbanColumnDef[]
  /** Pass a fixed date, so SLA times render the same on the server and in the browser. */
  now: Date
  onAdd?: (ticket: Ticket) => Promise<void>
  onMove?: (id: string, column: string, index: number) => void
  pausedColumns: string[]
  slaHours: number
  tickets: Ticket[]
  title: string
}

const NOW = Date.UTC(2026, 8, 28, 10)
const inMinutes = (minutes: number) => new Date(NOW + minutes * 60_000)

const exampleProps: Kanban3Props = {
  columns: [
    { color: 'var(--chart-3)', id: 'new', title: 'New' },
    { color: 'var(--chart-2)', id: 'open', title: 'Open', wipLimit: 5 },
    { color: 'var(--chart-5)', id: 'waiting', title: 'Waiting on customer' },
    { color: 'var(--destructive)', id: 'escalated', title: 'Escalated', wipLimit: 2 },
    { color: 'var(--chart-4)', id: 'solved', title: 'Solved' },
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

function SlaBadge({ due, now, paused }: { due: Date; now: Date; paused: boolean }) {
  const minutes = Math.round((due.getTime() - now.getTime()) / 60_000)
  const state = paused
    ? 'paused'
    : minutes < 0
      ? 'breached'
      : minutes < 60
        ? 'soon'
        : 'ok'
  const label =
    state === 'paused'
      ? 'SLA paused'
      : state === 'breached'
        ? `${formatSpan(-minutes)} over SLA`
        : `${formatSpan(minutes)} to SLA`
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap tabular-nums [&_svg]:size-3.5 [&_svg]:shrink-0',
        state === 'breached' && 'bg-red-500/10 text-red-700 dark:text-red-400',
        state === 'soon' && 'bg-amber-500/10 text-amber-800 dark:text-amber-400',
        (state === 'ok' || state === 'paused') && 'bg-muted text-muted-foreground',
      )}
    >
      {state === 'paused' ? (
        <IconPlaceholder
          lucide='CirclePauseIcon'
          tabler='IconPlayerPause'
          hugeicons='PauseIcon'
          phosphor='PauseCircleIcon'
          remixicon='RiPauseCircleLine'
          aria-hidden
        />
      ) : state === 'breached' ? (
        <IconPlaceholder
          lucide='ClockAlertIcon'
          tabler='IconClockExclamation'
          hugeicons='TimeQuarterPassIcon'
          phosphor='ClockCountdownIcon'
          remixicon='RiTimerFlashLine'
          aria-hidden
        />
      ) : (
        <IconPlaceholder
          lucide='ClockIcon'
          tabler='IconClock'
          hugeicons='Clock01Icon'
          phosphor='ClockIcon'
          remixicon='RiTimeLine'
          aria-hidden
        />
      )}
      {label}
    </span>
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
    tickets: initialTickets,
    title,
  } = props
  const [tickets, setTickets] = useState(initialTickets)
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
    setTickets((current) => [ticket, ...current])
    await onAdd(ticket)
  }

  return (
    <Card className='gap-0 pb-0'>
      <CardHeader className='border-b'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {unsolved.length} tickets need a reply ·{' '}
          <span className={cn(breached > 0 && 'text-red-700 dark:text-red-400')}>
            {breached} over SLA
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className='px-0'>
        <KanbanBoard
          className='scroll-px-6 px-6 py-4'
          columns={columns}
          itemName={{ one: 'ticket', other: 'tickets' }}
          items={tickets}
          label={`${title} board`}
          onMove={(id, column, index) => {
            setTickets((current) => moveItem(current, id, column, index))
            onMove?.(id, column, index)
          }}
          wipLimitMode='block'
        >
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              empty={column.id === 'escalated' ? 'Nothing escalated' : undefined}
              footer={
                column.id === firstColumn.id && (
                  <KanbanAddCard
                    label='Add ticket'
                    onAdd={(value) => void add(value)}
                    placeholder='Subject'
                  />
                )
              }
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
                      <SlaBadge
                        due={ticket.slaDueAt}
                        now={now}
                        paused={pausedColumns.includes(column.id)}
                      />
                      {ticket.assignee ? (
                        <KanbanAssignees className='ml-auto' names={[ticket.assignee]} />
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
      </CardContent>
    </Card>
  )
}

export { Kanban3, exampleProps as kanban3ExampleProps, type Kanban3Props }
