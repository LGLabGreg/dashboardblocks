'use client'

import {
  FunnelBar,
  type FunnelStage,
  formatRate,
  getFunnelSteps,
} from '@/registry/components/dashboardblocks/funnel'
import { Fragment } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface Funnel1Props {
  description: string
  stages: FunnelStage[]
  title: string
}

const exampleProps: Funnel1Props = {
  description: 'Visitors to paid customers, last 30 days',
  stages: [
    { label: 'Visited site', value: 48_210 },
    { label: 'Signed up', value: 9_870 },
    { label: 'Activated', value: 5_430 },
    { label: 'Started trial', value: 2_160 },
    { label: 'Became customer', value: 812 },
  ],
  title: 'Signup funnel',
}

const Funnel1 = (props: Funnel1Props) => {
  const { description, stages, title } = props
  const steps = getFunnelSteps(stages)
  const last = steps.at(-1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <table className='w-full text-sm'>
          <caption className='sr-only'>{`${title}: ${description}`}</caption>
          <thead className='text-muted-foreground text-xs'>
            <tr>
              <th scope='col' className='pb-2 text-left font-normal'>
                Stage
              </th>
              <th scope='col' className='pb-2 text-right font-normal'>
                Users
              </th>
              <th scope='col' className='pb-2 text-right font-normal'>
                Conversion<span className='sr-only'> from previous step</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step, index) => (
              <Fragment key={step.label}>
                <tr>
                  <th scope='row' className='pt-2.5 pr-4 pb-1.5 text-left font-normal'>
                    {step.label}
                  </th>
                  <td className='w-20 pt-2.5 pb-1.5 pl-2 text-right font-medium tabular-nums'>
                    {step.value.toLocaleString()}
                  </td>
                  <td className='text-muted-foreground w-24 pt-2.5 pb-1.5 pl-2 text-right tabular-nums'>
                    {index === 0 ? '—' : formatRate(step.fromPrevious)}
                  </td>
                </tr>
                <tr aria-hidden>
                  <td colSpan={3} className='pb-2.5'>
                    <FunnelBar delay={index * 80} value={step.fromStart * 100} />
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </CardContent>
      <CardFooter className='text-muted-foreground justify-between border-t text-sm'>
        <span>Overall conversion</span>
        <span className='text-foreground font-semibold tabular-nums'>
          {last ? formatRate(last.fromStart, 2) : '—'}
        </span>
      </CardFooter>
    </Card>
  )
}

export { Funnel1, exampleProps as funnel1ExampleProps, type Funnel1Props }
