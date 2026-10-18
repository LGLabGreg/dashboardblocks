'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { TileMap, US_STATE_TILES } from '@/registry/components/dashboardblocks/geo'
import { HeatmapLegend } from '@/registry/components/dashboardblocks/heatmap'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import {
  Leaderboard,
  LeaderboardBar,
  LeaderboardItem,
  LeaderboardLabel,
  LeaderboardValue,
} from '@/registry/components/dashboardblocks/leaderboard'
import { formatCurrency, formatPercent } from '@/registry/lib/dashboardblocks/format'

interface Geo1Props {
  /** Defaults to a sentence about the leading states' share. */
  description?: string
  formatter?: (value: number) => string
  status?: BlockStatus
  title: string
  valueLabel: string
  /** By two-letter state code, including DC. Leave out, or pass none, to show the empty state. */
  values?: Record<string, number>
}

const currency = (value: number) =>
  formatCurrency(value, { compact: true, maximumFractionDigits: 2 })

const exampleProps: Geo1Props = {
  formatter: currency,
  title: 'Revenue by state',
  valueLabel: 'Revenue',
  values: {
    AK: 21_400,
    AL: 98_600,
    AR: 57_300,
    AZ: 226_900,
    CA: 1_842_300,
    CO: 281_700,
    CT: 139_500,
    DC: 81_200,
    DE: 33_900,
    FL: 742_600,
    GA: 325_800,
    HI: 55_700,
    IA: 76_100,
    ID: 58_900,
    IL: 458_200,
    IN: 165_400,
    KS: 74_300,
    KY: 97_400,
    LA: 94_100,
    MA: 431_600,
    MD: 224_800,
    ME: 39_800,
    MI: 268_900,
    MN: 212_500,
    MO: 159_300,
    MS: 48_200,
    MT: 30_600,
    NC: 314_700,
    ND: 18_900,
    NE: 51_700,
    NH: 61_900,
    NJ: 369_400,
    NM: 52_600,
    NV: 111_800,
    NY: 1_084_500,
    OH: 297_300,
    OK: 88_400,
    OR: 189_600,
    PA: 392_100,
    RI: 36_700,
    SC: 124_200,
    SD: 21_600,
    TN: 193_800,
    TX: 1_016_200,
    UT: 148_300,
    VA: 327_400,
    VT: 24_800,
    WA: 512_900,
    WI: 158_700,
    WV: 26_300,
    WY: 15_200,
  },
}

const Geo1 = (props: Geo1Props) => {
  const { formatter = currency, status, title, valueLabel, values = {} } = props
  const total = Object.values(values).reduce((sum, value) => sum + value, 0)
  const ranked = US_STATE_TILES.filter((tile) => values[tile.id] !== undefined).sort(
    (a, b) => values[b.id] - values[a.id],
  )
  const top = ranked.slice(0, 5)
  const topShare = top.reduce((sum, tile) => sum + values[tile.id], 0)
  const share = (value: number) =>
    formatPercent(total > 0 ? value / total : 0, { maximumFractionDigits: 0 })
  const rankedValues = ranked.map((tile) => values[tile.id])
  const max = rankedValues[0] ?? 1
  const {
    description = top.length > 0
      ? `${top
          .slice(0, 3)
          .map((tile) => tile.name)
          .join(', ')} bring in ${share(
          top.slice(0, 3).reduce((sum, tile) => sum + values[tile.id], 0),
        )} of ${valueLabel.toLowerCase()}.`
      : undefined,
  } = props
  const state = getBlockState(status, ranked)

  return (
    <BlockStateProvider state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex flex-col gap-0.5'>
          <h2 className='font-semibold tracking-tight'>{title}</h2>
          <BlockReady className='text-sm'>
            {description && (
              <p className='text-muted-foreground text-sm'>{description}</p>
            )}
          </BlockReady>
        </header>
        <div className='flex flex-col gap-6 border-t pt-4 @2xl:flex-row @2xl:items-start'>
          <TileMap
            className='w-full max-w-xl @2xl:flex-1'
            describe={(tile, value) =>
              value === null
                ? `${tile.name}: no data`
                : `${tile.name}: ${formatter(value)}, ${share(value)} of total`
            }
            footer={
              rankedValues.length > 0 && (
                <HeatmapLegend
                  high={formatter(Math.max(...rankedValues))}
                  low={formatter(Math.min(...rankedValues))}
                />
              )
            }
            format={formatter}
            label={title}
            nameHeader='State'
            scale='sqrt'
            showShare
            tiles={US_STATE_TILES}
            valueHeader={valueLabel}
            values={values}
          />
          <div className='flex flex-col gap-4 @2xl:w-60'>
            <div className='flex flex-col gap-1'>
              <span className='text-muted-foreground text-sm'>
                Total {valueLabel.toLowerCase()}
              </span>
              <KPIValue value={total} format={formatter} />
            </div>
            {state === 'loading' && <BlockStateRows rows={5} />}
            {!state && (
              <div className='flex flex-col gap-1.5'>
                <p className='text-muted-foreground text-xs'>
                  Top {top.length}, {share(topShare)} of the total
                </p>
                <Leaderboard>
                  {top.map((tile, index) => (
                    <LeaderboardItem key={tile.id}>
                      <LeaderboardBar
                        delay={index * 100}
                        value={(values[tile.id] / max) * 100}
                      />
                      <span
                        aria-hidden
                        className='text-muted-foreground w-6 shrink-0 font-mono text-xs'
                      >
                        {tile.code}
                      </span>
                      <LeaderboardLabel className='truncate'>
                        {tile.name}
                      </LeaderboardLabel>
                      <LeaderboardValue>{formatter(values[tile.id])}</LeaderboardValue>
                    </LeaderboardItem>
                  ))}
                </Leaderboard>
              </div>
            )}
          </div>
        </div>
      </section>
    </BlockStateProvider>
  )
}

export { Geo1, exampleProps as geo1ExampleProps, type Geo1Props }
