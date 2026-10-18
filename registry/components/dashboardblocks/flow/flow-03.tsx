'use client'

import {
  BlockReady,
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
  getFlowTotals,
} from '@/registry/components/dashboardblocks/flow'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { formatCurrency, formatPercent } from '@/registry/lib/dashboardblocks/format'

interface Flow3Props {
  /** @default 'USD' */
  currency?: string
  description: string
  /** Leave out, or pass none, to show the empty state. */
  links?: FlowLink[]
  nodes?: FlowNode[]
  status?: BlockStatus
  /** Node ids for the headline figures. */
  totals: { grossProfit?: string; profit: string; revenue: string }
  title: string
}

const COST = 'color-mix(in oklab, var(--color-destructive) 75%, var(--color-background))'
const PROFIT = 'var(--color-chart-3)'

const exampleProps: Flow3Props = {
  description: 'Where revenue went, Q3 2026.',
  links: [
    { source: 'subscriptions', target: 'revenue', value: 3_860_000 },
    { source: 'services', target: 'revenue', value: 940_000 },
    { source: 'marketplace', target: 'revenue', value: 520_000 },
    { source: 'revenue', target: 'cost-of-revenue', value: 1_380_000 },
    { source: 'revenue', target: 'gross-profit', value: 3_940_000 },
    { source: 'gross-profit', target: 'r-and-d', value: 1_420_000 },
    { source: 'gross-profit', target: 'sales-marketing', value: 1_310_000 },
    { source: 'gross-profit', target: 'g-and-a', value: 480_000 },
    { source: 'gross-profit', target: 'operating-profit', value: 730_000 },
  ],
  nodes: [
    { id: 'subscriptions', label: 'Subscriptions' },
    { id: 'services', label: 'Services' },
    { id: 'marketplace', label: 'Marketplace' },
    { color: 'var(--color-primary)', id: 'revenue', label: 'Revenue' },
    { color: PROFIT, id: 'gross-profit', label: 'Gross profit' },
    { color: COST, id: 'cost-of-revenue', label: 'Cost of revenue' },
    { color: PROFIT, id: 'operating-profit', label: 'Operating profit' },
    { color: COST, id: 'r-and-d', label: 'R&D' },
    { color: COST, id: 'sales-marketing', label: 'Sales & marketing' },
    { color: COST, id: 'g-and-a', label: 'G&A' },
  ],
  title: 'Income flow',
  totals: { grossProfit: 'gross-profit', profit: 'operating-profit', revenue: 'revenue' },
}

const Flow3 = (props: Flow3Props) => {
  const {
    currency = 'USD',
    description,
    links = [],
    nodes = [],
    status,
    title,
    totals: ids,
  } = props
  const empty = links.length === 0
  const state = getBlockState(status, empty)
  const totals = getFlowTotals(nodes, links)
  const labels = new Map(nodes.map((node) => [node.id, node.label]))
  const format = (value: number) => formatCurrency(value, { compact: true, currency })
  const revenue = totals.get(ids.revenue)?.in ?? 0
  const profit = totals.get(ids.profit)?.in ?? 0
  const gross = ids.grossProfit ? totals.get(ids.grossProfit)?.in : undefined
  const margin = (value: number) => formatPercent(value / (revenue || 1))

  return (
    <BlockStateProvider status={status} empty={empty}>
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
                {state ? <SkeletonText className='w-16' /> : labels.get(ids.revenue)}
              </dt>
              <dd>
                <KPIValue value={revenue} format={format} />
              </dd>
            </div>
            {(state ? ids.grossProfit : gross !== undefined) && (
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>Gross margin</dt>
                <dd>
                  <KPIValue className='text-2xl' value={gross} format={margin} />
                </dd>
              </div>
            )}
            <div className='flex flex-col gap-1'>
              <dt className='text-muted-foreground text-sm'>Operating margin</dt>
              <dd>
                <KPIValue className='text-2xl' value={profit} format={margin} />
              </dd>
              <BlockReady className='text-xs'>
                <dd className='text-muted-foreground text-xs tabular-nums'>
                  {format(profit)} kept
                </dd>
              </BlockReady>
            </div>
          </dl>
        )}
        <FlowChart
          colorBy='target'
          describeLink={(link) => `${margin(link.value)} of revenue`}
          describeNode={(node) => `${margin(node.value)} of revenue`}
          format={format}
          height={300}
          label={title}
          links={links}
          minWidth='36rem'
          nodes={nodes}
        />
        <ChartPanelTable
          caption={`${title}: ${description}`}
          columns={[
            { key: 'source', label: 'From' },
            { key: 'target', label: 'To' },
            { key: 'value', label: 'Amount' },
            { key: 'share', label: 'Share of revenue' },
          ]}
          rows={links.map((link) => ({
            share: margin(link.value),
            source: labels.get(link.source) ?? link.source,
            target: labels.get(link.target) ?? link.target,
            value: format(link.value),
          }))}
        />
      </section>
    </BlockStateProvider>
  )
}

export { Flow3, exampleProps as flow3ExampleProps, type Flow3Props }
