'use client'

import { usePathname } from 'fumadocs-core/framework'
import type * as PageTree from 'fumadocs-core/page-tree'
import {
  SidebarFolder,
  SidebarFolderContent,
  SidebarFolderTrigger,
  SidebarItem,
  useFolderDepth,
} from 'fumadocs-ui/components/sidebar/base'
import { useTreePath } from 'fumadocs-ui/contexts/tree'

import { cn } from '@/lib/utils'

const row =
  'relative flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors [&_svg]:size-4 [&_svg]:shrink-0'

function isActive(url: string, pathname: string) {
  const strip = (path: string) => (path.length > 1 ? path.replace(/\/$/, '') : path)
  return strip(url) === strip(pathname)
}

export function SidebarTreeItem({ item }: { item: PageTree.Item }) {
  const pathname = usePathname()
  const nested = useFolderDepth() > 0

  return (
    <SidebarItem
      href={item.url}
      external={item.external}
      active={isActive(item.url, pathname)}
      icon={nested ? undefined : item.icon}
      className={cn(
        row,
        'text-muted-foreground hover:text-foreground hover:bg-accent/60 data-[active=true]:text-foreground data-[active=true]:font-medium',
        nested
          ? // A tick on the folder's rail marks the current page.
            'ms-6 w-auto py-1 ps-2.5 data-[active=true]:bg-accent/60 data-[active=true]:before:bg-foreground before:absolute before:inset-y-1.5 before:-start-[9px] before:w-px'
          : 'data-[active=true]:bg-accent',
      )}
    >
      {item.name}
    </SidebarItem>
  )
}

export function SidebarTreeFolder({
  item,
  children,
}: {
  item: PageTree.Folder
  children: React.ReactNode
}) {
  const path = useTreePath()
  const count = item.children.filter((child) => child.type === 'page').length

  return (
    <SidebarFolder
      collapsible={item.collapsible}
      active={path.includes(item)}
      defaultOpen={item.defaultOpen}
      className='mt-5'
    >
      <SidebarFolderTrigger
        className={cn(
          row,
          'text-foreground hover:bg-accent/60 font-medium [&_[data-icon]]:text-muted-foreground [&_[data-icon]]:size-3.5',
        )}
      >
        {item.icon}
        <span className='flex-1 text-start'>{item.name}</span>
        <span className='text-muted-foreground text-xs font-normal tabular-nums'>
          {count}
        </span>
      </SidebarFolderTrigger>
      <SidebarFolderContent className='relative flex flex-col gap-px pt-1 before:absolute before:inset-y-1 before:start-[15px] before:w-px before:bg-border'>
        {children}
      </SidebarFolderContent>
    </SidebarFolder>
  )
}

export function SidebarTreeSeparator({ item }: { item: PageTree.Separator }) {
  if (!item.name) return <hr className='mx-2 my-4' />

  return (
    <p className='text-muted-foreground mt-5 mb-1 px-2 text-xs font-medium'>
      {item.name}
    </p>
  )
}
