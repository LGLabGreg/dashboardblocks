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
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Button } from '@/components/ui/button'
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from '@/components/ui/code-block'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { Marker, MarkerContent, MarkerIcon } from '@/components/ui/marker'
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
} from '@/components/ui/message'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from '@/components/ui/message-scroller'

import { useHighlightedCode } from '@/hooks/use-highlighted-code'

import { cn } from '@/lib/utils'

type ChatRole = 'user' | 'assistant'

/** `submitted` waits for the first words of a reply, `streaming` while they arrive. */
type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'

type ChatFeedback = 'up' | 'down'

interface ChatMessageData {
  content: string
  createdAt?: Date
  id: string
  role: ChatRole
}

function isBusy(status: ChatStatus) {
  return status === 'submitted' || status === 'streaming'
}

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

function toPlainText(content: string) {
  return content
    .replace(/^\s*```.*$/gm, '')
    .replace(/\*\*|`/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .trim()
}

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

function CopyButton({
  className,
  label = 'Copy',
  value,
}: {
  className?: string
  label?: string
  value: string
}) {
  const { copied, copy } = useCopyToClipboard()
  return (
    <Button
      variant='ghost'
      size='icon-sm'
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

function highlightable(language: string) {
  return !Object.hasOwn(Object.prototype, language.toLowerCase())
}

function ChatCodeBlock({
  caret,
  code,
  language,
}: {
  caret?: ReactNode
  code: string
  language: string
}) {
  const lines = useHighlightedCode(code, highlightable(language) ? language : '')
  return (
    <CodeBlock size='sm'>
      <CodeBlockHeader>
        <CodeBlockTitle>{language || 'code'}</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton size='icon-sm' aria-label='Copy code' value={code} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent className='mask-none'>
        {lines.map((line, index) => (
          <CodeBlockLine key={index}>
            {caret && index === lines.length - 1 ? (
              <>
                {line}
                {caret}
              </>
            ) : (
              line
            )}
          </CodeBlockLine>
        ))}
      </CodeBlockContent>
    </CodeBlock>
  )
}

function StreamingCaret() {
  return (
    <span
      aria-hidden
      className='bg-foreground/70 ms-0.5 inline-block h-[1em] w-[0.45em] translate-y-[0.15em] animate-pulse rounded-[1px] motion-reduce:animate-none'
    />
  )
}

/** Message text with light formatting: paragraphs and line breaks, bullet and numbered lists, headings, **bold**, `code` and fenced code blocks. */
function ChatMessageContent({
  caret,
  className,
  content,
}: {
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
              <ChatCodeBlock
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
                  'flex flex-col gap-1 ps-5',
                  block.ordered ? 'list-decimal' : 'list-disc',
                )}
              >
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className='marker:text-muted-foreground ps-1'>
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

function ChatHeader({
  actions,
  className,
  description,
  icon,
  title = 'Assistant',
}: {
  actions?: ReactNode
  className?: string
  description?: ReactNode
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

const QUESTION_PEEK_PX = 64
const SCROLL_KEYS = new Set([
  'ArrowDown',
  'ArrowUp',
  'End',
  'Home',
  'PageDown',
  'PageUp',
  ' ',
])

// Message Scroller places a saved conversation by its height, which `content-visibility: auto` estimates while the log is off screen.
const MEASURED_ITEM = '[content-visibility:visible]'

interface ChatMessagesProps {
  children: ReactNode
  className?: string
  contentClassName?: string
  /** @default 'Conversation' */
  label?: string
  /** The newest message, read out once it has finished instead of word by word. */
  latest?: ChatMessageData
  /** Moves each new question to the top when the status turns `submitted`, and announces that the assistant is thinking, then the finished reply. Without it, the log follows the end for new questions. */
  status?: ChatStatus
}

function latestQuestion(content: HTMLElement | null) {
  return [...(content?.querySelectorAll<HTMLElement>('[data-chat-question]') ?? [])].at(
    -1,
  )
}

function ChatMessages(props: ChatMessagesProps) {
  const [selecting, setSelecting] = useState(false)
  return (
    <MessageScrollerProvider autoScroll={!selecting}>
      <ChatLog {...props} onSelectingChange={setSelecting} />
    </MessageScrollerProvider>
  )
}

function ChatLog({
  children,
  className,
  contentClassName,
  label = 'Conversation',
  latest,
  onSelectingChange,
  status = 'ready',
}: ChatMessagesProps & { onSelectingChange: (selecting: boolean) => void }) {
  const scroller = useMessageScroller()
  const scrollerRef = useRef(scroller)
  const viewportRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const heldQuestion = useRef<string | null>(null)
  const placedTop = useRef<number | null>(null)
  const opened = useRef(false)
  const placedForStatus = useRef(status)
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

  // A status region that mounts with its text isn't read: announce a question already on its way once the region is in the page.
  const mountedStatus = useRef(status)
  useEffect(() => {
    if (mountedStatus.current !== 'submitted') return
    const frame = requestAnimationFrame(() => setAnnouncement('Assistant is thinking'))
    return () => cancelAnimationFrame(frame)
  }, [])

  useLayoutEffect(() => {
    scrollerRef.current = scroller
  })

  function placeQuestion(id: string) {
    heldQuestion.current = id
    scrollerRef.current.scrollToMessage(id, { scrollMargin: QUESTION_PEEK_PX })
    placedTop.current = viewportRef.current?.scrollTop ?? null
  }

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const content = contentRef.current
    return () => {
      if (!viewport || !content || viewport.clientHeight === 0) return
      if (viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 2) return
      const item = content.querySelector<HTMLElement>('[data-message-id]')
      const id = item?.dataset.messageId
      if (!item || !id) return
      const offset =
        item.getBoundingClientRect().top -
        viewport.getBoundingClientRect().top -
        parseFloat(getComputedStyle(content).paddingTop)
      // Message Scroller goes back to following the end while hidden unless it's mid-jump, so make the current position one.
      scrollerRef.current.scrollToMessage(id, { scrollMargin: offset })
    }
  }, [])

  useLayoutEffect(() => {
    if (opened.current) return
    opened.current = true
    const content = contentRef.current
    const question = latestQuestion(content)
    const id = question?.dataset.messageId
    if (!content || !question || !id || !viewportRef.current) return
    const rest =
      content.getBoundingClientRect().bottom -
      question.getBoundingClientRect().top +
      QUESTION_PEEK_PX
    if (rest <= viewportRef.current.clientHeight) return
    placeQuestion(id)
  }, [])

  useEffect(() => {
    const before = placedForStatus.current
    placedForStatus.current = status
    if (status !== 'submitted' || before === 'submitted') return
    const id = latestQuestion(contentRef.current)?.dataset.messageId
    if (!id) return
    heldQuestion.current = id
    const frame = requestAnimationFrame(() => placeQuestion(id))
    return () => cancelAnimationFrame(frame)
  }, [status])

  useEffect(() => {
    const content = contentRef.current
    if (!content) return
    const observer = new ResizeObserver(() => {
      const id = heldQuestion.current
      if (!id) return
      if (latestQuestion(content)?.dataset.messageId !== id) {
        heldQuestion.current = null
        return
      }
      placeQuestion(id)
    })
    observer.observe(content)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    function onSelectionChange() {
      const selection = document.getSelection()
      const inLog = Boolean(
        selection &&
        !selection.isCollapsed &&
        viewportRef.current?.contains(selection.anchorNode),
      )
      if (inLog) heldQuestion.current = null
      onSelectingChange(inLog)
    }
    document.addEventListener('selectionchange', onSelectionChange)
    return () => document.removeEventListener('selectionchange', onSelectionChange)
  }, [onSelectingChange])

  function release() {
    heldQuestion.current = null
    placedTop.current = null
  }

  return (
    <MessageScroller className={cn('flex-1', className)}>
      <MessageScrollerViewport
        ref={viewportRef}
        role='log'
        aria-label={label}
        aria-live='off'
        onScroll={(event) => {
          const viewport = event.currentTarget
          const top = placedTop.current
          const held = heldQuestion.current
          if (viewport.clientHeight === 0 || top === null || held === null) return
          if (Math.abs(viewport.scrollTop - top) <= 1) return
          const clamped =
            viewport.scrollTop < top &&
            viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <= 1
          if (clamped) placeQuestion(held)
          else release()
        }}
        onWheel={release}
        onTouchMove={release}
        onPointerDown={release}
        onKeyDown={(event) => {
          if (SCROLL_KEYS.has(event.key)) release()
        }}
        className='mask-none focus-visible:ring-ring/50 outline-none focus-visible:ring-3 focus-visible:ring-inset'
      >
        <MessageScrollerContent
          ref={contentRef}
          role='none'
          className={cn('p-4', contentClassName)}
        >
          {children}
        </MessageScrollerContent>
      </MessageScrollerViewport>
      <MessageScrollerButton
        behavior='auto'
        onClick={() => {
          release()
          viewportRef.current?.focus({ preventScroll: true })
        }}
      >
        <IconPlaceholder
          lucide='ArrowDownIcon'
          tabler='IconArrowDown'
          hugeicons='ArrowDown01Icon'
          phosphor='ArrowDownIcon'
          remixicon='RiArrowDownLine'
        />
        <span className='sr-only'>Scroll to latest message</span>
      </MessageScrollerButton>
      <div role='status' className='sr-only'>
        {announcement}
      </div>
    </MessageScroller>
  )
}

interface ChatMessageProps {
  actions?: ReactNode
  avatar?: ReactNode
  className?: string
  footer?: ReactNode
  message: ChatMessageData
  name?: string
  streaming?: boolean
}

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
      <MessageScrollerItem
        messageId={message.id}
        data-chat-question
        className={MEASURED_ITEM}
      >
        <Message data-role='user' align='end' className={className}>
          <MessageContent>
            <Bubble variant='muted' align='end'>
              <BubbleContent>
                <span className='sr-only'>{name ?? 'You'}: </span>
                <ChatMessageContent content={message.content} />
              </BubbleContent>
            </Bubble>
            {actions}
          </MessageContent>
        </Message>
      </MessageScrollerItem>
    )
  }
  return (
    <MessageScrollerItem messageId={message.id} className={MEASURED_ITEM}>
      <Message data-role='assistant' className={className}>
        <AssistantMessageAvatar avatar={avatar} />
        <MessageContent>
          <Bubble variant='ghost'>
            <BubbleContent>
              <span className='sr-only'>{name ?? 'Assistant'}: </span>
              <ChatMessageContent
                content={message.content}
                caret={streaming ? <StreamingCaret /> : undefined}
              />
            </BubbleContent>
          </Bubble>
          {footer}
          {actions && <MessageFooter>{actions}</MessageFooter>}
        </MessageContent>
      </Message>
    </MessageScrollerItem>
  )
}

