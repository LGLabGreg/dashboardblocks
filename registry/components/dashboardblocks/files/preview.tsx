'use client'

import type { UploadFn } from '@/registry/components/dashboardblocks/files'
import {
  Files1,
  type Files1Props,
} from '@/registry/components/dashboardblocks/files/files-01'

// The docs preview only: uploads that count up to done, and every third one
// that fails partway, in place of a server. Not part of any registry item.

const MB = 1024 * 1024

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

const Files1Preview = (props: Omit<Files1Props, 'upload'>) => (
  <Files1 {...props} upload={simulateUpload} />
)

export { Files1Preview }
