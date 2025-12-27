import { cn } from '@/lib/utils'

import { Icons } from './icons'

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-1 text-lg font-bold', className)}>
      <Icons.logo className='size-8 dark:invert' />
      Dashboardblocks
    </div>
  )
}
