// Override of registry/components/dashboardblocks/files.tsx for React Aria
// source-hash: aeb738a91811

'use client'

import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import {
  type ChangeEvent,
  type DragEvent,
  Fragment,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { cn } from '@/lib/utils'

type FileKind =
  | 'archive'
  | 'audio'
  | 'code'
  | 'document'
  | 'folder'
  | 'image'
  | 'other'
  | 'pdf'
  | 'presentation'
  | 'spreadsheet'
  | 'video'

const EXTENSION_KINDS: Record<string, FileKind> = {
  '7z': 'archive',
  aac: 'audio',
  avi: 'video',
  avif: 'image',
  bmp: 'image',
  bz2: 'archive',
  c: 'code',
  cpp: 'code',
  css: 'code',
  csv: 'spreadsheet',
  doc: 'document',
  docx: 'document',
  flac: 'audio',
  gif: 'image',
  go: 'code',
  gz: 'archive',
  heic: 'image',
  html: 'code',
  java: 'code',
  jpeg: 'image',
  jpg: 'image',
  js: 'code',
  json: 'code',
  jsx: 'code',
  key: 'presentation',
  m4a: 'audio',
  m4v: 'video',
  md: 'document',
  mkv: 'video',
  mov: 'video',
  mp3: 'audio',
  mp4: 'video',
  numbers: 'spreadsheet',
  odp: 'presentation',
  ods: 'spreadsheet',
  odt: 'document',
  ogg: 'audio',
  pages: 'document',
  pdf: 'pdf',
  php: 'code',
  png: 'image',
  ppt: 'presentation',
  pptx: 'presentation',
  py: 'code',
  rar: 'archive',
  rb: 'code',
  rs: 'code',
  rtf: 'document',
  sh: 'code',
  sql: 'code',
  svg: 'image',
  swift: 'code',
  tar: 'archive',
  tgz: 'archive',
  tif: 'image',
  tiff: 'image',
  ts: 'code',
  tsv: 'spreadsheet',
  tsx: 'code',
  txt: 'document',
  wav: 'audio',
  webm: 'video',
  webp: 'image',
  xls: 'spreadsheet',
  xlsx: 'spreadsheet',
  xml: 'code',
  yaml: 'code',
  yml: 'code',
  zip: 'archive',
}

const MIME_KINDS: [RegExp, FileKind][] = [
  [/^image\//, 'image'],
  [/^video\//, 'video'],
  [/^audio\//, 'audio'],
  [/^application\/pdf$/, 'pdf'],
  [/spreadsheet|ms-excel|^text\/(csv|tab-separated-values)$/, 'spreadsheet'],
  [/presentation|ms-powerpoint/, 'presentation'],
  [/zip|compressed|x-tar|x-rar|gzip|x-7z/, 'archive'],
  [/json|javascript|typescript|^text\/(html|css|xml)$|^application\/xml$/, 'code'],
  [/wordprocessing|msword|opendocument\.text|^text\//, 'document'],
]

/**
 * The kind of a file from its name, then its MIME type: `getFileKind('Q3.xlsx')`,
 * `getFileKind('scan', 'application/pdf')` or `getFileKind('image/png')`.
 * A name ending in "/" is a folder.
 */
function getFileKind(name: string, type?: string): FileKind {
  if (name.endsWith('/')) return 'folder'
  const dot = name.lastIndexOf('.')
  const extension = dot > 0 ? name.slice(dot + 1).toLowerCase() : ''
  if (Object.hasOwn(EXTENSION_KINDS, extension)) return EXTENSION_KINDS[extension]
  const mime = (type || name).toLowerCase()
  return MIME_KINDS.find(([pattern]) => pattern.test(mime))?.[1] ?? 'other'
}

interface FileKindConfig {
  /** CSS colour for bars and legends. */
  color: string
  icon: ReactNode
  label: string
  /** Tinted background with readable text, for icons. */
  soft: string
}

/** An icon, a label and a tint per kind. Kind colours only tell kinds apart: say the kind in text too. */
const fileKindConfig: Record<FileKind, FileKindConfig> = {
  archive: {
    color: 'var(--color-amber-500)',
    icon: (
      <IconPlaceholder
        lucide='FileArchiveIcon'
        tabler='IconFileZip'
        hugeicons='FileZipIcon'
        phosphor='FileZipIcon'
        remixicon='RiFileZipLine'
      />
    ),
    label: 'Archive',
    soft: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  },
  audio: {
    color: 'var(--color-indigo-500)',
    icon: (
      <IconPlaceholder
        lucide='FileMusicIcon'
        tabler='IconFileMusic'
        hugeicons='FileAudioIcon'
        phosphor='FileAudioIcon'
        remixicon='RiFileMusicLine'
      />
    ),
    label: 'Audio',
    soft: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
  },
  code: {
    color: 'var(--color-cyan-500)',
    icon: (
      <IconPlaceholder
        lucide='FileCodeIcon'
        tabler='IconFileCode'
        hugeicons='FileCodeIcon'
        phosphor='FileCodeIcon'
        remixicon='RiFileCodeLine'
      />
    ),
    label: 'Code',
    soft: 'bg-cyan-500/10 text-cyan-800 dark:text-cyan-300',
  },
  document: {
    color: 'var(--color-blue-500)',
    icon: (
      <IconPlaceholder
        lucide='FileTextIcon'
        tabler='IconFileText'
        hugeicons='File02Icon'
        phosphor='FileTextIcon'
        remixicon='RiFileTextLine'
      />
    ),
    label: 'Document',
    soft: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  },
  folder: {
    color: 'var(--color-sky-500)',
    icon: (
      <IconPlaceholder
        lucide='FolderIcon'
        tabler='IconFolder'
        hugeicons='Folder01Icon'
        phosphor='FolderIcon'
        remixicon='RiFolderLine'
      />
    ),
    label: 'Folder',
    soft: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
  },
  image: {
    color: 'var(--color-violet-500)',
    icon: (
      <IconPlaceholder
        lucide='FileImageIcon'
        tabler='IconPhoto'
        hugeicons='Image01Icon'
        phosphor='FileImageIcon'
        remixicon='RiFileImageLine'
      />
    ),
    label: 'Image',
    soft: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
  },
  other: {
    color: 'var(--muted-foreground)',
    icon: (
      <IconPlaceholder
        lucide='FileIcon'
        tabler='IconFile'
        hugeicons='File01Icon'
        phosphor='FileIcon'
        remixicon='RiFileLine'
      />
    ),
    label: 'File',
    soft: 'bg-muted text-muted-foreground',
  },
  pdf: {
    color: 'var(--color-red-500)',
    icon: (
      <IconPlaceholder
        lucide='FileTextIcon'
        tabler='IconFileTypePdf'
        hugeicons='Pdf01Icon'
        phosphor='FilePdfIcon'
        remixicon='RiFilePdf2Line'
      />
    ),
    label: 'PDF',
    soft: 'bg-red-500/10 text-red-700 dark:text-red-400',
  },
  presentation: {
    color: 'var(--color-orange-500)',
    icon: (
      <IconPlaceholder
        lucide='PresentationIcon'
        tabler='IconPresentation'
        hugeicons='Ppt01Icon'
        phosphor='FilePptIcon'
        remixicon='RiFilePpt2Line'
      />
    ),
    label: 'Presentation',
    soft: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  },
  spreadsheet: {
    color: 'var(--color-emerald-500)',
    icon: (
      <IconPlaceholder
        lucide='FileSpreadsheetIcon'
        tabler='IconFileSpreadsheet'
        hugeicons='Xls01Icon'
        phosphor='FileXlsIcon'
        remixicon='RiFileExcel2Line'
      />
    ),
    label: 'Spreadsheet',
    soft: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  },
  video: {
    color: 'var(--color-pink-500)',
    icon: (
      <IconPlaceholder
        lucide='FileVideoCameraIcon'
        tabler='IconMovie'
        hugeicons='Video01Icon'
        phosphor='FileVideoIcon'
        remixicon='RiFileVideoLine'
      />
    ),
    label: 'Video',
    soft: 'bg-pink-500/10 text-pink-700 dark:text-pink-300',
  },
}

const fileIconSizes = {
  lg: 'size-12 rounded-lg [&_svg]:size-6',
  md: 'size-10 rounded-md [&_svg]:size-5',
  sm: 'size-8 rounded-md [&_svg]:size-4',
}

interface FileKindIconProps {
  className?: string
  /** Leave out to work it out from `name` and `type`. */
  kind?: FileKind
  name?: string
  /** @default 'md' */
  size?: keyof typeof fileIconSizes
  /** The MIME type, for names without a known extension. */
  type?: string
}

/** The icon for a kind of file in a tinted square. Decorative: show the name beside it. */
function FileKindIcon({
  className,
  kind,
  name = '',
  size = 'md',
  type,
}: FileKindIconProps) {
  const config = fileKindConfig[kind ?? getFileKind(name, type)]
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center',
        fileIconSizes[size],
        config.soft,
        className,
      )}
    >
      {config.icon}
    </span>
  )
}

const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB']
const sizeFormatters = [0, 1].map(
  (digits) => new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }),
)

