'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
} from '@/registry/components/dashboardblocks/block-state'
import {
  HeatmapGrid,
  HeatmapLegend,
  getColumnTotals,
  getPeak,
} from '@/registry/components/dashboardblocks/heatmap'
import {
  Stat,
  StatGroup,
  StatLabel,
  StatValue,
} from '@/registry/components/dashboardblocks/stat-group'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'

interface Heatmap1Props {
  /** Defaults to a sentence about the busiest time. */
  description?: string
  status?: BlockStatus
  title: string
  unit: string
  /** Seven rows, Monday first, of 24 hourly values. Leave out to show the empty state. */
  values?: number[][]
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]
const HOURS = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0'))

const exampleProps: Heatmap1Props = {
  title: 'When people visit',
  unit: 'sessions',
  values: DAYS.map((_, day) =>
    HOURS.map((_, hour) => {
      const weekend = day >= 5
      const workday = Math.exp(-((hour - 14) ** 2) / 18) * (weekend ? 0.45 : 1)
      const evening = Math.exp(-((hour - 21) ** 2) / 6) * (weekend ? 0.8 : 0.5)
      const night = hour < 6 ? 0.04 : 0
      return Math.round(40 + 1_240 * (workday + evening + night) * (1 - day * 0.03))
    }),
  ),
}

const hourRange = (hour: number) =>
  `${HOURS[hour]}:00–${String((hour + 1) % 24).padStart(2, '0')}:00`

const Heatmap1 = (props: Heatmap1Props) => {
  const { status, title, unit, values = [] } = props
  const peak = getPeak(values)
  const byHour = getColumnTotals(values)
  const peakHour = byHour.reduce(
    (top, value, hour) => (value > byHour[top] ? hour : top),
    0,
  )
  const week = byHour.reduce((sum, value) => sum + value, 0)
  const weekend = values
    .slice(5)
    .flat()
    .reduce((sum, value) => sum + value, 0)
  const unitName = unit.charAt(0).toUpperCase() + unit.slice(1)
  const {
    description = peak
      ? `${DAY_NAMES[peak.row]} at ${HOURS[peak.column]}:00 is the busiest hour of an average week, with ${formatNumber(peak.value)} ${unit}.`
      : undefined,
  } = props

  return (
    <BlockStateProvider status={status} empty={!peak}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            {description && (
              <p className='text-muted-foreground text-sm'>{description}</p>
            )}
          </BlockReady>
        </header>
        <StatGroup className='grid-cols-2 @xl:grid-cols-3'>
          <Stat className='col-span-2 @xl:col-span-1'>
            <StatLabel>{unitName} in an average week</StatLabel>
            <StatValue>{formatNumber(week)}</StatValue>
          </Stat>
          <Stat className='justify-end'>
            <StatLabel>Busiest hour of the day</StatLabel>
            <StatValue className='text-2xl'>{HOURS[peakHour]}:00</StatValue>
          </Stat>
          <Stat className='justify-end'>
            <StatLabel>On weekends</StatLabel>
            <StatValue className='text-2xl'>
              {formatPercent(week > 0 ? weekend / week : 0, { maximumFractionDigits: 0 })}
            </StatValue>
          </Stat>
        </StatGroup>
        <HeatmapGrid
          cellClassName='h-5'
          cellName={({ column, row }) => `${DAYS[row]}, ${hourRange(column)}`}
          columnLabelEvery={3}
          columnSummary={{
            highlightIndex: peakHour,
            label: `${unitName} by hour of the day, all week: most at ${HOURS[peakHour]}:00, with ${formatNumber(byHour[peakHour])}`,
            labels: HOURS.map((_, hour) => `${hourRange(hour)}, all week`),
            values: byHour,
          }}
          columns={HOURS}
          describe={({ column, row }, value) =>
            `${DAY_NAMES[row]}, ${hourRange(column)}: ${value === null ? 'no data' : formatNumber(value)} ${unit}`
          }
          footer={<HeatmapLegend />}
          label={`${title}: average ${unit} by weekday and hour`}
          rowHeader='Day'
          rowNames={DAY_NAMES}
          rows={DAYS}
          valueName={unitName}
          values={values}
        />
      </section>
    </BlockStateProvider>
  )
}

export { Heatmap1, exampleProps as heatmap1ExampleProps, type Heatmap1Props }
