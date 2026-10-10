'use client'

import {
  KanbanAssignees,
  KanbanAttachments,
  KanbanBoard,
  KanbanCard,
  KanbanCardMenu,
  KanbanCardTitle,
  KanbanColumn,
  type KanbanColumnDef,
  KanbanComments,
  KanbanDueDate,
  type KanbanItem,
  type KanbanLabelDef,
  KanbanLabels,
  KanbanPriority,
  type KanbanPriorityLevel,
  KanbanSubtasks,
  getColumnItems,
  moveItem,
} from '@/registry/components/dashboardblocks/kanban'
import { useState } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface SprintIssue extends KanbanItem {
  assignees: string[]
  attachments?: number
  comments?: number
  due?: Date
  key: string
  labels: KanbanLabelDef[]
  priority: KanbanPriorityLevel
  subtasks?: { done: number; total: number }
}

interface Kanban1Props {
  columns: KanbanColumnDef[]
  /** The column that counts as finished: its due dates lose their urgency. */
  doneColumn: string
  issues: SprintIssue[]
  /** Pass a fixed date, so due dates render the same on the server and in the browser. */
  now: Date
  onMove?: (id: string, column: string, index: number) => void
  subtitle: string
  title: string
}

const NOW = Date.UTC(2026, 8, 28, 10)
const inDays = (days: number) => new Date(NOW + days * 86_400_000)

const labels = {
  api: { name: 'API', tone: 'info' },
  bug: { name: 'Bug', tone: 'danger' },
  design: { name: 'Design', tone: 'accent' },
  feature: { name: 'Feature', tone: 'success' },
  infra: { name: 'Infra', tone: 'neutral' },
  perf: { name: 'Performance', tone: 'warning' },
} satisfies Record<string, KanbanLabelDef>

const exampleProps: Kanban1Props = {
  columns: [
    { color: 'var(--muted-foreground)', id: 'backlog', title: 'Backlog' },
    { color: 'var(--chart-3)', id: 'todo', title: 'To do' },
    { color: 'var(--chart-2)', id: 'progress', title: 'In progress', wipLimit: 3 },
    { color: 'var(--chart-5)', id: 'review', title: 'In review', wipLimit: 2 },
    { color: 'var(--chart-4)', id: 'done', title: 'Done' },
  ],
  doneColumn: 'done',
  issues: [
    {
      assignees: [],
      column: 'backlog',
      comments: 2,
      id: 'web-171',
      key: 'WEB-171',
      labels: [labels.feature],
      priority: 'low',
      title: 'Saved filters on the orders table',
    },
    {
      assignees: ['Noah Becker'],
      column: 'backlog',
      id: 'web-168',
      key: 'WEB-168',
      labels: [labels.infra],
      priority: 'medium',
      title: 'Move preview deploys to the new runner pool',
    },
    {
      assignees: [],
      attachments: 1,
      column: 'backlog',
      id: 'web-165',
      key: 'WEB-165',
      labels: [labels.design],
      priority: 'low',
      title: 'Empty states for reports',
    },
    {
      assignees: ['Priya Nair'],
      column: 'todo',
      comments: 4,
      due: inDays(3),
      id: 'web-158',
      key: 'WEB-158',
      labels: [labels.feature, labels.api],
      priority: 'high',
      subtasks: { done: 0, total: 4 },
      title: 'Webhooks for refund events',
    },
    {
      assignees: ['Tomás Ortega'],
      column: 'todo',
      due: inDays(6),
      id: 'web-161',
      key: 'WEB-161',
      labels: [labels.perf],
      priority: 'medium',
      title: 'Lazy-load chart bundles on the overview',
    },
    {
      assignees: ['Aiko Tanaka', 'Priya Nair'],
      attachments: 3,
      column: 'progress',
      comments: 7,
      due: inDays(-1),
      id: 'web-142',
      key: 'WEB-142',
      labels: [labels.bug],
      priority: 'urgent',
      subtasks: { done: 2, total: 3 },
      title: 'Checkout fails on Safari 17',
    },
    {
      assignees: ['Lena Fischer'],
      column: 'progress',
      comments: 3,
      due: inDays(0),
      id: 'web-150',
      key: 'WEB-150',
      labels: [labels.feature, labels.design],
      priority: 'high',
      subtasks: { done: 3, total: 5 },
      title: 'Team invites with roles',
    },
    {
      assignees: ['Noah Becker'],
      column: 'progress',
      due: inDays(4),
      id: 'web-153',
      key: 'WEB-153',
      labels: [labels.api],
      priority: 'medium',
      title: 'Rate limit the public search endpoint',
    },
    {
      assignees: ['Tomás Ortega', 'Lena Fischer', 'Aiko Tanaka', 'Priya Nair'],
      attachments: 2,
      column: 'review',
      comments: 12,
      due: inDays(1),
      id: 'web-147',
      key: 'WEB-147',
      labels: [labels.perf],
      priority: 'high',
      subtasks: { done: 6, total: 6 },
      title: 'Cut dashboard load time under one second',
    },
    {
      assignees: ['Priya Nair'],
      column: 'done',
      comments: 5,
      due: inDays(-2),
      id: 'web-139',
      key: 'WEB-139',
      labels: [labels.bug],
      priority: 'high',
      title: 'CSV export drops rows past 10,000',
    },
    {
      assignees: ['Aiko Tanaka'],
      column: 'done',
      due: inDays(-4),
      id: 'web-136',
      key: 'WEB-136',
      labels: [labels.design],
      priority: 'medium',
      subtasks: { done: 4, total: 4 },
      title: 'Dark mode for the billing pages',
    },
  ],
  now: new Date(NOW),
  subtitle: 'Web app · Sep 21 – Oct 4',
  title: 'Sprint 24',
}

