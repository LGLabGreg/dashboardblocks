import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'

import { Corner } from './corner'

export function CTA({ blockCount }: { blockCount: number }) {
  return (
    <section className='w-full py-24'>
      <div className='border-y md:px-6'>
        <div className='relative mx-auto max-w-6xl px-6 py-16 md:border-x md:px-10 md:py-20'>
          <Corner className='-top-[6px] -left-[5px]' />
          <Corner className='-top-[6px] -right-[5px]' />
          <Corner className='-bottom-[6px] -left-[5px]' />
          <Corner className='-right-[5px] -bottom-[6px]' />

          <div className='text-muted-foreground flex items-center justify-between gap-4 font-mono text-xs tracking-wider uppercase'>
            <span className='inline-flex items-center gap-2'>
              <span className='bg-foreground size-1.5 rounded-full' />
              Get started
            </span>
            <span className='hidden sm:inline'>Free forever</span>
          </div>

          <div className='mt-10 grid gap-10 md:mt-14 lg:grid-cols-12 lg:items-end lg:gap-12'>
            <h2 className='text-4xl leading-[0.95] font-medium tracking-[-0.045em] text-balance sm:text-5xl lg:col-span-8 lg:text-6xl'>
              Your next dashboard
              <br />
              <span className='text-muted-foreground'>is {blockCount} blocks away.</span>
            </h2>

            <div className='flex flex-col gap-6 lg:col-span-4'>
              <p className='text-muted-foreground text-base leading-relaxed text-pretty'>
                Free and open source under the MIT license. Star it, fork it, ship it.
              </p>
              <div className='flex flex-wrap items-center gap-3'>
                <Button size='lg' nativeButton={false} render={<Link href='/docs' />}>
                  Get Started
                  <ArrowRight data-icon='inline-end' />
                </Button>
                <Button
                  size='lg'
                  variant='outline'
                  nativeButton={false}
                  render={
                    <a
                      href='https://github.com/LGLabGreg/dashboardblocks'
                      target='_blank'
                      rel='noreferrer'
                      aria-label='Star on GitHub'
                    />
                  }
                >
                  <Icons.gitHub data-icon='inline-start' />
                  Star on GitHub
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
