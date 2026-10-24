'use client'

import {
  type AISource,
  getSafeHref,
} from '@/registry/components/dashboardblocks/ai-message'
import { AILink, Citation } from '@/registry/components/dashboardblocks/ai-sources'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from '@/registry/components/dashboardblocks/table'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { Lexer, type Token, type Tokens } from 'marked'
import type { ReactNode } from 'react'
import remend from 'remend'

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from '@/components/ui/code-block'

import { useHighlightedCode } from '@/hooks/use-highlighted-code'

import { cn } from '@/lib/utils'

const PARTIAL_CITATION = /\s*\[\d{0,3}$/
const CITATION = /\[(\d{1,3})\]/g

const ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  bull: '\u2022',
  cent: '¢',
  copy: '©',
  darr: '↓',
  deg: '°',
  divide: '÷',
  euro: '€',
  ge: '≥',
  gt: '>',
  hellip: '…',
  larr: '←',
  ldquo: '“',
  le: '≤',
  lsquo: '‘',
  lt: '<',
  mdash: '—',
  middot: '\u00b7',
  nbsp: '\u00a0',
  ndash: '–',
  ne: '≠',
  plusmn: '±',
  pound: '£',
  quot: '"',
  rarr: '→',
  rdquo: '”',
  reg: '®',
  rsquo: '’',
  times: '×',
  trade: '™',
  uarr: '↑',
  yen: '¥',
}

