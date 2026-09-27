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

import { registryItemName } from '@/lib/customizer'

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
  const shortCommands = useMemo(
    () => ({
      npm: `npx shadcn add ${item}`,
      pnpm: `pnpm dlx shadcn add ${item}`,
      yarn: `yarn dlx shadcn add ${item}`,
      bun: `bunx shadcn add ${item}`,
    }),
    [item],
  )

  const copyToClipboard = useCallback(() => {
    void navigator.clipboard.writeText(commands[packageManager])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [commands, packageManager])

  return (
    <ButtonGroup>
      <Button variant='outline' size='sm' onClick={copyToClipboard}>
        {copied ? <Check /> : <Terminal />}
        {shortCommands[packageManager]}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant='outline' className='pl-2!' size='sm' />}
        >
          <ChevronDownIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='[--radius:1rem]'>
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
