'use client'

import { markdownToPlainText } from '@/registry/components/dashboardblocks/ai-markdown'
import {
  type AIChat,
  type AIChatStatus,
  type AIFilePart,
  type AIMessage,
  type AIMessagePart,
  type AIReply,
  type AIToolApprovalResponse,
  getMessageFiles,
  getMessageSources,
  getMessageText,
  getToolLabel,
  isToolPart,
} from '@/registry/components/dashboardblocks/ai-message'
import {
  AIMessageParts,
  type AIMessagePartsProps,
  MessageFiles,
  ThinkingIndicator,
} from '@/registry/components/dashboardblocks/ai-parts'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import { formatList } from '@/registry/lib/dashboardblocks/format'
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
    <div className={cn('flex items-center gap-3 px-4 py-3', className)}>
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
    const question = latestQuestion(contentRef.current)
    const id = question?.dataset.messageId
    // A reply that goes on after an approval stays where the reader is.
    const last = [
      ...(contentRef.current?.querySelectorAll('[data-message-id]') ?? []),
    ].at(-1)
    if (!id || last !== question) return
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

interface ChatMessageProps extends Pick<
  AIMessagePartsProps,
  'onToolApprovalResponse' | 'renderToolResult' | 'toolLabels'
> {
  actions?: ReactNode
  avatar?: ReactNode
  /** What an assistant's reply shows, in place of its parts in order. */
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
  renderToolResult,
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
            {text && (
              <Bubble variant='muted' align='end'>
                <BubbleContent>
                  <p className='break-words whitespace-pre-wrap'>{text}</p>
                </BubbleContent>
              </Bubble>
            )}
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
                  renderToolResult={renderToolResult}
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
      {content && <CopyButton label='Copy message' value={content} />}
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
        <ThinkingIndicator label={label} />
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
          ? 'flex scroll-px-1 gap-2 overflow-x-auto overscroll-x-contain py-1 pe-1'
          : 'flex flex-col divide-y border-y',
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

interface ComposerFile {
  file: AIFilePart
  id: string
}

function accepts(file: File, accept: string) {
  return accept.split(',').some((rule) => {
    const pattern = rule.trim().toLowerCase()
    if (!pattern) return false
    if (pattern.startsWith('.')) return file.name.toLowerCase().endsWith(pattern)
    if (pattern.endsWith('/*')) return file.type.startsWith(pattern.slice(0, -1))
    return file.type === pattern
  })
}

const TEXT_TYPES: Record<string, string> = {
  csv: 'text/csv',
  json: 'application/json',
  log: 'text/plain',
  md: 'text/markdown',
  txt: 'text/plain',
}

// Browsers give no type to a .log or .md file, and model providers refuse application/octet-stream.
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

interface ChatComposerProps {
  /** Lets the person attach files of these types, by button, paste or drop, as the file input's `accept` reads it (`image/*,.pdf`). They're sent as data URLs. Leave out for text only. */
  accept?: string
  className?: string
  context?: ReactNode
  disabled?: boolean
  label?: string
  onStop?: () => void
  /** Takes the chat's `sendMessage` as it is. */
  onSubmit: (message: { files?: AIFilePart[]; text: string }) => void
  onValueChange?: (value: string) => void
  /** @default 'Ask anything…' */
  placeholder?: string
  /** Sending waits until the status is `ready` or `error`. */
  status?: AIChatStatus
  textareaRef?: Ref<HTMLTextAreaElement>
  tools?: ReactNode
  value?: string
}

function ChatComposer({
  accept,
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
  const fileInput = useRef<HTMLInputElement>(null)
  const nextFileId = useRef(0)
  const [draft, setDraft] = useState('')
  const [files, setFiles] = useState<ComposerFile[]>([])
  const [dragging, setDragging] = useState(false)
  const text = value ?? draft
  const busy = isBusy(status)
  const canSend = !disabled && !busy

  useImperativeHandle(textareaRef, () => inner.current as HTMLTextAreaElement, [])

  function change(next: string) {
    setDraft(next)
    onValueChange?.(next)
  }

  async function attach(list: FileList | File[]) {
    if (!accept || disabled) return
    const picked = [...list].filter((file) => accepts(file, accept))
    const read = await Promise.allSettled(picked.map(readFile))
    const added = read.flatMap((result) =>
      result.status === 'fulfilled'
        ? [{ file: result.value, id: `${++nextFileId.current}` }]
        : [],
    )
    setFiles((current) => [...current, ...added])
  }

  function send() {
    if (!canSend) return
    if (!text.trim() && files.length === 0) return inner.current?.focus()
    onSubmit(
      files.length > 0
        ? { files: files.map(({ file }) => file), text: text.trim() }
        : { text: text.trim() },
    )
    change('')
    setFiles([])
    inner.current?.focus()
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    send()
  }

  const attachments = files.map(({ file, id }) => (
    <Attachment key={id} size='xs'>
      <AttachmentMedia variant={file.mediaType.startsWith('image') ? 'image' : 'icon'}>
        {file.mediaType.startsWith('image') ? (
          // oxlint-disable-next-line nextjs/no-img-element -- blocks install into any React project
          <img src={file.url} alt='' />
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
      <AttachmentContent>
        <AttachmentTitle>{file.filename}</AttachmentTitle>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction
          type='button'
          aria-label={`Remove ${file.filename}`}
          onClick={() => {
            setFiles((current) => current.filter((item) => item.id !== id))
            inner.current?.focus()
          }}
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
  ))

  return (
    <form
      method='post'
      className={className}
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
          void attach(event.dataTransfer.files)
        }}
      >
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
            void attach(event.clipboardData.files)
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
                  if (event.target.files) void attach(event.target.files)
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
        {accept && ' Paste or drop files to attach them.'}
      </p>
    </form>
  )
}

const STOPPED = 'stopped'

interface UseChatStreamOptions {
  initialError?: string
  initialMessages?: AIMessage[]
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
  onFinish,
  onSend,
}: UseChatStreamOptions) {
  const controller = useRef<AbortController | null>(null)
  const history = useRef(initialMessages)
  const [messages, setMessagesState] = useState(initialMessages)
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
    metadata,
    text,
  }: {
    files?: AIFilePart[]
    metadata?: unknown
    text: string
  }) {
    if (controller.current) return
    const parts: AIMessagePart[] = [...files]
    if (text) parts.push({ state: 'done', text, type: 'text' })
    void run([...history.current, { id: createId(), metadata, parts, role: 'user' }])
  }

  function regenerate() {
    if (controller.current) return
    const conversation = [...history.current]
    while (conversation.at(-1)?.role === 'assistant') conversation.pop()
    if (conversation.length > 0) void run(conversation)
  }

  function addToolApprovalResponse({ approved, id, reason }: AIToolApprovalResponse) {
    const conversation = history.current
    const last = conversation.at(-1)
    if (controller.current || last?.role !== 'assistant') return
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
    setError(undefined)
    setStatus('ready')
  }

  return {
    addToolApprovalResponse,
    error,
    messages,
    regenerate,
    sendMessage,
    setMessages: replaceMessages,
    status,
    stop,
  } satisfies AIChat
}

export {
  AssistantAvatar,
  AssistantMessageAvatar,
  ChatComposer,
  ChatContextChip,
  ChatError,
  ChatHeader,
  ChatMessage,
  ChatMessageActions,
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
  ChatMessageProps,
  ChatMessagesProps,
  SuggestedPrompt,
  SuggestedPromptsProps,
  UseChatStreamOptions,
}
