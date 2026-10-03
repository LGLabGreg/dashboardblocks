'use client'

import { formatActivityTime } from '@/registry/components/dashboardblocks/activity-feed'
import {
  type FileAction,
  FileActionsMenu,
  FileBreadcrumbs,
  FileKindIcon,
  formatFileSize,
} from '@/registry/components/dashboardblocks/files'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useEffect, useRef, useState } from 'react'

import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface BrowserFile {
  href: string
  id: string
  modified: Date
  name: string
  /** In bytes. */
  size: number
  type: 'file'
}

interface BrowserFolder {
  children: BrowserItem[]
  id: string
  name: string
  type: 'folder'
}

type BrowserItem = BrowserFile | BrowserFolder

interface Files4Props {
  /** Copies a link to the file. Defaults to copying `href` to the clipboard. */
  onCopyLink?: (file: BrowserFile) => Promise<void>
  /** Deletes a file. Resolve once it's gone. Defaults to a short wait. */
  onDelete?: (file: BrowserFile) => Promise<void>
  /** Pass a fixed date, so times render the same on the server and in the browser. */
  now: Date
  /** The top folder. Its name starts the path. */
  root: BrowserFolder
  /** Time zone for dates. @default 'UTC' */
  timeZone?: string
}

const exampleNow = new Date(Date.UTC(2026, 8, 26, 15, 30))
const MB = 1024 * 1024

let exampleId = 0
const file = (name: string, size: number, hoursAgo: number): BrowserFile => ({
  href: '#',
  id: `file-${++exampleId}`,
  modified: new Date(exampleNow.getTime() - hoursAgo * 3_600_000),
  name,
  size: Math.round(size),
  type: 'file',
})
const folder = (name: string, children: BrowserItem[]): BrowserFolder => ({
  children,
  id: `folder-${++exampleId}`,
  name,
  type: 'folder',
})

const exampleProps: Files4Props = {
  now: exampleNow,
  root: folder('Marketing', [
    folder('Brand', [
      folder('Logos', [
        file('logo-primary.svg', 24 * 1024, 900),
        file('logo-mark@2x.png', 186 * 1024, 900),
        file('logo-white.svg', 22 * 1024, 880),
      ]),
      file('Brand guidelines v4.pdf', 12.1 * MB, 74),
      file('Typography specimen.pdf', 3.2 * MB, 410),
      file('Color tokens.json', 8 * 1024, 52),
    ]),
    folder('Campaigns', [
      folder('Fall launch', [
        file('Fall launch brief.pdf', 2.4 * MB, 5),
        file('hero-banner@2x.png', 6.8 * MB, 30),
        file('Launch teaser 30s.mp4', 142 * MB, 98),
        file('Media plan.xlsx', 312 * 1024, 20),
      ]),
      folder('Spring promo', []),
    ]),
    folder('Events', [
      folder('Summit 2026', [
        file('Keynote slides.pptx', 48.3 * MB, 300),
        file('Speaker headshots.zip', 96.4 * MB, 320),
      ]),
    ]),
    file('Q3 board deck.pptx', 18.4 * MB, 1.5),
    file('Campaign budget FY27.xlsx', 486 * 1024, 26),
    file('Press release draft.docx', 92 * 1024, 140),
    file('Podcast ep 12 master.wav', 318 * MB, 220),
    file('Team offsite.jpg', 4.6 * MB, 600),
  ]),
}

async function copyLink(target: BrowserFile) {
  await navigator.clipboard.writeText(new URL(target.href, window.location.href).href)
}

async function deleteFile() {
  await new Promise((resolve) => setTimeout(resolve, 400))
}

function findPath(root: BrowserFolder, id: string): BrowserFolder[] {
  if (root.id === id) return [root]
  for (const child of root.children) {
    if (child.type !== 'folder') continue
    const path = findPath(child, id)
    if (path.length > 0) return [root, ...path]
  }
  return []
}

function removeItem(folder: BrowserFolder, id: string): BrowserFolder {
  return {
    ...folder,
    children: folder.children
      .filter((child) => child.id !== id)
      .map((child) => (child.type === 'folder' ? removeItem(child, id) : child)),
  }
}

const plural = (count: number, noun: string) =>
  `${count} ${count === 1 ? noun : `${noun}s`}`

const byName = (a: BrowserItem, b: BrowserItem) => a.name.localeCompare(b.name, 'en-US')