/**
 * "0 B", "940 KB", "2.4 MB", "1.2 GB", in steps of 1,024 as browsers and
 * operating systems count. In en-US, so the server and the browser render the same.
 */
function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  let exponent = Math.min(
    FILE_SIZE_UNITS.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  )
  let value = bytes / 1024 ** exponent
  if (Math.round(value) >= 1024 && exponent < FILE_SIZE_UNITS.length - 1) {
    exponent += 1
    value /= 1024
  }
  const formatter = sizeFormatters[exponent > 0 && value < 100 ? 1 : 0]
  return `${formatter.format(value)} ${FILE_SIZE_UNITS[exponent]}`
}

type FileRejectionReason = 'count' | 'size' | 'type'

interface FileRejection {
  file: File
  /** Says why, ready to show: "Larger than 25 MB". */
  message: string
  reason: FileRejectionReason
}

interface FileRules {
  /** As in an input's `accept`: extensions and MIME types, such as ".pdf,image/*". */
  accept?: string
  /** Most files in one selection. The rest are rejected. */
  maxFiles?: number
  /** Largest file in bytes. */
  maxSize?: number
}

/** Whether a file matches an `accept` list of extensions and MIME types. An empty list accepts all. */
function matchesAccept(file: Pick<File, 'name' | 'type'>, accept?: string) {
  const tokens = (accept ?? '')
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
  if (tokens.length === 0) return true
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return tokens.some((token) => {
    if (token.startsWith('.')) return name.endsWith(token)
    if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1))
    return type === token
  })
}

