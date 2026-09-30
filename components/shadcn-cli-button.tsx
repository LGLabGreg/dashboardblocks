'use client'

import { Check, ChevronDownIcon, Terminal } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { registryItemName, siteChrome } from '@/lib/customizer'

import { Icons } from './icons'

type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun'

export function ShadcnCliButton({ name }: { name: string }) {
  const [packageManager, setPackageManager] = useState<PackageManager>('npm')
  const [copied, setCopied] = useState(false)

  const item = registryItemName(name)
  const commands = useMemo(
    () => ({
      npm: `npx shadcn@latest add ${item}`,
      pnpm: `pnpm dlx shadcn@latest add ${item}`,
      yarn: `yarn dlx shadcn@latest add ${item}`,
      bun: `bunx --bun shadcn@latest add ${item}`,
    }),
    [item],
  )
  // Shown without @latest to save room. The copied command keeps it.
  const shortPrefixes: Record<PackageManager, string> = {
    npm: 'npx shadcn add ',
    pnpm: 'pnpm dlx shadcn add ',
    yarn: 'yarn dlx shadcn add ',
    bun: 'bunx shadcn add ',
  }
  const shortCommand = shortPrefixes[packageManager] + item

  const copyToClipboard = useCallback(() => {
    void navigator.clipboard.writeText(commands[packageManager])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [commands, packageManager])

  return (
    <ButtonGroup className='max-w-full min-w-0'>
      {/* Shrinks and truncates in narrow previews rather than overflowing. */}
      <Button
        variant='outline'
        size='sm'
        onClick={copyToClipboard}
        title={commands[packageManager]}
        className='min-w-0 shrink overflow-hidden'
      >
        {copied ? <Check /> : <Terminal />}
        {/* The prefix truncates first, so the block name stays readable. The
            split spans read as two words, so screen readers get the whole
            command from one span instead. */}
        <span aria-hidden className='flex min-w-0'>
          <span className='truncate'>
            {shortPrefixes[packageManager]}
            {registryItemName('')}
          </span>
          <span className='shrink-0'>{name}</span>
        </span>
        <span className='sr-only'>{shortCommand}</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant='outline'
              className='pl-2!'
              size='sm'
              aria-label='Choose package manager'
            />
          }
        >
          <ChevronDownIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' {...siteChrome('[--radius:1rem]')}>
          <DropdownMenuGroup>
            {Object.entries(commands).map(([key]) => {
              const IconComponent = Icons[key as PackageManager]
              return (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setPackageManager(key as PackageManager)}
                >
                  <IconComponent />
                  {key}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  )
}
