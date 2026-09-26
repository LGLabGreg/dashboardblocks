'use client'

import {
  DotMap,
  DotMapLegend,
  type DotMapMarker,
} from '@/registry/components/dashboardblocks/geo'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Geo3Props {
  description: string
  locations: DotMapMarker[]
  title: string
  /** Unit for the readout, e.g. "active users". */
  unit: string
}

const exampleProps: Geo3Props = {
  description: 'Right now, by city',
  locations: [
    { id: 'sfo', lat: 37.77, lon: -122.42, name: 'San Francisco, US', value: 2_840 },
    { id: 'nyc', lat: 40.71, lon: -74.01, name: 'New York, US', value: 3_460 },
    { id: 'yyz', lat: 43.65, lon: -79.38, name: 'Toronto, CA', value: 1_120 },
    { id: 'mex', lat: 19.43, lon: -99.13, name: 'Mexico City, MX', value: 690 },
    { id: 'gru', lat: -23.55, lon: -46.63, name: 'São Paulo, BR', value: 1_310 },
    { id: 'lon', lat: 51.51, lon: -0.13, name: 'London, UK', value: 2_970 },
    { id: 'ber', lat: 52.52, lon: 13.4, name: 'Berlin, DE', value: 1_580 },
    { id: 'los', lat: 6.52, lon: 3.38, name: 'Lagos, NG', value: 540 },
    { id: 'blr', lat: 12.97, lon: 77.59, name: 'Bengaluru, IN', value: 2_120 },
    { id: 'sin', lat: 1.35, lon: 103.82, name: 'Singapore, SG', value: 1_240 },
    { id: 'tyo', lat: 35.68, lon: 139.69, name: 'Tokyo, JP', value: 1_760 },
    { id: 'syd', lat: -33.87, lon: 151.21, name: 'Sydney, AU', value: 980 },
  ],
  title: 'Active users',
  unit: 'active users',
}

const Geo3 = (props: Geo3Props) => {
  const { description, locations, title, unit } = props
  const total = locations.reduce((sum, location) => sum + location.value, 0)
  const max = Math.max(0, ...locations.map((location) => location.value))
  const top = locations.reduce<DotMapMarker | null>(
    (best, location) => (best === null || location.value > best.value ? location : best),
    null,
  )
  const share = (value: number) =>
    total > 0 ? `${Math.round((value / total) * 100)}%` : '0%'

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction className='flex flex-col items-end'>
          <span className='text-2xl font-semibold tracking-tight tabular-nums'>
            {total.toLocaleString('en-US')}
          </span>
          <span className='text-muted-foreground text-xs'>
            in {locations.length} cities
          </span>
        </CardAction>
      </CardHeader>
      <CardContent>
        <DotMap
          describe={(location) =>
            `${location.name}: ${location.value.toLocaleString('en-US')} ${unit} · ${share(location.value)}`
          }
          footer={<DotMapLegend max={max} />}
          label={`${title}, ${description.toLowerCase()}`}
          markers={locations}
          max={max}
          nameHeader='City'
          valueHeader={unit.charAt(0).toUpperCase() + unit.slice(1)}
        >
          {top &&
            `Most active: ${top.name}, ${top.value.toLocaleString('en-US')} ${unit}`}
        </DotMap>
      </CardContent>
    </Card>
  )
}

export { Geo3, exampleProps as geo3ExampleProps, type Geo3Props }