/** Splits files into those that pass the rules and those that don't, with why. */
function validateFiles(files: File[], { accept, maxFiles, maxSize }: FileRules = {}) {
  const accepted: File[] = []
  const rejected: FileRejection[] = []
  for (const file of files) {
    if (!matchesAccept(file, accept)) {
      rejected.push({
        file,
        message: 'File type not accepted',
        reason: 'type',
      })
    } else if (maxSize !== undefined && file.size > maxSize) {
      rejected.push({
        file,
        message: `Larger than ${formatFileSize(maxSize)}`,
        reason: 'size',
      })
    } else if (maxFiles !== undefined && accepted.length >= maxFiles) {
      rejected.push({
        file,
        message: `Over the limit of ${maxFiles} ${maxFiles === 1 ? 'file' : 'files'}`,
        reason: 'count',
      })
    } else {
      accepted.push(file)
    }
  }
  return { accepted, rejected }
}

interface FileDropzoneProps extends FileRules {
  className?: string
  disabled?: boolean
  /** Text under the title, such as the accepted types and the size limit. */
  hint?: ReactNode
  /** Replaces the upload icon. */
  icon?: ReactNode
  /** @default true */
  multiple?: boolean
  /** The input's name, to submit the files with a form. */
  name?: string
  /** Called with the files that pass the rules and those that don't. */
  onFiles: (accepted: File[], rejected: FileRejection[]) => void
  /** @default 'Drop files here or browse' */
  title?: ReactNode
}

/**
 * A drop target around a real file input. Click or tap it, or focus it and
 * press Enter or Space, to open the file picker; drag files onto it to add them.
 */
