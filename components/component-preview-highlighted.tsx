'use client'

import { Check, Clipboard } from 'lucide-react'
import { useCallback, useState } from 'react'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

interface ComponentPreviewHighlightedProps {
  code: string
  highlightedCode: string
  children: React.ReactNode
  className?: string
  previewClassName?: string
}

export function ComponentPreviewHighlighted({
  code,
  highlightedCode,
  children,
  className,
  previewClassName,
}: ComponentPreviewHighlightedProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')
  const [copied, setCopied] = useState(false)

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  return (
    <div className={cn('not-prose my-6 overflow-hidden rounded-xl border', className)}>
      {/* Header with tabs and actions */}
      <div className='flex items-center justify-between border-b px-4'>
        <div className='flex'>
          <button
            onClick={() => setActiveTab('preview')}
            className={cn(
              'relative px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'preview'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Preview
            {activeTab === 'preview' && (
              <span className='absolute inset-x-0 -bottom-px h-0.5 bg-foreground' />
            )}
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={cn(
              'relative px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'code'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Code
            {activeTab === 'code' && (
              <span className='absolute inset-x-0 -bottom-px h-0.5 bg-foreground' />
            )}
          </button>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='icon-sm'
            onClick={copyToClipboard}
            className='text-muted-foreground hover:text-foreground'
          >
            {copied ? <Check className='size-4' /> : <Clipboard className='size-4' />}
            <span className='sr-only'>Copy code</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'preview' ? (
        <div className='flex min-h-[200px] items-center justify-center p-8'>
          <div className={cn('w-full', previewClassName)}>{children}</div>
        </div>
      ) : (
        <div
          className='max-h-[500px] overflow-auto text-sm [&_pre]:m-0! [&_pre]:bg-transparent! [&_pre]:p-4'
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      )}
    </div>
  )
}