const Kanban1 = (props: Kanban1Props) => {
  const {
    columns,
    doneColumn,
    issues: initialIssues,
    now,
    onMove,
    subtitle,
    title,
  } = props
  const [issues, setIssues] = useState(initialIssues)
  const done = getColumnItems(issues, doneColumn).length

  return (
    <Card className='gap-0 pb-0'>
      <CardHeader className='border-b'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {subtitle} · {done} of {issues.length} issues done
        </CardDescription>
      </CardHeader>
      <CardContent className='px-0'>
        <KanbanBoard
          className='scroll-px-6 px-6 py-4'
          columns={columns}
          itemName={{ one: 'issue', other: 'issues' }}
          items={issues}
          label={`${title} board`}
          onMove={(id, column, index) => {
            setIssues((current) => moveItem(current, id, column, index))
            onMove?.(id, column, index)
          }}
        >
          {columns.map((column) => (
            <KanbanColumn key={column.id} column={column}>
              {getColumnItems(issues, column.id).map((issue) => (
                <KanbanCard key={issue.id} item={issue}>
                  <div className='flex min-h-6 items-center gap-2 pr-7'>
                    <span className='text-muted-foreground font-mono text-xs'>
                      {issue.key}
                    </span>
                    <KanbanPriority className='mr-auto' priority={issue.priority} />
                    <KanbanAssignees names={issue.assignees} />
                  </div>
                  <KanbanCardTitle />
                  <KanbanCardMenu className='absolute top-3 right-2' />
                  {issue.labels.length > 0 && <KanbanLabels labels={issue.labels} />}
                  <div className='flex flex-wrap items-center gap-x-3 gap-y-2 empty:hidden'>
                    {issue.due && (
                      <KanbanDueDate
                        date={issue.due}
                        done={issue.column === doneColumn}
                        now={now}
                      />
                    )}
                    {issue.comments !== undefined && (
                      <KanbanComments count={issue.comments} />
                    )}
                    {issue.attachments !== undefined && (
                      <KanbanAttachments count={issue.attachments} />
                    )}
                    {issue.subtasks && (
                      <KanbanSubtasks
                        done={issue.subtasks.done}
                        total={issue.subtasks.total}
                      />
                    )}
                  </div>
                </KanbanCard>
              ))}
            </KanbanColumn>
          ))}
        </KanbanBoard>
      </CardContent>
    </Card>
  )
}

export { Kanban1, exampleProps as kanban1ExampleProps, type Kanban1Props }
