'use client'

import {
  FileDropzone,
  type FileUpload,
  FileUploadItem,
  FileUploadList,
  type UploadFn,
  summarizeUploads,
  useFileUploads,
} from '@/registry/components/dashboardblocks/files'
import { formatPercent } from '@/registry/lib/dashboardblocks/format'

import { Button } from '@/components/ui/button'

interface Files1Props {
  /** File types the picker offers, as in an input's `accept`. */
  accept: string
  acceptHint: string
  description: string
  initialUploads?: FileUpload[]
  maxFiles: number
  /** Largest file in bytes. */
  maxSize: number
  title: string
  upload?: UploadFn
}

const MB = 1024 * 1024

const exampleProps: Files1Props = {
  accept: '.pdf,.png,.jpg,.jpeg,.docx,.xlsx,.pptx,.zip',
  acceptHint: 'PDF, PNG, JPG, Office files or ZIP, up to 25 MB each',
  description: 'Briefs, artwork and contracts for the Fall launch campaign.',
  initialUploads: [
    {
      id: 'fall-launch-brief',
      name: 'fall-launch-brief.pdf',
      progress: 1,
      size: 2.4 * MB,
      status: 'done',
      type: 'application/pdf',
    },
    {
      id: 'hero-banner',
      name: 'hero-banner@2x.png',
      progress: 1,
      size: 6.8 * MB,
      status: 'done',
      type: 'image/png',
    },
    {
      error: 'Larger than 25 MB',
      id: 'raw-footage',
      name: 'launch-film-raw-footage.zip',
      progress: 0,
      rejected: true,
      size: 412 * MB,
      status: 'error',
      type: 'application/zip',
    },
  ],
  maxFiles: 10,
  maxSize: 25 * MB,
  title: 'Fall launch files',
}

let simulatedUploads = 0

const simulateUpload: UploadFn = (file, { onProgress, signal }) => {
  const fails = simulatedUploads++ % 3 === 1
  const duration = Math.min(6_000, 1_200 + (file.size / MB) * 400)
  const started = Date.now()
  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      const progress = Math.min(1, (Date.now() - started) / duration)
      if (fails && progress >= 0.55) {
        clearInterval(timer)
        reject(new Error('Connection lost. Try again.'))
        return
      }
      onProgress(progress)
      if (progress >= 1) {
        clearInterval(timer)
        resolve()
      }
    }, 120)
    signal.addEventListener('abort', () => {
      clearInterval(timer)
      reject(signal.reason)
    })
  })
}

const Files1 = (props: Files1Props) => {
  const {
    accept,
    acceptHint,
    description,
    initialUploads,
    maxFiles,
    maxSize,
    title,
    upload = simulateUpload,
  } = props
  const { add, cancel, clear, remove, retry, uploads } = useFileUploads({
    initialUploads,
    upload,
  })
  const summary = summarizeUploads(uploads)

  let status = `${summary.done} of ${uploads.length} ${uploads.length === 1 ? 'file' : 'files'} uploaded`
  if (summary.active > 0) {
    status = `Uploading ${summary.active} ${summary.active === 1 ? 'file' : 'files'}…`
  } else if (summary.failed > 0) {
    status += `, ${summary.failed} failed`
  }

  return (
    <section className='@container flex flex-col gap-3'>
      <header className='flex flex-col gap-0.5'>
        <h2 className='font-semibold tracking-tight'>{title}</h2>
        <p className='text-muted-foreground text-sm'>{description}</p>
      </header>
      <FileDropzone
        accept={accept}
        hint={acceptHint}
        maxFiles={maxFiles}
        maxSize={maxSize}
        onFiles={add}
      />
      <p aria-live='polite' className='sr-only'>
        {uploads.length > 0 && status}
      </p>
      {uploads.length > 0 && (
        <section aria-label='Uploads' className='flex flex-col gap-1'>
          <div className='flex min-h-8 items-center justify-between gap-2'>
            <p className='text-muted-foreground text-sm tabular-nums'>
              <span aria-hidden>{status}</span>
              {summary.active > 0 && (
                <span aria-hidden>
                  {' '}
                  {formatPercent(summary.progress, { maximumFractionDigits: 0 })}
                </span>
              )}
            </p>
            {summary.done > 0 && (
              <Button variant='ghost' size='sm' onClick={() => clear()}>
                Clear uploaded
              </Button>
            )}
          </div>
          <FileUploadList>
            {uploads.map((item) => (
              <FileUploadItem
                key={item.id}
                upload={item}
                onCancel={cancel}
                onRemove={remove}
                onRetry={retry}
              />
            ))}
          </FileUploadList>
        </section>
      )}
    </section>
  )
}

export { Files1, exampleProps as files1ExampleProps, type Files1Props }
