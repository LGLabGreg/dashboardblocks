'use client'

import { getDelta } from '@/registry/components/dashboardblocks/comparison'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from '@/registry/components/dashboardblocks/data-table'
import { Trend } from '@/registry/components/dashboardblocks/trend'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ComparedMetric {
  current: number
  /** Formats the absolute difference, e.g. percentage points for rates. Defaults to `formatter`. */
  differenceFormatter?: (value: number) => string
  formatter?: (value: number) => string
  /** Use `down` for metrics like churn or latency, where a decrease is good. */
  goodDirection?: 'up' | 'down'
  label: string
  previous: number
}

interface Comparison1Props {
  currentLabel: string
  description: string
  metrics: ComparedMetric[]
  previousLabel: string
  title: string
}

const currency = (value: number) => `$${Math.round(value).toLocaleString('en-US')}`

const exampleProps: Comparison1Props = {
  currentLabel: 'September',
  description: 'September compared with August',
  metrics: [
    { current: 48_210, formatter: currency, label: 'Revenue', previous: 42_890 },
    { current: 1_284, label: 'Orders', previous: 1_210 },
    {
      current: 37.55,
      formatter: (value) => `$${value.toFixed(2)}`,
      label: 'Avg order value',
      previous: 35.45,
    },
    { current: 342, label: 'New customers', previous: 318 },
    {
      current: 2.1,
      differenceFormatter: (value) => `${value.toFixed(1)} pts`,
      formatter: (value) => `${value.toFixed(1)}%`,
      goodDirection: 'down',
      label: 'Refund rate',
      previous: 2.4,
    },
    {
      current: 4.2,
      formatter: (value) => `${value.toFixed(1)} h`,
      goodDirection: 'down',
      label: 'First response time',
      previous: 3.8,
    },
  ],
  previousLabel: 'August',
  title: 'Month over month',
}

const Comparison1 = (props: Comparison1Props) => {
  const { currentLabel, description, metrics, previousLabel, title } = props

  return (
    <Card className='@container/data-table gap-0 pb-0'>
      <CardHeader className='border-b'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <DataTable>
        <caption className='sr-only'>{`${title}: ${description}`}</caption>
        <DataTableHeader>
          <DataTableRow>
            <DataTableHead>Metric</DataTableHead>
            <DataTableHead align='end'>{currentLabel}</DataTableHead>
            <DataTableHead align='end'>{previousLabel}</DataTableHead>
            <DataTableHead align='end'>Difference</DataTableHead>
            <DataTableHead align='end'>Change</DataTableHead>
          </DataTableRow>
        </DataTableHeader>
        <DataTableBody>
          {metrics.map((metric) => {
            const format = metric.formatter ?? ((value: number) => value.toLocaleString())
            const { difference, percent } = getDelta(metric.current, metric.previous)
            const sign = difference > 0 ? '+' : difference < 0 ? '−' : ''
            return (
              <DataTableRow key={metric.label}>
                <DataTableCell primary>{metric.label}</DataTableCell>
                <DataTableCell align='end' label={currentLabel} className='font-medium'>
                  {format(metric.current)}
                </DataTableCell>
                <DataTableCell
                  align='end'
                  label={previousLabel}
                  className='text-muted-foreground'
                >
                  {format(metric.previous)}
                </DataTableCell>
                <DataTableCell align='end' label='Difference'>
                  {sign}
                  {(metric.differenceFormatter ?? format)(Math.abs(difference))}
                </DataTableCell>
                <DataTableCell align='end' label='Change'>
                  <Trend
                    className='justify-end text-xs @max-2xl/data-table:justify-start [&_svg]:size-3.5'
                    goodDirection={metric.goodDirection}
                    trend={percent}
                    trendIcon='arrow'
                  />
                </DataTableCell>
              </DataTableRow>
            )
          })}
        </DataTableBody>
      </DataTable>
    </Card>
  )
}

export { Comparison1, exampleProps as comparison1ExampleProps, type Comparison1Props }
