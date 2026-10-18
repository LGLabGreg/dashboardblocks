'use client'

import {
  BlockStateProvider,
  type BlockStatus,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { ChartPanelTable } from '@/registry/components/dashboardblocks/chart-panel'
import {
  FlowChart,
  type FlowLink,
  type FlowNode,
  getFlowColumns,
  getFlowTotals,
} from '@/registry/components/dashboardblocks/flow'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'

interface Flow2Props {
  description: string
  /** Leave out, or pass none, to show the empty state. */
  links?: FlowLink[]
  nodes?: FlowNode[]
  status?: BlockStatus
  title: string
  /** @default 'visitors' */
  unit?: string
}

const exampleProps: Flow2Props = {
  description:
    'Where visitors go in their first three pages after landing on Home, last 7 days. Grey bands are visitors who left.',
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
    { id: 'home', label: 'Home' },
    { id: 'pricing-2', label: 'Pricing' },
    { id: 'features-2', label: 'Features' },
    { id: 'docs-2', label: 'Docs' },
    { id: 'exit-2', kind: 'exit', label: 'Left' },
    { id: 'signup-3', label: 'Sign up' },
    { id: 'sales-3', label: 'Contact sales' },
    { id: 'pricing-3', label: 'Pricing' },
    { id: 'docs-3', label: 'Docs' },
    { id: 'exit-3', kind: 'exit', label: 'Left' },
  ],
  title: 'User paths',
  unit: 'visitors',
}

const Flow2 = (props: Flow2Props) => {
  const { description, links = [], nodes = [], status, title, unit = 'visitors' } = props
  const state = getBlockState(status, links)
  const totals = getFlowTotals(nodes, links)
  const labels = new Map(nodes.map((node) => [node.id, node.label]))
  const start = nodes.find((node) => (totals.get(node.id)?.in ?? 0) === 0)
  const entered = start ? (totals.get(start.id)?.out ?? 0) : 0
  const columnOf = getFlowColumns(nodes, links)
  const columns = Math.max(0, ...columnOf.values())
  const leftAt = Array.from({ length: columns }, (_, index) =>
    nodes
      .filter((node) => node.kind === 'exit' && columnOf.get(node.id) === index + 1)
      .reduce((sum, node) => sum + (totals.get(node.id)?.in ?? 0), 0),
  )
  const percent = (value: number) =>
    formatPercent(value / (entered || 1), { maximumFractionDigits: 0 })

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        {state === 'empty' || state === 'error' ? (
          <div className='border-t pt-4'>
            <KPIValue />
          </div>
        ) : (
          <dl className='grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-4 @lg:grid-cols-3 @lg:items-start'>
            <div className='col-span-2 flex flex-col gap-1 @lg:col-span-1'>
              <dt className='text-muted-foreground text-sm'>
                Landed on {state ? <SkeletonText className='w-12' /> : start?.label}
              </dt>
              <dd>
                <KPIValue value={entered} format={(value) => formatNumber(value)} />
              </dd>
            </div>
            {(state ? [0, 0] : leftAt).map((value, index) => (
              <div key={index} className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>
                  Left after page {index + 1}
                </dt>
                <dd>
                  <KPIValue className='text-2xl' value={value} format={percent} />
                </dd>
              </div>
            ))}
          </dl>
        )}
        <FlowChart
          colorBy='target'
          height={300}
          label={title}
          links={links}
          minWidth='34rem'
          nodes={nodes}
        />
        <ChartPanelTable
          caption={`${title}: ${description}`}
          columns={[
            { key: 'step', label: 'Step' },
            { key: 'source', label: 'From' },
            { key: 'target', label: 'To' },
            { key: 'value', label: unit.charAt(0).toUpperCase() + unit.slice(1) },
          ]}
          rows={links.map((link) => ({
            source: labels.get(link.source) ?? link.source,
            step: `Page ${(columnOf.get(link.source) ?? 0) + 1}`,
            target: labels.get(link.target) ?? link.target,
            value: formatNumber(link.value),
          }))}
        />
      </section>
    </BlockStateProvider>
  )
}

export { Flow2, exampleProps as flow2ExampleProps, type Flow2Props }
