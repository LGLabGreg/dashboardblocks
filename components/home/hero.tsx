import { ArrowRight, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

import { InstallCommand } from './install-command'
import { Showcase } from './showcase'

export function Hero({ blockCount }: { blockCount: number }) {
  return (
    <section className='relative w-full overflow-hidden'>
      <div aria-hidden className='pointer-events-none absolute inset-0 -z-10'>
        <div className='home-grid absolute inset-0' />
        <div className='bg-chart-1/20 absolute -top-40 left-1/2 size-[36rem] -translate-x-[85%] rounded-full blur-3xl' />
        <div className='bg-chart-2/20 absolute -top-24 left-1/2 size-[32rem] -translate-x-[10%] rounded-full blur-3xl' />
      </div>

      <div className='mx-auto flex max-w-6xl flex-col items-center px-4 pt-14 text-center md:pt-20'>
        <Link
          href='/docs'
          className='bg-background/70 hover:bg-background animate-in fade-in slide-in-from-bottom-2 mb-8 inline-flex items-center gap-2 rounded-full border py-1 pr-1 pl-3 text-sm backdrop-blur transition-colors duration-700'
        >
          <span className='relative flex size-2'>
            <span className='bg-chart-2 absolute inline-flex size-full animate-ping rounded-full opacity-75' />
            <span className='bg-chart-2 relative inline-flex size-2 rounded-full' />
          </span>
          <span className='font-medium'>{blockCount} blocks and counting</span>
          <span className='bg-muted flex size-6 items-center justify-center rounded-full'>
            <ArrowRight className='size-3.5' />
          </span>
        </Link>

        <h1 className='animate-in fade-in slide-in-from-bottom-4 max-w-4xl text-4xl font-semibold tracking-tighter text-balance duration-700 sm:text-6xl md:text-7xl'>
          Ship dashboards,{' '}
          <span className='from-chart-1 to-chart-2 bg-gradient-to-r bg-clip-text text-transparent'>
            one block
          </span>{' '}
          at a time.
        </h1>

        <p className='text-muted-foreground animate-in fade-in slide-in-from-bottom-4 mt-6 max-w-2xl text-base text-balance duration-1000 sm:text-lg'>
          KPI cards, usage meters, activity feeds and leaderboards — composable blocks
          built with Tailwind CSS and shadcn/ui. Copy one, or all of them. The code is
          yours.
        </p>

        <div className='animate-in fade-in slide-in-from-bottom-4 mt-8 flex flex-col items-center gap-4 duration-1000 sm:flex-row'>
          <Button size='lg' nativeButton={false} render={<Link href='/docs' />}>
            Get Started
            <ArrowRight data-icon='inline-end' />
          </Button>
          <Button
            variant='outline'
            size='lg'
            className='bg-background/70'
            nativeButton={false}
            render={<Link href='/docs/components/kpi' />}
          >
            <LayoutDashboard data-icon='inline-start' /> Browse blocks
          </Button>
        </div>

        <InstallCommand className='animate-in fade-in mt-6 duration-1000' />
      </div>

      <Showcase />
    </section>
  )
}
