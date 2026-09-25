import { cn } from '@/lib/utils'

import { Icons } from './icons'

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Icons.logo className='size-7 dark:invert' />
      <span className='text-[17px] font-semibold tracking-[-0.03em]'>
        Dashboard<span className='text-muted-foreground'>blocks</span>
      </span>
    </div>
  )
}
