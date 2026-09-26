'use client'

import { formatCurrency } from '@/registry/components/dashboardblocks/billing'
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

interface Flow3Props {
  /** @default 'USD' */
  currency?: string
  description: string
  links: FlowLink[]
  nodes: FlowNode[]
  /** Node ids for the headline figures. */
  totals: { grossProfit?: string; profit: string; revenue: string }
  title: string
}

const COST = 'color-mix(in oklab, var(--destructive) 75%, var(--card))'
const PROFIT = 'var(--chart-2)'

const exampleProps: Flow3Props = {
  description: 'Where revenue went, Q3 2026',
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
    { color: 'var(--primary)', id: 'revenue', label: 'Revenue' },
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
  const { currency = 'USD', description, links, nodes, title, totals: ids } = props
  const totals = getFlowTotals(nodes, links)
  const labels = new Map(nodes.map((node) => [node.id, node.label]))
  const format = (value: number) => formatCurrency(value, { compact: true, currency })
  const revenue = totals.get(ids.revenue)?.in ?? 0
  const profit = totals.get(ids.profit)?.in ?? 0
  const gross = ids.grossProfit ? totals.get(ids.grossProfit)?.in : undefined
  const margin = (value: number) => `${((value / (revenue || 1)) * 100).toFixed(1)}%`

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <dl className='grid grid-cols-2 gap-4 @md:grid-cols-3'>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>{labels.get(ids.revenue)}</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {format(revenue)}
            </dd>
          </div>
          {gross !== undefined && (
            <div className='flex flex-col gap-0.5'>
              <dt className='text-muted-foreground text-xs'>Gross margin</dt>
              <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
                {margin(gross)}
              </dd>
            </div>
          )}
          <div className='col-span-2 flex flex-col gap-0.5 @md:col-span-1'>
            <dt className='text-muted-foreground text-xs'>Operating margin</dt>
            <dd className='text-2xl font-semibold tracking-tight tabular-nums'>
              {margin(profit)}
            </dd>
          </div>
        </dl>
        <FlowChart
          colorBy='target'
          describeLink={(link, source, target) =>
            `${source.label} → ${target.label}: ${format(link.value)} (${margin(link.value)} of revenue)`
          }
          describeNode={(node) =>
            `${node.label}: ${format(node.value)} (${margin(node.value)} of revenue)`
          }
          format={format}
          height={300}
          links={links}
          minWidth='36rem'
          nodes={nodes}
        >
          Hover any part to see its share of revenue.
        </FlowChart>
        <ChartPanelTable
          caption={`${title}: ${description}.`}
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
      </CardContent>
    </Card>
  )
}

export { Flow3, exampleProps as flow3ExampleProps, type Flow3Props }
