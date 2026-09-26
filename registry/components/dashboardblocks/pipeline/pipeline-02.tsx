'use client'

import {
  formatCurrency,
  getStageColor,
} from '@/registry/components/dashboardblocks/pipeline'
import { useInView } from '@/registry/hooks/use-in-view'
import { type RefObject, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Card, CardContent } from '@/components/ui/card'

interface StageTotal {
  count: number
  label: string
  value: number
}

interface Pipeline2Props {
  /** What the items are called, such as "deals". */
  noun?: string
  /** Stages in order, first to last. */
  stages: StageTotal[]
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
  const { noun = 'items', stages, title } = props
  const [measure, setMeasure] = useState<Measure>('value')
  const { isInView, ref } = useInView({ threshold: 0.3 })
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (!isInView) return
    const frame = requestAnimationFrame(() => setRevealed(true))
    return () => cancelAnimationFrame(frame)
  }, [isInView])

  const totalCount = stages.reduce((sum, stage) => sum + stage.count, 0)
  const totalValue = stages.reduce((sum, stage) => sum + stage.value, 0)
  const total = measure === 'value' ? totalValue : totalCount

  return (
    <Card className='@container py-4'>
      <CardContent className='flex flex-col gap-4 px-4'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='flex flex-col'>
            <span className='text-muted-foreground text-sm'>{title}</span>
            <p className='flex flex-wrap items-baseline gap-x-2'>
              <span className='text-2xl font-semibold tracking-tight tabular-nums'>
                {formatCurrency(totalValue)}
              </span>
              <span className='text-muted-foreground text-sm'>
                {totalCount} {noun} in {stages.length} stages
              </span>
            </p>
          </div>
          <ButtonGroup aria-label='Size stages by'>
            {MEASURES.map((option) => (
              <Button
                key={option.value}
                aria-pressed={measure === option.value}
                className='aria-pressed:bg-muted aria-pressed:text-foreground text-muted-foreground'
                onClick={() => setMeasure(option.value)}
                size='sm'
                variant='outline'
              >
                {option.label}
              </Button>
            ))}
          </ButtonGroup>
        </div>
        <div
          ref={ref as RefObject<HTMLDivElement>}
          aria-hidden
          className='flex h-3 w-full gap-0.5 overflow-hidden rounded-full'
        >
          {stages.map((stage, index) => {
            const amount = measure === 'value' ? stage.value : stage.count
            return (
              <div
                key={stage.label}
                className='h-full min-w-0 transition-[flex-grow] duration-700 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none'
                style={{
                  backgroundColor: getStageColor(index, stages.length),
                  flexBasis: 0,
                  flexGrow: revealed && total > 0 ? amount / total : 0,
                }}
              />
            )
          })}
        </div>
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
                    {total > 0 ? Math.round((amount / total) * 100) : 0}%
                    <span className='sr-only'> of {measure}</span>
                  </span>
                </span>
                <span className='pl-3.5 text-sm font-medium tabular-nums'>
                  {formatCurrency(stage.value)}
                </span>
                <span className='text-muted-foreground pl-3.5 text-xs tabular-nums'>
                  {stage.count} {noun}
                </span>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}

export { Pipeline2, exampleProps as pipeline2ExampleProps, type Pipeline2Props }
