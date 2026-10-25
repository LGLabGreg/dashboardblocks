'use client'

import { modelPalette } from '@/registry/components/dashboardblocks/ai-usage'
import {
  BlockReady,
  BlockStateProvider,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  DataTableRowHead,
  DataTableRowLink,
  DataTableStateRows,
} from '@/registry/components/dashboardblocks/table'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'

import { cn } from '@/lib/utils'

interface ModelPerformance {
  /** Share of requests that errored, 0–1. */
  errorRate: number
  /** The model's calls: the whole row opens them. */
  href?: string
  label: string
  /** Output tokens per second while streaming. */
  outputSpeed: number
  requests: number
  /** Time to first token, median, in ms. */
  ttftP50: number
  /** Time to first token, 95th percentile, in ms. */
  ttftP95: number
}

interface AiUsage3Props extends BlockStateProps {
  /** Defaults to a sentence naming the busiest model and any over the error threshold. */
  description?: string
  /** Error rate above which a model is flagged, 0–1. */
  errorThreshold?: number
  /** Leave out, or pass none, to show the empty state. */
  models?: ModelPerformance[]
  title: string
}

const exampleProps: AiUsage3Props = {
  models: [
    {
      errorRate: 0.004,
      label: 'Reasoning',
      outputSpeed: 58,
      requests: 41_200,
      ttftP50: 1_240,
      ttftP95: 3_880,
    },
    {
      errorRate: 0.0012,
      label: 'Fast',
      outputSpeed: 164,
      requests: 318_000,
      ttftP50: 310,
      ttftP95: 790,
    },
    {
      errorRate: 0.021,
      label: 'Vision',
      outputSpeed: 91,
      requests: 12_600,
      ttftP50: 880,
      ttftP95: 2_940,
    },
  ],
  title: 'Model performance, last 24 hours',
}

const ms = (value: number) =>
  value >= 1_000
    ? `${formatNumber(value / 1_000, { maximumFractionDigits: 2, minimumFractionDigits: 2 })} s`
    : `${formatNumber(value, { maximumFractionDigits: 0 })} ms`

const percent = (value: number, digits = 0) =>
  formatPercent(value, { maximumFractionDigits: digits, minimumFractionDigits: digits })

const describe = (models: ModelPerformance[], errorThreshold: number) => {
  const requests = models.reduce((sum, model) => sum + model.requests, 0)
  const busiest = models.reduce<ModelPerformance | undefined>(
    (top, model) => (top && top.requests >= model.requests ? top : model),
    undefined,
  )
  if (!busiest || requests === 0) return 'No requests in this period.'
  const flagged = models.filter((model) => model.errorRate > errorThreshold)
  const errors =
    flagged.length === 0
      ? `Every model is under the ${percent(errorThreshold)} error threshold.`
      : flagged.length === 1
        ? `${flagged[0].label} errors on ${percent(flagged[0].errorRate, 1)} of requests, over the ${percent(errorThreshold)} threshold.`
        : `${flagged.length} models are over the ${percent(errorThreshold)} error threshold.`
  return `${busiest.label} served ${percent(busiest.requests / requests)} of ${formatNumber(requests)} requests. ${errors}`
}

function LatencyRange({ max, p50, p95 }: { max: number; p50: number; p95: number }) {
  const at = (value: number) => `${(Math.min(value, max) / (max || 1)) * 100}%`
  return (
    <span
      aria-hidden
      className='bg-muted relative block h-1.5 w-20 shrink-0 rounded-full'
    >
      <span
        className='absolute inset-y-0 rounded-full bg-chart-2/35'
        style={{ left: at(p50), right: `calc(100% - ${at(p95)})` }}
      />
      <span
        className='ring-background absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-chart-2 ring-2'
        style={{ left: at(p50) }}
      />
    </span>
  )
}

const AiUsage3 = (props: AiUsage3Props) => {
  const { errorThreshold = 0.01, models = [], errorMessage, status, title } = props
  const { description = describe(models, errorThreshold) } = props
  const state = getBlockState(status, models)
  const slowest = Math.max(0, ...models.map((model) => model.ttftP95))

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-3'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        <DataTable caption={title} className='min-w-[34rem] border-t tabular-nums'>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Model</DataTableHead>
              <DataTableHead align='end'>Requests</DataTableHead>
              <DataTableHead align='end'>
                <abbr
                  title='Time to first token, median and 95th percentile'
                  className='no-underline'
                >
                  TTFT, median to p95
                </abbr>
              </DataTableHead>
              <DataTableHead align='end'>Tokens/s</DataTableHead>
              <DataTableHead align='end'>Errors</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
          <DataTableBody>
            <DataTableStateRows colSpan={5} rows={3} />
            {!state &&
              models.map((model, index) => {
                const flagged = model.errorRate > errorThreshold
                return (
                  <DataTableRow key={model.label}>
                    <DataTableRowHead primary>
                      <span className='flex items-center gap-2'>
                        <span
                          aria-hidden
                          className='size-2.5 rounded-[3px]'
                          style={{
                            backgroundColor: modelPalette[index % modelPalette.length],
                          }}
                        />
                        {model.href ? (
                          <DataTableRowLink href={model.href}>
                            {model.label}
                          </DataTableRowLink>
                        ) : (
                          model.label
                        )}
                      </span>
                    </DataTableRowHead>
                    <DataTableCell align='end' className='text-muted-foreground'>
                      {formatNumber(model.requests)}
                    </DataTableCell>
                    <DataTableCell align='end'>
                      <span className='flex items-center justify-end gap-2.5'>
                        <span>{ms(model.ttftP50)}</span>
                        <LatencyRange
                          max={slowest}
                          p50={model.ttftP50}
                          p95={model.ttftP95}
                        />
                        <span className='text-muted-foreground w-14 text-end'>
                          {ms(model.ttftP95)}
                        </span>
                      </span>
                    </DataTableCell>
                    <DataTableCell align='end'>
                      {formatNumber(model.outputSpeed, { maximumFractionDigits: 0 })}
                    </DataTableCell>
                    <DataTableCell
                      align='end'
                      className={cn(
                        flagged && 'font-medium text-red-700 dark:text-red-400',
                      )}
                    >
                      {percent(model.errorRate, 2)}
                      {flagged && (
                        <span className='sr-only'>
                          , above the {percent(errorThreshold)} threshold
                        </span>
                      )}
                    </DataTableCell>
                  </DataTableRow>
                )
              })}
          </DataTableBody>
        </DataTable>
        <BlockReady className='text-xs'>
          <p className='text-muted-foreground text-xs'>
            TTFT is time to first token. The dot is the median and the bar runs to the
            95th percentile. Error rates over {percent(errorThreshold)} are red.
          </p>
        </BlockReady>
      </section>
    </BlockStateProvider>
  )
}

export {
  AiUsage3,
  exampleProps as aiUsage3ExampleProps,
  type AiUsage3Props,
  type ModelPerformance,
}
