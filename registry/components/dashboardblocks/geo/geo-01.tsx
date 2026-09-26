'use client'

import { TileMap, US_STATE_TILES } from '@/registry/components/dashboardblocks/geo'
import { HeatmapLegend } from '@/registry/components/dashboardblocks/heatmap'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Geo1Props {
  description: string
  formatter?: (value: number) => string
  title: string
  /** Heads the value column of the data table, e.g. "Revenue". */
  valueLabel: string
  /** By two-letter state code, including DC. */
  values: Record<string, number>
}

const currency = (value: number) =>
  value >= 1_000_000
    ? `$${(value / 1_000_000).toFixed(2)}M`
    : `$${Math.round(value / 1_000).toLocaleString('en-US')}K`

const exampleProps: Geo1Props = {
  description: 'Last 30 days',
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
  const { description, formatter = currency, title, valueLabel, values } = props
  const total = Object.values(values).reduce((sum, value) => sum + value, 0)
  const ranked = US_STATE_TILES.filter((tile) => values[tile.id] !== undefined).sort(
    (a, b) => values[b.id] - values[a.id],
  )
  const top = ranked[0]
  const share = (value: number) =>
    total > 0 ? `${((value / total) * 100).toFixed(1)}%` : '0%'
  const rankedValues = ranked.map((tile) => values[tile.id])

  return (
    <Card className='@container'>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-6 @2xl:flex-row @2xl:items-start'>
        <TileMap
          className='w-full max-w-xl @2xl:flex-1'
          describe={(tile, value) =>
            value === null
              ? `${tile.name}: no data`
              : `${tile.name}: ${formatter(value)} · ${share(value)} of total`
          }
          footer={
            <HeatmapLegend
              high={formatter(Math.max(...rankedValues))}
              low={formatter(Math.min(...rankedValues))}
            />
          }
          format={formatter}
          label={`${title}, ${description.toLowerCase()}`}
          nameHeader='State'
          // Revenue follows population, so a square-root scale keeps the smaller states apart.
          scale='sqrt'
          tiles={US_STATE_TILES}
          valueHeader={valueLabel}
          values={values}
        >
          {top &&
            `Top: ${top.name}, ${formatter(values[top.id])} · ${share(values[top.id])} of total`}
        </TileMap>
        <div className='flex flex-col gap-3 @2xl:w-56 @2xl:border-l @2xl:pl-6'>
          <div className='flex flex-col'>
            <span className='text-muted-foreground text-xs'>Total</span>
            <span className='text-2xl font-semibold tracking-tight tabular-nums'>
              {formatter(total)}
            </span>
          </div>
          <ol aria-label='Top 5 states' className='flex flex-col text-sm'>
            {ranked.slice(0, 5).map((tile) => (
              <li
                key={tile.id}
                className='flex items-center gap-2 border-b py-2 last:border-b-0'
              >
                <span
                  aria-hidden
                  className='bg-muted text-muted-foreground w-7 shrink-0 rounded-[3px] py-0.5 text-center text-[10px] font-medium'
                >
                  {tile.code}
                </span>
                <span className='min-w-0 flex-1 truncate'>{tile.name}</span>
                <span className='font-medium tabular-nums'>
                  {formatter(values[tile.id])}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}

export { Geo1, exampleProps as geo1ExampleProps, type Geo1Props }
