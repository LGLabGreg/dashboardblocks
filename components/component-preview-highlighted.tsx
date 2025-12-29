'use client'

import { Check, Code } from 'lucide-react'
import { useCallback, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { cn } from '@/lib/utils'

import { ShadcnCliButton } from './shadcn-cli-button'

interface ComponentPreviewHighlightedProps {
  name: string
  code: string
  highlightedCode: string
  children: React.ReactNode
  className?: string
  previewClassName?: string
}

export function ComponentPreviewHighlighted({
  name,
  code,
  highlightedCode,
  children,
  className,
  previewClassName,
}: ComponentPreviewHighlightedProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  return (
    <div className={cn('not-prose my-6 border border-dashed p-4', className)}>
      <Tabs defaultValue='preview'>
        <div className='flex flex-wrap items-center gap-2'>
          <TabsList>
            <TabsTrigger value='preview'>Preview</TabsTrigger>
            <TabsTrigger value='code'>Code</TabsTrigger>
          </TabsList>
          <Button variant='outline' onClick={copyToClipboard} size='sm'>
            {copied ? <Check className='size-4' /> : <Code className='size-4' />}
            <span>Copy code</span>
          </Button>
          <ShadcnCliButton name={name} />
        </div>

        <TabsContent value='preview'>
          <div className='flex items-center justify-center pt-4 pb-2'>
            <div className={cn('w-full', previewClassName)}>{children}</div>
          </div>
        </TabsContent>
        <TabsContent value='code'>
          <div
            className='max-h-[500px] mt-2 overflow-auto text-sm [&_pre]:m-0! [&_pre]:bg-transparent! [&_pre]:p-4'
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
