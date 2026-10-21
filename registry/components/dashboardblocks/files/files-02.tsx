'use client'

import { ActivityTime } from '@/registry/components/dashboardblocks/activity-feed'
import {
  BlockReady,
  BlockStateProvider,
  type BlockStatus,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  createDataTableColumnHelper,
  createDataTableSelectColumn,
  DataTableContent,
  DataTableFacetFilter,
  type DataTableFacetOption,
  DataTableReset,
  DataTableSearch,
  DataTableSelectionBar,
  useDataTable,
} from '@/registry/components/dashboardblocks/data-table'
import {
  type FileAction,
  FileActionsMenu,
  FileKindIcon,
  type FileKind,
  fileKindConfig,
  formatFileSize,
  getFileKind,
} from '@/registry/components/dashboardblocks/files'
import { DataTableRowLink } from '@/registry/components/dashboardblocks/table'
import { PersonAvatar } from '@/registry/components/dashboardblocks/team'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { createContext, startTransition, useContext, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'

interface DriveFile {
  href: string
  id: string
  modified: Date
  name: string
  owner: string
  ownerAvatar?: string
  /** In bytes. */
  size: number
}

interface FileRow extends DriveFile {
  kind: FileKind
}

interface Files2Props {
  /** Leave out to describe the files shown. */
  description?: string
  /** Leave out, or pass none, to show the empty state. */
  files?: DriveFile[]
  /** Pass a fixed date, so times render the same on the server and in the browser. */
  now: Date
  onCopyLink?: (file: DriveFile) => Promise<void>
  onDelete?: (files: DriveFile[]) => Promise<void>
  onDownload?: (files: DriveFile[]) => void
  status?: BlockStatus
  timeZone?: string
  title: string
}

const exampleNow = new Date(Date.UTC(2026, 8, 26, 15, 30))
const hoursAgo = (hours: number) => new Date(exampleNow.getTime() - hours * 3_600_000)
const MB = 1024 * 1024

const avatars: Record<string, string> = {
  'Hannah Okafor': '/images/avatar-03.webp',
  'Jonas Berg': '/images/avatar-04.webp',
  'Lena Fischer': '/images/avatar-05.webp',
  'Mateo Silva': '/images/avatar-02.webp',
  'Priya Nair': '/images/avatar-01.webp',
}

const exampleProps: Files2Props = {
  files: [
    ['Q3 board deck.pptx', 'Priya Nair', 1.5, 18.4 * MB],
    ['Fall launch brief.pdf', 'Mateo Silva', 5, 2.4 * MB],
    ['Campaign budget FY27.xlsx', 'Hannah Okafor', 26, 486 * 1024],
    ['hero-banner@2x.png', 'Lena Fischer', 30, 6.8 * MB],
    ['Brand guidelines v4.pdf', 'Priya Nair', 74, 12.1 * MB],
    ['Launch teaser 30s.mp4', 'Lena Fischer', 98, 142 * MB],
    ['Press release draft.docx', 'Mateo Silva', 140, 92 * 1024],
    ['Podcast ep 12 master.wav', 'Jonas Berg', 220, 318 * MB],
    ['Customer logos.zip', 'Hannah Okafor', 410, 54.6 * MB],
    ['utm-builder.json', 'Jonas Berg', 760, 6 * 1024],
  ].map(([name, owner, hours, size], index) => ({
    href: '#',
    id: `file-${index + 1}`,
    modified: hoursAgo(hours as number),
    name: name as string,
    owner: owner as string,
    ownerAvatar: avatars[owner as string],
    size: Math.round(size as number),
  })),
  now: exampleNow,
  title: 'Marketing drive',
}

async function copyLink(file: DriveFile) {
  await navigator.clipboard.writeText(new URL(file.href, window.location.href).href)
}

async function deleteFiles() {
  await new Promise((resolve) => setTimeout(resolve, 400))
}

const noFiles: DriveFile[] = []

const plural = (count: number) => `${count} ${count === 1 ? 'file' : 'files'}`

function summarize(rows: DriveFile[]) {
  if (rows.length === 0) return 'No files yet.'
  const owners = new Set(rows.map((row) => row.owner)).size
  const total = rows.reduce((sum, row) => sum + row.size, 0)
  return `${plural(rows.length)} from ${owners} ${owners === 1 ? 'person' : 'people'}, ${formatFileSize(total)} in all, newest first.`
}

const KIND_OPTIONS: DataTableFacetOption[] = (
  [
    'pdf',
    'document',
    'spreadsheet',
    'presentation',
    'image',
    'video',
    'audio',
    'archive',
    'code',
    'other',
  ] as const
).map((kind) => ({
  icon: fileKindConfig[kind].icon,
  label: fileKindConfig[kind].label,
  value: kind,
}))

const downloadIcon = (
  <IconPlaceholder
    lucide='DownloadIcon'
    tabler='IconDownload'
    hugeicons='Download01Icon'
    phosphor='DownloadIcon'
    remixicon='RiDownloadLine'
  />
)

const deleteIcon = (
  <IconPlaceholder
    lucide='Trash2Icon'
    tabler='IconTrash'
    hugeicons='Delete02Icon'
    phosphor='TrashIcon'
    remixicon='RiDeleteBinLine'
  />
)

interface FileTableContext {
  actionsFor: (file: DriveFile) => FileAction[]
  now: Date
  timeZone: string
}

const FileTable = createContext<FileTableContext>({
  actionsFor: () => [],
  now: new Date(0),
  timeZone: 'UTC',
})

function ModifiedCell({ date }: { date: Date }) {
  const { now, timeZone } = useContext(FileTable)
  return (
    <ActivityTime
      date={date}
      now={now}
      timeZone={timeZone}
      className='text-foreground text-sm'
    />
  )
}

function ActionsCell({ file }: { file: DriveFile }) {
  const { actionsFor } = useContext(FileTable)
  return <FileActionsMenu actions={actionsFor(file)} label={`Actions for ${file.name}`} />
}

const columnHelper = createDataTableColumnHelper<FileRow>()

const columns = columnHelper.columns([
  createDataTableSelectColumn<FileRow>({ getRowLabel: (row) => row.name }),
  columnHelper.accessor('name', {
    cell: ({ row }) => (
      <span className='flex min-w-0 items-center gap-3'>
        <FileKindIcon kind={row.original.kind} size='sm' />
        <DataTableRowLink href={row.original.href}>{row.original.name}</DataTableRowLink>
      </span>
    ),
    header: 'Name',
    meta: { primary: true, truncate: true },
  }),
  columnHelper.accessor('kind', {
    cell: ({ getValue }) => fileKindConfig[getValue()].label,
    enableGlobalFilter: false,
    header: 'Type',
    meta: { cellClassName: 'text-muted-foreground' },
  }),
  columnHelper.accessor('owner', {
    cell: ({ row }) => (
      <span className='flex items-center gap-2 whitespace-nowrap'>
        <PersonAvatar
          person={{ avatar: row.original.ownerAvatar, name: row.original.owner }}
          size='sm'
        />
        {row.original.owner}
      </span>
    ),
    header: 'Owner',
  }),
  columnHelper.accessor((row) => row.modified.getTime(), {
    cell: ({ row }) => <ModifiedCell date={row.original.modified} />,
    enableGlobalFilter: false,
    header: 'Modified',
    id: 'modified',
    sortDescFirst: true,
  }),
  columnHelper.accessor('size', {
    cell: ({ getValue }) => formatFileSize(getValue()),
    enableGlobalFilter: false,
    header: 'Size',
    meta: { align: 'end', cellClassName: 'tabular-nums' },
    sortDescFirst: true,
  }),
  columnHelper.display({
    cell: ({ row }) => <ActionsCell file={row.original} />,
    header: () => <span className='sr-only'>Actions</span>,
    id: 'actions',
    meta: {
      cellClassName: 'w-px pl-0',
      headerClassName: 'w-px',
    },
  }),
])

const Files2 = (props: Files2Props) => {
  const {
    description,
    files = noFiles,
    now,
    onCopyLink = copyLink,
    onDelete = deleteFiles,
    onDownload = () => {},
    status,
    timeZone = 'UTC',
    title,
  } = props
  const [deleted, setDeleted] = useState<ReadonlySet<string>>(() => new Set())
  const rows = useMemo<FileRow[]>(
    () =>
      files
        .filter((file) => !deleted.has(file.id))
        .map((file) => ({ ...file, kind: getFileKind(file.name) })),
    [deleted, files],
  )
  const [message, setMessage] = useState('')

  async function remove(targets: DriveFile[]) {
    const ids = new Set(targets.map((file) => file.id))
    setMessage(
      `Deleting ${targets.length === 1 ? targets[0].name : plural(targets.length)}…`,
    )
    await onDelete(targets)
    startTransition(() => {
      setDeleted((current) => new Set([...current, ...ids]))
      table.setRowSelection((current) =>
        Object.fromEntries(Object.entries(current).filter(([id]) => !ids.has(id))),
      )
      setMessage(
        `Deleted ${targets.length === 1 ? targets[0].name : plural(targets.length)}`,
      )
    })
  }

  function download(targets: DriveFile[]) {
    onDownload(targets)
    setMessage(
      `Downloading ${targets.length === 1 ? targets[0].name : plural(targets.length)}`,
    )
  }

  async function share(file: DriveFile) {
    try {
      await onCopyLink(file)
      startTransition(() => setMessage(`Copied a link to ${file.name}`))
    } catch {
      startTransition(() => setMessage(`Couldn't copy a link to ${file.name}`))
    }
  }

  const actionsFor = (file: DriveFile): FileAction[] => [
    { icon: downloadIcon, label: 'Download', onSelect: () => download([file]) },
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
      onSelect: () => void share(file),
    },
    {
      icon: deleteIcon,
      label: 'Delete',
      onSelect: () => void remove([file]),
      variant: 'destructive',
    },
  ]

  const table = useDataTable({
    columns,
    data: rows,
    getRowId: (row) => row.id,
    initialState: { sorting: [{ desc: true, id: 'modified' }] },
  })
  const selected = table.getSelectedRowModel().rows.map((row) => row.original)
  const shownDescription = description ?? summarize(rows)

  return (
    <BlockStateProvider state={getBlockState(status, files)}>
      <FileTable value={{ actionsFor, now, timeZone }}>
        <section className='@container/data-table flex flex-col gap-3'>
          <header className='flex flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <BlockReady className='text-sm'>
              <p className='text-muted-foreground text-sm'>{shownDescription}</p>
            </BlockReady>
          </header>
          <div className='flex min-h-9 flex-wrap items-center gap-2'>
            {selected.length > 0 ? (
              <DataTableSelectionBar className='w-full' table={table}>
                <Button variant='outline' size='sm' onClick={() => download(selected)}>
                  {downloadIcon}
                  Download
                </Button>
                <Button variant='outline' size='sm' onClick={() => void remove(selected)}>
                  {deleteIcon}
                  Delete
                </Button>
              </DataTableSelectionBar>
            ) : (
              <>
                <DataTableSearch table={table} placeholder='Search files…' />
                <DataTableFacetFilter
                  table={table}
                  columnId='kind'
                  options={KIND_OPTIONS.filter((option) =>
                    rows.some((row) => row.kind === option.value),
                  )}
                />
                <DataTableReset table={table} />
              </>
            )}
          </div>
          <DataTableContent caption={`${title}: ${shownDescription}`} table={table} />
          <p aria-live='polite' className='text-muted-foreground min-h-5 text-sm'>
            {message}
          </p>
        </section>
      </FileTable>
    </BlockStateProvider>
  )
}

export { Files2, exampleProps as files2ExampleProps, type DriveFile, type Files2Props }
