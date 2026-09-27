'use client'

import {
  type FileAction,
  FileActionsMenu,
  FileKindIcon,
  type FileKind,
  fileKindConfig,
  formatFileSize,
} from '@/registry/components/dashboardblocks/files'
import { SegmentedProgressBar } from '@/registry/components/dashboardblocks/progress-bar'
import {
  UsageMeterLimit,
  UsageMeterValue,
  UsageStatusBadge,
  getUsageStatus,
} from '@/registry/components/dashboardblocks/usage-meter'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { useId, useState } from 'react'

import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { cn } from '@/lib/utils'

interface StorageFile {
  href: string
  id: string
  kind: FileKind
  /** Where it lives, such as the folder. */
  location: string
  name: string
  /** In bytes. */
  size: number
}

interface StorageKind {
  kind: FileKind
  /** Defaults to the kind's label. */
  label?: string
  /** In bytes, including `largestFiles` of this kind. */
  size: number
}

interface Files3Props {
  /** Storage used by kind, largest first. */
  breakdown: StorageKind[]
  /** The biggest files, largest first, to free up space. */
  largestFiles: StorageFile[]
  /** In bytes. */
  limit: number
  /** Deletes a file. Resolve once it's gone. Defaults to a short wait. */
  onDelete?: (file: StorageFile) => Promise<void>
  plan: string
  title: string
  /** In the footer, until an action has news. */
  upgradeHint: string
  upgradeHref: string
}

const GB = 1024 ** 3
const MB = 1024 ** 2

const exampleProps: Files3Props = {
  breakdown: [
    { kind: 'video', label: 'Videos', size: 38.2 * GB },
    { kind: 'image', label: 'Images', size: 21.7 * GB },
    { kind: 'document', label: 'Documents', size: 11.4 * GB },
    { kind: 'archive', label: 'Archives', size: 7.9 * GB },
    { kind: 'other', label: 'Other', size: 3.4 * GB },
  ],
  largestFiles: [
    {
      href: '#',
      id: 'keynote-recording',
      kind: 'video',
      location: 'Events / Summit 2026',
      name: 'Summit keynote full recording.mov',
      size: 6.2 * GB,
    },
    {
      href: '#',
      id: 'photo-archive',
      kind: 'archive',
      location: 'Brand / Photography',
      name: 'Product shoot RAW archive.zip',
      size: 3.8 * GB,
    },
    {
      href: '#',
      id: 'teaser-master',
      kind: 'video',
      location: 'Campaigns / Fall launch',
      name: 'Launch teaser 4K master.mp4',
      size: 2.1 * GB,
    },
    {
      href: '#',
      id: 'print-catalog',
      kind: 'pdf',
      location: 'Sales / Print',
      name: 'Spring catalog print-ready.pdf',
      size: 846 * MB,
    },
  ],
  limit: 100 * GB,
  plan: 'Team plan',
  title: 'Storage',
  upgradeHint: 'Need more room? Business has 1 TB per workspace.',
  upgradeHref: '#',
}

async function deleteFile() {
  await new Promise((resolve) => setTimeout(resolve, 400))
}

/** Rolls kinds without their own row, such as PDF, into the closest one shown. */
function breakdownKind(kind: FileKind, shown: FileKind[]): FileKind {
  if (shown.includes(kind)) return kind
  const family: Partial<Record<FileKind, FileKind>> = {
    pdf: 'document',
    presentation: 'document',
    spreadsheet: 'document',
  }
  const parent = family[kind]
  return parent && shown.includes(parent) ? parent : 'other'
}

