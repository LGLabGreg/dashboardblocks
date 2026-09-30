import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'

import { siteChrome } from '@/lib/customizer'

export function CTA({ blockCount }: { blockCount: number }) {
  return (
    <section className='w-full px-4 py-24 md:py-32'>
      <div className='mx-auto flex max-w-2xl flex-col items-center text-center'>
        <h2 className='text-4xl leading-[1.05] font-medium tracking-[-0.045em] text-balance sm:text-5xl'>
          Your next dashboard{' '}
          <span className='text-muted-foreground'>is {blockCount} blocks away.</span>
        </h2>
        <p className='text-muted-foreground mt-5 text-pretty'>
          Free and open source under the MIT license. Star it, fork it, ship it.
        </p>
        <div {...siteChrome('mt-8 flex flex-wrap items-center justify-center gap-3')}>
          <Button size='lg' nativeButton={false} render={<Link href='/docs' />}>
            Get started
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
    </section>
  )
}
