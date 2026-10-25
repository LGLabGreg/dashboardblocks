'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  HeatmapGrid,
  HeatmapLegend,
  type HeatmapValue,
} from '@/registry/components/dashboardblocks/heatmap'
import {
  Stat,
  StatGroup,
  StatLabel,
  StatValue,
} from '@/registry/components/dashboardblocks/stat-group'
import { formatDate, formatNumber } from '@/registry/lib/dashboardblocks/format'

interface Heatmap3Props extends BlockStateProps {
  /** One value per day, oldest first, ending on `endDate`. Leave out, or pass none, to show the empty state. */
  daily?: number[]
  /** Defaults to a sentence about how many days had any. */
  description?: string
  endDate: Date
  title: string
  unit: string
}

const DAY = 86_400_000
const WEEKS = 52
const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]
const ROW_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', '']

const exampleProps: Heatmap3Props = {
  daily: Array.from({ length: 360 }, (_, day) => {
    const weekday = (day + 3) % 7
    const weekend = weekday >= 5
    const busy = Math.sin(day / 9) * 2.4 + Math.sin(day / 3.1) * 1.6 + day / 90
    const value = weekend ? Math.max(0, busy - 3) : 3 + busy
    return (day * 37) % 23 === 0 ? 0 : Math.max(0, Math.round(value))
  }),
  endDate: new Date(Date.UTC(2026, 8, 25)),
  title: 'Deploys',
  unit: 'deploys',
}

function getLongestRun(daily: number[]) {
  let longest = 0
  let current = 0
  for (const value of daily) {
    current = value > 0 ? current + 1 : 0
    longest = Math.max(longest, current)
  }
  return longest
}

const Heatmap3 = (props: Heatmap3Props) => {
  const { daily = [], endDate, errorMessage, status, title, unit } = props
  const endWeekday = (endDate.getUTCDay() + 6) % 7
  const start = endDate.getTime() - ((WEEKS - 1) * 7 + endWeekday) * DAY
  const dateAt = (row: number, column: number) =>
    new Date(start + (column * 7 + row) * DAY)
  const firstDay = endDate.getTime() - (daily.length - 1) * DAY

  const values: HeatmapValue[][] = DAY_NAMES.map((_, row) =>
    Array.from({ length: WEEKS }, (_, column) => {
      const time = dateAt(row, column).getTime()
      if (time > endDate.getTime() || time < firstDay) return null
      return daily[Math.round((time - firstDay) / DAY)] ?? null
    }),
  )
  const startsMonth = (column: number) =>
    column === 0 ||
    dateAt(0, column).getUTCMonth() !== dateAt(0, column - 1).getUTCMonth()
  const columns = Array.from({ length: WEEKS }, (_, column) => {
    if (!startsMonth(column)) return ''
    if (column === 0 && [1, 2].some(startsMonth)) return ''
    return formatDate(dateAt(0, column), 'month')
  })
  const total = daily.reduce((sum, value) => sum + value, 0)
  const activeDays = daily.filter((value) => value > 0).length
  const busiest = daily.reduce((top, value, day) => (value > daily[top] ? day : top), 0)
  const busiestDate = new Date(firstDay + busiest * DAY)
  const unitName = unit.charAt(0).toUpperCase() + unit.slice(1)
  const {
    description = `${unitName} on ${formatNumber(activeDays)} of the last ${formatNumber(daily.length)} days.`,
  } = props

  return (
    <BlockStateProvider errorMessage={errorMessage} state={getBlockState(status, daily)}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm'>{description}</p>
          </BlockReady>
        </header>
        <StatGroup className='grid-cols-2 @xl:grid-cols-3'>
          <Stat className='col-span-2 @xl:col-span-1'>
            <StatLabel>Total {unit}</StatLabel>
            <StatValue>{formatNumber(total)}</StatValue>
          </Stat>
          <Stat className='justify-end'>
            <StatLabel>Busiest day</StatLabel>
            <StatValue className='text-2xl'>
              {formatNumber(daily[busiest] ?? 0)}
              <span className='text-muted-foreground ml-1 text-sm font-normal tracking-normal'>
                on {formatDate(busiestDate, 'day')}
              </span>
            </StatValue>
          </Stat>
          <Stat className='justify-end'>
            <StatLabel>Longest run</StatLabel>
            <StatValue className='text-2xl'>
              {formatNumber(getLongestRun(daily))}
              <span className='text-muted-foreground ml-1 text-sm font-normal tracking-normal'>
                days in a row
              </span>
            </StatValue>
          </Stat>
        </StatGroup>
        <HeatmapGrid
          minWidth='40rem'
          cellClassName='aspect-square min-h-0'
          cellName={({ column, row }) =>
            `${DAY_NAMES[row]}, ${formatDate(dateAt(row, column), 'date')}`
          }
          columns={columns}
          describe={({ column, row }, value) =>
            `${DAY_NAMES[row]}, ${formatDate(dateAt(row, column), 'date')}: ${value === null ? 'no data' : `${formatNumber(value)} ${unit}`}`
          }
          footer={<HeatmapLegend />}
          label={`${title}: ${unit} per day over the last ${WEEKS} weeks`}
          rowHeader='Day'
          rowLabelClassName='h-0 min-h-full leading-none'
          rowNames={DAY_NAMES}
          rows={ROW_LABELS}
          valueName={unitName}
          values={values}
        />
      </section>
    </BlockStateProvider>
  )
}

export { Heatmap3, exampleProps as heatmap3ExampleProps, type Heatmap3Props }
