'use client'

import { formatActivityTime } from '@/registry/components/dashboardblocks/activity-feed'
import {
  BlockMessage,
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import { Details } from '@/registry/components/dashboardblocks/details'
import {
  type FileAction,
  FileActionsMenu,
  FileBreadcrumbs,
  FileKindIcon,
  fileKindConfig,
  formatFileSize,
} from '@/registry/components/dashboardblocks/files'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { joinDetails } from '@/registry/lib/dashboardblocks/format'
import { startTransition, useEffect, useMemo, useRef, useState } from 'react'

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
  onCopyLink?: (file: BrowserFile) => Promise<void>
  onDelete?: (file: BrowserFile) => Promise<void>
  /** Pass a fixed date, so times render the same on the server and in the browser. */
  now: Date
  /** Pass a root with no children to show the empty state. */
  root: BrowserFolder
  status?: BlockStatus
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
    root: storedRoot,
    status,
    timeZone = 'UTC',
  } = props
  const [deleted, setDeleted] = useState<ReadonlySet<string>>(() => new Set())
  const root = useMemo(
    () => [...deleted].reduce(removeItem, storedRoot),
    [deleted, storedRoot],
  )
  const [folderId, setFolderId] = useState(storedRoot.id)
  const state = getBlockState(status, storedRoot.children.length === 0)
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
    startTransition(() => {
      setDeleted((current) => new Set([...current, target.id]))
      setMessage(`Deleted ${target.name}`)
    })
  }

  async function share(target: BrowserFile) {
    try {
      await onCopyLink(target)
      startTransition(() => setMessage(`Copied a link to ${target.name}`))
    } catch {
      startTransition(() => setMessage(`Couldn't copy a link to ${target.name}`))
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

  const summary =
    joinDetails(
      folders.length > 0 && plural(folders.length, 'folder'),
      files.length > 0 && plural(files.length, 'file'),
      files.length > 0 && formatFileSize(files.reduce((sum, item) => sum + item.size, 0)),
    ) || 'Empty'

  return (
    <BlockStateProvider status={status} empty={storedRoot.children.length === 0}>
      <section className='@container flex flex-col gap-3'>
        <header className='flex flex-col gap-0.5'>
          <FileBreadcrumbs
            items={path.map((item) => ({ id: item.id, label: item.name }))}
            onNavigate={open}
            className='-mx-1 [&_ol]:text-base [&_[aria-current]]:font-semibold [&_[aria-current]]:tracking-tight'
          />
          <BlockReady className='text-sm'>
            <p className='text-muted-foreground text-sm tabular-nums'>{summary}</p>
          </BlockReady>
        </header>
        <section
          ref={contentRef}
          tabIndex={-1}
          aria-label={current.name}
          className='flex flex-col gap-4 outline-none'
        >
          <BlockStateRows className='border-t' rows={5} />
          {!state && folders.length > 0 && (
            <ul
              aria-label='Folders'
              className='grid grid-cols-1 gap-2 @xs:grid-cols-2 @2xl:grid-cols-3 @4xl:grid-cols-4'
            >
              {folders.map((item) => (
                <li key={item.id}>
                  <button
                    type='button'
                    onClick={() => open(item.id)}
                    className='bg-muted/50 hover:bg-muted focus-visible:ring-ring/50 flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors outline-none focus-visible:ring-3'
                  >
                    <FileKindIcon kind='folder' size='sm' className='bg-background' />
                    <span className='flex min-w-0 flex-col'>
                      <span className='truncate text-sm font-medium'>{item.name}</span>
                      <span className='text-muted-foreground text-sm tabular-nums'>
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
          {!state && files.length > 0 && (
            <ul aria-label='Files' className='flex flex-col border-t'>
              {files.map((item) => (
                <li
                  key={item.id}
                  className='relative flex items-center gap-3 border-b py-2.5'
                >
                  <FileKindIcon name={item.name} size='sm' />
                  <div className='flex min-w-0 flex-1 flex-col @md:flex-row @md:items-baseline @md:gap-4'>
                    <a
                      href={item.href}
                      className='truncate text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:underline @md:flex-1'
                    >
                      <span aria-hidden className='absolute inset-0' />
                      {item.name}
                    </a>
                    <span className='text-muted-foreground truncate text-sm tabular-nums @md:w-28 @md:shrink-0'>
                      <Details className='@md:hidden'>
                        {formatFileSize(item.size)}
                        <time dateTime={item.modified.toISOString()}>
                          {formatActivityTime(item.modified, now, timeZone)}
                        </time>
                      </Details>
                      <time
                        dateTime={item.modified.toISOString()}
                        className='hidden @md:inline'
                      >
                        {formatActivityTime(item.modified, now, timeZone)}
                      </time>
                    </span>
                    <span className='hidden w-20 shrink-0 text-right text-sm tabular-nums @md:inline'>
                      {formatFileSize(item.size)}
                    </span>
                  </div>
                  <FileActionsMenu
                    actions={actionsFor(item)}
                    label={`Actions for ${item.name}`}
                    className='relative -mr-2'
                  />
                </li>
              ))}
            </ul>
          )}
          {!state && folders.length === 0 && files.length === 0 && (
            <BlockMessage
              className='border-t'
              icon={fileKindConfig.folder.icon}
              title={`${current.name} is empty`}
              description='Files and folders added here show up in this list.'
            />
          )}
        </section>
        <p aria-live='polite' className='text-muted-foreground min-h-5 text-sm'>
          {message}
        </p>
      </section>
    </BlockStateProvider>
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
