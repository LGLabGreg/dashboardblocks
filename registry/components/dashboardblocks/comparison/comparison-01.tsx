'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { KPIChange } from '@/registry/components/dashboardblocks/kpi'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  DataTableStateRows,
} from '@/registry/components/dashboardblocks/table'
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatPoints,
  formatSigned,
} from '@/registry/lib/dashboardblocks/format'

interface ComparedMetric {
  current: number
  differenceFormatter?: (value: number) => string
  formatter?: (value: number) => string
  /** Use `down` for metrics like churn or latency, where a decrease is good. */
  goodDirection?: 'up' | 'down'
  label: string
  previous: number
}

interface Comparison1Props {
  currentLabel: string
  /** Defaults to a sentence saying how many metrics improved. */
  description?: string
  /** Leave out, or pass none, to show the empty state. */
  metrics?: ComparedMetric[]
  previousLabel: string
  status?: BlockStatus
  title: string
}

const exampleProps: Comparison1Props = {
  currentLabel: 'September',
  metrics: [
    {
      current: 48_210,
      formatter: (value) => formatCurrency(value),
      label: 'Revenue',
      previous: 42_890,
    },
    { current: 1_284, label: 'Orders', previous: 1_210 },
    {
      current: 37.55,
      formatter: (value) =>
        formatCurrency(value, { maximumFractionDigits: 2, minimumFractionDigits: 2 }),
      label: 'Avg order value',
      previous: 35.45,
    },
    { current: 342, label: 'New customers', previous: 318 },
    {
      current: 2.1,
      differenceFormatter: (value) => formatPoints(value, { minimumFractionDigits: 1 }),
      formatter: (value) => formatPercent(value / 100, { minimumFractionDigits: 1 }),
      goodDirection: 'down',
      label: 'Refund rate',
      previous: 2.4,
    },
    {
      current: 4.2,
      formatter: (value) => `${formatNumber(value, { minimumFractionDigits: 1 })} h`,
      goodDirection: 'down',
      label: 'First response time',
      previous: 3.8,
    },
  ],
  previousLabel: 'August',
  title: 'Month over month',
}

const isGood = (metric: ComparedMetric, difference: number) =>
  metric.goodDirection === 'down' ? difference < 0 : difference > 0

function summarize(metrics: ComparedMetric[], previousLabel: string) {
  const improved = metrics.filter((metric) =>
    isGood(metric, metric.current - metric.previous),
  ).length
  const worse = metrics.filter(
    (metric) =>
      metric.current !== metric.previous &&
      !isGood(metric, metric.current - metric.previous),
  )
  const lead = `${improved} of ${metrics.length} metrics improved on ${previousLabel}`
  if (worse.length === 0) return `${lead}.`
  return `${lead}; ${worse.map((metric) => metric.label.toLowerCase()).join(' and ')} got worse.`
}

const Comparison1 = (props: Comparison1Props) => {
  const { currentLabel, metrics = [], previousLabel, status, title } = props
  const { description = summarize(metrics, previousLabel) } = props

  return (
    <BlockStateProvider state={getBlockState(status, metrics)}>
      <section className='@container/data-table flex flex-col gap-3'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        <DataTable caption={`${title}: ${description}`} className='border-t'>
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
            <DataTableStateRows colSpan={5} rows={6} />
            {!status &&
              metrics.map((metric) => {
                const format =
                  metric.formatter ?? ((value: number) => formatNumber(value))
                const difference = metric.current - metric.previous
                return (
                  <DataTableRow key={metric.label}>
                    <DataTableCell primary>{metric.label}</DataTableCell>
                    <DataTableCell align='end' className='font-medium'>
                      {format(metric.current)}
                    </DataTableCell>
                    <DataTableCell align='end' className='text-muted-foreground'>
                      {format(metric.previous)}
                    </DataTableCell>
                    <DataTableCell align='end'>
                      {formatSigned(difference, metric.differenceFormatter ?? format)}
                    </DataTableCell>
                    <DataTableCell align='end'>
                      <KPIChange
                        comparison={`in ${previousLabel}`}
                        format={format}
                        goodDirection={metric.goodDirection}
                        inline
                        previous={metric.previous}
                        value={metric.current}
                        variant='short'
                      />
                    </DataTableCell>
                  </DataTableRow>
                )
              })}
          </DataTableBody>
        </DataTable>
      </section>
    </BlockStateProvider>
  )
}

export { Comparison1, exampleProps as comparison1ExampleProps, type Comparison1Props }