function FileDropzone({
  accept,
  className,
  disabled = false,
  hint,
  icon,
  maxFiles,
  maxSize,
  multiple = true,
  name,
  onFiles,
  title,
}: FileDropzoneProps) {
  const [dragging, setDragging] = useState(false)
  const depth = useRef(0)

  const receive = (list: FileList | null) => {
    const files = Array.from(list ?? [])
    if (files.length === 0) return
    const { accepted, rejected } = validateFiles(multiple ? files : files.slice(0, 1), {
      accept,
      maxFiles: multiple ? maxFiles : 1,
      maxSize,
    })
    onFiles(accepted, rejected)
  }

  const onDragEnter = (event: DragEvent<HTMLLabelElement>) => {
    if (disabled || !event.dataTransfer.types.includes('Files')) return
    event.preventDefault()
    depth.current += 1
    setDragging(true)
  }

  const onDragOver = (event: DragEvent<HTMLLabelElement>) => {
    if (disabled || !event.dataTransfer.types.includes('Files')) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  const onDragLeave = () => {
    depth.current = Math.max(0, depth.current - 1)
    if (depth.current === 0) setDragging(false)
  }

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    depth.current = 0
    setDragging(false)
    if (!disabled) receive(event.dataTransfer.files)
  }

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    receive(event.target.files)
    // Lets the same file be picked again, such as after removing it.
    event.target.value = ''
  }

  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- dropping is the mouse path; the input inside is the keyboard one
    <label
      data-dragging={dragging || undefined}
      data-disabled={disabled || undefined}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        'border-input hover:bg-muted/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 data-dragging:border-primary data-dragging:bg-primary/5 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-8 text-center transition-colors has-focus-visible:ring-3 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:hover:bg-transparent',
        className,
      )}
    >
      <input
        type='file'
        name={name}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={onChange}
        className='sr-only'
      />
      <span
        aria-hidden
        className='bg-muted text-muted-foreground in-data-dragging:bg-primary in-data-dragging:text-primary-foreground flex size-10 items-center justify-center rounded-full transition-colors [&_svg]:size-5'
      >
        {icon ?? (
          <IconPlaceholder
            lucide='CloudUploadIcon'
            tabler='IconCloudUpload'
            hugeicons='CloudUploadIcon'
            phosphor='CloudArrowUpIcon'
            remixicon='RiUploadCloud2Line'
          />
        )}
      </span>
      <span className='flex flex-col gap-1'>
        <span className='text-sm font-medium'>
          {title ?? (
            <>
              Drop files here or{' '}
              <span className='text-primary underline underline-offset-4'>browse</span>
            </>
          )}
        </span>
        {hint && <span className='text-muted-foreground text-xs'>{hint}</span>}
      </span>
    </label>
  )
}

type UploadStatus = 'canceled' | 'done' | 'error' | 'queued' | 'uploading'

interface FileUpload {
  /** Why the upload failed or the file was rejected. */
  error?: string
  /** The file to send. Uploads without one, such as earlier ones, can't be retried. */
  file?: File
  id: string
  name: string
  /** From 0 to 1. */
  progress: number
  /** Rejected by the dropzone's rules, so retrying won't help. */
  rejected?: boolean
  /** In bytes. */
  size: number
  status: UploadStatus
  /** The MIME type. */
  type: string
  /** Where the file lives once uploaded, when `upload` returns one. */
  url?: string
}

interface UploadOptions {
  /** Report progress from 0 to 1. */
  onProgress: (progress: number) => void
  /** Aborts when the upload is canceled or removed. Pass it to `fetch` or listen to it. */
  signal: AbortSignal
}

/** Sends one file. Resolve when it's stored, or reject with an `Error` whose message says why not. */
type UploadFn = (file: File, options: UploadOptions) => Promise<void | { url?: string }>

interface UseFileUploadsOptions {
  /** Uploads at a time. The rest wait their turn. @default 3 */
  concurrency?: number
  /** Uploads to start with, such as files already attached. */
  initialUploads?: FileUpload[]
  upload: UploadFn
}

function patchUpload(uploads: FileUpload[], id: string, changes: Partial<FileUpload>) {
  return uploads.map((item) => (item.id === id ? { ...item, ...changes } : item))
}

/**
 * Queues files and uploads them with your `upload` function, a few at a time,
 * tracking each one's status and progress. Canceling or removing an upload
 * aborts its signal. Pass `add` straight to `FileDropzone`'s `onFiles`.
 */
