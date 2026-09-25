'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

export function InstallCommand({
  name = 'kpi-01',
  className,
}: {
  name?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  const command = `npx shadcn@latest add https://dashboardblocks.com/r/${name}.json`

  const copy = () => {
    void navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type='button'
      onClick={copy}
      aria-label='Copy install command'
      className={cn(
        'group bg-card/80 hover:border-foreground/20 flex max-w-full items-center gap-3 rounded-full border py-2 pr-2 pl-4 font-mono text-xs backdrop-blur transition-colors sm:text-sm',
        className,
      )}
    >
      <span className='text-chart-1 select-none'>$</span>
      <span className='truncate'>
        npx shadcn add <span className='text-muted-foreground'>{name}</span>
      </span>
      <span className='bg-muted text-muted-foreground group-hover:text-foreground flex size-7 shrink-0 items-center justify-center rounded-full transition-colors'>
        {copied ? <Check className='size-3.5' /> : <Copy className='size-3.5' />}
      </span>
    </button>
  )
}
