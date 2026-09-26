'use client'

import {
  PipelineOwner,
  type PipelineStage,
  formatCurrency,
} from '@/registry/components/dashboardblocks/pipeline'
import { useInView } from '@/registry/hooks/use-in-view'
import { CircleCheckIcon, TriangleAlertIcon } from 'lucide-react'
import { type RefObject, useEffect, useState } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface OwnerPipeline {
  /** Won so far this period. */
  closed: number
  /** Open deals: their value and the id of their stage. */
  deals: { stage: string; value: number }[]
  name: string
  quota: number
}

interface Pipeline4Props {
  description: string
  owners: OwnerPipeline[]
  /** Stages with the chance that a deal in each one closes. */
  stages: PipelineStage[]
  title: string
}

const deals = (stage: string, ...values: number[]) =>
  values.map((value) => ({ stage, value }))

const exampleProps: Pipeline4Props = {
  description: 'Q3 forecast: closed plus open deals weighted by stage',
  owners: [
    {
      closed: 286_000,
      deals: [
        ...deals('qualified', 42_000, 31_200),
        ...deals('proposal', 39_900, 58_000),
        ...deals('negotiation', 74_000),
      ],
      name: 'Maya Patel',
      quota: 400_000,
    },
    {
      closed: 198_000,
      deals: [
        ...deals('discovery', 96_000),
        ...deals('proposal', 64_500),
        ...deals('negotiation', 212_000),
      ],
      name: 'Jonas Weber',
      quota: 400_000,
    },
    {
      closed: 142_000,
      deals: [
        ...deals('qualified', 27_000),
        ...deals('discovery', 48_000),
        ...deals('proposal', 128_000),
      ],
      name: 'Aiko Tanaka',
      quota: 350_000,
    },
    {
      closed: 121_000,
      deals: [
        ...deals('qualified', 18_500),
        ...deals('discovery', 54_000),
        ...deals('negotiation', 87_000),
      ],
      name: 'Luis Romero',
      quota: 300_000,
    },
  ],
  stages: [
    { id: 'qualified', label: 'Qualified', probability: 0.1 },
    { id: 'discovery', label: 'Discovery', probability: 0.25 },
    { id: 'proposal', label: 'Proposal', probability: 0.5 },
    { id: 'negotiation', label: 'Negotiation', probability: 0.75 },
  ],
  title: 'Weighted pipeline',
}

const CLOSED_COLOR = 'var(--chart-1)'
const WEIGHTED_COLOR = 'color-mix(in oklab, var(--chart-1) 50%, var(--card))'

const Pipeline4 = (props: Pipeline4Props) => {
  const { description, owners, stages, title } = props
  const { isInView, ref } = useInView({ threshold: 0.3 })
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (!isInView) return
    const frame = requestAnimationFrame(() => setRevealed(true))
    return () => cancelAnimationFrame(frame)
  }, [isInView])

  const probability = new Map(stages.map((stage) => [stage.id, stage.probability ?? 0]))
  const rows = owners.map((owner) => {
    const weighted = owner.deals.reduce(
      (sum, deal) => sum + deal.value * (probability.get(deal.stage) ?? 0),
      0,
    )
    return { ...owner, forecast: owner.closed + weighted, weighted }
  })
  // One scale for every row, so the bars compare across owners.
  const max = Math.max(1, ...rows.flatMap((row) => [row.quota, row.forecast]))
  const teamForecast = rows.reduce((sum, row) => sum + row.forecast, 0)
  const teamQuota = rows.reduce((sum, row) => sum + row.quota, 0)
  const scale = (value: number) => `${(value / max) * 100}%`

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <div className='flex flex-col gap-3 @md:flex-row @md:items-end @md:justify-between'>
          <p className='flex flex-wrap items-baseline gap-x-2'>
            <span className='text-3xl font-semibold tracking-tight tabular-nums'>
              {formatCurrency(teamForecast)}
            </span>
            <span className='text-muted-foreground text-sm'>
              of {formatCurrency(teamQuota)} team quota ·{' '}
              {Math.round((teamForecast / teamQuota) * 100)}%
            </span>
          </p>
          <ul className='text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs'>
            <li className='flex items-center gap-1.5'>
              <span
                aria-hidden
                className='size-2.5 rounded-[3px]'
                style={{ backgroundColor: CLOSED_COLOR }}
              />
              Closed
            </li>
            <li className='flex items-center gap-1.5'>
              <span
                aria-hidden
                className='size-2.5 rounded-[3px]'
                style={{ backgroundColor: WEIGHTED_COLOR }}
              />
              Weighted open
            </li>
            <li className='flex items-center gap-1.5'>
              <span aria-hidden className='bg-foreground h-3 w-0.5 rounded-full' />
              Quota
            </li>
          </ul>
        </div>
        <ul ref={ref as RefObject<HTMLUListElement>} className='flex flex-col'>
          {rows.map((row) => {
            const gap = row.quota - row.forecast
            const covered = gap <= 0
            const StatusIcon = covered ? CircleCheckIcon : TriangleAlertIcon
            return (
              <li
                key={row.name}
                className='flex flex-col gap-2 border-b py-3 first:pt-0 last:border-b-0 last:pb-0'
              >
                <div className='flex flex-wrap items-center justify-between gap-x-3 gap-y-1'>
                  <PipelineOwner name={row.name} showName className='font-medium' />
                  <span className='text-sm whitespace-nowrap tabular-nums'>
                    <span className='font-medium'>{formatCurrency(row.forecast)}</span>
                    <span className='text-muted-foreground'>
                      {' '}
                      of {formatCurrency(row.quota)}
                    </span>
                  </span>
                </div>
                <div aria-hidden className='relative h-2.5 w-full'>
                  <div className='bg-muted flex h-full w-full gap-px overflow-hidden rounded-full'>
                    <div
                      className='h-full transition-[width] duration-1000 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none'
                      style={{
                        backgroundColor: CLOSED_COLOR,
                        width: revealed ? scale(row.closed) : 0,
                      }}
                    />
                    <div
                      className='h-full transition-[width] delay-150 duration-1000 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none'
                      style={{
                        backgroundColor: WEIGHTED_COLOR,
                        width: revealed ? scale(row.weighted) : 0,
                      }}
                    />
                  </div>
                  <span
                    className='bg-foreground ring-card absolute top-1/2 h-[calc(100%+8px)] w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2'
                    style={{ left: scale(row.quota) }}
                  />
                </div>
                <p className='text-muted-foreground flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs tabular-nums'>
                  <span>
                    Closed {formatCurrency(row.closed)} · Weighted{' '}
                    {formatCurrency(row.weighted)}
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 font-medium',
                      covered
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-amber-800 dark:text-amber-400',
                    )}
                  >
                    <StatusIcon aria-hidden className='size-3.5' />
                    {covered
                      ? `Covers quota by ${formatCurrency(-gap)}`
                      : `Short ${formatCurrency(gap)}`}
                  </span>
                </p>
              </li>
            )
          })}
        </ul>
        <p className='text-muted-foreground border-t pt-4 text-xs'>
          Weighted at{' '}
          {stages
            .map(
              (stage) => `${stage.label} ${Math.round((stage.probability ?? 0) * 100)}%`,
            )
            .join(', ')}
          .
        </p>
      </CardContent>
    </Card>
  )
}

export { Pipeline4, exampleProps as pipeline4ExampleProps, type Pipeline4Props }