const Files3 = (props: Files3Props) => {
  const {
    breakdown: initialBreakdown,
    largestFiles: initialFiles,
    limit,
    onDelete = deleteFile,
    plan,
    title,
    upgradeHint,
    upgradeHref,
  } = props
  const headingId = useId()
  const [breakdown, setBreakdown] = useState(initialBreakdown)
  const [files, setFiles] = useState(initialFiles)
  const [message, setMessage] = useState('')

  const used = breakdown.reduce((sum, item) => sum + item.size, 0)
  const status = getUsageStatus(used, limit)

  async function remove(file: StorageFile) {
    setMessage(`Deleting ${file.name}…`)
    await onDelete(file)
    const kind = breakdownKind(
      file.kind,
      breakdown.map((item) => item.kind),
    )
    setFiles((current) => current.filter((item) => item.id !== file.id))
    setBreakdown((current) =>
      current.map((item) =>
        item.kind === kind ? { ...item, size: Math.max(0, item.size - file.size) } : item,
      ),
    )
    setMessage(`Deleted ${file.name}, freeing ${formatFileSize(file.size)}`)
  }

  const actionsFor = (file: StorageFile): FileAction[] => [
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
      onSelect: () => setMessage(`Downloading ${file.name}`),
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
      onSelect: () => void remove(file),
      variant: 'destructive',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {plan} · {formatFileSize(Math.max(0, limit - used))} free
        </CardDescription>
        <CardAction>
          <UsageStatusBadge status={status} />
        </CardAction>
      </CardHeader>
      <CardContent className='@container/storage flex flex-col gap-6'>
        <div className='flex flex-col gap-3'>
          <div className='flex items-baseline justify-between gap-2'>
            <UsageMeterValue>{formatFileSize(used)}</UsageMeterValue>
            <UsageMeterLimit>of {formatFileSize(limit)}</UsageMeterLimit>
          </div>
          <div aria-hidden>
            <SegmentedProgressBar
              className='h-2.5 gap-0.5'
              segments={breakdown.map((item) => ({
                color: fileKindConfig[item.kind].color,
                label: item.kind,
                value: item.size,
              }))}
              total={limit}
            />
          </div>
          <ul className='grid gap-x-4 gap-y-1.5 text-xs @xs/storage:grid-cols-2'>
            {breakdown.map((item) => (
              <li key={item.kind} className='flex min-w-0 items-center gap-2'>
                <span
                  aria-hidden
                  className='size-2.5 shrink-0 rounded-[3px]'
                  style={{ backgroundColor: fileKindConfig[item.kind].color }}
                />
                <span className='text-muted-foreground truncate'>
                  {item.label ?? fileKindConfig[item.kind].label}
                </span>
                <span className='ml-auto font-medium tabular-nums'>
                  {formatFileSize(item.size)}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <section aria-labelledby={headingId} className='flex flex-col gap-1'>
          <h3 id={headingId} className='text-sm font-medium'>
            Largest files
          </h3>
          {files.length > 0 ? (
            <ul className='-mx-2 flex flex-col'>
              {files.map((file) => (
                <li
                  key={file.id}
                  className='hover:bg-muted/50 focus-within:bg-muted/50 flex items-center gap-3 rounded-md px-2 py-2 transition-colors'
                >
                  <FileKindIcon kind={file.kind} size='sm' />
                  <div className='flex min-w-0 flex-1 flex-col'>
                    <a
                      href={file.href}
                      className='truncate text-sm underline-offset-4 outline-none hover:underline focus-visible:underline'
                    >
                      {file.name}
                    </a>
                    <span className='text-muted-foreground truncate text-xs'>
                      <span className='tabular-nums @sm/storage:hidden'>
                        {formatFileSize(file.size)} ·{' '}
                      </span>
                      {file.location}
                    </span>
                  </div>
                  <span className='hidden text-sm tabular-nums @sm/storage:inline'>
                    {formatFileSize(file.size)}
                  </span>
                  <FileActionsMenu
                    actions={actionsFor(file)}
                    label={`Actions for ${file.name}`}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-muted-foreground py-2 text-sm'>
              No large files left to review.
            </p>
          )}
        </section>
      </CardContent>
      <CardFooter className='flex flex-wrap items-center justify-between gap-3'>
        <p aria-live='polite' className='text-muted-foreground min-w-48 flex-1 text-xs'>
          {message || upgradeHint}
        </p>
        <a href={upgradeHref} className={cn(buttonVariants({ size: 'sm' }))}>
          Upgrade storage
        </a>
      </CardFooter>
    </Card>
  )
}

export {
  Files3,
  exampleProps as files3ExampleProps,
  type Files3Props,
  type StorageFile,
  type StorageKind,
}
