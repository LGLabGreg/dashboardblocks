'use client'

import {
  SeverityBadge,
  type AlertSeverity,
} from '@/registry/components/dashboardblocks/alerts'
import {
  ChartPanelFigure,
  ChartPanelTable,
  ChartPanelTooltip,
  chartAxisProps,
  chartGridProps,
} from '@/registry/components/dashboardblocks/chart-panel'
import { BookOpenIcon } from 'lucide-react'
import { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Reading {
  label: string
  value: number
}

interface Alerts2Props {
  description: string
  formatter?: (value: number) => string
  metric: string
  readings: Reading[]
  runbookHref?: string
  severity: AlertSeverity
  threshold: number
  title: string
}

const exampleProps: Alerts2Props = {
  description: 'checkout-api · eu-west-1 · firing for 12 minutes',
  formatter: (value) => `${value.toFixed(1)}%`,
  metric: 'Error rate',
  readings: Array.from({ length: 30 }, (_, index) => {
    const minute = 14 * 60 + index * 2
    const spike = index >= 23 ? 3.6 + Math.sin(index) * 0.8 + (index - 23) * 0.35 : 0
    return {
      label: `${Math.floor(minute / 60)}:${String(minute % 60).padStart(2, '0')}`,
      value: Number((1.1 + Math.sin(index / 2.4) * 0.35 + spike).toFixed(2)),
    }
  }),
  runbookHref: '#',
  severity: 'critical',
  threshold: 5,
  title: 'Error rate above threshold',
}

const Alerts2 = (props: Alerts2Props) => {
  const {
    description,
    formatter = (value) => value.toLocaleString(),
    metric,
    readings,
    runbookHref,
    severity,
    threshold,
    title,
  } = props
  const [acknowledged, setAcknowledged] = useState(false)
  const current = readings[readings.length - 1]?.value ?? 0
  const peak = Math.max(...readings.map((reading) => reading.value), threshold)
  const yMax = Math.ceil(peak * 1.15)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <SeverityBadge
            severity={acknowledged ? 'resolved' : severity}
            label={acknowledged ? 'Acknowledged' : undefined}
          />
        </CardAction>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <dl className='grid grid-cols-3 gap-4'>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>{metric} now</dt>
            <dd className='text-2xl font-semibold tracking-tight'>
              {formatter(current)}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Threshold</dt>
            <dd className='text-2xl font-semibold tracking-tight'>
              {formatter(threshold)}
            </dd>
          </div>
          <div className='flex flex-col gap-0.5'>
            <dt className='text-muted-foreground text-xs'>Peak</dt>
            <dd className='text-2xl font-semibold tracking-tight'>{formatter(peak)}</dd>
          </div>
        </dl>
        <ChartPanelFigure className='h-48'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={readings} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid {...chartGridProps} />
              <XAxis
                {...chartAxisProps}
                dataKey='label'
                interval='preserveStartEnd'
                minTickGap={40}
              />
              <YAxis
                {...chartAxisProps}
                domain={[0, yMax]}
                tickFormatter={(value: number) => formatter(value)}
                width={44}
              />
              <ReferenceArea
                y1={threshold}
                y2={yMax}
                fill='var(--color-red-500)'
                fillOpacity={0.06}
                ifOverflow='hidden'
              />
              <ReferenceLine
                y={threshold}
                stroke='var(--color-red-600)'
                strokeDasharray='4 3'
                label={{
                  fill: 'var(--color-muted-foreground)',
                  fontSize: 11,
                  position: 'insideTopLeft',
                  value: `Threshold ${formatter(threshold)}`,
                }}
              />
              <Tooltip
                content={(tooltipProps) => (
                  <ChartPanelTooltip {...tooltipProps} valueFormatter={formatter} />
                )}
                cursor={{ stroke: 'var(--color-border)' }}
              />
              <Area
                activeDot={{ r: 4, stroke: 'var(--color-card)', strokeWidth: 2 }}
                dataKey='value'
                fill='var(--chart-1)'
                fillOpacity={0.1}
                name={metric}
                stroke='var(--chart-1)'
                strokeWidth={2}
                type='monotone'
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanelFigure>
        <ChartPanelTable
          caption={`${metric} over the last hour. Threshold ${formatter(threshold)}.`}
          columns={[
            { key: 'label', label: 'Time' },
            { format: formatter, key: 'value', label: metric },
          ]}
          rows={readings}
        />
      </CardContent>
      <CardFooter className='flex flex-wrap gap-2 border-t'>
        <Button size='sm' disabled={acknowledged} onClick={() => setAcknowledged(true)}>
          {acknowledged ? 'Acknowledged' : 'Acknowledge'}
        </Button>
        {runbookHref && (
          <a
            href={runbookHref}
            className={buttonVariants({ size: 'sm', variant: 'outline' })}
          >
            <BookOpenIcon />
            Open runbook
          </a>
        )}
      </CardFooter>
    </Card>
  )
}

export { Alerts2, exampleProps as alerts2ExampleProps, type Alerts2Props }
