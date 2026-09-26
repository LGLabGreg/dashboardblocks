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

interface Flow2Props {
  description: string
  links: FlowLink[]
  /** One column per step. Give pages a distinct id in each step, e.g. "pricing-2". */
  nodes: FlowNode[]
  title: string
  /** @default 'visitors' */
  unit?: string
}

const exampleProps: Flow2Props = {
  description:
    'Where visitors go in their first three pages after landing on Home, last 7 days',
  links: [
    { source: 'home', target: 'pricing-2', value: 4_820 },
    { source: 'home', target: 'features-2', value: 3_640 },
    { source: 'home', target: 'docs-2', value: 2_210 },
    { source: 'home', target: 'exit-2', value: 5_330 },
    { source: 'pricing-2', target: 'signup-3', value: 1_540 },
    { source: 'pricing-2', target: 'sales-3', value: 610 },
    { source: 'pricing-2', target: 'docs-3', value: 720 },
    { source: 'pricing-2', target: 'exit-3', value: 1_950 },
    { source: 'features-2', target: 'pricing-3', value: 1_380 },
    { source: 'features-2', target: 'signup-3', value: 520 },
    { source: 'features-2', target: 'exit-3', value: 1_740 },
    { source: 'docs-2', target: 'signup-3', value: 290 },
    { source: 'docs-2', target: 'docs-3', value: 1_120 },
    { source: 'docs-2', target: 'exit-3', value: 800 },
  ],
  nodes: [
    { column: 0, id: 'home', label: 'Home' },
    { column: 1, id: 'pricing-2', label: 'Pricing' },
    { column: 1, id: 'features-2', label: 'Features' },
    { column: 1, id: 'docs-2', label: 'Docs' },
    { column: 1, id: 'exit-2', kind: 'exit', label: 'Left' },
    { column: 2, id: 'signup-3', label: 'Sign up' },
    { column: 2, id: 'sales-3', label: 'Contact sales' },
    { column: 2, id: 'pricing-3', label: 'Pricing' },
    { column: 2, id: 'docs-3', label: 'Docs' },
    { column: 2, id: 'exit-3', kind: 'exit', label: 'Left' },
  ],
  title: 'User paths',
  unit: 'visitors',
}

const Flow2 = (props: Flow2Props) => {
  const { description, links, nodes, title, unit = 'visitors' } = props
  const totals = getFlowTotals(nodes, links)
  const labels = new Map(nodes.map((node) => [node.id, node.label]))
  const start = nodes.find((node) => (totals.get(node.id)?.in ?? 0) === 0)
  const entered = start ? (totals.get(start.id)?.out ?? 0) : 0
  const columns = Math.max(0, ...nodes.map((node) => node.column ?? 0))
  // Visitors who left at each step, as a share of everyone who entered.
  const leftAt = Array.from({ length: columns }, (_, index) =>
    nodes
      .filter((node) => node.kind === 'exit' && node.column === index + 1)
      .reduce((sum, node) => sum + (totals.get(node.id)?.in ?? 0), 0),
  )
  const percent = (value: number) => `${Math.round((value / (entered || 1)) * 100)}%`

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <dl className='grid grid-cols-2 gap-4 @md:grid-cols-3'>
          <div className='col-span-2 flex flex-col gap-0.5 @md:col-span-1'>
            <dt className='text-muted-foreground text-xs'>Landed on {start?.label}</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {entered.toLocaleString()}
            </dd>
          </div>
          {leftAt.map((value, index) => (
            <div key={index} className='flex flex-col gap-0.5'>
              <dt className='text-muted-foreground text-xs'>
                Left after page {index + 1}
              </dt>
              <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
                {percent(value)}
              </dd>
            </div>
          ))}
        </dl>
        <FlowChart
          colorBy='target'
          height={300}
          links={links}
          minWidth='34rem'
          nodes={nodes}
        >
          {`Each column is a page view. Grey bands are ${unit} who left.`}
        </FlowChart>
        <ChartPanelTable
          caption={`${title}: ${description}.`}
          columns={[
            { key: 'step', label: 'Step' },
            { key: 'source', label: 'From' },
            { key: 'target', label: 'To' },
            { key: 'value', label: unit.charAt(0).toUpperCase() + unit.slice(1) },
          ]}
          rows={links.map((link) => ({
            source: labels.get(link.source) ?? link.source,
            step: `Page ${(nodes.find((node) => node.id === link.source)?.column ?? 0) + 1}`,
            target: labels.get(link.target) ?? link.target,
            value: link.value.toLocaleString(),
          }))}
        />
      </CardContent>
    </Card>
  )
}

export { Flow2, exampleProps as flow2ExampleProps, type Flow2Props }
