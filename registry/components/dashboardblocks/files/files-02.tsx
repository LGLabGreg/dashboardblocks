'use client'

import { ActivityTime } from '@/registry/components/dashboardblocks/activity-feed'
import {
  createDataTableColumnHelper,
  createDataTableSelectColumn,
  DataTableContent,
  DataTableFacetFilter,
  type DataTableFacetOption,
  DataTableReset,
  DataTableSearch,
  DataTableSelectionBar,
  DataTableSortMenu,
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
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { createContext, useContext, useState } from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface DriveFile {
  href: string
  id: string
  modified: Date
  name: string
  owner: string
  /** In bytes. */
  size: number
}

interface FileRow extends DriveFile {
  kind: FileKind
}

interface Files2Props {
  description: string
  files: DriveFile[]
  /** Pass a fixed date, so times render the same on the server and in the browser. */
  now: Date
  /** Copies a link to the file. Defaults to copying `href` to the clipboard. */
  onCopyLink?: (file: DriveFile) => Promise<void>
  /** Deletes the files. Resolve once they're gone. Defaults to a short wait. */
  onDelete?: (files: DriveFile[]) => Promise<void>
  /** Downloads the files. Defaults to doing nothing, as the example files don't exist. */
  onDownload?: (files: DriveFile[]) => void
  /** Time zone for dates. @default 'UTC' */
  timeZone?: string
  title: string
}

const exampleNow = new Date(Date.UTC(2026, 8, 26, 15, 30))
const hoursAgo = (hours: number) => new Date(exampleNow.getTime() - hours * 3_600_000)
const MB = 1024 * 1024

const exampleProps: Files2Props = {
  description: 'Marketing team drive',
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
    size: Math.round(size as number),
  })),
  now: exampleNow,
  title: 'Files',
}

async function copyLink(file: DriveFile) {
  await navigator.clipboard.writeText(new URL(file.href, window.location.href).href)
}

async function deleteFiles() {
  await new Promise((resolve) => setTimeout(resolve, 400))
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

const plural = (count: number) => `${count} ${count === 1 ? 'file' : 'files'}`

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
        <a
          href={row.original.href}
          className='truncate underline-offset-4 outline-none hover:underline focus-visible:underline'
        >
          {row.original.name}
        </a>
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
    cell: ({ getValue }) => (
      <span className='flex items-center gap-2 whitespace-nowrap'>
        <Avatar size='sm'>
          <AvatarFallback>{initials(getValue())}</AvatarFallback>
        </Avatar>
        {getValue()}
      </span>
    ),
    header: 'Owner',
  }),
  columnHelper.accessor((row) => row.modified.getTime(), {
    cell: ({ row }) => <ModifiedCell date={row.original.modified} />,
    enableGlobalFilter: false,
    header: 'Modified',
    id: 'modified',
    meta: { sortLabels: { asc: 'Oldest first', desc: 'Newest first' } },
    sortDescFirst: true,
  }),
  columnHelper.accessor('size', {
    cell: ({ getValue }) => formatFileSize(getValue()),
    enableGlobalFilter: false,
    header: 'Size',
    meta: { align: 'end' },
    sortDescFirst: true,
  }),
  columnHelper.display({
    cell: ({ row }) => <ActionsCell file={row.original} />,
    header: () => <span className='sr-only'>Actions</span>,
    id: 'actions',
    meta: {
      cellClassName:
        'w-px pl-0 @max-2xl/data-table:absolute @max-2xl/data-table:right-4.5 @max-2xl/data-table:bottom-3 @max-2xl/data-table:w-auto',
      headerClassName: 'w-px',
      hideLabelWhenStacked: true,
    },
  }),
])

const Files2 = (props: Files2Props) => {
  const {
    description,
    files,
    now,
    onCopyLink = copyLink,
    onDelete = deleteFiles,
    onDownload = () => {},
    timeZone = 'UTC',
    title,
  } = props
  const [rows, setRows] = useState<FileRow[]>(() =>
    files.map((file) => ({ ...file, kind: getFileKind(file.name) })),
  )
  const [message, setMessage] = useState('')

  async function remove(targets: DriveFile[]) {
    const ids = new Set(targets.map((file) => file.id))
    setMessage(
      `Deleting ${targets.length === 1 ? targets[0].name : plural(targets.length)}…`,
    )
    await onDelete(targets)
    setRows((current) => current.filter((row) => !ids.has(row.id)))
    table.setRowSelection((current) =>
      Object.fromEntries(Object.entries(current).filter(([id]) => !ids.has(id))),
    )
    setMessage(
      `Deleted ${targets.length === 1 ? targets[0].name : plural(targets.length)}`,
    )
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
      setMessage(`Copied a link to ${file.name}`)
    } catch {
      setMessage(`Couldn't copy a link to ${file.name}`)
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
  const total = rows.reduce((sum, row) => sum + row.size, 0)

  return (
    <FileTable value={{ actionsFor, now, timeZone }}>
      <Card className='@container/data-table gap-0 pb-0'>
        <CardHeader className='border-b'>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <div className='flex min-h-15 flex-wrap items-center gap-2 border-b px-6 py-3'>
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
                column={table.getColumn('kind')}
                options={KIND_OPTIONS.filter((option) =>
                  rows.some((row) => row.kind === option.value),
                )}
              />
              <DataTableReset table={table} />
              <DataTableSortMenu
                className='ml-auto @2xl/data-table:hidden'
                table={table}
              />
            </>
          )}
        </div>
        <DataTableContent caption={`${title}: ${description}`} table={table} />
        <div className='text-muted-foreground flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t px-6 py-3 text-xs'>
          <span className='tabular-nums'>
            {plural(rows.length)} · {formatFileSize(total)}
          </span>
          <span aria-live='polite'>{message}</span>
        </div>
      </Card>
    </FileTable>
  )
}

export { Files2, exampleProps as files2ExampleProps, type DriveFile, type Files2Props }