const Files4 = (props: Files4Props) => {
  const {
    now,
    onCopyLink = copyLink,
    onDelete = deleteFile,
    root: initialRoot,
    timeZone = 'UTC',
  } = props
  const [root, setRoot] = useState(initialRoot)
  const [folderId, setFolderId] = useState(initialRoot.id)
  const [message, setMessage] = useState('')
  const contentRef = useRef<HTMLElement>(null)
  const moved = useRef(false)

  const path = findPath(root, folderId)
  const current = path.at(-1) ?? root
  const folders = current.children
    .filter((item): item is BrowserFolder => item.type === 'folder')
    .sort(byName)
  const files = current.children
    .filter((item): item is BrowserFile => item.type === 'file')
    .sort((a, b) => b.modified.getTime() - a.modified.getTime())

  useEffect(() => {
    if (!moved.current) return
    moved.current = false
    contentRef.current?.focus()
  }, [folderId])

  function open(id: string) {
    moved.current = true
    setFolderId(id)
    setMessage('')
  }

  async function remove(target: BrowserFile) {
    setMessage(`Deleting ${target.name}…`)
    await onDelete(target)
    setRoot((currentRoot) => removeItem(currentRoot, target.id))
    setMessage(`Deleted ${target.name}`)
  }

  async function share(target: BrowserFile) {
    try {
      await onCopyLink(target)
      setMessage(`Copied a link to ${target.name}`)
    } catch {
      setMessage(`Couldn't copy a link to ${target.name}`)
    }
  }

  const actionsFor = (target: BrowserFile): FileAction[] => [
    {
      icon: (
        <IconPlaceholder
          lucide='DownloadIcon'
          tabler='IconDownload'
          hugeicons='Download01Icon'
          phosphor='DownloadIcon'
          remixicon='RiDownloadLine'
        />
      ),
      label: 'Download',
      onSelect: () => setMessage(`Downloading ${target.name}`),
    },
    {
      icon: (
        <IconPlaceholder
          lucide='LinkIcon'
          tabler='IconLink'
          hugeicons='Link01Icon'
          phosphor='LinkIcon'
          remixicon='RiLinkM'
        />
      ),
      label: 'Copy link',
      onSelect: () => void share(target),
    },
    {
      icon: (
        <IconPlaceholder
          lucide='Trash2Icon'
          tabler='IconTrash'
          hugeicons='Delete02Icon'
          phosphor='TrashIcon'
          remixicon='RiDeleteBinLine'
        />
      ),
      label: 'Delete',
      onSelect: () => void remove(target),
      variant: 'destructive',
    },
  ]

  return (
    <Card className='@container/files'>
      <CardHeader className='flex flex-col gap-1'>
        <FileBreadcrumbs
          items={path.map((item) => ({ id: item.id, label: item.name }))}
          onNavigate={open}
          className='-mx-1'
        />
        <CardDescription className='tabular-nums'>
          {[
            folders.length > 0 && plural(folders.length, 'folder'),
            files.length > 0 && plural(files.length, 'file'),
          ]
            .filter(Boolean)
            .join(' · ') || 'Empty'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <section
          ref={contentRef}
          tabIndex={-1}
          aria-label={current.name}
          className='flex flex-col gap-6 outline-none'
        >
          {folders.length > 0 && (
            <ul
              aria-label='Folders'
              className='grid grid-cols-1 gap-3 @xs/files:grid-cols-2 @2xl/files:grid-cols-3'
            >
              {folders.map((item) => (
                <li key={item.id}>
                  <button
                    type='button'
                    onClick={() => open(item.id)}
                    className='hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-ring/50 flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors outline-none focus-visible:ring-3'
                  >
                    <FileKindIcon kind='folder' />
                    <span className='flex min-w-0 flex-col'>
                      <span className='truncate text-sm font-medium'>{item.name}</span>
                      <span className='text-muted-foreground text-xs tabular-nums'>
                        {item.children.length === 0
                          ? 'Empty'
                          : plural(item.children.length, 'item')}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {files.length > 0 && (
            <ul
              aria-label='Files'
              className='grid grid-cols-1 gap-2 @sm/files:grid-cols-2 @sm/files:gap-3 @2xl/files:grid-cols-3 @4xl/files:grid-cols-4'
            >
              {files.map((item) => (
                <li
                  key={item.id}
                  className='hover:bg-muted/50 focus-within:bg-muted/50 relative flex flex-col gap-2 rounded-lg border p-2 transition-colors'
                >
                  <div className='bg-muted/50 hidden aspect-2/1 items-center justify-center rounded-md @sm/files:flex'>
                    <FileKindIcon name={item.name} size='lg' />
                  </div>
                  <div className='flex items-center gap-3 @sm/files:items-start @sm/files:gap-1 @sm/files:pl-1'>
                    <FileKindIcon
                      name={item.name}
                      size='sm'
                      className='@sm/files:hidden'
                    />
                    <div className='flex min-w-0 flex-1 flex-col'>
                      <a
                        href={item.href}
                        className='truncate text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:underline'
                      >
                        <span aria-hidden className='absolute inset-0 rounded-lg' />
                        {item.name}
                      </a>
                      <span className='text-muted-foreground truncate text-xs tabular-nums'>
                        {formatFileSize(item.size)} ·{' '}
                        <time dateTime={item.modified.toISOString()}>
                          {formatActivityTime(item.modified, now, timeZone)}
                        </time>
                      </span>
                    </div>
                    <FileActionsMenu
                      actions={actionsFor(item)}
                      label={`Actions for ${item.name}`}
                      className='relative @sm/files:-mt-0.5'
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
          {folders.length === 0 && files.length === 0 && (
            <div className='text-muted-foreground flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center text-sm'>
              <FileKindIcon kind='folder' />
              {current.name} is empty.
            </div>
          )}
        </section>
        <p
          aria-live='polite'
          className={cn('text-muted-foreground text-xs', message && 'mt-4')}
        >
          {message}
        </p>
      </CardContent>
    </Card>
  )
}

export {
  Files4,
  exampleProps as files4ExampleProps,
  type BrowserFile,
  type BrowserFolder,
  type BrowserItem,
  type Files4Props,
}
