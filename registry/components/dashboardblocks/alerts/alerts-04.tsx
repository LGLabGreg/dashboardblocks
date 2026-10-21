'use client'

import {
  type AlertSeverity,
  SeverityLabel,
  formatRelativeTime,
  severityConfig,
} from '@/registry/components/dashboardblocks/alerts'
import {
  BlockReady,
  BlockStateProvider,
  BlockStateText,
  type BlockStatus,
  SkeletonText,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { Details } from '@/registry/components/dashboardblocks/details'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'

import { Button } from '@/components/ui/button'

interface Alerts4Props {
  /** Leave out to show the empty state. */
  counts?: Partial<Record<Exclude<AlertSeverity, 'resolved'>, number>>
  latest?: { firedAt: Date; severity: AlertSeverity; source: string; title: string }
  now: Date
  onViewAll?: () => void
  status?: BlockStatus
}

const NOW = Date.UTC(2026, 8, 25, 14, 30)

const exampleProps: Alerts4Props = {
  counts: { critical: 2, info: 3, warning: 5 },
  latest: {
    firedAt: new Date(NOW - 4 * 60_000),
    severity: 'critical',
    source: 'checkout-api',
    title: 'Error rate above 5% for 10 minutes',
  },
  now: new Date(NOW),
}

const SEVERITIES = ['critical', 'warning', 'info'] as const

const Alerts4 = (props: Alerts4Props) => {
  const { counts, latest, now, onViewAll, status } = props
  const state = getBlockState(status, counts)
  const total = SEVERITIES.reduce((sum, severity) => sum + (counts?.[severity] ?? 0), 0)

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-3 border-t pt-3 @2xl:flex-row @2xl:items-center @2xl:gap-6'>
        <div className='flex shrink-0 flex-col gap-0.5'>
          {state === 'error' || state === 'empty' ? (
            <p className='flex items-baseline gap-2'>
              <span className='text-sm font-medium'>Open alerts</span>
              <BlockStateText
                className='text-2xl font-light tracking-tight'
                variant='short'
              />
            </p>
          ) : (
            <p className='flex items-baseline gap-2'>
              <span className='text-2xl font-light tracking-tight tabular-nums'>
                {state === 'loading' ? <SkeletonText className='w-[1.5em]' /> : total}
              </span>
              <span className='text-sm font-medium'>
                {total === 1 ? 'open alert' : 'open alerts'}
              </span>
            </p>
          )}
          <BlockReady className='w-40 text-sm'>
            <Details className='text-sm'>
              {SEVERITIES.map((severity) => {
                const count = counts?.[severity] ?? 0
                return count > 0 ? (
                  <SeverityLabel variant='text' key={severity} severity={severity}>
                    {count} {severityConfig[severity].label.toLowerCase()}
                  </SeverityLabel>
                ) : (
                  <span key={severity} className='text-muted-foreground tabular-nums'>
                    0 {severityConfig[severity].label.toLowerCase()}
                  </span>
                )
              })}
            </Details>
          </BlockReady>
        </div>
        {state === 'loading' && (
          <BlockReady className='min-w-0 flex-1 text-sm @2xl:border-l @2xl:pl-6'>
            {null}
          </BlockReady>
        )}
        {!state && (
          <div className='flex min-w-0 flex-1 flex-col gap-0.5 text-sm @2xl:border-l @2xl:pl-6'>
            {latest && total > 0 ? (
              <>
                <p>
                  <span className='text-muted-foreground'>Latest </span>
                  <SeverityLabel severity={latest.severity} />{' '}
                  <span className='font-medium'>{latest.title}</span>
                </p>
                <Details className='text-muted-foreground text-xs'>
                  {latest.source}
                  <time dateTime={latest.firedAt.toISOString()}>
                    {formatRelativeTime(latest.firedAt, now)}
                  </time>
                </Details>
              </>
            ) : (
              <p className='text-muted-foreground'>Nothing needs a response.</p>
            )}
          </div>
        )}
        <Button
          variant='outline'
          size='sm'
          className='self-start @2xl:self-center'
          onClick={onViewAll}
        >
          View alerts
          <IconPlaceholder
            lucide='ArrowRightIcon'
            tabler='IconArrowRight'
            hugeicons='ArrowRight01Icon'
            phosphor='ArrowRightIcon'
            remixicon='RiArrowRightLine'
            data-icon='inline-end'
          />
        </Button>
      </section>
    </BlockStateProvider>
  )
}

export { Alerts4, exampleProps as alerts4ExampleProps, type Alerts4Props }
