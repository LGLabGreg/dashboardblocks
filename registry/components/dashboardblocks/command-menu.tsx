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
  /** A second line, such as an email or an order total. */
  description?: string
  /** Where the item goes. Leave out when `onSelect` does the work. */
  href?: string
  icon?: ReactNode
  /** Unique across every group. */
  id: string
  /** Other words that should find this item, such as "billing" for Invoices. */
  keywords?: string[]
  label: string
  onSelect?: () => void
  /** Shown on the right, such as "⌘N". Displayed only: bind the keys yourself. */
  shortcut?: string
}

interface CommandMenuGroup {
  heading: string
  items: CommandMenuItem[]
}

/** The groups with only the items that match `query`, by label, description or keyword. */
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

/** Runs `onOpen` on ⌘K, or Ctrl+K on Windows and Linux. */
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
  /** Shows "Searching…" while results load. */
  loading?: boolean
  /**
   * Opens an item's `href`. Pass your router's navigate function for
   * client-side navigation. @default window.location.assign
   */
  onNavigate?: (href: string) => void
  onOpenChange: (open: boolean) => void
  /**
   * Fetch results yourself: the menu shows `groups` as they are, without
   * filtering. Leave out to filter `groups` as the user types.
   */
  onQueryChange?: (query: string) => void
  open: boolean
  /** @default 'Search…' */
  placeholder?: string
  /** The search text, when you pass `onQueryChange`. */
  query?: string
  /** Names the dialog for screen readers. @default 'Search' */
  title?: string
}

/** A search dialog of pages, actions and records, opened from a button or ⌘K. */
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

  return (
    <CommandDialog
      open={open}
      onOpenChange={changeOpen}
      title={title}
      description={placeholder}
    >
      <Command shouldFilter={false}>
        <CommandInput value={query} onValueChange={setQuery} placeholder={placeholder} />
        <CommandList>
          {loading ? (
            <p role='status' className='text-muted-foreground py-6 text-center text-sm'>
              Searching…
            </p>
          ) : (
            <CommandEmpty>{emptyMessage}</CommandEmpty>
          )}
          {results.map((group) => (
            <CommandGroup key={group.heading} heading={group.heading}>
              {group.items.map((item) => (
                <CommandItem key={item.id} value={item.id} onSelect={() => select(item)}>
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

/** A search field that opens the command menu. Collapses to an icon on small screens. */
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
  /** The keys shown on the button, or null when none open the menu. @default '⌘K' */
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
