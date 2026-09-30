'use client'

import { Check, ChevronDown, Copy, FileText, Link2, SquarePen } from 'lucide-react'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { siteChrome } from '@/lib/customizer'
import { cn } from '@/lib/utils'

import { Icons } from './icons'

// The menu closes on click, so the split button's label reports every copy.
const LABELS = {
  idle: 'Copy page',
  markdown: 'Copied',
  link: 'Link copied',
  failed: "Couldn't copy",
}

/**
 * Copy the page as Markdown, or hand it to an AI chat. The Markdown comes from
 * app/llms.mdx, where each preview becomes its install command.
 */
export function PageActions({
  markdownUrl,
  pageUrl,
  githubUrl,
  className,
}: {
  /** Site-relative URL of the page's Markdown. */
  markdownUrl: string
  /** Absolute URL of the page, for the link and the AI prompts. */
  pageUrl: string
  /** The page's source file on GitHub. */
  githubUrl: string
  className?: string
}) {
  const [status, setStatus] = useState<'markdown' | 'link' | 'failed' | null>(null)
  const markdown = useRef<Promise<string> | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = (next: 'markdown' | 'link' | 'failed') => {
    setStatus(next)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setStatus(null), 2000)
  }

  const copyMarkdown = async () => {
    markdown.current ??= fetch(markdownUrl).then((res) => {
      if (!res.ok) throw new Error(`Couldn't load ${markdownUrl}`)
      return res.text()
    })
    try {
      if (typeof ClipboardItem === 'undefined') {
        await navigator.clipboard.writeText(await markdown.current)
        show('markdown')
        return
      }
      // Safari only allows a clipboard write inside the click, so the text goes
      // in as a promise instead of being awaited first.
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': markdown.current.then(
            (text) => new Blob([text], { type: 'text/plain' }),
          ),
        }),
      ])
      show('markdown')
    } catch {
      markdown.current = null
      show('failed')
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl)
      show('link')
    } catch {
      show('failed')
    }
  }

  const prompt = `Read ${new URL(markdownUrl, pageUrl).href}, I want to ask questions about it.`

  return (
    <div {...siteChrome(cn('flex', className))}>
      <ButtonGroup>
        <Button variant='outline' size='sm' onClick={copyMarkdown}>
          {status === 'markdown' || status === 'link' ? <Check /> : <Copy />}
          {LABELS[status ?? 'idle']}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant='outline'
                size='sm'
                className='pl-2!'
                aria-label='More page actions'
              />
            }
          >
            <ChevronDown />
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' {...siteChrome('w-56')}>
            <DropdownMenuGroup>
              <DropdownMenuItem
                render={
                  <a
                    href={markdownUrl}
                    target='_blank'
                    rel='noreferrer'
                    aria-label='View as Markdown'
                  />
                }
              >
                <FileText />
                View as Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copyLink}>
                <Link2 />
                Copy link
              </DropdownMenuItem>
              <DropdownMenuItem
                render={
                  <a
                    href={githubUrl}
                    target='_blank'
                    rel='noreferrer'
                    aria-label='Edit on GitHub'
                  />
                }
              >
                <SquarePen />
                Edit on GitHub
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Ask AI about this page</DropdownMenuLabel>
              <DropdownMenuItem
                render={
                  <a
                    href={`https://chatgpt.com/?${new URLSearchParams({ hints: 'search', prompt })}`}
                    target='_blank'
                    rel='noreferrer'
                    aria-label='Ask ChatGPT'
                  />
                }
              >
                <Icons.openai />
                ChatGPT
              </DropdownMenuItem>
              <DropdownMenuItem
                render={
                  <a
                    href={`https://claude.ai/new?${new URLSearchParams({ q: prompt })}`}
                    target='_blank'
                    rel='noreferrer'
                    aria-label='Ask Claude'
                  />
                }
              >
                <Icons.anthropic />
                Claude
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
      <span role='status' className='sr-only'>
        {status === 'markdown' ? 'Page copied as Markdown' : status ? LABELS[status] : ''}
      </span>
    </div>
  )
}
