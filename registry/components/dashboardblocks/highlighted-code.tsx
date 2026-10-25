'use client'

import { type ComponentProps, type ReactNode, useEffect, useMemo, useState } from 'react'
import {
  createHighlighterCore,
  type GrammarState,
  type HighlighterCore,
  type ThemeRegistration,
} from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFooter,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from '@/components/ui/code-block'

import { cn } from '@/lib/utils'

const languages = {
  bash: () => import('shiki/langs/shellscript.mjs'),
  css: () => import('shiki/langs/css.mjs'),
  diff: () => import('shiki/langs/diff.mjs'),
  html: () => import('shiki/langs/html.mjs'),
  javascript: () => import('shiki/langs/javascript.mjs'),
  json: () => import('shiki/langs/json.mjs'),
  jsx: () => import('shiki/langs/jsx.mjs'),
  markdown: () => import('shiki/langs/markdown.mjs'),
  python: () => import('shiki/langs/python.mjs'),
  sql: () => import('shiki/langs/sql.mjs'),
  tsx: () => import('shiki/langs/tsx.mjs'),
  typescript: () => import('shiki/langs/typescript.mjs'),
  yaml: () => import('shiki/langs/yaml.mjs'),
}

type Language = keyof typeof languages

const aliases: Record<string, Language> = {
  js: 'javascript',
  json5: 'json',
  jsonc: 'json',
  md: 'markdown',
  py: 'python',
  sh: 'bash',
  shell: 'bash',
  shellscript: 'bash',
  ts: 'typescript',
  yml: 'yaml',
  zsh: 'bash',
}

const muted = 'var(--color-muted-foreground)'
const text = 'var(--color-foreground)'
const value = 'var(--code-value)'

const theme: ThemeRegistration = {
  name: 'dashboardblocks',
  type: 'light',
  fg: text,
  bg: 'transparent',
  settings: [
    { settings: { foreground: text } },
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: muted, fontStyle: 'italic' },
    },
    {
      scope: [
        'keyword',
        'storage',
        'punctuation',
        'meta.brace',
        'entity.other.attribute-name',
        'constant.other.option',
        'variable.parameter.option',
        'markup.heading',
        'markup.list',
      ],
      settings: { foreground: muted },
    },
    {
      scope: [
        'string',
        'constant.numeric',
        'constant.language',
        'constant.character',
        'support.constant',
        'markup.inline.raw',
        'markup.inserted',
      ],
      settings: { foreground: value },
    },
    {
      scope: ['entity.name', 'support.type.property-name', 'meta.object-literal.key'],
      settings: { foreground: text },
    },
    { scope: ['markup.deleted'], settings: { foreground: 'var(--color-destructive)' } },
  ],
}

let highlighter: Promise<HighlighterCore> | undefined

function getHighlighter() {
  highlighter ??= createHighlighterCore({
    themes: [theme],
    langs: [],
    engine: createJavaScriptRegexEngine({ forgiving: true }),
  })
  return highlighter
}

function getLanguage(language: string): Language | null {
  const name = language.toLowerCase()
  if (Object.hasOwn(languages, name)) return name as Language
  return Object.hasOwn(aliases, name) ? aliases[name] : null
}

interface Token {
  content: string
  color?: string
  italic?: boolean
}

interface Tokenizer {
  tokenize: (
    code: string,
    state?: GrammarState,
  ) => { lines: Token[][]; state?: GrammarState }
}

async function loadTokenizer(language: string): Promise<Tokenizer | null> {
  const lang = getLanguage(language)
  if (!lang) return null
  const shiki = await getHighlighter()
  if (!shiki.getLoadedLanguages().includes(lang)) {
    await shiki.loadLanguage(languages[lang])
  }
  return {
    tokenize(code, state) {
      const tokens = shiki.codeToTokens(code, {
        lang,
        theme: 'dashboardblocks',
        grammarState: state,
        tokenizeTimeLimit: 2000,
      }).tokens
      return {
        lines: tokens.map((line) =>
          line.map((token) => ({
            content: token.content,
            color: token.color,
            italic: ((token.fontStyle ?? 0) & 1) === 1,
          })),
        ),
        state: shiki.getLastGrammarState(tokens),
      }
    },
  }
}

