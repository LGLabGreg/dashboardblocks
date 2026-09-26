'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

import { useCustomizerConfig } from '@/components/customizer/customizer-provider'

import { registryItemUrl } from '@/lib/customizer'
import { cn } from '@/lib/utils'

const iconTransition =
  'transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]'

export function InstallCommand({
  name = 'kpi-01',
  className,
}: {
  name?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  const { base } = useCustomizerConfig()
  const command = `npx shadcn@latest add ${registryItemUrl(name, base)}`

  const copy = () => {
    void navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <button
        type='button'
        onClick={copy}
        title={command}
        className={cn(
          'group bg-card/80 hover:border-foreground/20 flex max-w-full items-center gap-3 rounded-full border py-2 pr-2 pl-4 font-mono text-xs backdrop-blur transition-[border-color,scale] duration-150 ease-out active:scale-[0.96] sm:text-sm',
          className,
        )}
      >
        <span aria-hidden className='text-muted-foreground select-none'>
          $
        </span>
        <span className='truncate'>
          npx shadcn add <span className='text-muted-foreground'>{name}</span>
        </span>
        <span className='sr-only'>, copy install command</span>
        <span
          aria-hidden
          className='bg-muted text-muted-foreground group-hover:text-foreground relative flex size-7 shrink-0 items-center justify-center rounded-full transition-colors'
        >
          <Check
            className={cn(
              'absolute size-3.5',
              iconTransition,
              copied
                ? 'blur-0 scale-100 opacity-100'
                : 'scale-[0.25] opacity-0 blur-[4px]',
            )}
          />
          <Copy
            className={cn(
              'size-3.5',
              iconTransition,
              copied
                ? 'scale-[0.25] opacity-0 blur-[4px]'
                : 'blur-0 scale-100 opacity-100',
            )}
          />
        </span>
      </button>
      <span role='status' className='sr-only'>
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </>
  )
}
