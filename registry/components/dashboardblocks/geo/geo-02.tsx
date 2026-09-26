'use client'

import { CountryFlag, ShareBar } from '@/registry/components/dashboardblocks/geo'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface CountryRow {
  /** ISO 3166-1 alpha-2 code, e.g. "GB", for the flag. */
  code: string
  name: string
  value: number
}

interface Geo2Props {
  countries: CountryRow[]
  description: string
  formatter?: (value: number) => string
  /** How many countries to list. The rest are summed into "Other countries". @default 8 */
  limit?: number
  title: string
  /** Total across all countries. Defaults to the sum of `countries`. */
  total?: number
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
  description: 'Sessions, last 30 days',
  title: 'Top countries',
}

const Geo2 = (props: Geo2Props) => {
  const {
    countries,
    description,
    formatter = (value: number) => value.toLocaleString('en-US'),
    limit = 8,
    title,
  } = props
  const sorted = [...countries].sort((a, b) => b.value - a.value)
  const total = props.total ?? countries.reduce((sum, country) => sum + country.value, 0)
  const shown = sorted.slice(0, limit)
  const other = total - shown.reduce((sum, country) => sum + country.value, 0)
  // Bars are scaled to the top row so the differences stay visible; the share is the text.
  const largest = Math.max(shown[0]?.value ?? 0, other)
  const share = (value: number) =>
    total > 0 ? `${((value / total) * 100).toFixed(1)}%` : '0%'

  const rows = [
    ...shown.map((country) => ({ ...country, key: country.code })),
    ...(other > 0
      ? [
          {
            code: undefined,
            key: 'other',
            name: 'Other countries',
            value: other,
          },
        ]
      : []),
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        <div className='text-muted-foreground flex justify-between gap-4 text-xs'>
          <span>Country</span>
          <span>{formatter(total)} total</span>
        </div>
        <ol className='flex flex-col gap-3'>
          {rows.map((row) => (
            <li key={row.key} className='flex items-start gap-3'>
              <CountryFlag code={row.code} className='h-5' />
              <div className='flex min-w-0 flex-1 flex-col gap-1.5'>
                <div className='flex items-baseline justify-between gap-3 text-sm'>
                  <span className='min-w-0 truncate'>{row.name}</span>
                  <span className='shrink-0 tabular-nums'>
                    <span className='font-medium'>{formatter(row.value)}</span>
                    <span className='sr-only'>, </span>
                    <span className='text-muted-foreground inline-block w-14 text-right text-xs'>
                      {share(row.value)}
                      <span className='sr-only'> of total</span>
                    </span>
                  </span>
                </div>
                <ShareBar
                  color={row.code ? 'var(--chart-1)' : 'var(--muted-foreground)'}
                  value={largest > 0 ? row.value / largest : 0}
                />
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

export { Geo2, exampleProps as geo2ExampleProps, type Geo2Props }
