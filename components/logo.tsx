import Link from 'next/link'

import { cn } from '@/lib/utils'

import { Icons } from './icons'

export function Logo({ className }: { className?: string }) {
  return (
    <Link href='/' className={cn('flex items-center gap-1 text-xl font-bold', className)}>
      <Icons.logo className='size-8 dark:invert' />
      Dashboardblocks
    </Link>
  )
}