function useFileUploads({
  concurrency = 3,
  initialUploads = [],
  upload,
}: UseFileUploadsOptions) {
  const prefix = useId()
  const nextId = useRef(0)
  const [uploads, setUploads] = useState<FileUpload[]>(initialUploads)
  const controllers = useRef(new Map<string, AbortController>())
  const uploadRef = useRef(upload)

  useEffect(() => {
    uploadRef.current = upload
  }, [upload])

  useEffect(() => {
    const running = controllers.current
    return () => {
      for (const controller of running.values()) controller.abort()
      running.clear()
    }
  }, [])

  useEffect(() => {
    const running = controllers.current
    const room = concurrency - running.size
    const next = uploads
      .filter((item) => item.status === 'queued' && item.file && !running.has(item.id))
      .slice(0, Math.max(0, room))
    for (const item of next) {
      const controller = new AbortController()
      const { signal } = controller
      running.set(item.id, controller)
      const update = (changes: Partial<FileUpload>) => {
        if (!signal.aborted)
          setUploads((current) => patchUpload(current, item.id, changes))
      }
      const finish = (changes: Partial<FileUpload>) => {
        if (running.get(item.id) === controller) running.delete(item.id)
        update(changes)
      }
      update({ error: undefined, progress: 0, status: 'uploading' })
      uploadRef
        .current(item.file as File, {
          onProgress: (progress) =>
            update({ progress: Math.min(1, Math.max(0, progress)) }),
          signal,
        })
        .then((result) => finish({ progress: 1, status: 'done', url: result?.url }))
        .catch((error: unknown) =>
          finish({
            error: error instanceof Error ? error.message : 'Upload failed',
            status: 'error',
          }),
        )
    }
  }, [concurrency, uploads])

  const stop = (id: string) => {
    controllers.current.get(id)?.abort()
    controllers.current.delete(id)
  }

  /** Queues the accepted files and lists the rejected ones with why. */
  const add = (files: File[], rejected: FileRejection[] = []) => {
    const created = (file: File): Omit<FileUpload, 'progress' | 'status'> => ({
      file,
      id: `${prefix}${nextId.current++}`,
      name: file.name,
      size: file.size,
      type: file.type,
    })
    setUploads((current) => [
      ...current,
      ...files.map((file) => ({
        ...created(file),
        progress: 0,
        status: 'queued' as const,
      })),
      ...rejected.map(({ file, message }) => ({
        ...created(file),
        error: message,
        progress: 0,
        rejected: true,
        status: 'error' as const,
      })),
    ])
  }

  /** Stops an upload that's waiting or in progress. */
  const cancel = (id: string) => {
    stop(id)
    setUploads((current) =>
      current.map((item) =>
        item.id === id && (item.status === 'queued' || item.status === 'uploading')
          ? { ...item, status: 'canceled' }
          : item,
      ),
    )
  }

  /** Queues a failed or canceled upload again. */
  const retry = (id: string) => {
    setUploads((current) =>
      current.map((item) =>
        item.id === id && item.file && !item.rejected
          ? { ...item, error: undefined, progress: 0, status: 'queued' }
          : item,
      ),
    )
  }

  /** Takes an upload off the list, stopping it first. */
  const remove = (id: string) => {
    stop(id)
    setUploads((current) => current.filter((item) => item.id !== id))
  }

  /** Takes uploads with these statuses off the list. @default ['done'] */
  const clear = (statuses: UploadStatus[] = ['done']) => {
    setUploads((current) => current.filter((item) => !statuses.includes(item.status)))
  }

  return { add, cancel, clear, remove, retry, uploads }
}

/** Counts by status, and the share of bytes sent across uploads that are waiting, running or done. */
function summarizeUploads(uploads: FileUpload[]) {
  let active = 0
  let done = 0
  let failed = 0
  let sent = 0
  let total = 0
  for (const item of uploads) {
    if (item.status === 'queued' || item.status === 'uploading') active += 1
    if (item.status === 'done') done += 1
    if (item.status === 'error') failed += 1
    if (item.status === 'error' || item.status === 'canceled') continue
    sent += item.size * item.progress
    total += item.size
  }
  return { active, done, failed, progress: total > 0 ? sent / total : 0 }
}

const percentFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
  style: 'percent',
})

/** A thin progress bar for one upload, exposed as a `progressbar`. */
function FileUploadProgress({
  className,
  label,
  value,
}: {
  className?: string
  /** Names the bar for screen readers, such as "Uploading report.pdf". */
  label: string
  /** From 0 to 1. */
  value: number
}) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div
      role='progressbar'
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={cn('bg-muted h-1.5 w-full overflow-hidden rounded-full', className)}
    >
      <div
        className='bg-primary h-full rounded-full transition-[width] duration-200 ease-out motion-reduce:transition-none'
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

