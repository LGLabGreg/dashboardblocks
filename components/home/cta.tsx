import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'

export function CTA({ blockCount }: { blockCount: number }) {
  return (
    <section className='mx-auto w-full max-w-6xl px-4 py-24'>
      <div className='bg-foreground text-background relative overflow-hidden rounded-3xl px-6 py-16 text-center sm:px-12 md:py-20'>
        <div
          aria-hidden
          className='home-grid-invert pointer-events-none absolute inset-0'
        />
        <div
          aria-hidden
          className='bg-chart-1/40 pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full blur-3xl'
        />
        <div
          aria-hidden
          className='bg-chart-2/40 pointer-events-none absolute -top-32 -right-20 size-80 rounded-full blur-3xl'
        />
        <div className='relative flex flex-col items-center'>
          <h2 className='max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl'>
            Your next dashboard is {blockCount} blocks away.
          </h2>
          <p className='text-background/70 mt-4 max-w-xl text-balance'>
            Free and open source under the MIT license. Star it, fork it, ship it.
          </p>
          <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
            <Button
              size='lg'
              className='bg-background text-foreground hover:bg-background/90'
              nativeButton={false}
              render={<Link href='/docs' />}
            >
              Get Started
              <ArrowRight data-icon='inline-end' />
            </Button>
            <Button
              size='lg'
              variant='outline'
              className='border-background/20 text-background hover:bg-background/10 hover:text-background bg-transparent'
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
    </section>
  )
}
