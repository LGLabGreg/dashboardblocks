'use client'

import { markdownToPlainText } from '@/registry/components/dashboardblocks/ai-markdown'
import {
  type AIChat,
  type AIChatStatus,
  type AIFilePart,
  type AIMessage,
  type AIMessagePart,
  type AIMessageVersions,
  type AIReply,
  type AIToolApprovalResponse,
  branchMessages,
  getMessageFiles,
  getMessageSources,
  getMessageText,
  getStreamingMessageId,
  getMessageVersion,
  getToolLabel,
  isToolPart,
  selectMessageVersion,
} from '@/registry/components/dashboardblocks/ai-message'
import {
  AIMessageParts,
  type AIMessagePartsProps,
  fileKind,
  MessageFiles,
  ThinkingIndicator,
} from '@/registry/components/dashboardblocks/ai-parts'
import {
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  type BlockStatus,
  useBlockState,
} from '@/registry/components/dashboardblocks/block-state'
import {
  formatFileSize,
  validateFiles,
} from '@/registry/components/dashboardblocks/files'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatList } from '@/registry/lib/dashboardblocks/format'
import {
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  type RefObject,
  startTransition,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { flushSync } from 'react-dom'

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from '@/components/ui/input-group'
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

import { cn } from '@/lib/utils'

type ChatFeedback = 'up' | 'down'

function isBusy(status: AIChatStatus) {
  return status === 'submitted' || status === 'streaming'
}

/** What a screen reader hears once a reply ends: its text, and what waits for the person. */
function describeReply(message: AIMessage) {
  const waiting = message.parts.flatMap((part) =>
    isToolPart(part) && part.state === 'approval-requested' ? [getToolLabel(part)] : [],
  )
  return [
    markdownToPlainText(getMessageText(message), getMessageSources(message).length),
    waiting.length > 0 && `Waiting for your approval: ${formatList(waiting)}.`,
  ]
    .filter(Boolean)
    .join(' ')
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
    <div className={cn('flex min-h-14 items-center gap-3 px-4 py-2', className)}>
      <AssistantAvatar icon={icon} />
      <div className='flex min-w-0 flex-1 flex-col'>
        <h2 className='truncate text-sm font-semibold tracking-tight'>{title}</h2>
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
  latest?: AIMessage
  /** Moves each new question to the top when the status turns `submitted`, and announces that the assistant is thinking, then the finished reply. Without it, the log follows the end for new questions. */
  status?: AIChatStatus
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
  const placedMargin = useRef(QUESTION_PEEK_PX)
  const opened = useRef(false)
  const placedForStatus = useRef(status)
  const [announcement, setAnnouncement] = useState('')
  const [previousStatus, setPreviousStatus] = useState(status)

  if (status !== previousStatus) {
    setPreviousStatus(status)
    if (status === 'submitted') {
      setAnnouncement('Assistant is thinking')
    } else if (status === 'ready' && isBusy(previousStatus)) {
      setAnnouncement(latest?.role === 'assistant' ? describeReply(latest) : '')
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

  function placeQuestion(id: string, margin = placedMargin.current) {
    heldQuestion.current = id
    placedMargin.current = margin
    scrollerRef.current.scrollToMessage(id, { scrollMargin: margin })
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
    placeQuestion(id, 0)
  }, [])

  useEffect(() => {
    const before = placedForStatus.current
    placedForStatus.current = status
    if (status !== 'submitted' || before === 'submitted') return
    const question = latestQuestion(contentRef.current)
    const id = question?.dataset.messageId
    // A reply that goes on after an approval stays where the reader is.
    const last = [
      ...(contentRef.current?.querySelectorAll('[data-message-id]') ?? []),
    ].at(-1)
    if (!id || last !== question) return
    heldQuestion.current = id
    placedMargin.current = QUESTION_PEEK_PX
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
        className='mask-none focus-visible:ring-ring/50 outline-none [scrollbar-width:thin] focus-visible:ring-3 focus-visible:ring-inset'
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

interface ChatMessageProps extends Pick<
  AIMessagePartsProps,
  | 'onToolApprovalResponse'
  | 'renderApproval'
  | 'renderToolResult'
  | 'renderWork'
  | 'toolLabels'
> {
  actions?: ReactNode
  avatar?: ReactNode
  /** What the message shows in place of its text, or of a reply's parts in order, such as a question being edited. */
  children?: ReactNode
  className?: string
  footer?: ReactNode
  message: AIMessage
  name?: string
  streaming?: boolean
}

function ChatMessage({
  actions,
  avatar,
  children,
  className,
  footer,
  message,
  name,
  onToolApprovalResponse,
  renderApproval,
  renderToolResult,
  renderWork,
  streaming,
  toolLabels,
}: ChatMessageProps) {
  if (message.role === 'user') {
    const text = getMessageText(message)
    return (
      <MessageScrollerItem
        messageId={message.id}
        data-chat-question
        className={MEASURED_ITEM}
      >
        <Message data-role='user' align='end' className={className}>
          <MessageContent>
            <span className='sr-only'>{name ?? 'You'}: </span>
            <MessageFiles files={getMessageFiles(message)} className='justify-end' />
            {children ??
              (text && (
                <Bubble variant='muted' align='end'>
                  <BubbleContent>
                    <p className='break-words whitespace-pre-wrap'>{text}</p>
                  </BubbleContent>
                </Bubble>
              ))}
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
        <MessageContent aria-busy={streaming}>
          <Bubble variant='ghost' className='w-full'>
            <BubbleContent className='w-full'>
              <span className='sr-only'>{name ?? 'Assistant'}: </span>
              {children ?? (
                <AIMessageParts
                  message={message}
                  streaming={streaming}
                  toolLabels={toolLabels}
                  onToolApprovalResponse={onToolApprovalResponse}
                  renderApproval={renderApproval}
                  renderToolResult={renderToolResult}
                  renderWork={renderWork}
                />
              )}
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

interface MessageVersion {
  count: number
  /** The version showing, from 0. */
  index: number
}

interface ChatMessageActionsProps {
  className?: string
  content: string
  /** Turns the buttons that change the chat off while a reply arrives. */
  disabled?: boolean
  feedback?: ChatFeedback | null
  /** Shows thumbs up and down. */
  onFeedback?: (feedback: ChatFeedback | null) => void
  /** Shows a regenerate button, usually on the last reply only. */
  onRegenerate?: () => void
  /** Steps to another version of the reply. */
  onVersionChange?: (index: number) => void
  /** Shows which version of the reply this is, with buttons to the others. */
  version?: MessageVersion
}

/** Which version of a message shows, such as 2 / 3, with buttons to the one before and after. */
function MessageVersions({
  disabled,
  onChange,
  version,
}: {
  disabled?: boolean
  onChange: (index: number) => void
  version: MessageVersion
}) {
  const { count, index } = version
  return (
    <div role='group' aria-label='Versions' className='flex items-center'>
      <Button
        variant='ghost'
        size='icon-sm'
        aria-label='Previous version'
        disabled={disabled || index === 0}
        onClick={() => onChange(index - 1)}
      >
        <IconPlaceholder
          lucide='ChevronLeftIcon'
          tabler='IconChevronLeft'
          hugeicons='ArrowLeft01Icon'
          phosphor='CaretLeftIcon'
          remixicon='RiArrowLeftSLine'
        />
      </Button>
      <span className='min-w-9 text-center text-xs tabular-nums'>
        <span aria-hidden>
          {index + 1} / {count}
        </span>
        <span className='sr-only'>
          Version {index + 1} of {count}
        </span>
      </span>
      <Button
        variant='ghost'
        size='icon-sm'
        aria-label='Next version'
        disabled={disabled || index === count - 1}
        onClick={() => onChange(index + 1)}
      >
        <IconPlaceholder
          lucide='ChevronRightIcon'
          tabler='IconChevronRight'
          hugeicons='ArrowRight01Icon'
          phosphor='CaretRightIcon'
          remixicon='RiArrowRightSLine'
        />
      </Button>
    </div>
  )
}

function ChatMessageActions({
  className,
  content,
  disabled,
  feedback,
  onFeedback,
  onRegenerate,
  onVersionChange,
  version,
}: ChatMessageActionsProps) {
  return (
    <div
      role='group'
      aria-label='Message actions'
      className={cn('text-muted-foreground -ms-1.5 flex items-center gap-0.5', className)}
    >
      {version && onVersionChange && (
        <MessageVersions
          disabled={disabled}
          version={version}
          onChange={onVersionChange}
        />
      )}
      {content && <CopyButton label='Copy message' value={content} />}
      {onRegenerate && (
        <Button
          variant='ghost'
          size='icon-sm'
          aria-label='Regenerate response'
          disabled={disabled}
          onClick={() => onRegenerate()}
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
  label,
}: {
  className?: string
  /** @default 'Thinking…' */
  label?: string
}) {
  return (
    <Message data-role='assistant' className={className}>
      <AssistantMessageAvatar />
      <MessageContent>
        <Bubble variant='ghost' className='w-full'>
          <BubbleContent className='w-full'>
            <ThinkingIndicator label={label} />
          </BubbleContent>
        </Bubble>
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
          ? 'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 flex flex-wrap gap-2 duration-300'
          : 'flex flex-col divide-y border-y',
        className,
      )}
    >
      {prompts.map((prompt) =>
        variant === 'chips' ? (
          <li key={prompt.label} className='flex'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => onSelect(prompt.prompt ?? prompt.label)}
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
              className='hover:bg-muted/50 focus-visible:ring-ring/50 -mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-md px-2 py-2.5 text-start text-sm transition-colors outline-none focus-visible:ring-3 motion-reduce:transition-none [&_svg]:size-4 [&_svg]:shrink-0'
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
        <p className='font-semibold tracking-tight'>{title}</p>
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

type ComposerFile = { id: string; name: string; preview?: string } & (
  | { controller: AbortController; state: 'uploading' }
  | { part: AIFilePart; state: 'done' }
  | { message: string; state: 'error' }
)

type ComposerUpload = (
  file: File,
  options: { signal: AbortSignal },
) => Promise<AIFilePart | { message: string; status: 'error' }>

const TEXT_TYPES: Record<string, string> = {
  csv: 'text/csv',
  json: 'application/json',
  log: 'text/plain',
  md: 'text/markdown',
  txt: 'text/plain',
}

/** A file's media type, from its name when the browser gives none, as for a .log or .md file: model providers refuse application/octet-stream. */
function getMediaType(file: File) {
  if (file.type) return file.type
  const extension = file.name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase() ?? ''
  return Object.hasOwn(TEXT_TYPES, extension)
    ? TEXT_TYPES[extension]
    : 'application/octet-stream'
}

function readFile(file: File) {
  return new Promise<AIFilePart>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') return reject(reader.error)
      const mediaType = getMediaType(file)
      resolve({
        filename: file.name,
        mediaType,
        type: 'file',
        url: reader.result.replace(/^data:[^;,]*/, `data:${mediaType}`),
      })
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function ComposerAttachment({
  file,
  onRemove,
}: {
  file: ComposerFile
  onRemove: () => void
}) {
  const description =
    file.state === 'uploading'
      ? 'Uploading…'
      : file.state === 'error'
        ? file.message
        : fileKind(file.part)
  return (
    <Attachment size='xs' state={file.state}>
      <AttachmentMedia variant={file.preview ? 'image' : 'icon'}>
        {file.state === 'uploading' ? (
          <IconPlaceholder
            lucide='Loader2Icon'
            tabler='IconLoader'
            hugeicons='Loading03Icon'
            phosphor='SpinnerIcon'
            remixicon='RiLoaderLine'
            className='animate-spin motion-reduce:animate-none'
          />
        ) : file.state === 'error' ? (
          <IconPlaceholder
            lucide='TriangleAlertIcon'
            tabler='IconAlertTriangle'
            hugeicons='Alert02Icon'
            phosphor='WarningIcon'
            remixicon='RiErrorWarningLine'
          />
        ) : file.preview ? (
          // oxlint-disable-next-line nextjs/no-img-element -- blocks install into any React project
          <img src={file.preview} alt='' />
        ) : (
          <IconPlaceholder
            lucide='FileTextIcon'
            tabler='IconFileText'
            hugeicons='File02Icon'
            phosphor='FileTextIcon'
            remixicon='RiFileTextLine'
          />
        )}
      </AttachmentMedia>
      <AttachmentContent className='max-w-48 min-w-0'>
        <AttachmentTitle className='block truncate'>{file.name}</AttachmentTitle>
        <AttachmentDescription
          className='block truncate'
          title={file.state === 'error' ? file.message : undefined}
        >
          {description}
        </AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction
          type='button'
          aria-label={`Remove ${file.name}`}
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
    </Attachment>
  )
}

interface ChatComposerProps {
  /** Lets the person attach files of these types, by button, paste or drop, as the file input's `accept` reads it (`image/*,.pdf`). A file of another type shows as one that can't be sent. Leave out for text only. */
  accept?: string
  className?: string
  context?: ReactNode
  disabled?: boolean
  label?: string
  /** The largest file to attach, in bytes. A larger one shows as one that can't be sent. */
  maxSize?: number
  onStop?: () => void
  /** Takes the chat's `sendMessage` as it is. Return `false` to keep the message and its files in the box, as when the page holds it. */
  onSubmit: (message: { files?: AIFilePart[]; text: string }) => unknown
  onValueChange?: (value: string) => void
  /** @default 'Ask anything' */
  placeholder?: string
  /** Sending waits until the status is `ready` or `error`. */
  status?: AIChatStatus
  textareaRef?: Ref<HTMLTextAreaElement>
  /** Controls beside Attach files. The message box is a size container, so they can drop their labels when it's narrow (`@md:inline`). */
  tools?: ReactNode
  /**
   * Uploads each file as it's attached, and Send waits until every one is done. Resolve the file part
   * to send, with the `url` your storage keeps it at, or `{ status: 'error', message }` to refuse it;
   * a throw shows "Check your connection and try again." Removing the file aborts `signal`.
   * Without it, files are read in the browser and sent as data URLs.
   */
  upload?: ComposerUpload
  value?: string
}

function ChatComposer({
  accept,
  className,
  context,
  disabled,
  label = 'Message',
  maxSize,
  onStop,
  onSubmit,
  onValueChange,
  placeholder = 'Ask anything',
  status = 'ready',
  textareaRef,
  tools,
  upload = readFile,
  value,
}: ChatComposerProps) {
  const hintId = useId()
  const inner = useRef<HTMLTextAreaElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const nextFileId = useRef(0)
  const [draft, setDraft] = useState('')
  const [files, setFiles] = useState<ComposerFile[]>([])
  const [notices, setNotices] = useState<{ id: string; text: string }[]>([])
  const [dragging, setDragging] = useState(false)
  const text = value ?? draft
  const busy = isBusy(status)
  const canSend = !disabled && !busy

  useImperativeHandle(textareaRef, () => inner.current as HTMLTextAreaElement, [])

  function change(next: string) {
    setDraft(next)
    onValueChange?.(next)
  }

  const previews = useRef(new Set<string>())

  useEffect(() => {
    const shown = previews.current
    return () => {
      for (const url of shown) URL.revokeObjectURL(url)
      shown.clear()
    }
  }, [])

  function preview(file: File) {
    if (!file.type.startsWith('image/')) return undefined
    const url = URL.createObjectURL(file)
    previews.current.add(url)
    return url
  }

  function forget(items: ComposerFile[]) {
    for (const item of items) {
      if (item.state === 'uploading') item.controller.abort()
      if (!item.preview) continue
      URL.revokeObjectURL(item.preview)
      previews.current.delete(item.preview)
    }
  }

  function announce(id: string, name: string, message: string) {
    setNotices((current) => [...current.slice(-2), { id, text: `${name}: ${message}` }])
  }

  function finish(
    id: string,
    name: string,
    result: AIFilePart | { message: string; status: 'error' },
  ) {
    startTransition(() => {
      if ('status' in result) announce(id, name, result.message)
      setFiles((current) =>
        current.map((item) =>
          item.id !== id || item.state !== 'uploading'
            ? item
            : 'status' in result
              ? { id, message: result.message, name: item.name, state: 'error' }
              : {
                  id,
                  name: item.name,
                  part: result,
                  preview: item.preview,
                  state: 'done',
                },
        ),
      )
    })
  }

  async function start(id: string, file: File, signal: AbortSignal) {
    const result = await upload(file, { signal }).catch(() => ({
      message: 'Check your connection and try again.',
      status: 'error' as const,
    }))
    if (!signal.aborted) finish(id, file.name, result)
  }

  function attach(list: FileList | File[]) {
    if (!accept || disabled) return
    const added = [...list].map((file): ComposerFile => {
      const id = `${++nextFileId.current}`
      const [rejected] = validateFiles([file], { accept, maxSize }).rejected
      if (rejected) {
        const message =
          rejected.reason === 'size' && maxSize !== undefined
            ? `Over ${formatFileSize(maxSize)}. Try a smaller file.`
            : 'Can’t read this kind of file.'
        announce(id, file.name, message)
        return { id, message, name: file.name, state: 'error' }
      }
      const controller = new AbortController()
      void start(id, file, controller.signal)
      return {
        controller,
        id,
        name: file.name,
        preview: preview(file),
        state: 'uploading',
      }
    })
    setFiles((current) => [...current, ...added])
  }

  function remove(id: string) {
    forget(files.filter((item) => item.id === id))
    setFiles((current) => current.filter((item) => item.id !== id))
    inner.current?.focus()
  }

  const ready = files.flatMap((item) => (item.state === 'done' ? [item.part] : []))
  const uploading = files.some((item) => item.state === 'uploading')

  function send() {
    if (!canSend || uploading) return
    if (!text.trim() && ready.length === 0) return inner.current?.focus()
    const sent = onSubmit(
      ready.length > 0 ? { files: ready, text: text.trim() } : { text: text.trim() },
    )
    if (sent === false) return inner.current?.focus()
    change('')
    forget(files)
    setFiles([])
    inner.current?.focus()
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    send()
  }

  const attachments = files.map((file) => (
    <ComposerAttachment key={file.id} file={file} onRemove={() => remove(file.id)} />
  ))

  return (
    <form
      method='post'
      className={cn('@container', className)}
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        send()
      }}
    >
      <InputGroup
        onDragOver={(event) => {
          if (!accept || !event.dataTransfer.types.includes('Files')) return
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null))
            setDragging(false)
        }}
        onDrop={(event) => {
          if (!accept) return
          event.preventDefault()
          setDragging(false)
          attach(event.dataTransfer.files)
        }}
      >
        <div role='status' aria-atomic='false' className='sr-only'>
          {notices.map((notice) => (
            <div key={notice.id}>{notice.text}</div>
          ))}
        </div>
        {dragging && (
          <div
            aria-hidden
            className='border-ring bg-background/90 text-muted-foreground pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] border-2 border-dashed text-sm'
          >
            Drop to attach
          </div>
        )}
        {(context || attachments.length > 0) && (
          <InputGroupAddon align='block-start' className='flex-wrap gap-1.5'>
            {context}
            {attachments}
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
          onPaste={(event) => {
            if (!accept || event.clipboardData.files.length === 0) return
            event.preventDefault()
            attach(event.clipboardData.files)
          }}
          className='max-h-48'
        />
        <InputGroupAddon align='block-end'>
          {accept && (
            <>
              <input
                ref={fileInput}
                type='file'
                accept={accept}
                multiple
                hidden
                tabIndex={-1}
                onChange={(event) => {
                  if (event.target.files) attach(event.target.files)
                  event.target.value = ''
                }}
              />
              <Button
                type='button'
                variant='ghost'
                size='icon-sm'
                aria-label='Attach files'
                disabled={disabled}
                onClick={() => fileInput.current?.click()}
              >
                <IconPlaceholder
                  lucide='PaperclipIcon'
                  tabler='IconPaperclip'
                  hugeicons='Attachment01Icon'
                  phosphor='PaperclipIcon'
                  remixicon='RiAttachment2'
                />
              </Button>
            </>
          )}
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
              aria-label={
                uploading ? 'Send message, once the files have uploaded' : 'Send message'
              }
              disabled={!canSend || uploading}
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
        {accept && ' Paste or drop files to attach them.'}
      </p>
    </form>
  )
}

interface ChatConversationProps extends Pick<
  AIMessagePartsProps,
  'renderApproval' | 'renderToolResult' | 'renderWork' | 'toolLabels'
> {
  chat: AIChat
  /** The message box, which Retry focuses as it goes. */
  composerRef?: RefObject<HTMLTextAreaElement | null>
  feedback?: Record<string, ChatFeedback | null>
  /** The questions to suggest under the last reply once it has finished. */
  followUps?: (reply: AIMessage) => SuggestedPrompt[] | undefined
  /** More to show under a finished reply, such as its tokens and cost. */
  footer?: (reply: AIMessage) => ReactNode
  /** What screen readers call the assistant. @default 'Assistant' */
  name?: string
  /** Shows thumbs up and down under each reply. */
  onFeedback?: (messageId: string, feedback: ChatFeedback | null) => void
}

/** A question being edited, in place of its bubble: Enter sends it as a new version, Escape puts it back. */
function QuestionEditor({
  defaultValue,
  onCancel,
  onSubmit,
}: {
  defaultValue: string
  onCancel: () => void
  onSubmit: (text: string) => void
}) {
  const [text, setText] = useState(defaultValue)
  const canSend = text.trim().length > 0
  const send = () => {
    if (canSend) onSubmit(text.trim())
  }
  return (
    <form
      method='post'
      className='w-full'
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        send()
      }}
    >
      <InputGroup>
        <InputGroupTextarea
          // oxlint-disable-next-line jsx-a11y/no-autofocus -- Edit opens the question to type in
          autoFocus
          aria-label='Edit your message'
          rows={1}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onFocus={(event) => {
            const end = event.currentTarget.value.length
            event.currentTarget.setSelectionRange(end, end)
          }}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing) return
            if (event.key === 'Escape') {
              event.preventDefault()
              onCancel()
            } else if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              send()
            }
          }}
          className='max-h-48'
        />
        <InputGroupAddon align='block-end' className='justify-end gap-2'>
          <Button type='button' variant='ghost' size='sm' onClick={onCancel}>
            Cancel
          </Button>
          <Button type='submit' size='sm' disabled={!canSend}>
            Send
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </form>
  )
}

/** Under a question: which version it is, and Copy and Edit, which show on hover. */
function QuestionActions({
  content,
  disabled,
  editId,
  onEdit,
  onVersionChange,
  version,
}: {
  content: string
  disabled?: boolean
  editId: string
  onEdit?: () => void
  onVersionChange?: (index: number) => void
  version?: MessageVersion
}) {
  return (
    <div
      role='group'
      aria-label='Question actions'
      className='text-muted-foreground -me-1.5 flex items-center justify-end gap-0.5'
    >
      <div className='flex items-center gap-0.5 transition-opacity group-focus-within/message:opacity-100 group-hover/message:opacity-100 pointer-fine:opacity-0'>
        {content && <CopyButton label='Copy message' value={content} />}
        {onEdit && (
          <Button
            id={editId}
            variant='ghost'
            size='icon-sm'
            aria-label='Edit message'
            disabled={disabled}
            onClick={onEdit}
          >
            <IconPlaceholder
              lucide='PencilIcon'
              tabler='IconPencil'
              hugeicons='PencilEdit02Icon'
              phosphor='PencilSimpleIcon'
              remixicon='RiPencilLine'
            />
          </Button>
        )}
      </div>
      {version && onVersionChange && (
        <MessageVersions
          disabled={disabled}
          version={version}
          onChange={onVersionChange}
        />
      )}
    </div>
  )
}

/**
 * A chat's messages for `ChatMessages`: each reply with its actions, the follow-ups under the last one,
 * "Thinking…" until a reply starts, and a failed reply with Retry. A question can be edited, and a chat
 * that keeps versions (`chat.versions`) shows them under each question and reply, to step between.
 */
function ChatConversation({
  chat,
  composerRef,
  feedback,
  followUps,
  footer,
  name,
  onFeedback,
  renderApproval,
  renderToolResult,
  renderWork,
  toolLabels,
}: ChatConversationProps) {
  const { messages, status } = chat
  const id = useId()
  const [editing, setEditing] = useState<string | null>(null)
  const streamingId = getStreamingMessageId(messages, status)
  const busy = isBusy(status)
  const keepsVersions = chat.selectVersion !== undefined
  let lastQuestion = messages.length - 1
  while (lastQuestion >= 0 && messages[lastQuestion]?.role !== 'user') lastQuestion--
  const selectVersion = (messageId: string) =>
    chat.selectVersion && ((index: number) => void chat.selectVersion?.(messageId, index))

  const stopEditing = (messageId: string) => {
    flushSync(() => setEditing(null))
    document.getElementById(`${id}-edit-${messageId}`)?.focus()
  }

  return (
    <>
      {messages.map((message, index) => {
        const streaming = message.id === streamingId
        const lastMessage = index === messages.length - 1
        const version = getMessageVersion(messages, chat.versions, index)
        if (message.role === 'user') {
          const text = getMessageText(message)
          const isEditing = editing === message.id && !busy
          return (
            <ChatMessage
              key={message.id}
              message={message}
              actions={
                !isEditing && (
                  <QuestionActions
                    content={text}
                    disabled={busy}
                    editId={`${id}-edit-${message.id}`}
                    onEdit={
                      keepsVersions || index === lastQuestion
                        ? () => setEditing(message.id)
                        : undefined
                    }
                    onVersionChange={selectVersion(message.id)}
                    version={version}
                  />
                )
              }
            >
              {isEditing ? (
                <QuestionEditor
                  defaultValue={text}
                  onCancel={() => stopEditing(message.id)}
                  onSubmit={(next) => {
                    setEditing(null)
                    void chat.sendMessage({
                      files: getMessageFiles(message),
                      messageId: message.id,
                      metadata: message.metadata,
                      text: next,
                    })
                    composerRef?.current?.focus()
                  }}
                />
              ) : undefined}
            </ChatMessage>
          )
        }
        const failedReply = lastMessage && status === 'error'
        const waiting = message.parts.some(
          (part) => isToolPart(part) && part.state === 'approval-requested',
        )
        const finishedReply =
          message.role === 'assistant' && !streaming && !failedReply && !waiting
        const more = finishedReply ? footer?.(message) : undefined
        const prompts =
          finishedReply && lastMessage && status === 'ready'
            ? followUps?.(message)
            : undefined
        return (
          <ChatMessage
            key={message.id}
            message={message}
            name={message.role === 'assistant' ? name : undefined}
            streaming={streaming}
            toolLabels={toolLabels}
            renderApproval={renderApproval}
            renderToolResult={renderToolResult}
            renderWork={renderWork}
            onToolApprovalResponse={chat.addToolApprovalResponse}
            footer={
              <>
                {more}
                {prompts && prompts.length > 0 && (
                  <SuggestedPrompts
                    label='Follow-up questions'
                    prompts={prompts}
                    onSelect={(text) => void chat.sendMessage({ text })}
                  />
                )}
              </>
            }
            actions={
              finishedReply && (
                <ChatMessageActions
                  content={getMessageText(message)}
                  disabled={busy}
                  feedback={feedback?.[message.id]}
                  onFeedback={onFeedback && ((value) => onFeedback(message.id, value))}
                  onRegenerate={
                    lastMessage
                      ? () => {
                          void chat.regenerate()
                          composerRef?.current?.focus()
                        }
                      : undefined
                  }
                  onVersionChange={selectVersion(message.id)}
                  version={version}
                />
              )
            }
          />
        )
      })}
      {status === 'submitted' && !streamingId && <TypingIndicator />}
      {status === 'error' && (
        <ChatError
          message={chat.error?.message}
          onRetry={() => {
            void chat.regenerate()
            composerRef?.current?.focus()
          }}
        />
      )}
    </>
  )
}

interface ChatPanelProps
  extends
    BlockStateProps,
    Pick<ChatConversationProps, 'followUps' | 'renderToolResult' | 'toolLabels'> {
  /**
   * The chat the panel runs: `useChat()` from `@ai-sdk/react`, or `useChatStream` for any other stream.
   * The AI SDK sends "An error occurred." for a failed reply unless the route's `onError` returns the message to show.
   */
  chat: AIChat
  className?: string
  /** Shown in the message box above what the person types, such as a chip for the page the question is about. */
  context?: ReactNode
  description?: ReactNode
  id?: string
  /** Shows a close button, and Escape in the panel calls it. */
  onClose?: () => void
  /** @default 'Ask anything' */
  placeholder?: string
  /** While a saved conversation loads or fails to. */
  status?: BlockStatus
  /** The questions a new conversation suggests. */
  suggestions?: SuggestedPrompt[]
  textareaRef?: Ref<HTMLTextAreaElement>
  title: string
}

/** An assistant in a panel: a header with New conversation and Close, a welcome with suggested questions, the conversation, and the message box. */
function ChatPanel({
  chat,
  className,
  context,
  description,
  errorMessage,
  followUps,
  id,
  onClose,
  placeholder,
  renderToolResult,
  status: loadStatus,
  suggestions,
  textareaRef,
  title,
  toolLabels,
}: ChatPanelProps) {
  const blockState = useBlockState()
  const loadState = blockState === 'empty' ? loadStatus : (blockState ?? loadStatus)
  const composerRef = useRef<HTMLTextAreaElement | null>(null)
  const { messages, status } = chat

  useImperativeHandle(textareaRef, () => composerRef.current as HTMLTextAreaElement, [])

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== 'Escape' || event.nativeEvent.isComposing) return
    if (event.defaultPrevented || !onClose) return
    if (!event.currentTarget.contains(event.target as Node)) return
    event.preventDefault()
    onClose()
  }

  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Escape from anywhere inside closes the panel
    <section
      id={id}
      aria-label={title}
      onKeyDown={onKeyDown}
      className={cn('bg-background flex h-full min-h-0 flex-col', className)}
    >
      <ChatHeader
        title={title}
        description={description}
        className='border-b'
        actions={
          <>
            {chat.setMessages && (
              <Button
                variant='ghost'
                size='icon-sm'
                aria-label='New conversation'
                disabled={messages.length === 0 || loadState !== undefined}
                onClick={() => {
                  void chat.stop()
                  chat.setMessages?.([])
                  composerRef.current?.focus()
                }}
              >
                <IconPlaceholder
                  lucide='SquarePenIcon'
                  tabler='IconEdit'
                  hugeicons='PencilEdit02Icon'
                  phosphor='NotePencilIcon'
                  remixicon='RiEditBoxLine'
                />
              </Button>
            )}
            {onClose && (
              <Button
                variant='ghost'
                size='icon-sm'
                aria-label={`Close ${title}`}
                onClick={onClose}
              >
                <IconPlaceholder
                  lucide='XIcon'
                  tabler='IconX'
                  hugeicons='Cancel01Icon'
                  phosphor='XIcon'
                  remixicon='RiCloseLine'
                />
              </Button>
            )}
          </>
        }
      />
      {loadState ? (
        <BlockStateProvider errorMessage={errorMessage} state={loadState}>
          <div className='flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-2 [scrollbar-width:thin]'>
            <BlockStateRows rows={3} />
          </div>
        </BlockStateProvider>
      ) : messages.length === 0 ? (
        <div className='flex min-h-0 flex-1 flex-col overflow-y-auto p-4 [scrollbar-width:thin]'>
          <ChatWelcome title={title} description={description} className='m-auto'>
            {suggestions && suggestions.length > 0 && (
              <SuggestedPrompts
                variant='list'
                prompts={suggestions}
                onSelect={(text) => void chat.sendMessage({ text })}
              />
            )}
          </ChatWelcome>
        </div>
      ) : (
        <ChatMessages status={status} latest={messages.at(-1)}>
          <ChatConversation
            chat={chat}
            composerRef={composerRef}
            followUps={followUps}
            name={title}
            renderToolResult={renderToolResult}
            toolLabels={toolLabels}
          />
        </ChatMessages>
      )}
      <ChatComposer
        className='p-4 pt-2'
        context={context}
        disabled={loadState !== undefined}
        placeholder={placeholder}
        status={status}
        textareaRef={composerRef}
        onSubmit={chat.sendMessage}
        onStop={chat.stop}
      />
    </section>
  )
}

const STOPPED = 'stopped'

interface UseChatStreamOptions {
  initialError?: string
  initialMessages?: AIMessage[]
  /** The versions a saved chat kept, as `chat.versions` gave them. */
  initialVersions?: AIMessageVersions
  /** Runs when a reply ends, whether it finished or was stopped. */
  onFinish?: (
    message: AIMessage,
    info: { messages: AIMessage[]; stopped: boolean },
  ) => void
  /**
   * Streams the reply to the conversation so far. Each value is the whole reply as it stands: what `readUIMessageStream` from the AI SDK yields, or `replyFromText` around a stream of text.
   * After a tool approval the conversation ends with the assistant's message, and the values continue it, its earlier parts included.
   */
  onSend: (messages: AIMessage[], signal: AbortSignal) => AsyncIterable<AIReply>
  /** Runs when the person steps to another version of a message, so a saved chat shows it next time. */
  onVersionChange?: (messageId: string, index: number) => void
}

// Unique across page loads, so a saved conversation's ids never repeat.
function createId() {
  // randomUUID exists only on https and localhost.
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

/** Runs a chat from any function that streams replies, and returns what `useChat` from the AI SDK returns, so the chat blocks take either. */
function useChatStream({
  initialError,
  initialMessages = [],
  initialVersions = {},
  onFinish,
  onSend,
  onVersionChange,
}: UseChatStreamOptions) {
  const controller = useRef<AbortController | null>(null)
  const history = useRef(initialMessages)
  const kept = useRef(initialVersions)
  const [messages, setMessagesState] = useState(initialMessages)
  const [versions, setVersionsState] = useState(initialVersions)
  const [status, setStatus] = useState<AIChatStatus>(initialError ? 'error' : 'ready')
  const [error, setError] = useState(() =>
    initialError === undefined ? undefined : new Error(initialError),
  )

  useEffect(
    () => () => {
      if (!controller.current) return
      controller.current.abort(STOPPED)
      controller.current = null
      setStatus('ready')
    },
    [],
  )

  function setMessages(next: AIMessage[]) {
    history.current = next
    setMessagesState(next)
  }

  function setVersions(next: AIMessageVersions) {
    kept.current = next
    setVersionsState(next)
  }

  /** Runs the conversation with the messages from `index` on replaced by `next`, keeping them as a version. */
  function branch(index: number, next: AIMessage[]) {
    const branched = branchMessages(
      { messages: history.current, versions: kept.current },
      index,
      next,
    )
    setVersions(branched.versions)
    void run(branched.messages)
  }

  async function run(conversation: AIMessage[]) {
    const current = new AbortController()
    controller.current = current
    setMessages(conversation)
    setStatus('submitted')
    setError(undefined)
    const last = conversation.at(-1)
    const continuing = last?.role === 'assistant'
    const before = continuing ? conversation.slice(0, -1) : conversation
    let reply: AIMessage = continuing
      ? last
      : { id: createId(), parts: [], role: 'assistant' }
    try {
      for await (const snapshot of onSend(conversation, current.signal)) {
        if (current.signal.aborted) break
        reply = {
          ...reply,
          id: snapshot.id ?? reply.id,
          metadata: snapshot.metadata ?? reply.metadata,
          parts: structuredClone(snapshot.parts),
        }
        setMessages([...before, reply])
        setStatus('streaming')
      }
    } catch (caught) {
      if (!current.signal.aborted) {
        controller.current = null
        setError(caught instanceof Error ? caught : new Error(String(caught)))
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
    if (reply.parts.length > 0) {
      onFinish?.(reply, { messages: [...before, reply], stopped })
    }
  }

  function sendMessage({
    files = [],
    messageId,
    metadata,
    text,
  }: Parameters<AIChat['sendMessage']>[0]) {
    if (controller.current) return
    const parts: AIMessagePart[] = [...files]
    if (text) parts.push({ state: 'done', text, type: 'text' })
    const question: AIMessage = {
      id: createId(),
      metadata,
      parts,
      role: 'user',
    }
    const edited = history.current.findIndex(
      (message) => message.id === messageId && message.role === 'user',
    )
    branch(edited === -1 ? history.current.length : edited, [question])
  }

  function regenerate({ messageId }: { messageId?: string } = {}) {
    if (controller.current) return
    const conversation = history.current
    const asked = conversation.findIndex((message) => message.id === messageId)
    const end = asked === -1 ? conversation.length : asked
    let question = end - 1
    while (question >= 0 && conversation[question]?.role !== 'user') question--
    if (question < 0) return
    if (status === 'error') void run(conversation.slice(0, question + 1))
    else branch(question + 1, [])
  }

  function selectVersion(messageId: string, index: number) {
    if (controller.current) return
    const selected = selectMessageVersion(
      { messages: history.current, versions: kept.current },
      messageId,
      index,
    )
    if (selected.versions === kept.current) return
    setMessages(selected.messages)
    setVersions(selected.versions)
    onVersionChange?.(messageId, index)
  }

  function addToolApprovalResponse({ approved, id, reason }: AIToolApprovalResponse) {
    const conversation = history.current
    const last = conversation.at(-1)
    if (controller.current || last?.role !== 'assistant') return
    const asked = last.parts.some(
      (part) =>
        isToolPart(part) &&
        part.state === 'approval-requested' &&
        part.approval?.id === id,
    )
    // A request that isn't waiting in the last reply anymore: nothing to answer.
    if (!asked) return
    const parts = last.parts.map((part) =>
      isToolPart(part) && part.state === 'approval-requested' && part.approval?.id === id
        ? {
            ...part,
            approval: { ...part.approval, approved, reason },
            state: 'approval-responded' as const,
          }
        : part,
    )
    const next = [...conversation.slice(0, -1), { ...last, parts }]
    const waiting = parts.some(
      (part) => isToolPart(part) && part.state === 'approval-requested',
    )
    if (waiting) setMessages(next)
    else void run(next)
  }

  function stop() {
    controller.current?.abort(STOPPED)
    controller.current = null
    setStatus('ready')
  }

  function replaceMessages(next: AIMessage[]) {
    controller.current?.abort()
    controller.current = null
    setMessages(next)
    setVersions({})
    setError(undefined)
    setStatus('ready')
  }

  return {
    addToolApprovalResponse,
    error,
    messages,
    regenerate,
    selectVersion,
    sendMessage,
    setMessages: replaceMessages,
    status,
    stop,
    versions,
  } satisfies AIChat
}

export {
  AssistantAvatar,
  AssistantMessageAvatar,
  ChatComposer,
  ChatContextChip,
  ChatConversation,
  ChatError,
  ChatHeader,
  ChatMessage,
  ChatMessageActions,
  ChatMessages,
  ChatPanel,
  ChatWelcome,
  SuggestedPrompts,
  TypingIndicator,
  getMediaType,
  isBusy,
  useChatStream,
}

export type {
  MessageVersion,
  ChatComposerProps,
  ChatConversationProps,
  ChatFeedback,
  ChatMessageActionsProps,
  ChatMessageProps,
  ChatMessagesProps,
  ChatPanelProps,
  ComposerUpload,
  SuggestedPrompt,
  SuggestedPromptsProps,
  UseChatStreamOptions,
}
