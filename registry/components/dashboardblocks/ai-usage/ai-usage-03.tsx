'use client'

import { modelPalette } from '@/registry/components/dashboardblocks/ai-usage'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface ModelPerformance {
  /** Share of requests that errored, 0–1. */
  errorRate: number
  label: string
  /** Output tokens per second while streaming. */
  outputSpeed: number
  requests: number
  /** Time to first token, median, in ms. */
  ttftP50: number
  /** Time to first token, 95th percentile, in ms. */
  ttftP95: number
}

interface AiUsage3Props {
  description: string
  /** Error rate above which a model is flagged, 0–1. @default 0.01 */
  errorThreshold?: number
  models: ModelPerformance[]
  title: string
}

const exampleProps: AiUsage3Props = {
  description: 'Last 24 hours, all regions',
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
  title: 'Model performance',
}

const ms = (value: number) =>
  value >= 1_000 ? `${(value / 1_000).toFixed(2)} s` : `${Math.round(value)} ms`

const AiUsage3 = (props: AiUsage3Props) => {
  const { description, errorThreshold = 0.01, models, title } = props

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='-mx-1 overflow-x-auto px-1'>
          <table className='w-full min-w-[30rem] text-sm tabular-nums'>
            <thead>
              <tr className='text-muted-foreground border-b text-xs'>
                <th scope='col' className='pb-2 text-left font-normal'>
                  Model
                </th>
                <th scope='col' className='pb-2 text-right font-normal'>
                  Requests
                </th>
                <th scope='col' className='pb-2 text-right font-normal'>
                  <abbr title='Time to first token, median' className='no-underline'>
                    TTFT p50
                  </abbr>
                </th>
                <th scope='col' className='pb-2 text-right font-normal'>
                  <abbr
                    title='Time to first token, 95th percentile'
                    className='no-underline'
                  >
                    TTFT p95
                  </abbr>
                </th>
                <th scope='col' className='pb-2 text-right font-normal'>
                  Tokens/s
                </th>
                <th scope='col' className='pb-2 text-right font-normal'>
                  Errors
                </th>
              </tr>
            </thead>
            <tbody>
              {models.map((model, index) => {
                const flagged = model.errorRate > errorThreshold
                return (
                  <tr key={model.label} className='border-b last:border-b-0'>
                    <th scope='row' className='py-2.5 text-left font-medium'>
                      <span className='flex items-center gap-2'>
                        <span
                          aria-hidden
                          className='size-2.5 rounded-[3px]'
                          style={{
                            backgroundColor: modelPalette[index % modelPalette.length],
                          }}
                        />
                        {model.label}
                      </span>
                    </th>
                    <td className='text-muted-foreground py-2.5 text-right'>
                      {model.requests.toLocaleString()}
                    </td>
                    <td className='py-2.5 text-right'>{ms(model.ttftP50)}</td>
                    <td className='py-2.5 text-right'>{ms(model.ttftP95)}</td>
                    <td className='py-2.5 text-right'>{Math.round(model.outputSpeed)}</td>
                    <td
                      className={cn(
                        'py-2.5 text-right',
                        flagged && 'font-medium text-red-700 dark:text-red-400',
                      )}
                    >
                      {(model.errorRate * 100).toFixed(2)}%
                      {flagged && (
                        <span className='sr-only'>
                          , above the {errorThreshold * 100}% threshold
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className='text-muted-foreground mt-3 text-xs'>
          TTFT is time to first token. Error rates over {errorThreshold * 100}% are red.
        </p>
      </CardContent>
    </Card>
  )
}

export {
  AiUsage3,
  exampleProps as aiUsage3ExampleProps,
  type AiUsage3Props,
  type ModelPerformance,
}
