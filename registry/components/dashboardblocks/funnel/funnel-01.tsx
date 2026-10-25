'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  FunnelBar,
  type FunnelStage,
  formatRate,
  getFunnelSteps,
} from '@/registry/components/dashboardblocks/funnel'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { Link } from '@/registry/components/dashboardblocks/link'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  DataTableRowHead,
} from '@/registry/components/dashboardblocks/table'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatNumber } from '@/registry/lib/dashboardblocks/format'
import { Fragment } from 'react'

import { buttonVariants } from '@/components/ui/button'

import { cn } from '@/lib/utils'

interface Funnel1Props extends BlockStateProps {
  description: string
  /** Where the chart opens in full, such as the explorer it was saved from. */
  link?: { href: string; label: string }
  /** Leave out, or pass none, to show the empty state. */
  stages?: FunnelStage[]
  title: string
}

const exampleProps: Funnel1Props = {
  description: 'Visitors to paid customers, last 30 days.',
  link: { href: '/dashboard/funnels', label: 'Open in Funnels' },
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
  const { description, errorMessage, link, stages = [], status, title } = props
  const state = getBlockState(status, stages)
  const steps = getFunnelSteps(stages)
  const first = steps[0]
  const last = steps.at(-1)

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </div>
          {link && (
            <Link
              href={link.href}
              className={cn(
                buttonVariants({ size: 'xs', variant: 'outline' }),
                'group/open shrink-0',
              )}
            >
              {link.label}
              <IconPlaceholder
                lucide='ArrowRightIcon'
                tabler='IconArrowRight'
                hugeicons='ArrowRight01Icon'
                phosphor='ArrowRightIcon'
                remixicon='RiArrowRightLine'
                className='transition-transform group-hover/open:translate-x-0.5 motion-reduce:transition-none'
                data-icon='inline-end'
                aria-hidden
              />
            </Link>
          )}
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
          <DataTable density='compact' caption={`${title}: ${description}`}>
            <DataTableHeader>
              <DataTableRow>
                <DataTableHead>Stage</DataTableHead>
                <DataTableHead align='end'>Users</DataTableHead>
                <DataTableHead align='end'>
                  Conversion<span className='sr-only'> from previous step</span>
                </DataTableHead>
              </DataTableRow>
            </DataTableHeader>
            <DataTableBody>
              {steps.map((step, index) => (
                <Fragment key={step.label}>
                  <DataTableRow className='border-b-0'>
                    <DataTableRowHead className='pb-1.5'>{step.label}</DataTableRowHead>
                    <DataTableCell align='end' className='w-20 pb-1.5 font-medium'>
                      {formatNumber(step.value)}
                    </DataTableCell>
                    <DataTableCell
                      align='end'
                      className='text-muted-foreground w-24 pb-1.5'
                    >
                      {index === 0 ? '—' : formatRate(step.fromPrevious)}
                    </DataTableCell>
                  </DataTableRow>
                  <DataTableRow aria-hidden>
                    <DataTableCell colSpan={3} className='pt-0'>
                      <FunnelBar delay={index * 80} value={step.fromStart * 100} />
                    </DataTableCell>
                  </DataTableRow>
                </Fragment>
              ))}
            </DataTableBody>
          </DataTable>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Funnel1, exampleProps as funnel1ExampleProps, type Funnel1Props }
