'use client'

import { Check, Code } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { DEFAULT_CONFIG } from '@/lib/customizer'
import { highlightTsx } from '@/lib/highlight-client'
import { toProjectCode } from '@/lib/registry-code'
import { cn } from '@/lib/utils'

import { useCustomizerConfig } from './customizer/customizer-provider'
import { ShadcnCliButton } from './shadcn-cli-button'

interface ComponentPreviewHighlightedProps {
  name: string
  code: string
  highlightedCode: string
  children: React.ReactNode
  className?: string
  previewClassName?: string
}

interface VariantCode {
  code: string
  html: string
}

const variants = new Map<string, Promise<VariantCode>>()

/** The block's code as the CLI installs it for another component or icon library. */
function loadVariant(
  name: string,
  base: string,
  iconLibrary: typeof DEFAULT_CONFIG.iconLibrary,
) {
  const key = `${base}/${iconLibrary}/${name}`
  let variant = variants.get(key)
  if (!variant) {
    variant = fetch(`/r/${base}/${name}.json`)
      .then((response) => response.json() as Promise<{ files: { content: string }[] }>)
      .then(async (item) => {
        const code = toProjectCode(item.files[0].content, iconLibrary)
        return { code, html: await highlightTsx(code) }
      })
    variant.catch(() => variants.delete(key))
    variants.set(key, variant)
  }
  return variant
}

function useVariantCode(name: string, fallback: VariantCode) {
  const { base, iconLibrary } = useCustomizerConfig()
  const isDefault =
    base === DEFAULT_CONFIG.base && iconLibrary === DEFAULT_CONFIG.iconLibrary
  const key = `${base}/${iconLibrary}`
  const [loaded, setLoaded] = useState<{ key: string; value: VariantCode } | null>(null)

  useEffect(() => {
    if (isDefault) return
    let active = true
    loadVariant(name, base, iconLibrary)
      .then((value) => active && setLoaded({ key, value }))
      .catch(() => {})
    return () => {
      active = false
    }
  }, [base, iconLibrary, isDefault, key, name])

  if (isDefault) return fallback
  return loaded?.key === key ? loaded.value : null
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
  const variant = useVariantCode(name, { code, html: highlightedCode })

  const copyToClipboard = useCallback(() => {
    if (!variant) return
    void navigator.clipboard.writeText(variant.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [variant])

  return (
    <div className={cn('not-prose my-6 overflow-hidden rounded-xl border', className)}>
      <Tabs defaultValue='preview' className='gap-0'>
        <div className='bg-background flex flex-wrap items-center gap-2 border-b p-3'>
          <TabsList>
            <TabsTrigger value='preview'>Preview</TabsTrigger>
            <TabsTrigger value='code'>Code</TabsTrigger>
          </TabsList>
          <Button
            variant='outline'
            onClick={copyToClipboard}
            size='sm'
            disabled={!variant}
          >
            {copied ? <Check className='size-4' /> : <Code className='size-4' />}
            <span>Copy code</span>
          </Button>
          <ShadcnCliButton name={name} />
        </div>

        <TabsContent value='preview' className='bg-muted/40 dark:bg-black/30'>
          <div className='flex items-center justify-center px-4 py-8 sm:px-6'>
            <div className={cn('w-full', previewClassName)}>{children}</div>
          </div>
        </TabsContent>
        <TabsContent value='code'>
          {variant ? (
            <div
              className='max-h-[500px] overflow-auto text-sm [&_pre]:m-0! [&_pre]:bg-transparent! [&_pre]:p-4'
              dangerouslySetInnerHTML={{ __html: variant.html }}
            />
          ) : (
            <p className='text-muted-foreground p-4 text-sm'>Loading code…</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