function AssistantMessageAvatar({ avatar }: { avatar?: ReactNode }) {
  return (
    <MessageAvatar className='self-start group-has-data-[slot=message-footer]/message:translate-y-0'>
      {avatar ?? <AssistantAvatar className='size-8' />}
    </MessageAvatar>
  )
}

interface ChatMessageActionsProps {
  className?: string
  content: string
  feedback?: ChatFeedback | null
  /** Shows thumbs up and down. */
  onFeedback?: (feedback: ChatFeedback | null) => void
  /** Shows a regenerate button, usually on the last reply only. */
  onRegenerate?: () => void
}

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
      className={cn('text-muted-foreground -ms-1.5 flex items-center gap-0.5', className)}
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

function TypingIndicator({
  className,
  label = 'Thinking…',
}: {
  className?: string
  /** @default 'Thinking…' */
  label?: string
}) {
  return (
    <Message data-role='assistant' className={className}>
      <AssistantMessageAvatar />
      <MessageContent>
        <Marker>
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
      </MessageContent>
    </Message>
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
  label?: string
  onSelect: (prompt: string) => void
  prompts: SuggestedPrompt[]
  variant?: 'chips' | 'list'
}

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
        variant === 'chips'
          ? '-mx-1 flex scroll-px-1 gap-2 overflow-x-auto overscroll-x-contain p-1'
          : 'flex flex-col gap-2',
        className,
      )}
    >
      {prompts.map((prompt) =>
        variant === 'chips' ? (
          <li key={prompt.label} className='flex shrink-0'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => onSelect(prompt.prompt ?? prompt.label)}
              onFocus={(event) =>
                event.currentTarget.scrollIntoView({
                  block: 'nearest',
                  inline: 'nearest',
                })
              }
            >
              {prompt.icon}
              {prompt.label}
            </Button>
          </li>
        ) : (
          <li key={prompt.label} className='flex max-w-full'>
            <button
              type='button'
              onClick={() => onSelect(prompt.prompt ?? prompt.label)}
              className='hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-ring/50 bg-background flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-start text-sm transition-colors outline-none focus-visible:ring-3 motion-reduce:transition-none [&_svg]:size-4 [&_svg]:shrink-0'
            >
              {prompt.icon && (
                <span className='text-muted-foreground flex'>{prompt.icon}</span>
              )}
              {prompt.label}
            </button>
          </li>
        ),
      )}
    </ul>
  )
}

