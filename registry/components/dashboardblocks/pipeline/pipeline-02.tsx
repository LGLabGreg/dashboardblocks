'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  BlockStateText,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { BreakdownBar } from '@/registry/components/dashboardblocks/breakdown'
import { ChartPlaceholder } from '@/registry/components/dashboardblocks/chart'
import { getStageColor } from '@/registry/components/dashboardblocks/pipeline'
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from '@/registry/lib/dashboardblocks/format'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'

interface StageTotal {
  count: number
  label: string
  value: number
}

interface Pipeline2Props extends BlockStateProps {
  /** Defaults to a sentence naming the stage that holds the most value. */
  description?: string
  noun?: string
  /** Leave out, or pass none, to show the empty state. */
  stages?: StageTotal[]
  title: string
}

const exampleProps: Pipeline2Props = {
  noun: 'deals',
  stages: [
    { count: 48, label: 'Lead', value: 1_240_000 },
    { count: 31, label: 'Qualified', value: 982_000 },
    { count: 22, label: 'Discovery', value: 861_500 },
    { count: 14, label: 'Proposal', value: 724_000 },
    { count: 7, label: 'Negotiation', value: 409_000 },
  ],
  title: 'Open pipeline',
}

type Measure = 'value' | 'count'

const MEASURES: { label: string; value: Measure }[] = [
  { label: 'Value', value: 'value' },
  { label: 'Count', value: 'count' },
]

const Pipeline2 = (props: Pipeline2Props) => {
  const { noun = 'items', stages = [], errorMessage, status, title } = props
  const state = getBlockState(status, stages)
  const [measure, setMeasure] = useState<Measure>('value')

  const totalCount = stages.reduce((sum, stage) => sum + stage.count, 0)
  const totalValue = stages.reduce((sum, stage) => sum + stage.value, 0)
  const total = measure === 'value' ? totalValue : totalCount
  const largest = stages.reduce<StageTotal | undefined>(
    (best, stage) => (best && best.value >= stage.value ? best : stage),
    undefined,
  )
  const last = stages[stages.length - 1]
  const {
    description = largest && last
      ? `${largest.label} holds the most value; ${formatCurrency(last.value, { compact: true })} is in ${last.label}, the last stage before closing.`
      : `No open ${noun}.`,
  } = props

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-wrap items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <BlockReady className='text-sm'>
              <p className='text-muted-foreground text-sm'>{description}</p>
            </BlockReady>
          </div>
          <ButtonGroup aria-label='Size stages by'>
            {MEASURES.map((option) => (
              <Button
                key={option.value}
                aria-pressed={measure === option.value}
                disabled={state !== undefined}
                className='not-aria-pressed:text-muted-foreground aria-pressed:bg-muted aria-pressed:text-foreground'
                onClick={() => setMeasure(option.value)}
                size='sm'
                variant='outline'
              >
                {option.label}
              </Button>
            ))}
          </ButtonGroup>
        </header>
        <p className='flex flex-wrap items-baseline gap-x-2 border-t pt-4'>
          <span className='text-4xl font-light tracking-tight tabular-nums'>
            {state ? (
              <BlockStateText variant='short' />
            ) : (
              formatCurrency(totalValue, { compact: true })
            )}
          </span>
          {!state && (
            <span className='text-muted-foreground text-sm'>
              in {formatNumber(totalCount)} open {noun}
            </span>
          )}
        </p>
        {state === 'loading' && (
          <>
            <ChartPlaceholder className='rounded-full' height={12} />
            <BlockStateRows rows={3} />
          </>
        )}
        {!state && (
          <>
            <BreakdownBar
              segments={stages.map((stage, index) => ({
                color: getStageColor(index, stages.length),
                label: stage.label,
                value: measure === 'value' ? stage.value : stage.count,
              }))}
            />
            <ol className='grid grid-cols-2 gap-x-4 gap-y-3 @md:grid-cols-3 @2xl:auto-cols-fr @2xl:grid-flow-col @2xl:grid-cols-none'>
              {stages.map((stage, index) => {
                const amount = measure === 'value' ? stage.value : stage.count
                return (
                  <li key={stage.label} className='flex min-w-0 flex-col gap-0.5'>
                    <span className='flex items-center gap-1.5 text-xs font-medium'>
                      <span
                        aria-hidden
                        className='size-2 shrink-0 rounded-full'
                        style={{ backgroundColor: getStageColor(index, stages.length) }}
                      />
                      <span className='truncate'>{stage.label}</span>
                      <span className='text-muted-foreground ml-auto font-normal tabular-nums'>
                        {formatPercent(total > 0 ? amount / total : 0, {
                          maximumFractionDigits: 0,
                        })}
                        <span className='sr-only'> of {measure}</span>
                      </span>
                    </span>
                    <span className='pl-3.5 text-sm tabular-nums'>
                      {formatCurrency(stage.value, { compact: true })}
                    </span>
                    <span className='text-muted-foreground pl-3.5 text-xs tabular-nums'>
                      {formatNumber(stage.count)} {noun}
                    </span>
                  </li>
                )
              })}
            </ol>
          </>
        )}
      </section>
    </BlockStateProvider>
  )
}

export { Pipeline2, exampleProps as pipeline2ExampleProps, type Pipeline2Props }
