import { version } from '@/package.json'

import { cn } from '@/lib/utils'

import { Icons } from './icons'

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Icons.logo className='size-7 dark:invert' />
      <span className='text-[17px] font-semibold tracking-[-0.03em]'>
        Dashboard<span className='text-muted-foreground'>blocks</span>
      </span>
      <span className='text-muted-foreground rounded-full border px-1.5 py-px font-mono text-[11px] font-normal leading-4 tabular-nums'>
        v{version}
      </span>
    </div>
  )
}
