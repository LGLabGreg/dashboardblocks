'use client'

import {
  StatusIndicator,
  type StatusLevel,
} from '@/registry/components/dashboardblocks/status'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Region {
  code: string
  errorRate: number
  latency: number
  name: string
  status: StatusLevel
}

interface Status4Props {
  regions: Region[]
  title: string
}

const exampleProps: Status4Props = {
  regions: [
    {
      code: 'us-east-1',
      errorRate: 0.02,
      latency: 48,
      name: 'N. Virginia',
      status: 'operational',
    },
    {
      code: 'us-west-2',
      errorRate: 0.03,
      latency: 61,
      name: 'Oregon',
      status: 'operational',
    },
    {
      code: 'eu-west-1',
      errorRate: 0.41,
      latency: 212,
      name: 'Ireland',
      status: 'degraded',
    },
    {
      code: 'eu-central-1',
      errorRate: 0.01,
      latency: 57,
      name: 'Frankfurt',
      status: 'operational',
    },
    {
      code: 'ap-south-1',
      errorRate: 4.8,
      latency: 890,
      name: 'Mumbai',
      status: 'partial',
    },
    {
      code: 'ap-northeast-1',
      errorRate: 0.02,
      latency: 73,
      name: 'Tokyo',
      status: 'operational',
    },
  ],
  title: 'Region health',
}

const Status4 = (props: Status4Props) => {
  const { regions, title } = props
  const healthy = regions.filter((region) => region.status === 'operational').length

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {healthy} of {regions.length} regions healthy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {regions.map((region) => (
            <li
              key={region.code}
              className='flex flex-col gap-3 rounded-lg p-3 shadow-[0_0_0_1px_var(--color-border)]'
            >
              <div className='flex flex-col'>
                <span className='text-sm font-medium'>{region.name}</span>
                <span className='text-muted-foreground font-mono text-xs'>
                  {region.code}
                </span>
              </div>
              <StatusIndicator className='text-xs' status={region.status} />
              <dl className='grid grid-cols-2 gap-2 text-xs'>
                <div className='flex flex-col'>
                  <dt className='text-muted-foreground'>Latency</dt>
                  <dd className='font-medium tabular-nums'>
                    {region.latency > 0 ? `${region.latency} ms` : '—'}
                  </dd>
                </div>
                <div className='flex flex-col'>
                  <dt className='text-muted-foreground'>Errors</dt>
                  <dd className='font-medium tabular-nums'>{region.errorRate}%</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export { Status4, exampleProps as status4ExampleProps, type Status4Props }
