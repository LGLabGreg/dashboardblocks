'use client'

import { ChartPanelTable } from '@/registry/components/dashboardblocks/chart-panel'
import {
  FlowChart,
  type FlowLink,
  type FlowNode,
  getFlowTotals,
} from '@/registry/components/dashboardblocks/flow'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Flow1Props {
  description: string
  links: FlowLink[]
  /** Sources first, then each step, then outcomes. */
  nodes: FlowNode[]
  /** The outcome node that counts as a conversion. */
  goal: string
  title: string
  /** @default 'sessions' */
  unit?: string
}

const exampleProps: Flow1Props = {
  description:
    'Sessions from each source, through the landing page, to the outcome, last 30 days',
  goal: 'signed-up',
  links: [
    { source: 'organic', target: 'home', value: 18_400 },
    { source: 'organic', target: 'blog', value: 12_600 },
    { source: 'organic', target: 'pricing', value: 3_900 },
    { source: 'paid', target: 'pricing', value: 9_800 },
    { source: 'paid', target: 'home', value: 4_200 },
    { source: 'social', target: 'blog', value: 6_300 },
    { source: 'social', target: 'home', value: 2_100 },
    { source: 'email', target: 'pricing', value: 3_400 },
    { source: 'email', target: 'home', value: 1_600 },
    { source: 'home', target: 'signed-up', value: 3_100 },
    { source: 'home', target: 'browsed', value: 13_800 },
    { source: 'home', target: 'bounced', value: 9_400 },
    { source: 'pricing', target: 'signed-up', value: 4_700 },
    { source: 'pricing', target: 'browsed', value: 7_200 },
    { source: 'pricing', target: 'bounced', value: 5_200 },
    { source: 'blog', target: 'signed-up', value: 900 },
    { source: 'blog', target: 'browsed', value: 6_700 },
    { source: 'blog', target: 'bounced', value: 11_300 },
  ],
  nodes: [
    { id: 'organic', label: 'Organic search' },
    { id: 'paid', label: 'Paid ads' },
    { id: 'social', label: 'Social' },
    { id: 'email', label: 'Email' },
    { id: 'home', label: 'Home' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'blog', label: 'Blog' },
    { color: 'var(--chart-2)', id: 'signed-up', label: 'Signed up' },
    { color: 'var(--chart-4)', id: 'browsed', label: 'Kept browsing' },
    { id: 'bounced', kind: 'exit', label: 'Bounced' },
  ],
  title: 'Traffic flow',
  unit: 'sessions',
}

const Flow1 = (props: Flow1Props) => {
  const { description, goal, links, nodes, title, unit = 'sessions' } = props
  const totals = getFlowTotals(nodes, links)
  const labels = new Map(nodes.map((node) => [node.id, node.label]))
  const sessions = nodes
    .filter((node) => (totals.get(node.id)?.in ?? 0) === 0)
    .reduce((sum, node) => sum + (totals.get(node.id)?.out ?? 0), 0)
  const converted = totals.get(goal)?.in ?? 0
  const bounced = nodes
    .filter((node) => node.kind === 'exit')
    .reduce((sum, node) => sum + (totals.get(node.id)?.in ?? 0), 0)
  const percent = (value: number) => `${((value / (sessions || 1)) * 100).toFixed(1)}%`

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <dl className='grid grid-cols-2 gap-4 @md:grid-cols-3'>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>
              {unit.charAt(0).toUpperCase()}
              {unit.slice(1)}
            </dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {sessions.toLocaleString()}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>{labels.get(goal)}</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {percent(converted)}
            </dd>
          </div>
          <div className='col-span-2 flex flex-col gap-0.5 @md:col-span-1'>
            <dt className='text-muted-foreground text-xs'>Dropped off</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {percent(bounced)}
            </dd>
          </div>
        </dl>
        <FlowChart height={300} links={links} minWidth='36rem' nodes={nodes}>
          Hover a source, page or band to follow it.
        </FlowChart>
        <ChartPanelTable
          caption={`${title}: ${description}.`}
          columns={[
            { key: 'source', label: 'From' },
            { key: 'target', label: 'To' },
            { key: 'value', label: unit.charAt(0).toUpperCase() + unit.slice(1) },
          ]}
          rows={links.map((link) => ({
            source: labels.get(link.source) ?? link.source,
            target: labels.get(link.target) ?? link.target,
            value: link.value.toLocaleString(),
          }))}
        />
      </CardContent>
    </Card>
  )
}

export { Flow1, exampleProps as flow1ExampleProps, type Flow1Props }