/** A list of uploads. */
function FileUploadList({
  children,
  className,
  label = 'Uploads',
}: {
  children: ReactNode
  className?: string
  /** @default 'Uploads' */
  label?: string
}) {
  return (
    <ul aria-label={label} className={cn('flex flex-col divide-y', className)}>
      {children}
    </ul>
  )
}

interface FileUploadItemProps {
  className?: string
  onCancel?: (id: string) => void
  onRemove?: (id: string) => void
  onRetry?: (id: string) => void
  upload: FileUpload
}

/**
 * One upload with its icon, name, status and progress, and buttons to
 * cancel it while it runs, and to retry or remove it after.
 */
function FileUploadItem({
  className,
  onCancel,
  onRemove,
  onRetry,
  upload,
}: FileUploadItemProps) {
  const { error, name, progress, size, status } = upload
  const running = status === 'queued' || status === 'uploading'
  const canRetry =
    (status === 'error' || status === 'canceled') && !!upload.file && !upload.rejected
  const actionsRef = useRef<HTMLDivElement>(null)
  const canceling = useRef(false)

  useEffect(() => {
    if (!canceling.current || running) return
    canceling.current = false
    actionsRef.current?.querySelector('button')?.focus()
  }, [running])

  return (
    <li
      data-status={status}
      className={cn('flex items-center gap-3 py-3 [&_svg]:shrink-0', className)}
    >
      <FileKindIcon name={name} type={upload.type} />
      <div className='flex min-w-0 flex-1 flex-col gap-1.5'>
        <div className='flex items-baseline justify-between gap-3'>
          <p className='truncate text-sm font-medium' title={name}>
            {name}
          </p>
          {status === 'uploading' && (
            <span className='text-muted-foreground text-xs tabular-nums'>
              {percentFormatter.format(progress)}
            </span>
          )}
        </div>
        {running && (
          <FileUploadProgress
            label={`Uploading ${name}`}
            value={status === 'queued' ? 0 : progress}
          />
        )}
        <p
          className={cn(
            'text-muted-foreground flex min-w-0 items-center gap-1 text-xs tabular-nums [&_svg]:size-3.5',
            status === 'error' && 'text-destructive',
          )}
        >
          {status === 'queued' && <>{formatFileSize(size)} · Waiting…</>}
          {status === 'uploading' && (
            <>
              {formatFileSize(size * progress)} of {formatFileSize(size)}
            </>
          )}
          {status === 'done' && (
            <>
              {formatFileSize(size)} ·
              <IconPlaceholder
                lucide='CircleCheckIcon'
                tabler='IconCircleCheck'
                hugeicons='CheckmarkCircle02Icon'
                phosphor='CheckCircleIcon'
                remixicon='RiCheckboxCircleLine'
                aria-hidden
                className='text-emerald-600 dark:text-emerald-400'
              />
              Uploaded
            </>
          )}
          {status === 'error' && (
            <>
              <IconPlaceholder
                lucide='CircleAlertIcon'
                tabler='IconAlertCircle'
                hugeicons='AlertCircleIcon'
                phosphor='WarningCircleIcon'
                remixicon='RiErrorWarningLine'
                aria-hidden
              />
              <span className='truncate'>{error ?? 'Upload failed'}</span>
            </>
          )}
          {status === 'canceled' && <>{formatFileSize(size)} · Canceled</>}
        </p>
      </div>
      <div ref={actionsRef} className='flex shrink-0 items-center'>
        {running && onCancel && (
          <Button
            variant='ghost'
            size='icon-sm'
            aria-label={`Cancel upload of ${name}`}
            onClick={() => {
              canceling.current = true
              onCancel(upload.id)
            }}
          >
            <IconPlaceholder
              lucide='XIcon'
              tabler='IconX'
              hugeicons='Cancel01Icon'
              phosphor='XIcon'
              remixicon='RiCloseLine'
            />
          </Button>
        )}
        {canRetry && onRetry && (
          <Button
            variant='ghost'
            size='icon-sm'
            aria-label={`Retry ${name}`}
            onClick={() => onRetry(upload.id)}
          >
            <IconPlaceholder
              lucide='RotateCwIcon'
              tabler='IconRotateClockwise2'
              hugeicons='Rotate01Icon'
              phosphor='ArrowClockwiseIcon'
              remixicon='RiRefreshLine'
            />
          </Button>
        )}
        {!running && onRemove && (
          <Button
            variant='ghost'
            size='icon-sm'
            aria-label={`Remove ${name}`}
            onClick={() => onRemove(upload.id)}
          >
            <IconPlaceholder
              lucide='Trash2Icon'
              tabler='IconTrash'
              hugeicons='Delete02Icon'
              phosphor='TrashIcon'
              remixicon='RiDeleteBinLine'
            />
          </Button>
        )}
      </div>
    </li>
  )
}

