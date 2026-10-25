'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStateProps,
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
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'

interface Flow1Props extends BlockStateProps {
  description: string
  /** Leave out, or pass none, to show the empty state. */
  links?: FlowLink[]
  /** Sources first, then each step, then outcomes. */
  nodes?: FlowNode[]
  goal: string
  title: string
  /** @default 'sessions' */
  unit?: string
}

const exampleProps: Flow1Props = {
  description:
    'Sessions from each source, through the landing page, to the outcome, last 30 days.',
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
    { color: 'var(--color-chart-3)', id: 'signed-up', label: 'Signed up' },
    { color: 'var(--color-chart-5)', id: 'browsed', label: 'Kept browsing' },
    { id: 'bounced', kind: 'exit', label: 'Bounced' },
  ],
  title: 'Traffic flow',
  unit: 'sessions',
}

const Flow1 = (props: Flow1Props) => {
  const {
    description,
    goal,
    links = [],
    nodes = [],
    errorMessage,
    status,
    title,
    unit = 'sessions',
  } = props
  const state = getBlockState(status, links)
  const totals = getFlowTotals(nodes, links)
  const labels = new Map(nodes.map((node) => [node.id, node.label]))
  const sessions = nodes
    .filter((node) => (totals.get(node.id)?.in ?? 0) === 0)
    .reduce((sum, node) => sum + (totals.get(node.id)?.out ?? 0), 0)
  const converted = totals.get(goal)?.in ?? 0
  const bounced = nodes
    .filter((node) => node.kind === 'exit')
    .reduce((sum, node) => sum + (totals.get(node.id)?.in ?? 0), 0)
  const percent = (value: number) => formatPercent(value / (sessions || 1))
  const best = nodes
    .filter((node) =>
      links.some((link) => link.source === node.id && link.target === goal),
    )
    .map((node) => ({
      label: node.label,
      rate:
        (links.find((link) => link.source === node.id && link.target === goal)?.value ??
          0) / (totals.get(node.id)?.out || 1),
    }))
    .sort((a, b) => b.rate - a.rate)[0]

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
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
                {state ? <SkeletonText className='w-20' /> : labels.get(goal)}
              </dt>
              <dd>
                <KPIValue value={converted} format={percent} />
              </dd>
              <BlockReady className='text-xs'>
                <dd className='text-muted-foreground text-xs tabular-nums'>
                  {formatNumber(converted)} of {formatNumber(sessions)} {unit}
                </dd>
              </BlockReady>
            </div>
            <div className='flex flex-col gap-1'>
              <dt className='text-muted-foreground text-sm'>Dropped off</dt>
              <dd>
                <KPIValue className='text-2xl' value={bounced} format={percent} />
              </dd>
            </div>
            {(state || best) && (
              <div className='flex flex-col gap-1'>
                <dt className='text-muted-foreground text-sm'>Converts best</dt>
                <dd className='text-2xl font-light tracking-tight'>
                  {state ? <SkeletonText className='w-[4em]' /> : best?.label}
                </dd>
                <BlockReady className='text-xs'>
                  <dd className='text-muted-foreground text-xs tabular-nums'>
                    {formatPercent(best?.rate ?? 0, { maximumFractionDigits: 0 })} of its{' '}
                    {unit}
                  </dd>
                </BlockReady>
              </div>
            )}
          </dl>
        )}
        <FlowChart
          emphasis={goal}
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
            { key: 'value', label: unit.charAt(0).toUpperCase() + unit.slice(1) },
          ]}
          rows={links.map((link) => ({
            source: labels.get(link.source) ?? link.source,
            target: labels.get(link.target) ?? link.target,
            value: formatNumber(link.value),
          }))}
        />
      </section>
    </BlockStateProvider>
  )
}

export { Flow1, exampleProps as flow1ExampleProps, type Flow1Props }
