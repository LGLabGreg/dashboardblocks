'use client'

import {
  AIMarkdown,
  completeMarkdown,
} from '@/registry/components/dashboardblocks/ai-markdown'
import {
  type AIAnyToolPart,
  type AIFilePart,
  type AIMessage,
  type AISource,
  type AIToolApprovalResponse,
  getMessageFiles,
  getMessageSources,
  getToolLabel,
  getToolName,
  isToolPart,
} from '@/registry/components/dashboardblocks/ai-message'
import { SourceList } from '@/registry/components/dashboardblocks/ai-sources'
import {
  Disclosure,
  DisclosureContent,
  DisclosureTrigger,
} from '@/registry/components/dashboardblocks/disclosure'
import { HighlightedCode } from '@/registry/components/dashboardblocks/highlighted-code'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatDuration } from '@/registry/lib/dashboardblocks/format'
import { type ReactNode, useEffect, useId, useRef, useState } from 'react'

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment'
import { Button } from '@/components/ui/button'
import { Marker, MarkerContent, MarkerIcon } from '@/components/ui/marker'

import { cn } from '@/lib/utils'

/** The line a reply shows while the model works, before it has anything to show. */
function ThinkingIndicator({
  className,
  label = 'Thinking…',
}: {
  className?: string
  /** @default 'Thinking…' */
  label?: string
}) {
  return (
    <Marker data-slot='thinking-indicator' className={className}>
      <MarkerIcon>
        <IconPlaceholder
          lucide='Loader2Icon'
          tabler='IconLoader'
          hugeicons='Loading03Icon'
          phosphor='SpinnerIcon'
          remixicon='RiLoaderLine'
          className='animate-spin motion-reduce:animate-none'
        />
      </MarkerIcon>
      <MarkerContent className='shimmer'>{label}</MarkerContent>
    </Marker>
  )
}

interface ThinkingProps {
  className?: string
  /** Shown before the model's reasoning arrives too, so the line doesn't move when it does. */
  streaming: boolean
  /** The model's reasoning. Empty when the provider doesn't send it. */
  text: string
}

/** A model's reasoning: "Thinking…" while it works, then one line, "Thought for 4.2 s", that opens what it thought. It never opens by itself, so nothing under it moves. */
function Thinking({ className, streaming, text }: ThinkingProps) {
  const [durationMs, setDurationMs] = useState<number | null>(null)

  useEffect(() => {
    if (!streaming) return
    const startedAt = performance.now()
    return () => setDurationMs(performance.now() - startedAt)
  }, [streaming])

  if (streaming) return <ThinkingIndicator className={className} />
  const label =
    durationMs === null ? 'Reasoning' : `Thought for ${formatDuration(durationMs)}`
  if (!text.trim()) {
    if (durationMs === null) return null
    return (
      <p data-slot='thinking' className={cn('text-muted-foreground text-sm', className)}>
        {label}
      </p>
    )
  }
  return (
    <Disclosure data-slot='thinking' className={className}>
      <DisclosureTrigger>{label}</DisclosureTrigger>
      <DisclosureContent>
        <p className='text-muted-foreground border-s-2 ps-3 text-sm text-pretty break-words whitespace-pre-line'>
          {text.trim()}
        </p>
      </DisclosureContent>
    </Disclosure>
  )
}

function stringify(value: unknown) {
  if (typeof value === 'string') return value
  return JSON.stringify(value, null, 2) ?? String(value)
}

interface ToolValueProps {
  /** What the value is, such as `Input`, `Output` or `Arguments`. */
  label: string
  /** The tool it belongs to, added to the region's name for screen readers. */
  tool?: string
  /** A string shows as written, highlighted when it's JSON; anything else as JSON. */
  value: unknown
}

