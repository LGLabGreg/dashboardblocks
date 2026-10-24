'use client'

import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  DotMap,
  DotMapLegend,
  type DotMapMarker,
} from '@/registry/components/dashboardblocks/geo'
import { KPIValue } from '@/registry/components/dashboardblocks/kpi'
import { formatNumber, formatPercent } from '@/registry/lib/dashboardblocks/format'

interface Geo3Props {
  /** Defaults to a sentence about the most active city. */
  description?: string
  /** Leave out, or pass none, to show the empty state. */
  locations?: DotMapMarker[]
  status?: BlockStatus
  title: string
  unit: string
}

const exampleProps: Geo3Props = {
  locations: [
    {
      country: 'US',
      id: 'sfo',
      lat: 37.77,
      lon: -122.42,
      name: 'San Francisco',
      value: 2_840,
    },
    {
      country: 'US',
      id: 'nyc',
      lat: 40.71,
      lon: -74.01,
      name: 'New York',
      value: 3_460,
    },
    {
      country: 'CA',
      id: 'yyz',
      lat: 43.65,
      lon: -79.38,
      name: 'Toronto',
      value: 1_120,
    },
    {
      country: 'MX',
      id: 'mex',
      lat: 19.43,
      lon: -99.13,
      name: 'Mexico City',
      value: 690,
    },
    {
      country: 'BR',
      id: 'gru',
      lat: -23.55,
      lon: -46.63,
      name: 'São Paulo',
      value: 1_310,
    },
    {
      country: 'GB',
      id: 'lon',
      lat: 51.51,
      lon: -0.13,
      name: 'London',
      value: 2_970,
    },
    {
      country: 'DE',
      id: 'ber',
      lat: 52.52,
      lon: 13.4,
      name: 'Berlin',
      value: 1_580,
    },
    {
      country: 'NG',
      id: 'los',
      lat: 6.52,
      lon: 3.38,
      name: 'Lagos',
      value: 540,
    },
    {
      country: 'IN',
      id: 'blr',
      lat: 12.97,
      lon: 77.59,
      name: 'Bengaluru',
      value: 2_120,
    },
    {
      country: 'SG',
      id: 'sin',
      lat: 1.35,
      lon: 103.82,
      name: 'Singapore',
      value: 1_240,
    },
    {
      country: 'JP',
      id: 'tyo',
      lat: 35.68,
      lon: 139.69,
      name: 'Tokyo',
      value: 1_760,
    },
    {
      country: 'AU',
      id: 'syd',
      lat: -33.87,
      lon: 151.21,
      name: 'Sydney',
      value: 980,
    },
  ],
  title: 'Active users',
  unit: 'active users',
}

const Geo3 = (props: Geo3Props) => {
  const { locations = [], status, title, unit } = props
  const state = getBlockState(status, locations)
  const unitName = unit.charAt(0).toUpperCase() + unit.slice(1)
  const total = locations.reduce((sum, location) => sum + location.value, 0)
  const max = Math.max(0, ...locations.map((location) => location.value))
  const top = locations.reduce<DotMapMarker | null>(
    (best, location) => (best === null || location.value > best.value ? location : best),
    null,
  )
  const share = (value: number) =>
    formatPercent(total > 0 ? value / total : 0, { maximumFractionDigits: 0 })
  const {
    description = top
      ? `${top.name} has the most ${unit} right now, ${share(top.value)} of them.`
      : undefined,
  } = props

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
        <div className='flex flex-col gap-1 border-t pt-4'>
          <span className='text-muted-foreground text-sm'>
            {state ? unitName : `${unitName} in ${formatNumber(locations.length)} cities`}
          </span>
          <KPIValue value={total} format={(value) => formatNumber(value)} />
        </div>
        <DotMap
          describe={(location) =>
            `${location.name}: ${formatNumber(location.value)} ${unit}, ${share(location.value)}`
          }
          footer={<DotMapLegend max={max} />}
          label={`${title}, by city`}
          labelLargest
          markers={locations}
          max={max}
          nameHeader='City'
          showShare
          valueHeader={unitName}
        />
      </section>
    </BlockStateProvider>
  )
}

export { Geo3, exampleProps as geo3ExampleProps, type Geo3Props }