function ChatWelcome({
  children,
  className,
  description,
  title,
}: {
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
      {children && <div className='w-full text-start'>{children}</div>}
    </div>
  )
}

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
    <div className={cn('flex flex-col items-start gap-2', className)}>
      <Bubble variant='destructive' role='alert'>
        <BubbleContent className='flex items-start gap-2'>
          <IconPlaceholder
            lucide='TriangleAlertIcon'
            tabler='IconAlertTriangle'
            hugeicons='Alert02Icon'
            phosphor='WarningIcon'
            remixicon='RiErrorWarningLine'
            className='mt-1 size-4 shrink-0'
          />
          <p className='min-w-0'>{message}</p>
        </BubbleContent>
      </Bubble>
      {onRetry && (
        <Button variant='outline' size='sm' onClick={onRetry}>
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
    <Attachment size='xs' className={className}>
      {icon && <AttachmentMedia>{icon}</AttachmentMedia>}
      <AttachmentContent>
        <AttachmentTitle>{label}</AttachmentTitle>
      </AttachmentContent>
      {onRemove && (
        <AttachmentActions>
          <AttachmentAction
            type='button'
            aria-label={`Remove ${label}`}
            onClick={onRemove}
          >
            <IconPlaceholder
              lucide='XIcon'
              tabler='IconX'
              hugeicons='Cancel01Icon'
              phosphor='XIcon'
              remixicon='RiCloseLine'
            />
          </AttachmentAction>
        </AttachmentActions>
      )}
    </Attachment>
  )
}

