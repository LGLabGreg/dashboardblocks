import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { VersionBadge } from '@/components/version-badge'

import { siteChrome } from '@/lib/customizer'

import { InstallCommand } from './install-command'

export function Hero({ blockCount }: { blockCount: number }) {
  return (
    <section className='w-full px-4 pt-20 pb-20 md:pt-28 md:pb-24'>
      <div className='mx-auto flex max-w-3xl flex-col items-center text-center'>
        <Link
          href='/docs/compatibility'
          className='text-muted-foreground hover:text-foreground hover:border-foreground/20 inline-flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-xs transition-colors'
        >
          <VersionBadge className='border-0 bg-muted' />
          Base UI, Radix and React Aria
          <ArrowRight className='size-3' />
        </Link>

        <h1 className='mt-8 text-5xl leading-[1.05] font-medium tracking-[-0.045em] text-balance sm:text-6xl lg:text-7xl'>
          Dashboard blocks for shadcn/ui.
        </h1>

        <p className='text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed text-pretty'>
          {blockCount} open-source blocks for KPIs, charts, tables and whole app pages.
          Add them with the shadcn CLI and own every line.
        </p>

        <div {...siteChrome('mt-9 flex flex-wrap items-center justify-center gap-3')}>
          <Button size='lg' nativeButton={false} render={<Link href='/docs' />}>
            Get started
            <ArrowRight data-icon='inline-end' />
          </Button>
          <Button
            size='lg'
            variant='outline'
            nativeButton={false}
            render={<Link href='/docs/components/activity-feed' />}
          >
            Browse blocks
          </Button>
        </div>

        <InstallCommand className='mt-8' />
      </div>
    </section>
  )
}
