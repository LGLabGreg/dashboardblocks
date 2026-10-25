'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateText,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  CompareToggle,
  DashboardHeaderTitle,
  type DateRangePreset,
  DateRangePicker,
  ExportMenu,
} from '@/registry/components/dashboardblocks/dashboard-header'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { startTransition, useState } from 'react'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

interface DashboardHeader4Props extends BlockStateProps {
  defaultPreset?: DateRangePreset
  /** Leave out to show the empty state. */
  description?: string
  lastUpdated: string
  onExport?: (format: string) => void
  onRefresh?: () => Promise<void>
  title: string
  /** The last day of every date range preset. */
  today: Date
}

const exampleProps: DashboardHeader4Props = {
  defaultPreset: '30d',
  description: '4,812 subscriptions across every plan, bringing in $96,240 a month.',
  lastUpdated: '5 min ago',
  onRefresh: () => new Promise((resolve) => setTimeout(resolve, 1200)),
  title: 'Subscriptions',
  today: new Date(Date.UTC(2026, 8, 25)),
}

const DashboardHeader4 = (props: DashboardHeader4Props) => {
  const {
    defaultPreset = '30d',
    description,
    lastUpdated,
    onExport = () => {},
    onRefresh = async () => {},
    errorMessage,
    status,
    title,
    today,
  } = props
  const state = getBlockState(status, description)
  const [preset, setPreset] = useState<DateRangePreset>(defaultPreset)
  const [compare, setCompare] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [updated, setUpdated] = useState(lastUpdated)

  const refresh = async () => {
    setRefreshing(true)
    try {
      await onRefresh()
      startTransition(() => setUpdated('just now'))
    } finally {
      startTransition(() => setRefreshing(false))
    }
  }

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <header className='@container'>
        <div className='flex flex-col gap-4 @3xl:flex-row @3xl:items-end @3xl:justify-between'>
          <div className='flex flex-col gap-2'>
            <DashboardHeaderTitle
              title={title}
              description={state ? <BlockStateText /> : description}
            />
            <BlockReady className='flex h-6 items-center text-xs'>
              <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
                <span
                  aria-hidden
                  className={cn(
                    'size-1.5 shrink-0 rounded-full bg-emerald-500',
                    refreshing && 'motion-safe:animate-pulse',
                  )}
                />
                <span aria-live='polite'>
                  {refreshing ? 'Refreshing…' : `Updated ${updated}`}
                </span>
                <Button disabled={refreshing} onClick={refresh} size='xs' variant='ghost'>
                  <IconPlaceholder
                    lucide='RefreshCwIcon'
                    tabler='IconRefresh'
                    hugeicons='RefreshIcon'
                    phosphor='ArrowClockwiseIcon'
                    remixicon='RiRefreshLine'
                    className={cn(refreshing && 'motion-safe:animate-spin')}
                  />
                  Refresh
                </Button>
              </div>
            </BlockReady>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <CompareToggle
              checked={compare}
              onCheckedChange={setCompare}
              className='basis-full @md:mr-2 @md:basis-auto'
            />
            <DateRangePicker onValueChange={setPreset} today={today} value={preset} />
            <ExportMenu disabled={state !== undefined} onExport={onExport} />
          </div>
        </div>
      </header>
    </BlockStateProvider>
  )
}

export {
  DashboardHeader4,
  exampleProps as dashboardHeader4ExampleProps,
  type DashboardHeader4Props,
}
