'use client'

import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import {
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from '@/components/ui/input-group'

import { cn } from '@/lib/utils'

/*
 * Provider-agnostic: messages, `status` and the callbacks have the same shapes
 * as the Vercel AI SDK's `useChat`, so its values plug straight in. Map each
 * message's text parts to `content`. Any other API works the same way, or use
 * `useChatStream` below with a function that streams text.
 */

type ChatRole = 'user' | 'assistant'

/** `submitted` waits for the first words of a reply, `streaming` while they arrive. */
type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'

type ChatFeedback = 'up' | 'down'

interface ChatMessageData {
  /** Plain text. Paragraphs, lists, **bold**, `code` and fenced code blocks are formatted. */
  content: string
  createdAt?: Date
  id: string
  role: ChatRole
}

function isBusy(status: ChatStatus) {
  return status === 'submitted' || status === 'streaming'
}

/* Formatting: a small, safe subset of Markdown rendered as React elements. */

type Block =
  | { type: 'code'; code: string; language: string }
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[]; ordered: boolean; start: number }
  | { type: 'paragraph'; lines: string[] }

const FENCE = /^\s*```\s*([\w+#.-]*)\s*$/
const HEADING = /^#{1,6}\s+(.+)$/
const LIST_ITEM = /^\s*(?:[-*•]|(\d+)[.)])\s+(.*)$/

function parseBlocks(content: string) {
  const lines = content.replace(/\r\n?/g, '\n').split('\n')
  const blocks: Block[] = []
  let index = 0
  while (index < lines.length) {
    const line = lines[index]
    const fence = FENCE.exec(line)
    if (fence) {
      // A fence still streaming in has no end yet: the rest is code.
      const code: string[] = []
      index++
      while (index < lines.length && !/^\s*```\s*$/.test(lines[index])) {
        code.push(lines[index])
        index++
      }
      blocks.push({ code: code.join('\n'), language: fence[1], type: 'code' })
      index++
      continue
    }
    if (!line.trim()) {
      index++
      continue
    }
    const heading = HEADING.exec(line)
    if (heading) {
      blocks.push({ text: heading[1], type: 'heading' })
      index++
      continue
    }
    const first = LIST_ITEM.exec(line)
    if (first) {
      const ordered = first[1] !== undefined
      const items: string[] = []
      while (index < lines.length) {
        const item = LIST_ITEM.exec(lines[index])
        if (item && (item[1] !== undefined) === ordered) {
          items.push(item[2])
        } else if (items.length > 0 && /^\s{2,}\S/.test(lines[index])) {
          // An indented line continues the item above it.
          items[items.length - 1] += ` ${lines[index].trim()}`
        } else {
          break
        }
        index++
      }
      blocks.push({ items, ordered, start: Number(first[1] ?? 1), type: 'list' })
      continue
    }
    const text: string[] = []
    while (
      index < lines.length &&
      lines[index].trim() &&
      !FENCE.test(lines[index]) &&
      !HEADING.test(lines[index]) &&
      !LIST_ITEM.test(lines[index])
    ) {
      text.push(lines[index])
      index++
    }
    blocks.push({ lines: text, type: 'paragraph' })
  }
  return blocks
}

