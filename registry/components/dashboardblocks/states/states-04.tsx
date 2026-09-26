'use client'

import {
  BlockMessage,
  Skeleton,
  useBlockData,
} from '@/registry/components/dashboardblocks/block-state'
import {
  ChartPanelFigure,
  ChartPanelTable,
  ChartPanelTooltip,
  chartAxisProps,
  chartGridProps,
} from '@/registry/components/dashboardblocks/chart-panel'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface WeeklyPoint {
  label: string
  value: number
}

interface States4Props {
  description: string
  /** Fetches the series. A rejected promise shows the error state with a retry button. */
  load: () => Promise<WeeklyPoint[]>
  title: string
}

let exampleAttempts = 0

const exampleProps: States4Props = {
  description: 'New accounts per week, last 8 weeks',
  // Fails the first time so the error state shows, then succeeds on retry.
  load: () => {
    const attempt = exampleAttempts++
    return new Promise((resolve, reject) =>
      setTimeout(() => {
        if (attempt % 2 === 0) {
          reject(new Error('The analytics service timed out.'))
          return
        }
        resolve(
          [
            'Aug 3',
            'Aug 10',
            'Aug 17',
            'Aug 24',
            'Aug 31',
            'Sep 7',
            'Sep 14',
            'Sep 21',
          ].map((label, week) => ({
            label,
            value: Math.round(1_150 + week * 48 + Math.sin(week) * 90),
          })),
        )
      }, 1_000),
    )
  },
  title: 'Signups',
}

const States4 = (props: States4Props) => {
  const { description, load, title } = props
  const { data, error, reload, status } = useBlockData(load, { keepData: false })
  const loading = status === 'loading' || status === 'idle'

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <span role='status' className='sr-only'>
          {loading ? `Loading ${title.toLowerCase()}…` : ''}
          {status === 'error' ? `Couldn't load ${title.toLowerCase()}` : ''}
        </span>
        {loading ? (
          <div aria-busy className='flex h-60 items-end gap-3 pb-6 pl-10'>
            {[55, 62, 58, 70, 66, 74, 80, 77].map((height, index) => (
              <Skeleton key={index} className='flex-1' style={{ height: `${height}%` }} />
            ))}
          </div>
        ) : status === 'error' || !data ? (
          <BlockMessage
            className='h-60 py-0'
            icon={
              <IconPlaceholder
                lucide='TriangleAlertIcon'
                tabler='IconAlertTriangle'
                hugeicons='Alert02Icon'
                phosphor='WarningIcon'
                remixicon='RiErrorWarningLine'
              />
            }
            tone='error'
            title={`Couldn't load ${title.toLowerCase()}`}
            description={
              error instanceof Error
                ? error.message
                : 'Something went wrong. Try again in a moment.'
            }
            action={
              <Button variant='outline' size='sm' onClick={() => void reload()}>
                Try again
              </Button>
            }
          />
        ) : (
          <>
            <ChartPanelFigure className='h-60'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid {...chartGridProps} />
                  <XAxis {...chartAxisProps} dataKey='label' />
                  <YAxis {...chartAxisProps} width={40} />
                  <Tooltip
                    content={(tooltipProps) => <ChartPanelTooltip {...tooltipProps} />}
                    cursor={{ fill: 'var(--color-muted)', opacity: 0.5 }}
                  />
                  <Bar
                    dataKey='value'
                    fill='var(--chart-1)'
                    name={title}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartPanelFigure>
            <ChartPanelTable
              caption={`${title}: ${description}`}
              columns={[
                { key: 'label', label: 'Week of' },
                { key: 'value', label: title },
              ]}
              rows={data}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}

export { States4, exampleProps as states4ExampleProps, type States4Props }