interface ChatComposerProps {
  className?: string
  context?: ReactNode
  disabled?: boolean
  label?: string
  onStop?: () => void
  onSubmit: (text: string) => void
  onValueChange?: (value: string) => void
  /** @default 'Ask anything…' */
  placeholder?: string
  /** Sending waits until the status is `ready` or `error`. */
  status?: ChatStatus
  textareaRef?: Ref<HTMLTextAreaElement>
  tools?: ReactNode
  value?: string
}

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
  const canSend = !disabled && !busy

  useImperativeHandle(textareaRef, () => inner.current as HTMLTextAreaElement, [])

  function change(next: string) {
    setDraft(next)
    onValueChange?.(next)
  }

  function send() {
    if (!canSend) return
    if (!text.trim()) return inner.current?.focus()
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
      method='post'
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
              className='ms-auto'
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
              className='ms-auto'
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
  initialError?: string
  initialMessages?: ChatMessageData[]
  /** Runs when a reply ends, whether it finished or was stopped. */
  onFinish?: (
    message: ChatMessageData,
    info: { messages: ChatMessageData[]; stopped: boolean },
  ) => void
  /** Streams the reply to the conversation so far as chunks of text, such as from `fetch` with a streamed body. */
  onSend: (messages: ChatMessageData[], signal: AbortSignal) => AsyncIterable<string>
}

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

  useEffect(
    () => () => {
      if (!controller.current) return
      controller.current.abort(STOPPED)
      controller.current = null
      setStatus('ready')
    },
    [],
  )

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
    const stopped = current.signal.aborted
    const keepPartialReply = !stopped || current.signal.reason === STOPPED
    if (!keepPartialReply) return
    if (!stopped) {
      controller.current = null
      setStatus('ready')
    }
    if (reply.content) {
      const message = { ...reply }
      onFinish?.(message, { messages: [...conversation, message], stopped })
    }
  }

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

  function regenerate() {
    if (controller.current) return
    const conversation = [...history.current]
    while (conversation.at(-1)?.role === 'assistant') conversation.pop()
    if (conversation.length > 0) void run(conversation)
  }

  function stop() {
    controller.current?.abort(STOPPED)
    controller.current = null
    setStatus('ready')
  }

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
  ChatMessageContent,
  ChatMessages,
  ChatWelcome,
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