/** `code` and **bold** inside a line. */
function renderInline(text: string) {
  return text.split(/(`[^`\n]+`|\*\*[^*\n]+\*\*)/g).map((part, index) => {
    if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className='bg-muted rounded-sm px-1 py-0.5 font-mono text-[0.85em]'
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className='font-semibold'>
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

/** Message text without formatting marks, for screen reader announcements. */
function toPlainText(content: string) {
  return content
    .replace(/^\s*```.*$/gm, '')
    .replace(/\*\*|`/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .trim()
}

/** Copies text to the clipboard, and says so for two seconds. */
function useCopyToClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      return false
    }
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), timeout)
    return true
  }

  return { copied, copy }
}

/** An icon button that copies `value`, shows a tick once copied and announces it. */
function CopyButton({
  className,
  label = 'Copy',
  size = 'icon-sm',
  value,
}: {
  className?: string
  /** Names the button, e.g. "Copy code". */
  label?: string
  size?: 'icon-xs' | 'icon-sm'
  value: string
}) {
  const { copied, copy } = useCopyToClipboard()
  return (
    <Button
      variant='ghost'
      size={size}
      className={className}
      aria-label={label}
      onClick={() => void copy(value)}
    >
      {copied ? (
        <IconPlaceholder
          lucide='CheckIcon'
          tabler='IconCheck'
          hugeicons='Tick02Icon'
          phosphor='CheckIcon'
          remixicon='RiCheckLine'
          aria-hidden
        />
      ) : (
        <IconPlaceholder
          lucide='CopyIcon'
          tabler='IconCopy'
          hugeicons='Copy01Icon'
          phosphor='CopyIcon'
          remixicon='RiFileCopyLine'
          aria-hidden
        />
      )}
      <span role='status' className='sr-only'>
        {copied ? 'Copied' : ''}
      </span>
    </Button>
  )
}

/** A fenced code block with its language and a copy button. */
function CodeBlock({
  caret,
  code,
  language,
}: {
  caret?: ReactNode
  code: string
  language: string
}) {
  return (
    <div className='bg-muted/50 overflow-hidden rounded-lg border'>
      <div className='flex items-center justify-between gap-2 border-b py-1 pr-1 pl-3'>
        <span className='text-muted-foreground font-mono text-xs'>
          {language || 'code'}
        </span>
        <CopyButton label='Copy code' size='icon-xs' value={code} />
      </div>
      <pre
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- lets keyboard users scroll long lines
        tabIndex={0}
        className='focus-visible:ring-ring/50 overflow-x-auto p-3 text-xs leading-relaxed outline-none focus-visible:ring-3 focus-visible:ring-inset'
      >
        <code className='font-mono text-xs'>{code}</code>
        {caret}
      </pre>
    </div>
  )
}

/** A blinking block at the end of a reply while it streams in. */
function StreamingCaret() {
  return (
    <span
      aria-hidden
      className='bg-foreground/70 ml-0.5 inline-block h-[1em] w-[0.45em] translate-y-[0.15em] animate-pulse rounded-[1px] motion-reduce:animate-none'
    />
  )
}

/**
 * Message text with light formatting: paragraphs and line breaks, bullet and
 * numbered lists, headings, **bold**, `code` and fenced code blocks. Renders
 * elements, never HTML, so replies can't inject markup.
 */
function MessageContent({
  caret,
  className,
  content,
}: {
  /** Placed after the last word, such as a streaming caret. */
  caret?: ReactNode
  className?: string
  content: string
}) {
  const blocks = parseBlocks(content)
  if (blocks.length === 0) return caret ? <p className={className}>{caret}</p> : null
  return (
    <div className={cn('flex flex-col gap-3 leading-relaxed break-words', className)}>
      {blocks.map((block, index) => {
        const end = index === blocks.length - 1 ? caret : null
        switch (block.type) {
          case 'code':
            return (
              <CodeBlock
                key={index}
                caret={end}
                code={block.code}
                language={block.language}
              />
            )
          case 'heading':
            return (
              <p key={index} className='font-semibold'>
                {renderInline(block.text)}
                {end}
              </p>
            )
          case 'list': {
            const List = block.ordered ? 'ol' : 'ul'
            return (
              <List
                key={index}
                start={block.ordered && block.start !== 1 ? block.start : undefined}
                className={cn(
                  'flex flex-col gap-1 pl-5',
                  block.ordered ? 'list-decimal' : 'list-disc',
                )}
              >
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className='marker:text-muted-foreground pl-1'>
                    {renderInline(item)}
                    {itemIndex === block.items.length - 1 && end}
                  </li>
                ))}
              </List>
            )
          }
          case 'paragraph':
            return (
              <p key={index}>
                {block.lines.map((line, lineIndex) => (
                  <span key={lineIndex}>
                    {lineIndex > 0 && <br />}
                    {renderInline(line)}
                  </span>
                ))}
                {end}
              </p>
            )
        }
      })}
    </div>
  )
}

/** The assistant's round mark, a sparkle by default. */
function AssistantAvatar({ className, icon }: { className?: string; icon?: ReactNode }) {
  return (
    <span
      aria-hidden
      className={cn(
        'bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-full [&_svg]:size-3.5',
        className,
      )}
    >
      {icon ?? (
        <IconPlaceholder
          lucide='SparklesIcon'
          tabler='IconSparkles'
          hugeicons='SparklesIcon'
          phosphor='SparkleIcon'
          remixicon='RiSparklingLine'
        />
      )}
    </span>
  )
}

/** The top of a chat: the assistant's mark, a title and description, and actions. */
function ChatHeader({
  actions,
  className,
  description,
  icon,
  title = 'Assistant',
}: {
  /** Buttons such as New chat and Close. */
  actions?: ReactNode
  className?: string
  description?: ReactNode
  /** Replaces the sparkle in the avatar. */
  icon?: ReactNode
  /** @default 'Assistant' */
  title?: string
}) {
  return (
    <div className={cn('flex items-center gap-3 px-4 py-3', className)}>
      <AssistantAvatar icon={icon} />
      <div className='flex min-w-0 flex-1 flex-col'>
        <h2 className='truncate text-sm font-semibold'>{title}</h2>
        {description && (
          <p className='text-muted-foreground truncate text-xs'>{description}</p>
        )}
      </div>
      {actions && <div className='flex shrink-0 items-center gap-1'>{actions}</div>}
    </div>
  )
}

interface ChatMessagesProps {
  children: ReactNode
  className?: string
  /** Around the messages inside the scrolling area, such as padding to line up with a card. */
  contentClassName?: string
  /** @default 'Conversation' */
  label?: string
  /** The newest message, read out once it has finished instead of word by word. */
  latest?: ChatMessageData
  /** Brings the log back to the bottom on a new message and announces progress. */
  status?: ChatStatus
}

/**
 * The scrolling log of messages. It follows new content while it's scrolled to
 * the bottom, and stays put when the reader scrolls up, with a button back to
 * the latest message. It scrolls itself, never the page.
 *
 * Streaming text isn't announced as it arrives: screen readers hear that the
 * assistant is thinking, then the whole reply once it's done.
 */
function ChatMessages({
  children,
  className,
  contentClassName,
  label = 'Conversation',
  latest,
  status = 'ready',
}: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const pinned = useRef(true)
  const lastScrollTop = useRef(0)
  const [atBottom, setAtBottom] = useState(true)
  const [announcement, setAnnouncement] = useState('')
  const [previousStatus, setPreviousStatus] = useState(status)

  if (status !== previousStatus) {
    setPreviousStatus(status)
    if (status === 'submitted') {
      setAnnouncement('Assistant is thinking')
    } else if (status === 'ready' && isBusy(previousStatus)) {
      setAnnouncement(latest?.role === 'assistant' ? toPlainText(latest.content) : '')
    }
  }

  function scrollToBottom() {
    const scroller = scrollRef.current
    if (scroller) scroller.scrollTop = scroller.scrollHeight
  }

  useEffect(() => {
    const scroller = scrollRef.current
    const content = contentRef.current
    if (!scroller || !content) return
    const observer = new ResizeObserver(() => {
      if (pinned.current) scroller.scrollTop = scroller.scrollHeight
    })
    observer.observe(content)
    observer.observe(scroller)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (status !== 'submitted') return
    pinned.current = true
    scrollToBottom()
  }, [status])

  // Only scrolling up lets go of the bottom: new content arriving before this
  // event also leaves a gap, and shouldn't.
  function onScroll() {
    const scroller = scrollRef.current
    if (!scroller) return
    const gap = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight
    if (gap < 24) pinned.current = true
    else if (scroller.scrollTop < lastScrollTop.current) pinned.current = false
    lastScrollTop.current = scroller.scrollTop
    setAtBottom(pinned.current)
  }

  return (
    <div className={cn('relative flex min-h-0 flex-1 flex-col', className)}>
      <div
        ref={scrollRef}
        role='log'
        aria-label={label}
        aria-live='off'
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- lets keyboard users scroll the log
        tabIndex={0}
        onScroll={onScroll}
        className='focus-visible:ring-ring/50 min-h-0 flex-1 overflow-y-auto overscroll-contain outline-none focus-visible:ring-3 focus-visible:ring-inset'
      >
        <div ref={contentRef} className={cn('flex flex-col gap-6 p-4', contentClassName)}>
          {children}
        </div>
      </div>
      {!atBottom && (
        <Button
          variant='outline'
          size='icon-sm'
          aria-label='Scroll to latest message'
          onClick={() => {
            pinned.current = true
            scrollToBottom()
          }}
          className='absolute bottom-3 left-1/2 -translate-x-1/2 shadow-sm'
        >
          <IconPlaceholder
            lucide='ArrowDownIcon'
            tabler='IconArrowDown'
            hugeicons='ArrowDown01Icon'
            phosphor='ArrowDownIcon'
            remixicon='RiArrowDownLine'
          />
        </Button>
      )}
      <div role='status' className='sr-only'>
        {announcement}
      </div>
    </div>
  )
}

interface ChatMessageProps {
  /** Under the message, such as `ChatMessageActions`. */
  actions?: ReactNode
  /** Replaces the assistant's sparkle avatar. */
  avatar?: ReactNode
  className?: string
  /** Under an assistant reply, above its actions, such as tokens and cost. */
  footer?: ReactNode
  message: ChatMessageData
  /** Who's speaking, for screen readers. Defaults to "You" and "Assistant". */
  name?: string
  /** Shows a caret after the last word while the reply streams in. */
  streaming?: boolean
}

/** One message: the user's in a bubble on the right, the assistant's beside its avatar. */
function ChatMessage({
  actions,
  avatar,
  className,
  footer,
  message,
  name,
  streaming,
}: ChatMessageProps) {
  if (message.role === 'user') {
    return (
      <div data-role='user' className={cn('flex flex-col items-end gap-1', className)}>
        <div className='bg-muted max-w-[85%] rounded-2xl px-3.5 py-2 text-sm'>
          <span className='sr-only'>{name ?? 'You'}: </span>
          <MessageContent content={message.content} />
        </div>
        {actions}
      </div>
    )
  }
  return (
    <div data-role='assistant' className={cn('flex gap-3', className)}>
      {avatar ?? <AssistantAvatar />}
      <div className='flex min-w-0 flex-1 flex-col gap-2 pt-1 text-sm'>
        <span className='sr-only'>{name ?? 'Assistant'}: </span>
        <MessageContent
          content={message.content}
          caret={streaming ? <StreamingCaret /> : undefined}
        />
        {footer}
        {actions}
      </div>
    </div>
  )
}

interface ChatMessageActionsProps {
  className?: string
  /** The text the copy button copies. */
  content: string
  /** The rating given, shown as a pressed thumb. */
  feedback?: ChatFeedback | null
  /** Shows thumbs up and down. Called with `null` when a rating is taken back. */
  onFeedback?: (feedback: ChatFeedback | null) => void
  /** Shows a regenerate button, usually on the last reply only. */
  onRegenerate?: () => void
}

/** Copy, regenerate and thumbs up and down under a reply. */
function ChatMessageActions({
  className,
  content,
  feedback,
  onFeedback,
  onRegenerate,
}: ChatMessageActionsProps) {
  return (
    <div
      role='group'
      aria-label='Message actions'
      className={cn('text-muted-foreground -ml-1.5 flex items-center gap-0.5', className)}
    >
      <CopyButton label='Copy message' value={content} />
      {onRegenerate && (
        <Button
          variant='ghost'
          size='icon-sm'
          aria-label='Regenerate response'
          onClick={onRegenerate}
        >
          <IconPlaceholder
            lucide='RefreshCwIcon'
            tabler='IconRefresh'
            hugeicons='RefreshIcon'
            phosphor='ArrowClockwiseIcon'
            remixicon='RiRefreshLine'
          />
        </Button>
      )}
      {onFeedback && (
        <>
          <Button
            variant='ghost'
            size='icon-sm'
            aria-label='Good response'
            aria-pressed={feedback === 'up'}
            onClick={() => onFeedback(feedback === 'up' ? null : 'up')}
            className='aria-pressed:text-foreground'
          >
            <IconPlaceholder
              lucide='ThumbsUpIcon'
              tabler='IconThumbUp'
              hugeicons='ThumbsUpIcon'
              phosphor='ThumbsUpIcon'
              remixicon='RiThumbUpLine'
              className={cn(feedback === 'up' && 'fill-current')}
            />
          </Button>
          <Button
            variant='ghost'
            size='icon-sm'
            aria-label='Bad response'
            aria-pressed={feedback === 'down'}
            onClick={() => onFeedback(feedback === 'down' ? null : 'down')}
            className='aria-pressed:text-foreground'
          >
            <IconPlaceholder
              lucide='ThumbsDownIcon'
              tabler='IconThumbDown'
              hugeicons='ThumbsDownIcon'
              phosphor='ThumbsDownIcon'
              remixicon='RiThumbDownLine'
              className={cn(feedback === 'down' && 'fill-current')}
            />
          </Button>
        </>
      )}
    </div>
  )
}

/** Three pulsing dots beside the avatar while the assistant works on a reply. */
function TypingIndicator({
  className,
  label = 'Assistant is thinking',
}: {
  className?: string
  /** @default 'Assistant is thinking' */
  label?: string
}) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <AssistantAvatar />
      <span aria-hidden className='flex items-center gap-1'>
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className='bg-muted-foreground size-1.5 animate-pulse rounded-full motion-reduce:animate-none'
            style={{ animationDelay: `${dot * 300}ms` }}
          />
        ))}
      </span>
      <span className='sr-only'>{label}</span>
    </div>
  )
}

interface SuggestedPrompt {
  icon?: ReactNode
  label: string
  /** Sent instead of the label, when the question is longer than its label. */
  prompt?: string
}

interface SuggestedPromptsProps {
  className?: string
  /** Names the list for screen readers. @default 'Suggested prompts' */
  label?: string
  onSelect: (prompt: string) => void
  prompts: SuggestedPrompt[]
  /** `chips` wrap in a row, `list` stacks full-width rows. @default 'chips' */
  variant?: 'chips' | 'list'
}

/** Questions to start from. Choosing one sends it. */
function SuggestedPrompts({
  className,
  label = 'Suggested prompts',
  onSelect,
  prompts,
  variant = 'chips',
}: SuggestedPromptsProps) {
  return (
    <ul
      aria-label={label}
      className={cn(
        variant === 'chips' ? 'flex flex-wrap gap-2' : 'flex flex-col gap-2',
        className,
      )}
    >
      {prompts.map((prompt) => (
        <li key={prompt.label} className='flex max-w-full'>
          {/* Not a Button: long questions wrap instead of being cut off. */}
          <button
            type='button'
            onClick={() => onSelect(prompt.prompt ?? prompt.label)}
            className={cn(
              'hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-ring/50 bg-background flex items-center rounded-lg border text-left text-sm transition-colors outline-none focus-visible:ring-3 motion-reduce:transition-none [&_svg]:size-4 [&_svg]:shrink-0',
              variant === 'chips' ? 'gap-2 px-3 py-1.5' : 'w-full gap-3 px-3 py-2.5',
            )}
          >
            {prompt.icon && (
              <span className='text-muted-foreground flex'>{prompt.icon}</span>
            )}
            {prompt.label}
          </button>
        </li>
      ))}
    </ul>
  )
}

/** The empty state: the assistant's mark, a greeting and what it can help with. */
function ChatWelcome({
  children,
  className,
  description,
  title,
}: {
  /** Under the text, such as `SuggestedPrompts`. */
  children?: ReactNode
  className?: string
  description?: ReactNode
  title: string
}) {
  return (
    <div className={cn('flex flex-col items-center gap-4 text-center', className)}>
      <AssistantAvatar className='size-10 [&_svg]:size-5' />
      <div className='flex flex-col gap-1'>
        <p className='font-medium'>{title}</p>
        {description && (
          <p className='text-muted-foreground text-sm text-balance'>{description}</p>
        )}
      </div>
      {children && <div className='w-full text-left'>{children}</div>}
    </div>
  )
}

/** A failed reply, with a button to try again. */
function ChatError({
  className,
  message = 'Something went wrong. Try again.',
  onRetry,
}: {
  className?: string
  /** @default 'Something went wrong. Try again.' */
  message?: string
  onRetry?: () => void
}) {
  return (
    <div
      role='alert'
      className={cn(
        'border-destructive/30 bg-destructive/5 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border px-3 py-2 text-sm',
        className,
      )}
    >
      <div className='flex min-w-48 flex-1 items-start gap-3'>
        <IconPlaceholder
          lucide='TriangleAlertIcon'
          tabler='IconAlertTriangle'
          hugeicons='Alert02Icon'
          phosphor='WarningIcon'
          remixicon='RiErrorWarningLine'
          className='text-destructive mt-0.5 size-4 shrink-0'
        />
        <p className='flex-1'>{message}</p>
      </div>
      {onRetry && (
        <Button variant='outline' size='sm' className='ml-auto' onClick={onRetry}>
          <IconPlaceholder
            lucide='RefreshCwIcon'
            tabler='IconRefresh'
            hugeicons='RefreshIcon'
            phosphor='ArrowClockwiseIcon'
            remixicon='RiRefreshLine'
            data-icon='inline-start'
          />
          Retry
        </Button>
      )}
    </div>
  )
}

/** Something the assistant will look at, such as the current page or a file, with a remove button. */
function ChatContextChip({
  className,
  icon,
  label,
  onRemove,
}: {
  className?: string
  icon?: ReactNode
  label: string
  /** Shows a remove button. */
  onRemove?: () => void
}) {
  return (
    <span
      className={cn(
        'bg-muted text-foreground inline-flex h-6 max-w-full items-center gap-1.5 rounded-md pl-2 text-xs font-medium [&_svg]:size-3.5 [&_svg]:shrink-0',
        onRemove ? 'pr-0.5' : 'pr-2',
        className,
      )}
    >
      {icon}
      <span className='truncate'>{label}</span>
      {onRemove && (
        <button
          type='button'
          aria-label={`Remove ${label}`}
          onClick={onRemove}
          className='text-muted-foreground hover:bg-foreground/10 hover:text-foreground focus-visible:ring-ring/50 flex size-5 items-center justify-center rounded-sm outline-none focus-visible:ring-2 [&_svg]:size-3'
        >
          <IconPlaceholder
            lucide='XIcon'
            tabler='IconX'
            hugeicons='Cancel01Icon'
            phosphor='XIcon'
            remixicon='RiCloseLine'
          />
        </button>
      )}
    </span>
  )
}

interface ChatComposerProps {
  className?: string
  /** Above the text, such as `ChatContextChip`s for the page or files in view. */
  context?: ReactNode
  /** Turns the composer off, e.g. while the assistant is unavailable. */
  disabled?: boolean
  /** Names the text box. @default 'Message' */
  label?: string
  /** Stops the reply. While one streams, the send button becomes Stop. */
  onStop?: () => void
  onSubmit: (text: string) => void
  /** Controlled text. Leave out to let the composer keep it. */
  onValueChange?: (value: string) => void
  /** @default 'Ask anything…' */
  placeholder?: string
  /** Sending waits until the status is `ready` or `error`. */
  status?: ChatStatus
  /** The text box, to focus it after an action such as opening the panel. */
  textareaRef?: Ref<HTMLTextAreaElement>
  /** Left of the send button, such as an attach button or a model picker. */
  tools?: ReactNode
  value?: string
}

/**
 * The message box. It grows with its text; Enter sends and Shift+Enter adds a
 * line. While a reply is on its way, sending waits and the send button stops it.
 */
function ChatComposer({
  className,
  context,
  disabled,
  label = 'Message',
  onStop,
  onSubmit,
  onValueChange,
  placeholder = 'Ask anything…',
  status = 'ready',
  textareaRef,
  tools,
  value,
}: ChatComposerProps) {
  const hintId = useId()
  const inner = useRef<HTMLTextAreaElement>(null)
  const [draft, setDraft] = useState('')
  const text = value ?? draft
  const busy = isBusy(status)
  const canSend = !disabled && !busy && text.trim().length > 0

  useImperativeHandle(textareaRef, () => inner.current as HTMLTextAreaElement, [])

  function change(next: string) {
    setDraft(next)
    onValueChange?.(next)
  }

  function send() {
    if (!canSend) return
    onSubmit(text.trim())
    change('')
    inner.current?.focus()
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    send()
  }

  return (
    <form
      className={className}
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        send()
      }}
    >
      <InputGroup>
        {context && (
          <InputGroupAddon align='block-start' className='flex-wrap gap-1.5'>
            {context}
          </InputGroupAddon>
        )}
        <InputGroupTextarea
          ref={inner}
          aria-label={label}
          aria-describedby={hintId}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          value={text}
          onChange={(event) => change(event.target.value)}
          onKeyDown={onKeyDown}
          className='max-h-48'
        />
        <InputGroupAddon align='block-end'>
          {tools}
          {busy && onStop ? (
            <Button
              type='button'
              size='icon-sm'
              aria-label='Stop generating'
              onClick={() => {
                onStop()
                inner.current?.focus()
              }}
              className='ml-auto'
            >
              <IconPlaceholder
                lucide='SquareIcon'
                tabler='IconPlayerStopFilled'
                hugeicons='StopIcon'
                phosphor='StopIcon'
                remixicon='RiStopFill'
                className='fill-current'
              />
            </Button>
          ) : (
            <Button
              type='submit'
              size='icon-sm'
              aria-label='Send message'
              disabled={!canSend}
              className='ml-auto'
            >
              <IconPlaceholder
                lucide='ArrowUpIcon'
                tabler='IconArrowUp'
                hugeicons='ArrowUpIcon'
                phosphor='ArrowUpIcon'
                remixicon='RiArrowUpLine'
              />
            </Button>
          )}
        </InputGroupAddon>
      </InputGroup>
      <p id={hintId} className='sr-only'>
        Press Enter to send and Shift+Enter for a new line.
      </p>
    </form>
  )
}

const STOPPED = 'stopped'

interface UseChatStreamOptions {
  /** A failed request to show on load, such as one saved with the conversation. */
  initialError?: string
  initialMessages?: ChatMessageData[]
  /** Runs when a reply ends, whether it finished or was stopped. `messages` ends with it. */
  onFinish?: (
    message: ChatMessageData,
    info: { messages: ChatMessageData[]; stopped: boolean },
  ) => void
  /**
   * Streams the reply to the conversation so far as chunks of text, such as
   * from `fetch` with a streamed body. Stopping aborts `signal`.
   */
  onSend: (messages: ChatMessageData[], signal: AbortSignal) => AsyncIterable<string>
}

/**
 * Messages, status and actions for a chat, from any function that streams
 * text. Like the AI SDK's `useChat`, without the SDK: use `useChat` instead if
 * you already have it.
 */
function useChatStream({
  initialError,
  initialMessages = [],
  onFinish,
  onSend,
}: UseChatStreamOptions) {
  const idPrefix = useId()
  const nextId = useRef(0)
  const controller = useRef<AbortController | null>(null)
  const history = useRef(initialMessages)
  const [messages, setMessagesState] = useState(initialMessages)
  const [status, setStatus] = useState<ChatStatus>(initialError ? 'error' : 'ready')
  const [error, setError] = useState(initialError)

  useEffect(() => () => controller.current?.abort(), [])

  function setMessages(next: ChatMessageData[]) {
    history.current = next
    setMessagesState(next)
  }

  async function run(conversation: ChatMessageData[]) {
    const current = new AbortController()
    controller.current = current
    setMessages(conversation)
    setStatus('submitted')
    setError(undefined)
    const reply: ChatMessageData = {
      content: '',
      createdAt: new Date(),
      id: `${idPrefix}${++nextId.current}`,
      role: 'assistant',
    }
    try {
      for await (const chunk of onSend(conversation, current.signal)) {
        if (current.signal.aborted) break
        reply.content += chunk
        setMessages([...conversation, { ...reply }])
        setStatus('streaming')
      }
    } catch (caught) {
      if (!current.signal.aborted) {
        controller.current = null
        setError(caught instanceof Error ? caught.message : String(caught))
        setStatus('error')
        return
      }
    }
    // Stopping keeps the reply so far; a new chat or unmounting drops it.
    const stopped = current.signal.aborted
    if (stopped && current.signal.reason !== STOPPED) return
    if (!stopped) {
      controller.current = null
      setStatus('ready')
    }
    if (reply.content) {
      const message = { ...reply }
      onFinish?.(message, { messages: [...conversation, message], stopped })
    }
  }

  /** Sends a message from the user. Waits while a reply is on its way. */
  function send(text: string) {
    if (controller.current) return
    void run([
      ...history.current,
      {
        content: text,
        createdAt: new Date(),
        id: `${idPrefix}${++nextId.current}`,
        role: 'user',
      },
    ])
  }

  /** Asks again for the last reply, or retries a failed one. */
  function regenerate() {
    if (controller.current) return
    const conversation = [...history.current]
    while (conversation.at(-1)?.role === 'assistant') conversation.pop()
    if (conversation.length > 0) void run(conversation)
  }

  /** Stops the reply, keeping what has arrived. */
  function stop() {
    controller.current?.abort(STOPPED)
    controller.current = null
    setStatus('ready')
  }

  /** Starts a new chat. */
  function reset() {
    controller.current?.abort()
    controller.current = null
    setMessages([])
    setError(undefined)
    setStatus('ready')
  }

  return { error, messages, regenerate, reset, send, status, stop }
}

export {
  AssistantAvatar,
  ChatComposer,
  ChatContextChip,
  ChatError,
  ChatHeader,
  ChatMessage,
  ChatMessageActions,
  ChatMessages,
  ChatWelcome,
  MessageContent,
  SuggestedPrompts,
  TypingIndicator,
  isBusy,
  useChatStream,
}

export type {
  ChatComposerProps,
  ChatFeedback,
  ChatMessageActionsProps,
  ChatMessageData,
  ChatMessageProps,
  ChatMessagesProps,
  ChatRole,
  ChatStatus,
  SuggestedPrompt,
  SuggestedPromptsProps,
  UseChatStreamOptions,
}
