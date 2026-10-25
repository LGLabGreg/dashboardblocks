'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { CountryFlag } from '@/registry/components/dashboardblocks/geo'
import {
  Leaderboard,
  LeaderboardBar,
  LeaderboardItem,
  LeaderboardLabel,
  LeaderboardValue,
} from '@/registry/components/dashboardblocks/leaderboard'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'

import { cn } from '@/lib/utils'

interface CountryRow {
  /** ISO 3166-1 alpha-2 code, such as `GB`. */
  code: string
  name: string
  value: number
}

interface Geo2Props extends BlockStateProps {
  /** Leave out, or pass none, to show the empty state. */
  countries?: CountryRow[]
  /** Defaults to a sentence about the leading country's share. */
  description?: string
  formatter?: (value: number) => string
  /** How many countries get a row of their own. @default 8 */
  limit?: number
  /** Names the row that sums the rest; `null` leaves it out. @default 'Other countries' */
  otherLabel?: string | null
  title: string
  total?: number
  /** @default 'sessions' */
  unit?: string
}

const exampleProps: Geo2Props = {
  countries: [
    { code: 'US', name: 'United States', value: 48_210 },
    { code: 'GB', name: 'United Kingdom', value: 14_380 },
    { code: 'DE', name: 'Germany', value: 11_920 },
    { code: 'IN', name: 'India', value: 10_470 },
    { code: 'CA', name: 'Canada', value: 7_860 },
    { code: 'FR', name: 'France', value: 6_940 },
    { code: 'BR', name: 'Brazil', value: 5_310 },
    { code: 'AU', name: 'Australia', value: 4_820 },
    { code: 'NL', name: 'Netherlands', value: 3_560 },
    { code: 'JP', name: 'Japan', value: 3_110 },
    { code: 'ES', name: 'Spain', value: 2_740 },
    { code: 'SE', name: 'Sweden', value: 1_980 },
    { code: 'MX', name: 'Mexico', value: 1_870 },
    { code: 'SG', name: 'Singapore', value: 1_420 },
  ],
  title: 'Top countries',
}

const Geo2 = (props: Geo2Props) => {
  const {
    countries = [],
    formatter = (value: number) => formatNumber(value),
    limit = 8,
    otherLabel = 'Other countries',
    errorMessage,
    status,
    title,
    unit = 'sessions',
  } = props
  const sorted = [...countries].sort((a, b) => b.value - a.value)
  const total = props.total ?? countries.reduce((sum, country) => sum + country.value, 0)
  const shown = sorted.slice(0, limit)
  const other =
    otherLabel === null
      ? 0
      : total - shown.reduce((sum, country) => sum + country.value, 0)
  const largest = Math.max(shown[0]?.value ?? 0, other)
  const share = (value: number) =>
    formatPercent(total > 0 ? value / total : 0, {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
    })
  const [first] = sorted
  const {
    description = first
      ? `${first.name} sent ${formatPercent(total > 0 ? first.value / total : 0, { maximumFractionDigits: 0 })} of ${formatter(total)} ${unit}.`
      : undefined,
  } = props

  const rows = [
    ...shown.map((country) => ({ ...country, key: country.code })),
    ...(other > 0
      ? [{ code: undefined, key: 'other', name: otherLabel, value: other }]
      : []),
  ]

  return (
    <BlockStateProvider
      errorMessage={errorMessage}
      state={getBlockState(status, countries)}
    >
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            {description && (
              <p className='text-muted-foreground text-sm'>{description}</p>
            )}
          </BlockReady>
        </header>
        <div className='flex flex-col gap-1.5 border-t pt-4'>
          <div className='text-muted-foreground flex justify-between px-2 text-xs'>
            <span>Country</span>
            <span className='capitalize'>{unit}</span>
          </div>
          <BlockStateRows rows={9} />
          {!status && rows.length > 0 && (
            <Leaderboard>
              {rows.map((row, index) => (
                <LeaderboardItem key={row.key}>
                  <LeaderboardBar
                    className={
                      row.code === undefined
                        ? 'bg-muted'
                        : index === 0
                          ? 'bg-[color-mix(in_oklab,var(--color-chart-2)_32%,transparent)]'
                          : undefined
                    }
                    delay={index * 100}
                    value={largest > 0 ? (row.value / largest) * 100 : 0}
                  />
                  <CountryFlag code={row.code} />
                  <LeaderboardLabel
                    className={cn(
                      'truncate',
                      row.code === undefined && 'text-muted-foreground',
                    )}
                  >
                    {row.name}
                  </LeaderboardLabel>
                  <span className='text-muted-foreground shrink-0 text-xs tabular-nums'>
                    {share(row.value)}
                    <span className='sr-only'> of total</span>
                  </span>
                  <LeaderboardValue className='w-14'>
                    {formatter(row.value)}
                  </LeaderboardValue>
                </LeaderboardItem>
              ))}
            </Leaderboard>
          )}
        </div>
      </section>
    </BlockStateProvider>
  )
}

export { Geo2, exampleProps as geo2ExampleProps, type Geo2Props }