// marked decodes numeric entities in text but leaves named ones (`&amp;`) as typed. React escapes the result, so it stays text.
function decodeEntities(text: string) {
  return text.replace(
    /&(#x[\da-f]{1,6}|#\d{1,7}|[a-z][a-z\d]{1,31});/gi,
    (match, name: string) => {
      if (name.startsWith('#')) {
        const code =
          name[1] === 'x' || name[1] === 'X'
            ? parseInt(name.slice(2), 16)
            : Number(name.slice(1))
        return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match
      }
      return Object.hasOwn(ENTITIES, name) ? ENTITIES[name] : match
    },
  )
}

/** Closes what a reply has opened but not finished yet (`**bold`, a backtick, a link), and holds back a citation or a table row still being written, so raw syntax never shows while it streams. */
function completeMarkdown(text: string) {
  return remend(text.replace(PARTIAL_CITATION, ''), {
    images: false,
    inlineKatex: false,
    katex: false,
    linkMode: 'text-only',
  })
}

function lex(text: string, streaming: boolean) {
  const tokens = new Lexer({ breaks: true, gfm: true }).lex(
    streaming ? completeMarkdown(text) : text,
  )
  if (!streaming) return tokens
  const last = tokens.findLast((token) => token.type !== 'space')
  // A table's first row reads as text until the line under it arrives.
  if (last?.type === 'paragraph' && last.raw.trimStart().startsWith('|')) {
    return tokens.slice(0, tokens.lastIndexOf(last))
  }
  return tokens
}

const BLOCKS = new Set(['blockquote', 'code', 'heading', 'list', 'paragraph', 'table'])

function plainText(tokens: Token[], sourceCount: number): string {
  return tokens
    .map(
      (token) => plainTextOf(token, sourceCount) + (BLOCKS.has(token.type) ? '\n' : ''),
    )
    .join('')
}

function plainTextOf(token: Token, sourceCount: number): string {
  if ('tokens' in token && token.tokens) return plainText(token.tokens, sourceCount)
  if (token.type === 'list') {
    return (token as Tokens.List).items
      .map((item) => plainText(item.tokens, sourceCount))
      .join('\n')
  }
  if (token.type === 'table') {
    const table = token as Tokens.Table
    return [table.header, ...table.rows]
      .map((row) => row.map((cell) => plainText(cell.tokens, sourceCount)).join(', '))
      .join('\n')
  }
  if (token.type === 'space') return '\n'
  if (token.type === 'hr' || token.type === 'checkbox') return ''
  if (token.type === 'codespan' || token.type === 'code') return token.text
  if (!('text' in token)) return ''
  return decodeEntities(token.text).replace(
    /\s*\[(\d{1,3})\]/g,
    (match, number: string) =>
      Number(number) >= 1 && Number(number) <= sourceCount ? '' : match,
  )
}

/** What a reply says without its Markdown, for a screen reader's announcement. Citations of its `sourceCount` sources are left out. */
function markdownToPlainText(text: string, sourceCount = 0) {
  return plainText(lex(text, false), sourceCount)
    .replace(/\n{2,}/g, '\n')
    .trim()
}

/** The sources a text cites, in order and once each, out of `sourceCount`. */
function getCitedNumbers(text: string, sourceCount: number) {
  const cited = new Set<number>()
  for (const match of text.matchAll(CITATION)) {
    const number = Number(match[1])
    if (number >= 1 && number <= sourceCount) cited.add(number)
  }
  return [...cited].sort((a, b) => a - b)
}

function highlightable(language: string) {
  return !Object.hasOwn(Object.prototype, language.toLowerCase())
}

function AICodeBlock({ code, language }: { code: string; language: string }) {
  const lines = useHighlightedCode(code, highlightable(language) ? language : '')
  return (
    <CodeBlock size='sm'>
      <CodeBlockHeader>
        <CodeBlockTitle>{language || 'code'}</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton aria-label='Copy code' value={code} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent className='mask-none'>
        {lines.map((line, index) => (
          <CodeBlockLine key={index}>{line}</CodeBlockLine>
        ))}
      </CodeBlockContent>
    </CodeBlock>
  )
}

interface RenderContext {
  sources: AISource[]
  streaming: boolean
}

function fadeInWords(text: string, key: string): ReactNode[] {
  return (text.match(/\s*\S+\s*|\s+/g) ?? []).map((word, index) => (
    <span
      key={`${key}-${index}`}
      className='motion-safe:animate-in motion-safe:fade-in duration-500'
    >
      {word}
    </span>
  ))
}

function renderText(raw: string, context: RenderContext, key: string): ReactNode {
  const text = decodeEntities(raw)
  // One flat list of words, so a word keeps its node when a citation after it completes.
  const show = (value: string, at: number): ReactNode[] =>
    context.streaming ? fadeInWords(value, `${key}-${at}`) : [value]
  if (context.sources.length === 0 || !text.includes('[')) return show(text, 0)
  const parts: ReactNode[] = []
  let last = 0
  for (const match of text.matchAll(CITATION)) {
    const source = context.sources[Number(match[1]) - 1]
    if (!source) continue
    // The space before a citation would sit between the word and its number.
    parts.push(...show(text.slice(last, match.index).replace(/\s+$/, ''), last))
    const citation = (
      <Citation key={`${key}-${match.index}`} index={Number(match[1])} source={source} />
    )
    parts.push(
      context.streaming ? (
        <span
          key={`${key}-${match.index}`}
          className='motion-safe:animate-in motion-safe:fade-in duration-500'
        >
          {citation}
        </span>
      ) : (
        citation
      ),
    )
    last = match.index + match[0].length
  }
  parts.push(...show(text.slice(last), last))
  return parts
}

function renderInline(tokens: Token[], context: RenderContext, prefix = ''): ReactNode[] {
  return tokens.map((token, index) => {
    const key = `${prefix}${index}`
    switch (token.type) {
      case 'strong':
        return (
          <strong key={key} className='font-semibold'>
            {renderInline((token as Tokens.Strong).tokens, context, `${key}-`)}
          </strong>
        )
      case 'em':
        return (
          <em key={key}>
            {renderInline((token as Tokens.Em).tokens, context, `${key}-`)}
          </em>
        )
      case 'del':
        return (
          <del key={key}>
            {renderInline((token as Tokens.Del).tokens, context, `${key}-`)}
          </del>
        )
      case 'codespan':
        return (
          <code
            key={key}
            className='bg-muted rounded-sm px-1 py-0.5 font-mono text-[0.85em]'
          >
            {(token as Tokens.Codespan).text}
          </code>
        )
      case 'br':
        return <br key={key} />
      case 'link':
      case 'image': {
        const link = token as Tokens.Link | Tokens.Image
        const label =
          link.type === 'link'
            ? renderInline(link.tokens, context, `${key}-`)
            : link.text || link.href
        const href = getSafeHref(link.href)
        if (!href) return <span key={key}>{label}</span>
        return (
          <AILink
            key={key}
            href={href}
            className='font-medium underline underline-offset-4'
          >
            {label}
          </AILink>
        )
      }
      case 'text': {
        const text = token as Tokens.Text
        return text.tokens ? (
          <span key={key}>{renderInline(text.tokens, context, `${key}-`)}</span>
        ) : (
          <span key={key}>{renderText(text.text, context, key)}</span>
        )
      }
      case 'escape':
        return <span key={key}>{(token as Tokens.Escape).text}</span>
      case 'html':
        return <span key={key}>{token.raw}</span>
      default:
        return null
    }
  })
}

function renderListItem(item: Tokens.ListItem, context: RenderContext, key: string) {
  const content = item.tokens.filter((token) => token.type !== 'checkbox')
  const body = renderBlocks(content, context, `${key}-`, !item.loose)
  if (!item.task) {
    return (
      <li key={key} className='marker:text-muted-foreground ps-1'>
        {body}
      </li>
    )
  }
  return (
    <li key={key} className='-ms-5 flex list-none items-start gap-2'>
      {item.checked ? (
        <IconPlaceholder
          lucide='CircleCheckIcon'
          tabler='IconCircleCheck'
          hugeicons='CheckmarkCircle02Icon'
          phosphor='CheckCircleIcon'
          remixicon='RiCheckboxCircleLine'
          aria-hidden
          className='mt-1 size-4 shrink-0 text-emerald-700 dark:text-emerald-400'
        />
      ) : (
        <IconPlaceholder
          lucide='CircleIcon'
          tabler='IconCircle'
          hugeicons='CircleIcon'
          phosphor='CircleIcon'
          remixicon='RiCircleLine'
          aria-hidden
          className='text-muted-foreground mt-1 size-4 shrink-0'
        />
      )}
      <span className='sr-only'>{item.checked ? 'Done: ' : 'To do: '}</span>
      <div className='min-w-0 flex-1'>{body}</div>
    </li>
  )
}

function renderBlocks(
  tokens: Token[],
  context: RenderContext,
  prefix = '',
  tight = false,
): ReactNode[] {
  return tokens.map((token, index) => {
    const key = `${prefix}${index}`
    switch (token.type) {
      case 'paragraph':
        return (
          <p key={key}>
            {renderInline((token as Tokens.Paragraph).tokens, context, `${key}-`)}
          </p>
        )
      case 'text': {
        const text = token as Tokens.Text
        const inline = renderInline(text.tokens ?? [text], context, `${key}-`)
        return tight ? <span key={key}>{inline}</span> : <p key={key}>{inline}</p>
      }
      case 'heading':
        return (
          <p key={key} className='font-semibold'>
            {renderInline((token as Tokens.Heading).tokens, context, `${key}-`)}
          </p>
        )
      case 'list': {
        const list = token as Tokens.List
        const List = list.ordered ? 'ol' : 'ul'
        const start = typeof list.start === 'number' ? list.start : 1
        return (
          <List
            key={key}
            start={list.ordered && start !== 1 ? start : undefined}
            className={cn(
              'flex flex-col gap-1 ps-5',
              list.ordered ? 'list-decimal' : 'list-disc',
            )}
          >
            {list.items.map((item, itemIndex) =>
              renderListItem(item, context, `${key}-${itemIndex}`),
            )}
          </List>
        )
      }
      case 'blockquote':
        return (
          <blockquote
            key={key}
            className='text-muted-foreground flex flex-col gap-2 border-s-2 ps-3'
          >
            {renderBlocks((token as Tokens.Blockquote).tokens, context, `${key}-`)}
          </blockquote>
        )
      case 'code': {
        const code = token as Tokens.Code
        return (
          <AICodeBlock
            key={key}
            code={code.text}
            language={(code.lang ?? '').split(/\s/)[0]}
          />
        )
      }
      case 'table': {
        const table = token as Tokens.Table
        const align = (value: Tokens.TableCell['align']) =>
          value === 'right' ? 'end' : value === 'center' ? 'center' : 'start'
        return (
          <DataTable key={key} density='compact'>
            <DataTableHeader>
              <DataTableRow>
                {table.header.map((cell, cellIndex) => (
                  <DataTableHead key={cellIndex} align={align(cell.align)}>
                    {renderInline(cell.tokens, context, `${key}-h${cellIndex}-`)}
                  </DataTableHead>
                ))}
              </DataTableRow>
            </DataTableHeader>
            <DataTableBody>
              {table.rows.map((row, rowIndex) => (
                <DataTableRow key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <DataTableCell key={cellIndex} align={align(cell.align)}>
                      {renderInline(
                        cell.tokens,
                        context,
                        `${key}-${rowIndex}-${cellIndex}-`,
                      )}
                    </DataTableCell>
                  ))}
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        )
      }
      case 'hr':
        return <hr key={key} className='border-border' />
      case 'html':
        return <p key={key}>{token.raw.trim()}</p>
      default:
        return null
    }
  })
}

interface AIMarkdownProps {
  className?: string
  /** `[n]` in the text links to the nth source. */
  sources?: AISource[]
  /** Closes unfinished syntax and holds back half-written table rows and citations. */
  streaming?: boolean
  text: string
}

/** Markdown a model wrote: GitHub's tables, lists, task lists, quotes, links and code. HTML shows as text; links open only http(s), mailto and in-app paths; images show as links. */
function AIMarkdown({
  className,
  sources = [],
  streaming = false,
  text,
}: AIMarkdownProps) {
  const blocks = renderBlocks(lex(text, streaming), { sources, streaming })
  if (blocks.every((block) => block === null)) return null
  return (
    <div
      data-slot='ai-markdown'
      className={cn('flex min-w-0 flex-col gap-3 leading-relaxed break-words', className)}
    >
      {blocks}
    </div>
  )
}

export { AIMarkdown, completeMarkdown, getCitedNumbers, markdownToPlainText }

export type { AIMarkdownProps }