function isJson(text: string) {
  if (!/^\s*[[{]/.test(text)) return false
  try {
    JSON.parse(text)
    return true
  } catch {
    return false
  }
}

/** A tool's input or output, or any JSON a model call sent or got back: highlighted, in a code block with copy. */
function ToolValue({ label, tool, value }: ToolValueProps) {
  const code = stringify(value)
  const name = tool ? `${label} of ${tool}` : label
  return (
    <div data-slot='tool-value' className='flex max-h-80 w-full min-w-0 flex-col'>
      <HighlightedCode
        code={code}
        language={typeof value !== 'string' || isJson(value) ? 'json' : ''}
        title={label}
        copyLabel={`Copy ${name.toLowerCase()}`}
        label={name}
        wrap
      />
    </div>
  )
}

/** Whether a tool call never ended: it was still running, or approved and running, when the reply stopped. */
function isToolUnfinished(part: AIAnyToolPart) {
  switch (part.state) {
    case 'input-streaming':
    case 'input-available':
      return true
    case 'approval-responded':
      return part.approval?.approved !== false
    case 'output-available':
      return part.preliminary === true
    default:
      return false
  }
}

function ToolStateIcon({ part, stopped }: { part: AIAnyToolPart; stopped: boolean }) {
  const className = 'mt-0.5 size-4 shrink-0'
  if (stopped) {
    return (
      <IconPlaceholder
        lucide='CircleMinusIcon'
        tabler='IconCircleMinus'
        hugeicons='MinusSignCircleIcon'
        phosphor='MinusCircleIcon'
        remixicon='RiIndeterminateCircleLine'
        aria-hidden
        className={cn(className, 'text-muted-foreground')}
      />
    )
  }
  switch (part.state) {
    case 'output-available':
      return part.preliminary ? (
        <ToolSpinner className={className} />
      ) : (
        <IconPlaceholder
          lucide='CircleCheckIcon'
          tabler='IconCircleCheck'
          hugeicons='CheckmarkCircle02Icon'
          phosphor='CheckCircleIcon'
          remixicon='RiCheckboxCircleLine'
          aria-hidden
          className={cn(className, 'text-emerald-700 dark:text-emerald-400')}
        />
      )
    case 'output-error':
      return (
        <IconPlaceholder
          lucide='CircleAlertIcon'
          tabler='IconAlertCircle'
          hugeicons='AlertCircleIcon'
          phosphor='WarningCircleIcon'
          remixicon='RiErrorWarningLine'
          aria-hidden
          className={cn(className, 'text-red-700 dark:text-red-400')}
        />
      )
    case 'output-denied':
      return (
        <IconPlaceholder
          lucide='CircleXIcon'
          tabler='IconCircleX'
          hugeicons='CancelCircleIcon'
          phosphor='XCircleIcon'
          remixicon='RiCloseCircleLine'
          aria-hidden
          className={cn(className, 'text-muted-foreground')}
        />
      )
    case 'approval-requested':
      return (
        <IconPlaceholder
          lucide='CirclePauseIcon'
          tabler='IconPlayerPause'
          hugeicons='PauseIcon'
          phosphor='PauseCircleIcon'
          remixicon='RiPauseCircleLine'
          aria-hidden
          className={cn(className, 'text-orange-700 dark:text-orange-400')}
        />
      )
    case 'approval-responded':
      return part.approval?.approved === false ? (
        <IconPlaceholder
          lucide='CircleXIcon'
          tabler='IconCircleX'
          hugeicons='CancelCircleIcon'
          phosphor='XCircleIcon'
          remixicon='RiCloseCircleLine'
          aria-hidden
          className={cn(className, 'text-muted-foreground')}
        />
      ) : (
        <ToolSpinner className={className} />
      )
    default:
      return <ToolSpinner className={className} />
  }
}

function ToolSpinner({ className }: { className: string }) {
  return (
    <IconPlaceholder
      lucide='Loader2Icon'
      tabler='IconLoader'
      hugeicons='Loading03Icon'
      phosphor='SpinnerIcon'
      remixicon='RiLoaderLine'
      aria-hidden
      className={cn(
        className,
        'text-muted-foreground animate-spin motion-reduce:animate-none',
      )}
    />
  )
}

function getToolStatus(part: AIAnyToolPart, stopped: boolean) {
  if (stopped) return 'Not finished'
  switch (part.state) {
    case 'input-streaming':
      return 'Preparing…'
    case 'input-available':
      return 'Running…'
    case 'approval-requested':
      return 'Waiting for approval'
    case 'approval-responded':
      return part.approval?.approved === false ? 'Denied' : 'Approved. Running…'
    case 'output-available':
      return part.preliminary ? 'Running…' : null
    case 'output-error':
      return `Failed: ${part.errorText ?? 'the tool returned an error.'}`
    case 'output-denied':
      return part.approval?.reason ? `Denied: ${part.approval.reason}` : 'Denied'
  }
}

interface ToolCallProps {
  className?: string
  /** The reply is still arriving. Once it isn't, a call that never ended reads "Not finished" instead of spinning. @default true */
  inProgress?: boolean
  /** What the row calls the tool. @default the part's `title`, or its name in words */
  label?: string
  /** Answers a tool that waits for approval. Leave out to show that it waits, with no buttons. */
  onApprovalResponse?: (response: AIToolApprovalResponse) => void
  part: AIAnyToolPart
  /** The tool's result drawn as a block, such as a chart or a table, under the row. */
  result?: ReactNode
}

/** One tool call: its state, its input and output under Details, Approve and Deny when it waits for a person, and its result drawn as a block when the block gives one. */
function ToolCall({
  className,
  inProgress = true,
  label,
  onApprovalResponse,
  part,
  result,
}: ToolCallProps) {
  const name = label ?? getToolLabel(part)
  const stopped = !inProgress && isToolUnfinished(part)
  const status = getToolStatus(part, stopped)
  const rowRef = useRef<HTMLDivElement>(null)
  const waiting = part.state === 'approval-requested' && part.approval
  const hasDetails =
    part.state !== 'input-streaming' &&
    (part.input !== undefined || part.output !== undefined)

  function answer(approved: boolean) {
    if (!part.approval) return
    onApprovalResponse?.({ approved, id: part.approval.id })
    // The buttons go once it's answered: keep focus on the call they answered.
    rowRef.current?.focus()
  }

  return (
    <div data-slot='tool-call' className={cn('flex min-w-0 flex-col gap-3', className)}>
      <div
        ref={rowRef}
        tabIndex={-1}
        className='flex min-w-0 items-start gap-2 rounded-sm outline-none'
      >
        <ToolStateIcon part={part} stopped={stopped} />
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <p className='text-sm font-medium break-words'>{name}</p>
          {status && (
            <p
              className={cn(
                'text-xs break-words',
                part.state === 'output-error'
                  ? 'text-red-700 dark:text-red-400'
                  : part.state === 'approval-requested'
                    ? 'text-orange-700 dark:text-orange-400'
                    : 'text-muted-foreground',
              )}
            >
              {status}
              {waiting &&
                part.approval?.requestReason &&
                `: ${part.approval.requestReason}`}
            </p>
          )}
          {waiting && onApprovalResponse && (
            <div className='mt-1 flex flex-wrap gap-2'>
              <Button size='sm' onClick={() => answer(true)}>
                Approve
                <span className='sr-only'> {name}</span>
              </Button>
              <Button variant='outline' size='sm' onClick={() => answer(false)}>
                Deny
                <span className='sr-only'> {name}</span>
              </Button>
            </div>
          )}
          {hasDetails && (
            <Disclosure className='mt-1'>
              <DisclosureTrigger>
                Details<span className='sr-only'> of {name}</span>
              </DisclosureTrigger>
              <DisclosureContent>
                {part.input !== undefined && (
                  <ToolValue label='Input' tool={name} value={part.input} />
                )}
                {part.output !== undefined && (
                  <ToolValue label='Output' tool={name} value={part.output} />
                )}
              </DisclosureContent>
            </Disclosure>
          )}
        </div>
      </div>
      {result && <div className='flex min-w-0 flex-col gap-1.5'>{result}</div>}
    </div>
  )
}

// Only a file the browser already holds: a URL from a reply would load, unasked, from wherever the model chose.
function isLocalUrl(url: string) {
  return /^(?:data|blob):/i.test(url)
}

function FileIcon({ file }: { file: AIFilePart }) {
  if (file.mediaType.startsWith('image/') && isLocalUrl(file.url)) {
    return (
      <AttachmentMedia variant='image'>
        {/* oxlint-disable-next-line nextjs/no-img-element -- blocks install into any React project */}
        <img src={file.url} alt='' />
      </AttachmentMedia>
    )
  }
  return (
    <AttachmentMedia>
      <IconPlaceholder
        lucide='FileTextIcon'
        tabler='IconFileText'
        hugeicons='File02Icon'
        phosphor='FileTextIcon'
        remixicon='RiFileTextLine'
      />
    </AttachmentMedia>
  )
}

function fileKind({ filename, mediaType }: AIFilePart) {
  const extension = filename?.match(/\.([a-z0-9]{1,5})$/i)?.[1]
  if (extension) return extension.toUpperCase()
  const [type, subtype] = mediaType.split('/')
  if (subtype && subtype !== '*') return subtype.split(/[+.;]/)[0].toUpperCase()
  return type.charAt(0).toUpperCase() + type.slice(1)
}

/** The files a message carries, such as what the person attached. */
function MessageFiles({ className, files }: { className?: string; files: AIFilePart[] }) {
  if (files.length === 0) return null
  return (
    <ul
      data-slot='message-files'
      aria-label={files.length === 1 ? 'Attached file' : 'Attached files'}
      className={cn('flex max-w-full flex-wrap gap-2', className)}
    >
      {files.map((file, index) => (
        <li key={`${file.url}-${index}`} className='flex max-w-full min-w-0'>
          <Attachment size='sm'>
            <FileIcon file={file} />
            <AttachmentContent>
              <AttachmentTitle>{file.filename ?? 'File'}</AttachmentTitle>
              <AttachmentDescription>{fileKind(file)}</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
        </li>
      ))}
    </ul>
  )
}

type AIMessageGroup =
  | { key: string; type: 'thinking'; streaming: boolean; text: string }
  | { key: string; part: AIAnyToolPart; type: 'tool' }
  | { key: string; streaming: boolean; text: string; type: 'text' }

/** A reply's parts as it shows them: reasoning in a row joined into one thinking group, text, and each tool call. */
function groupParts(message: AIMessage, streaming: boolean): AIMessageGroup[] {
  const groups: AIMessageGroup[] = []
  const { parts } = message
  parts.forEach((part, index) => {
    const previous = groups.at(-1)
    // A stopped reply can leave a part marked streaming.
    const partStreaming = streaming && 'state' in part && part.state === 'streaming'
    if (part.type === 'reasoning') {
      if (previous?.type === 'thinking' && parts[index - 1]?.type === 'reasoning') {
        previous.text += `\n\n${part.text}`
        previous.streaming ||= partStreaming
      } else {
        groups.push({
          key: `thinking-${index}`,
          streaming: partStreaming,
          text: part.text,
          type: 'thinking',
        })
      }
    } else if (part.type === 'text') {
      groups.push({
        key: `text-${index}`,
        // A stopped reply's last text is cut mid-word: still close what it opened and drop a half-written citation.
        streaming: part.state === 'streaming',
        text: part.text,
        type: 'text',
      })
    } else if (isToolPart(part)) {
      groups.push({ key: part.toolCallId, part, type: 'tool' })
    } else if (part.type === 'step-start' && streaming && index === parts.length - 1) {
      // A step that has nothing to show yet: the model is thinking, so show the line its reasoning will fill.
      groups.push({
        key: `thinking-${index + 1}`,
        streaming: true,
        text: '',
        type: 'thinking',
      })
    }
  })
  return groups
}

// A model can call a tool by any name, `__proto__` and `toString` included.
function getLabel(labels: Record<string, string> | undefined, name: string) {
  if (!labels || !Object.hasOwn(labels, name)) return undefined
  const label = labels[name]
  return typeof label === 'string' ? label : undefined
}

interface AIMessagePartsProps {
  className?: string
  message: AIMessage
  /** Answers a tool call that waits for approval: pass the chat's `addToolApprovalResponse`. Approve and Deny show once the reply has stopped streaming. */
  onToolApprovalResponse?: (response: AIToolApprovalResponse) => void
  /** Draws a tool's result as a block, such as a chart, under its row. Return nothing to show only the row. */
  renderToolResult?: (part: AIAnyToolPart) => ReactNode
  /** Lists the sources under a finished reply. Turn it off when the block lists them itself. @default true */
  showSources?: boolean
  /** What `[n]` in the reply cites, when the block holds the sources rather than the reply's `source-url` parts. */
  sources?: AISource[]
  /** The reply is still arriving. */
  streaming?: boolean
  /** What each tool is called, by its name. Others read as their name in words. */
  toolLabels?: Record<string, string>
}

/** Whether a reply holds anything to show: a tool call, or text that reads as more than a cut-off citation such as `[1`. */
function hasAnswer(reply: Pick<AIMessage, 'parts'>) {
  return reply.parts.some(
    (part) =>
      isToolPart(part) ||
      (part.type === 'text' &&
        (part.state === 'streaming' ? completeMarkdown(part.text) : part.text).trim() !==
          ''),
  )
}

/** Everything a reply holds, in the order it came: thinking, text, tool calls, files, and its sources once it's done. */
function AIMessageParts({
  className,
  message,
  onToolApprovalResponse,
  renderToolResult,
  showSources = true,
  sources: sourcesProp,
  streaming = false,
  toolLabels,
}: AIMessagePartsProps) {
  const id = useId()
  const sources = sourcesProp ?? getMessageSources(message)
  const groups = groupParts(message, streaming)
  const files = getMessageFiles(message)
  return (
    <div
      data-slot='ai-message-parts'
      className={cn('flex min-w-0 flex-col gap-3', className)}
    >
      {groups.map((group) => {
        switch (group.type) {
          case 'thinking':
            return (
              <Thinking key={group.key} streaming={group.streaming} text={group.text} />
            )
          case 'text':
            return (
              <AIMarkdown
                key={group.key}
                text={group.text}
                sources={sources}
                streaming={group.streaming}
              />
            )
          case 'tool': {
            return (
              <ToolCall
                key={group.key}
                part={group.part}
                inProgress={streaming}
                label={getLabel(toolLabels, getToolName(group.part))}
                onApprovalResponse={streaming ? undefined : onToolApprovalResponse}
                result={
                  group.part.state === 'output-available' && !group.part.preliminary
                    ? renderToolResult?.(group.part)
                    : undefined
                }
              />
            )
          }
        }
      })}
      <MessageFiles files={files} />
      {showSources && !streaming && sources.length > 0 && (
        <SourceList id={id} sources={sources} />
      )}
    </div>
  )
}

export {
  AIMessageParts,
  groupParts,
  hasAnswer,
  isToolUnfinished,
  MessageFiles,
  Thinking,
  ThinkingIndicator,
  ToolCall,
  ToolValue,
}

export type {
  AIMessageGroup,
  AIMessagePartsProps,
  ThinkingProps,
  ToolCallProps,
  ToolValueProps,
}