function useTokenLines(source: string, language: string) {
  const code = source.endsWith('\n') ? source.slice(0, -1) : source
  const [loaded, setLoaded] = useState<{
    language: string
    tokenizer: Tokenizer | null
  } | null>(null)
  const tokenizer = loaded?.language === language ? loaded.tokenizer : null

  useEffect(() => {
    let cancelled = false
    loadTokenizer(language)
      .then((next) => {
        if (!cancelled) setLoaded({ language, tokenizer: next })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [language])

  const [done, setDone] = useState<{
    tokenizer: Tokenizer | null
    text: string
    lines: Token[][]
    state?: GrammarState
  }>({ tokenizer: null, text: '', lines: [] })

  let next = done
  if (next.tokenizer !== tokenizer || !code.startsWith(next.text)) {
    next = { tokenizer, text: '', lines: [] }
  }
  const end = code.lastIndexOf('\n') + 1
  if (tokenizer && end > next.text.length) {
    const result = tokenizer.tokenize(code.slice(next.text.length, end - 1), next.state)
    next = {
      tokenizer,
      text: code.slice(0, end),
      lines: [...next.lines, ...result.lines],
      state: result.state,
    }
  }
  if (next !== done) setDone(next)

  const tail = code.slice(end)
  return useMemo(() => {
    if (!tokenizer) return code.split('\n').map((line) => [{ content: line }])
    return [...next.lines, tokenizer.tokenize(tail, next.state).lines[0] ?? []]
  }, [code, tokenizer, next, tail])
}

function markRanges(line: string, marks: readonly string[]) {
  const ranges: [number, number][] = []
  for (const mark of marks) {
    if (!mark) continue
    let at = line.indexOf(mark)
    while (at !== -1) {
      ranges.push([at, at + mark.length])
      at = line.indexOf(mark, at + mark.length)
    }
  }
  ranges.sort((a, b) => a[0] - b[0])
  const merged: [number, number][] = []
  for (const [from, to] of ranges) {
    const last = merged.at(-1)
    if (last && from <= last[1]) last[1] = Math.max(last[1], to)
    else merged.push([from, to])
  }
  return merged
}

function renderLine(tokens: Token[], marks: readonly string[]): ReactNode[] {
  const ranges = marks.length
    ? markRanges(tokens.map((token) => token.content).join(''), marks)
    : []
  const pieces: { node: ReactNode; range: number }[] = []
  let offset = 0
  tokens.forEach((token, index) => {
    const style = token.color
      ? { color: token.color, fontStyle: token.italic ? 'italic' : undefined }
      : undefined
    const start = offset
    const end = offset + token.content.length
    offset = end
    const cuts = new Set([start, end])
    for (const [from, to] of ranges) {
      if (from > start && from < end) cuts.add(from)
      if (to > start && to < end) cuts.add(to)
    }
    const points = [...cuts].sort((a, b) => a - b)
    for (let i = 0; i < points.length - 1; i++) {
      pieces.push({
        node: (
          <span key={`${index}-${i}`} style={style}>
            {token.content.slice(points[i] - start, points[i + 1] - start)}
          </span>
        ),
        range: ranges.findIndex(([from, to]) => points[i] >= from && points[i + 1] <= to),
      })
    }
  })
  const nodes: ReactNode[] = []
  for (let i = 0; i < pieces.length; i++) {
    const { range } = pieces[i]
    if (range === -1) {
      nodes.push(pieces[i].node)
      continue
    }
    const marked: ReactNode[] = []
    while (i < pieces.length && pieces[i].range === range) marked.push(pieces[i++].node)
    i--
    nodes.push(
      <mark
        key={`mark-${range}`}
        data-slot='highlighted-code-mark'
        className='bg-chart-2/15 ring-chart-2/35 -mx-0.5 box-decoration-clone rounded-sm px-0.5 text-inherit ring-1 ring-inset'
      >
        {marked}
      </mark>,
    )
  }
  return nodes
}

interface HighlightedCodeProps extends Omit<
  ComponentProps<typeof CodeBlock>,
  'children' | 'title'
> {
  /** The code, shown and copied exactly as written. It may grow while a model streams it. */
  code: string
  /** `tsx`, `bash`, `json` and the other languages this file lists, or an alias such as `ts` or `sh`. Any other value shows plain text. */
  language?: string
  /** A file name or what the code is, such as `app/layout.tsx` or `Payload`. Without one, the copy button floats over the code. */
  title?: ReactNode
  /** The copy button's accessible name, such as `Copy payload`. */
  copyLabel?: string
  /** Text to pick out wherever it appears, such as the key the reader must check is theirs. */
  mark?: readonly string[]
  /** Wraps long lines instead of scrolling them sideways. */
  wrap?: boolean
  /** Names the code for screen readers and makes it a region. */
  label?: string
  /** Shown under the code, inside its frame, such as what happened after running it. */
  footer?: ReactNode
}

function HighlightedCode({
  code,
  language = '',
  title,
  copyLabel = 'Copy code',
  mark = [],
  wrap = false,
  label,
  footer,
  size = 'sm',
  className,
  ...props
}: HighlightedCodeProps) {
  const lines = useTokenLines(code, language)
  const copy = (
    <CodeBlockActions>
      <CodeBlockCopyButton aria-label={copyLabel} value={code} />
    </CodeBlockActions>
  )
  return (
    <CodeBlock
      data-slot='highlighted-code'
      size={size}
      className={cn(
        '[--code-value:var(--color-chart-3)] dark:[--code-value:var(--color-chart-1)]',
        className,
      )}
      {...props}
    >
      {title ? (
        <CodeBlockHeader>
          <CodeBlockTitle>{title}</CodeBlockTitle>
          {copy}
        </CodeBlockHeader>
      ) : (
        copy
      )}
      <CodeBlockContent
        wrap={wrap}
        className='mask-none data-wrap:mask-none'
        role={label ? 'region' : undefined}
        aria-label={label}
      >
        {lines.map((line, index) => (
          <CodeBlockLine key={index}>{renderLine(line, mark)}</CodeBlockLine>
        ))}
      </CodeBlockContent>
      {footer && <CodeBlockFooter>{footer}</CodeBlockFooter>}
    </CodeBlock>
  )
}

export { HighlightedCode }
export type { HighlightedCodeProps }
