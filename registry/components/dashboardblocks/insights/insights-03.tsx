'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { DivergingBar } from '@/registry/components/dashboardblocks/comparison'
import {
  type InsightSegment,
  InsightText,
  getChangeTone,
} from '@/registry/components/dashboardblocks/insights'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import {
  formatNumber,
  formatPercent,
  formatPoints,
  formatSigned,
} from '@/registry/lib/dashboardblocks/format'

interface Contribution {
  label: string
  value: number
}

interface Insights3Props {
  /** Leave out, or pass none, to show the empty state. */
  contributions?: Contribution[]
  description: string
  formatter?: (value: number) => string
  /** @default 'up' */
  goodDirection?: 'up' | 'down'
  metric: string
  previous: number
  status?: BlockStatus
  title: string
}

const exampleProps: Insights3Props = {
  contributions: [
    { label: 'Organic search', value: 812 },
    { label: 'Referral', value: 264 },
    { label: 'Email', value: 206 },
    { label: 'Paid search', value: 168 },
    { label: 'Partnerships', value: -48 },
    { label: 'Paid social', value: -118 },
  ],
  description: 'Weekly signups by channel, Sep 14–20 against Sep 7–13.',
  metric: 'Signups',
  previous: 5_350,
  title: 'What drove the change',
}

const toneColors = {
  negative: 'var(--color-red-600)',
  neutral: 'var(--color-muted-foreground)',
  positive: 'var(--color-emerald-600)',
}

const Insights3 = (props: Insights3Props) => {
  const {
    contributions = [],
    description,
    formatter = (value) => formatNumber(value, { maximumFractionDigits: 0 }),
    goodDirection = 'up',
    metric,
    previous,
    status,
    title,
  } = props
  const state = getBlockState(status, contributions)
  const rows = [...contributions].sort((a, b) => b.value - a.value)
  const net = rows.reduce((sum, row) => sum + row.value, 0)
  const max = Math.max(...rows.map((row) => Math.abs(row.value)), 0)
  const points = (value: number) =>
    previous === 0 ? 0 : Math.round((value / Math.abs(previous)) * 1000) / 10
  const percent = points(net)
  const netTone = getChangeTone(net, goodDirection)

  const lead = net >= 0 ? rows[0] : rows[rows.length - 1]
  const drag = net >= 0 ? rows[rows.length - 1] : rows[0]
  const summary: InsightSegment[] = [
    `${metric} `,
    {
      text:
        net === 0
          ? 'unchanged'
          : `${net > 0 ? 'up' : 'down'} ${formatPercent(Math.abs(percent) / 100)}`,
      tone: netTone,
    },
  ]
  if (lead && Math.sign(lead.value) === Math.sign(net) && net !== 0) {
    summary.push('. Biggest driver: ', `${lead.label} `, {
      text: formatSigned(lead.value, formatter),
      tone: getChangeTone(lead.value, goodDirection),
    })
  }
  if (drag && Math.sign(drag.value) === -Math.sign(net) && net !== 0) {
    summary.push('. Biggest drag: ', `${drag.label} `, {
      text: formatSigned(drag.value, formatter),
      tone: getChangeTone(drag.value, goodDirection),
    })
  }
  summary.push('.')

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <div className='flex flex-col gap-5 border-t pt-4'>
          <div className='flex flex-col gap-1'>
            <div className='flex flex-wrap items-baseline gap-x-2'>
              <KPIValue value={net} format={(value) => formatSigned(value, formatter)} />
              {!state && (
                <span className='text-muted-foreground text-sm tabular-nums'>
                  {formatter(previous)} <span aria-hidden>→</span>
                  <span className='sr-only'>to</span> {formatter(previous + net)}
                </span>
              )}
            </div>
            <BlockReady className='text-sm'>
              <InsightText segments={summary} />
            </BlockReady>
          </div>
          {state === 'loading' && <BlockStateRows rows={6} />}
          {!state && (
            <>
              <ul className='flex flex-col gap-3'>
                {rows.map((row) => (
                  <li
                    key={row.label}
                    className='grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 @md:grid-cols-[8rem_minmax(0,1fr)_9rem]'
                  >
                    <span className='truncate text-sm'>{row.label}</span>
                    <span className='text-right text-sm whitespace-nowrap tabular-nums @md:order-last'>
                      <span className='font-medium'>
                        {formatSigned(row.value, formatter)}
                      </span>{' '}
                      <span className='text-muted-foreground text-xs'>
                        ({formatSigned(points(row.value), formatPoints)})
                      </span>
                    </span>
                    <DivergingBar
                      className='col-span-2 @md:col-span-1'
                      color={toneColors[getChangeTone(row.value, goodDirection)]}
                      max={max}
                      value={row.value}
                    />
                  </li>
                ))}
              </ul>
              <div
                aria-hidden
                className='text-muted-foreground grid grid-cols-[minmax(0,1fr)] gap-x-4 text-xs @md:grid-cols-[8rem_minmax(0,1fr)_9rem]'
              >
                <span className='hidden @md:block' />
                <span className='flex justify-between'>
                  <span>Pulled down</span>
                  <span>Pushed up</span>
                </span>
              </div>
              <p className='text-muted-foreground border-t pt-4 text-xs'>
                Points are each segment's share of the change, as a percentage of last
                period's {metric.toLowerCase()}. They add up to the total change.
              </p>
            </>
          )}
        </div>
      </section>
    </BlockStateProvider>
  )
}

export { Insights3, exampleProps as insights3ExampleProps, type Insights3Props }