interface FileAction {
  icon?: ReactNode
  label: string
  onSelect: () => void
  /** Red, for actions like delete. Put these last. */
  variant?: 'default' | 'destructive'
}

/** A button with a menu of actions for a file, such as Download, Share and Delete. */
function FileActionsMenu({
  actions,
  className,
  label,
}: {
  actions: FileAction[]
  className?: string
  /** Name the file, such as "Actions for report.pdf". */
  label: string
}) {
  const firstDestructive = actions.findIndex((action) => action.variant === 'destructive')
  return (
    <DropdownMenuTrigger>
      <Button variant='ghost' size='icon-sm' aria-label={label} className={className}>
        <IconPlaceholder
          lucide='EllipsisIcon'
          tabler='IconDots'
          hugeicons='MoreHorizontalCircle01Icon'
          phosphor='DotsThreeIcon'
          remixicon='RiMoreLine'
        />
      </Button>
      <DropdownMenu placement='bottom end' className='w-auto min-w-40'>
        {actions.map((action, index) => (
          <Fragment key={action.label}>
            {index === firstDestructive && index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              variant={action.variant}
              textValue={action.label}
              onAction={action.onSelect}
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenu>
    </DropdownMenuTrigger>
  )
}

interface FileBreadcrumb {
  id: string
  label: string
}

/** The path to the current folder. Every folder but the last is a button that opens it. */
function FileBreadcrumbs({
  className,
  items,
  label = 'Folder path',
  onNavigate,
}: {
  className?: string
  /** From the root to the current folder. */
  items: FileBreadcrumb[]
  /** @default 'Folder path' */
  label?: string
  onNavigate: (id: string) => void
}) {
  return (
    <nav aria-label={label} className={cn('min-w-0', className)}>
      <ol className='text-muted-foreground flex flex-wrap items-center gap-1 text-sm'>
        {items.map((item, index) => {
          const current = index === items.length - 1
          return (
            <li key={item.id} className='flex min-w-0 items-center gap-1'>
              {current ? (
                <span
                  aria-current='page'
                  className='text-foreground truncate px-1 font-medium'
                >
                  {item.label}
                </span>
              ) : (
                <>
                  <button
                    type='button'
                    onClick={() => onNavigate(item.id)}
                    className='hover:text-foreground focus-visible:ring-ring/50 truncate rounded-sm px-1 transition-colors outline-none focus-visible:ring-3'
                  >
                    {item.label}
                  </button>
                  <IconPlaceholder
                    lucide='ChevronRightIcon'
                    tabler='IconChevronRight'
                    hugeicons='ArrowRight01Icon'
                    phosphor='CaretRightIcon'
                    remixicon='RiArrowRightSLine'
                    aria-hidden
                    className='size-3.5 shrink-0'
                  />
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export {
  FileActionsMenu,
  FileBreadcrumbs,
  FileDropzone,
  FileKindIcon,
  FileUploadItem,
  FileUploadList,
  FileUploadProgress,
  fileKindConfig,
  formatFileSize,
  getFileKind,
  matchesAccept,
  summarizeUploads,
  useFileUploads,
  validateFiles,
}

export type {
  FileAction,
  FileBreadcrumb,
  FileDropzoneProps,
  FileKindIconProps,
  FileKind,
  FileKindConfig,
  FileRejection,
  FileRejectionReason,
  FileRules,
  FileUpload,
  FileUploadItemProps,
  UploadFn,
  UploadOptions,
  UploadStatus,
  UseFileUploadsOptions,
}
