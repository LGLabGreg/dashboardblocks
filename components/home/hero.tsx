import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

import { Corner } from './corner'
import { InstallCommand } from './install-command'
import { Showcase } from './showcase'

export function Hero({ blockCount }: { blockCount: number }) {
  return (
    <section className='w-full'>
      <div className='border-b md:px-6'>
        <div className='relative mx-auto max-w-6xl px-6 md:border-x pt-16 pb-14 md:px-10 md:pt-24 md:pb-20'>
          <Corner className='-bottom-[6px] -left-[5px]' />
          <Corner className='-right-[5px] -bottom-[6px]' />

          <div className='text-muted-foreground animate-in fade-in flex items-center justify-between gap-4 font-mono text-xs tracking-wider uppercase duration-700'>
            <Link
              href='/docs'
              className='hover:text-foreground inline-flex items-center gap-2 transition-colors'
            >
              <span className='bg-foreground size-1.5 rounded-full' />
              {blockCount} blocks for shadcn/ui
              <ArrowRight className='size-3' />
            </Link>
            <span className='hidden sm:inline'>Open source · MIT</span>
          </div>

          <div className='mt-10 grid gap-10 md:mt-14 lg:grid-cols-12 lg:items-end lg:gap-12'>
            <h1 className='animate-in fade-in slide-in-from-bottom-3 text-5xl leading-[0.95] font-medium tracking-[-0.045em] text-balance duration-700 sm:text-6xl lg:col-span-8 lg:text-7xl'>
              Ship dashboards,
              <br />
              <span className='text-muted-foreground'>one block at a time.</span>
            </h1>

            <div className='animate-in fade-in slide-in-from-bottom-3 flex flex-col gap-6 duration-1000 lg:col-span-4'>
              <p className='text-muted-foreground text-base leading-relaxed text-pretty'>
                KPI cards, usage meters, activity feeds and leaderboards. Composable
                blocks built with Tailwind CSS and shadcn/ui — copy one or all of them,
                and own the code.
              </p>
              <div className='flex flex-wrap items-center gap-3'>
                <Button size='lg' nativeButton={false} render={<Link href='/docs' />}>
                  Get Started
                  <ArrowRight data-icon='inline-end' />
                </Button>
                <Button
                  variant='ghost'
                  size='lg'
                  nativeButton={false}
                  render={<Link href='/docs/components/kpi' />}
                >
                  Browse blocks
                </Button>
              </div>
              <InstallCommand className='self-start' />
            </div>
          </div>
        </div>
      </div>

      <Showcase />
    </section>
  )
}
