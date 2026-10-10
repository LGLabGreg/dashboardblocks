// Override of registry/components/dashboardblocks/command-menu.tsx for React Aria
// source-hash: dc8eb3cbfaf0

'use client'

import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { type ReactNode, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command'
import { Kbd } from '@/components/ui/kbd'

import { cn } from '@/lib/utils'

interface CommandMenuItem {
  description?: string
  href?: string
  icon?: ReactNode
  /** Unique across every group. */
  id: string
  keywords?: string[]
  label: string
  onSelect?: () => void
  shortcut?: string
}

interface CommandMenuGroup {
  heading: string
  items: CommandMenuItem[]
}

function filterCommandGroups(groups: CommandMenuGroup[], query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) return groups
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        [item.label, item.description, ...(item.keywords ?? [])].some((text) =>
          text?.toLowerCase().includes(needle),
        ),
      ),
    }))
    .filter((group) => group.items.length > 0)
}

function useCommandMenuShortcut(onOpen: () => void, key = 'k') {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Chrome's autofill sends keydown events without a key.
      if (event.key?.toLowerCase() === key && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        onOpen()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [key, onOpen])
}

interface CommandMenuProps {
  /** @default 'No results found.' */
  emptyMessage?: string
  groups: CommandMenuGroup[]
  loading?: boolean
  onNavigate?: (href: string) => void
  onOpenChange: (open: boolean) => void
  /** Fetch results yourself: the menu shows `groups` as they are, without filtering. */
  onQueryChange?: (query: string) => void
  open: boolean
  /** @default 'Search…' */
  placeholder?: string
  /** The search text, when you pass `onQueryChange`. */
  query?: string
  title?: string
}

function CommandMenu({
  emptyMessage = 'No results found.',
  groups,
  loading = false,
  onNavigate = (href) => window.location.assign(href),
  onOpenChange,
  onQueryChange,
  open,
  placeholder = 'Search…',
  query: controlledQuery,
  title = 'Search',
}: CommandMenuProps) {
  const [ownQuery, setOwnQuery] = useState('')
  const query = controlledQuery ?? ownQuery
  const setQuery = onQueryChange ?? setOwnQuery
  const results = onQueryChange ? groups : filterCommandGroups(groups, query)

  function changeOpen(next: boolean) {
    onOpenChange(next)
    if (!next) setQuery('')
  }

  function select(item: CommandMenuItem) {
    changeOpen(false)
    if (item.onSelect) item.onSelect()
    else if (item.href) onNavigate(item.href)
  }

  const items = new Map(
    results.flatMap((group) => group.items.map((item) => [item.id, item] as const)),
  )

  return (
    <CommandDialog
      open={open}
      onOpenChange={changeOpen}
      title={title}
      description={placeholder}
    >
      <Command inputValue={query} onInputChange={setQuery} filter={() => true}>
        <CommandInput placeholder={placeholder} />
        {loading && (
          <p role='status' className='text-muted-foreground py-6 text-center text-sm'>
            Searching…
          </p>
        )}
        <CommandList
          aria-label={title}
          onAction={(key) => {
            const item = items.get(String(key))
            if (item) select(item)
          }}
          renderEmptyState={() =>
            loading ? null : <CommandEmpty>{emptyMessage}</CommandEmpty>
          }
        >
          {results.map((group) => (
            <CommandGroup key={group.heading} heading={group.heading}>
              {group.items.map((item) => (
                <CommandItem key={item.id} id={item.id} textValue={item.label}>
                  {item.icon}
                  <span className='flex min-w-0 flex-col'>
                    <span className='truncate'>{item.label}</span>
                    {item.description && (
                      <span className='text-muted-foreground truncate text-xs'>
                        {item.description}
                      </span>
                    )}
                  </span>
                  {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}

function CommandMenuTrigger({
  className,
  onClick,
  placeholder = 'Search…',
  shortcut = '⌘K',
}: {
  className?: string
  onClick: () => void
  /** @default 'Search…' */
  placeholder?: string
  shortcut?: string | null
}) {
  return (
    <Button
      variant='outline'
      onClick={onClick}
      aria-label={placeholder}
      className={cn(
        'max-sm:aspect-square max-sm:px-0 sm:w-64 sm:justify-start',
        className,
      )}
    >
      <IconPlaceholder
        lucide='SearchIcon'
        tabler='IconSearch'
        hugeicons='SearchIcon'
        phosphor='MagnifyingGlassIcon'
        remixicon='RiSearchLine'
      />
      <span className='truncate max-sm:sr-only'>{placeholder}</span>
      {shortcut && <Kbd className='ml-auto max-sm:hidden'>{shortcut}</Kbd>}
    </Button>
  )
}

export { CommandMenu, CommandMenuTrigger, filterCommandGroups, useCommandMenuShortcut }

export type { CommandMenuGroup, CommandMenuItem, CommandMenuProps }
