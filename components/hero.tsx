import { BarChartKPI2 } from '@/registry/components/dashboardblocks/kpi/bar-chart-kpi-02'
import { ArrowRight, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

import { Badge } from './ui/badge'

export function Hero() {
  return (
    <section className='flex flex-col items-center gap-8 px-5 py-8 text-center md:py-12'>
      <div className='flex flex-col items-center gap-4'>
        <Link
          href='/docs'
          className='mx-auto mb-3 inline-flex items-center gap-3 rounded-full border px-2 py-1 text-sm'
        >
          <Badge>beta</Badge>
          <span className='font-medium'>Introducing Dashboardblocks</span>
          <span className='bg-muted flex size-7 items-center justify-center rounded-full'>
            <ArrowRight className='size-4' />
          </span>
        </Link>
        <h1 className='text-primary leading-tighter text-4xl font-semibold tracking-tight text-balance lg:leading-[1.1] lg:font-semibold xl:text-5xl xl:tracking-tighter max-w-4xl'>
          Beautiful Dashboard Blocks Built with Tailwind CSS and Shadcn UI
        </h1>
        <p className='text-foreground max-w-3xl text-base sm:text-lg'>
          A growing collection of composable dashboard components—KPI cards, activity
          feeds, usage meters—each installable on its own. Open source and built to work
          with your existing shadcn setup.
        </p>
      </div>
      <div className='flex gap-4 mb-5'>
        <Button size='lg' asChild>
          <Link href='/docs'>
            Get Started
            <ArrowRight />
          </Link>
        </Button>
        <Button variant='outline' size='lg' asChild>
          <Link href='/docs/components/activity-feed'>
            <LayoutDashboard /> Components
          </Link>
        </Button>
      </div>
      <div className='w-full max-w-md text-left'>
        <BarChartKPI2 />
      </div>
    </section>
  )
}
