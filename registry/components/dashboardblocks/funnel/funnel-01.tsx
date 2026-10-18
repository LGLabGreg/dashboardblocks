'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  FunnelBar,
  type FunnelStage,
  formatRate,
  getFunnelSteps,
} from '@/registry/components/dashboardblocks/funnel'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { formatNumber } from '@/registry/lib/dashboardblocks/format'
import { Fragment } from 'react'

interface Funnel1Props {
  description: string
  /** Leave out, or pass none, to show the empty state. */
  stages?: FunnelStage[]
  status?: BlockStatus
  title: string
}

const exampleProps: Funnel1Props = {
  description: 'Visitors to paid customers, last 30 days.',
  stages: [
    { label: 'Visited site', value: 48_210 },
    { label: 'Signed up', value: 9_870 },
    { label: 'Activated', value: 5_430 },
    { label: 'Started trial', value: 2_160 },
    { label: 'Became customer', value: 812 },
  ],
  title: 'Signup funnel',
}

const Funnel1 = (props: Funnel1Props) => {
  const { description, stages = [], status, title } = props
  const state = getBlockState(status, stages)
  const steps = getFunnelSteps(stages)
  const first = steps[0]
  const last = steps.at(-1)

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </header>
        <dl className='flex flex-col gap-1 border-t pt-4'>
          <dt className='text-muted-foreground text-sm'>Overall conversion</dt>
          <dd>
            <KPIValue value={last?.fromStart} format={(value) => formatRate(value, 2)} />
          </dd>
          <BlockReady className='text-xs'>
            {first && last && (
              <dd className='text-muted-foreground text-xs tabular-nums'>
                {formatNumber(last.value)} of {formatNumber(first.value)}
              </dd>
            )}
          </BlockReady>
        </dl>
        {state === 'loading' && <BlockStateRows rows={5} />}
        {!state && (
          <table className='w-full text-sm'>
            <caption className='sr-only'>{`${title}: ${description}`}</caption>
            <thead className='text-muted-foreground text-xs'>
              <tr>
                <th scope='col' className='pb-1 text-left font-normal'>
                  Stage
                </th>
                <th scope='col' className='pb-1 text-right font-normal'>
                  Users
                </th>
                <th scope='col' className='pb-1 text-right font-normal'>
                  Conversion<span className='sr-only'> from previous step</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {steps.map((step, index) => (
                <Fragment key={step.label}>
                  <tr>
                    <th scope='row' className='pt-2.5 pr-4 pb-1.5 text-left font-normal'>
                      {step.label}
                    </th>
                    <td className='w-20 pt-2.5 pb-1.5 pl-2 text-right font-medium tabular-nums'>
                      {formatNumber(step.value)}
                    </td>
                    <td className='text-muted-foreground w-24 pt-2.5 pb-1.5 pl-2 text-right tabular-nums'>
                      {index === 0 ? '—' : formatRate(step.fromPrevious)}
                    </td>
                  </tr>
                  <tr aria-hidden>
                    <td colSpan={3} className='pb-1'>
                      <FunnelBar delay={index * 80} value={step.fromStart * 100} />
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Funnel1, exampleProps as funnel1ExampleProps, type Funnel1Props }
