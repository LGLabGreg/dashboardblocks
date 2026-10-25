'use client'

import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/registry/components/dashboardblocks/block-state'
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
  UsageStatusLabel,
  getUsageStatus,
} from '@/registry/components/dashboardblocks/usage-meter'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatPercent } from '@/registry/lib/dashboardblocks/format'
import { startTransition, useId, useMemo, useRef, useState } from 'react'

import { buttonVariants } from '@/components/ui/button'

import { cn } from '@/lib/utils'

interface StorageFile {
  href: string
  id: string
  kind: FileKind
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

interface Files3Props extends BlockStateProps {
  /** Storage used by kind, largest first. Leave out, or pass none, to show the empty state. */
  breakdown?: StorageKind[]
  /** The biggest files, largest first, to free up space. */
  largestFiles?: StorageFile[]
  /** In bytes. */
  limit: number
  onDelete?: (file: StorageFile) => Promise<void>
  plan: string
  title: string
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

const noKinds: StorageKind[] = []
const noFiles: StorageFile[] = []

const KIND_COLORS = [
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
  'var(--color-chart-1)',
]

function getKindColors(breakdown: StorageKind[]) {
  let next = 0
  return breakdown.map((item) =>
    item.kind === 'other'
      ? 'var(--color-muted-foreground)'
      : KIND_COLORS[next++ % KIND_COLORS.length],
  )
}

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
    breakdown: storedBreakdown = noKinds,
    largestFiles = noFiles,
    limit,
    onDelete = deleteFile,
    plan,
    errorMessage,
    status,
    title,
    upgradeHint,
    upgradeHref,
  } = props
  const headingId = useId()
  const [deleted, setDeleted] = useState<ReadonlySet<string>>(() => new Set())
  const [message, setMessage] = useState('')
  const deleting = useRef(new Set<string>())
  const state = getBlockState(status, storedBreakdown)

  const files = useMemo(
    () => largestFiles.filter((file) => !deleted.has(file.id)),
    [deleted, largestFiles],
  )
  const breakdown = useMemo(() => {
    const kinds = storedBreakdown.map((item) => item.kind)
    const freed = new Map<FileKind, number>()
    for (const file of largestFiles) {
      if (!deleted.has(file.id)) continue
      const kind = breakdownKind(file.kind, kinds)
      freed.set(kind, (freed.get(kind) ?? 0) + file.size)
    }
    return storedBreakdown.map((item) => ({
      ...item,
      size: Math.max(0, item.size - (freed.get(item.kind) ?? 0)),
    }))
  }, [deleted, largestFiles, storedBreakdown])

  const used = breakdown.reduce((sum, item) => sum + item.size, 0)
  const free = Math.max(0, limit - used)
  const kindColors = getKindColors(breakdown)
  const usage = getUsageStatus(used, limit)
  const largest = breakdown.reduce<StorageKind | undefined>(
    (top, item) => (top && top.size >= item.size ? top : item),
    undefined,
  )
  const labelOf = (item: StorageKind) => item.label ?? fileKindConfig[item.kind].label
  const reclaimable = files.reduce((sum, file) => sum + file.size, 0)

  async function remove(file: StorageFile) {
    if (deleting.current.has(file.id)) return
    deleting.current.add(file.id)
    setMessage(`Deleting ${file.name}…`)
    try {
      await onDelete(file)
    } finally {
      deleting.current.delete(file.id)
    }
    startTransition(() => {
      setDeleted((current) => new Set([...current, file.id]))
      setMessage(`Deleted ${file.name}, freeing ${formatFileSize(file.size)}`)
    })
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
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <section className='@container flex flex-col gap-4'>
        <header className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <BlockReady className='text-sm'>
              <p className='text-muted-foreground text-sm'>
                {largest ? (
                  <>
                    {labelOf(largest)} use the most space, and{' '}
                    <span className='tabular-nums'>{formatFileSize(free)}</span> of the{' '}
                    {plan} is free.
                  </>
                ) : (
                  `Nothing stored on the ${plan} yet.`
                )}
              </p>
            </BlockReady>
          </div>
          <UsageStatusLabel className='mt-0.5' status={usage} />
        </header>
        <div className='flex flex-col gap-3 border-t pt-4'>
          <div className='flex flex-wrap items-baseline gap-x-2'>
            <UsageMeterValue>{formatFileSize(used)}</UsageMeterValue>
            <UsageMeterLimit>of {formatFileSize(limit)}</UsageMeterLimit>
          </div>
          <div aria-hidden>
            <SegmentedProgressBar
              className='h-2.5 gap-0.5'
              segments={breakdown.map((item, index) => ({
                color: kindColors[index],
                label: item.kind,
                value: item.size,
              }))}
              total={Math.max(limit, used)}
            />
          </div>
          {state === 'loading' && <BlockStateRows rows={4} />}
          {!state && (
            <ul className='grid gap-x-6 text-sm @sm:grid-cols-2'>
              {breakdown.map((item, index) => (
                <li
                  key={item.kind}
                  className='flex min-w-0 items-center gap-2 border-b py-2'
                >
                  <span
                    aria-hidden
                    className='size-2.5 shrink-0 rounded-[3px]'
                    style={{ backgroundColor: kindColors[index] }}
                  />
                  <span className='text-muted-foreground truncate'>{labelOf(item)}</span>
                  <span className='ml-auto font-medium tabular-nums'>
                    {formatFileSize(item.size)}
                  </span>
                  <span className='text-muted-foreground w-9 text-right text-xs tabular-nums'>
                    {formatPercent(limit > 0 ? item.size / limit : 0, {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {(state === undefined || state === 'loading') && (
          <section aria-labelledby={headingId} className='flex flex-col gap-1'>
            <div className='flex flex-col gap-0.5'>
              <h3 id={headingId} className='text-sm font-medium'>
                Largest files
              </h3>
              {!state && files.length > 0 && (
                <p className='text-muted-foreground text-sm'>
                  Deleting these {files.length === 1 ? 'file' : `${files.length} files`}{' '}
                  would free{' '}
                  <span className='tabular-nums'>{formatFileSize(reclaimable)}</span>.
                </p>
              )}
            </div>
            {state === 'loading' ? (
              <BlockStateRows className='mt-1 border-t' rows={4} />
            ) : files.length > 0 ? (
              <ul className='mt-1 flex flex-col border-t'>
                {files.map((file) => (
                  <li key={file.id} className='flex items-center gap-3 border-b py-2.5'>
                    <FileKindIcon kind={file.kind} size='sm' />
                    <div className='flex min-w-0 flex-1 flex-col'>
                      <a
                        href={file.href}
                        className='truncate text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:underline'
                      >
                        {file.name}
                      </a>
                      <span className='text-muted-foreground truncate text-sm'>
                        {file.location}
                      </span>
                    </div>
                    <span className='text-sm tabular-nums'>
                      {formatFileSize(file.size)}
                    </span>
                    <FileActionsMenu
                      actions={actionsFor(file)}
                      label={`Actions for ${file.name}`}
                      className='-mr-2'
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-muted-foreground border-t py-2.5 text-sm'>
                No large files left to review.
              </p>
            )}
          </section>
        )}
        <footer className='flex flex-wrap items-center justify-between gap-3'>
          <p aria-live='polite' className='text-muted-foreground min-w-48 flex-1 text-sm'>
            {message || upgradeHint}
          </p>
          <a href={upgradeHref} className={cn(buttonVariants({ size: 'sm' }))}>
            Upgrade storage
          </a>
        </footer>
      </section>
    </BlockStateProvider>
  )
}

export {
  Files3,
  exampleProps as files3ExampleProps,
  type Files3Props,
  type StorageFile,
  type StorageKind,
}
