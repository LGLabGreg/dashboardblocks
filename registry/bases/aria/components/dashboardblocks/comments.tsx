// Override of registry/components/dashboardblocks/comments.tsx for React Aria
// source-hash: d7b0d4561a24

'use client'

import {
  ActivityIcon,
  ActivityTime,
  activityToneClasses,
} from '@/registry/components/dashboardblocks/activity-feed'
import { IconPlaceholder } from '@/registry/icons/icon-placeholder'
import {
  type FormEvent,
  Fragment,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from '@/components/ui/input-group'

import { cn } from '@/lib/utils'

interface CommentAuthor {
  /** An image URL. Initials show while it loads or when it's missing. */
  avatar?: string
  name: string
}

interface CommentReaction {
  count: number
  emoji: string
  /** Whether the current user is one of `count`. */
  reacted: boolean
}

interface ThreadComment {
  at: Date
  author: CommentAuthor
  /** Plain text. Line breaks are kept, and `@Name` renders as a mention. */
  body: string
  /** Shows "(edited)" beside the time. */
  edited?: boolean
  id: string
  reactions?: CommentReaction[]
  /** Replies, oldest first. One level deep: replies don't have replies. */
  replies?: ThreadComment[]
  /** Collapses the thread to a summary. Top-level comments only. */
  resolved?: boolean
}

interface ReactionChoice {
  emoji: string
  /** Read by screen readers, such as "Thumbs up". */
  label: string
}

const defaultReactions: ReactionChoice[] = [
  { emoji: '👍', label: 'Thumbs up' },
  { emoji: '❤️', label: 'Heart' },
  { emoji: '🎉', label: 'Hooray' },
  { emoji: '😄', label: 'Laugh' },
  { emoji: '👀', label: 'Eyes' },
  { emoji: '🚀', label: 'Rocket' },
]

/** Adds the current user's reaction, or takes it back if they already reacted. */
function toggleReaction(reactions: CommentReaction[] = [], emoji: string) {
  if (!reactions.some((reaction) => reaction.emoji === emoji)) {
    return [...reactions, { count: 1, emoji, reacted: true }]
  }
  return reactions
    .map((reaction) =>
      reaction.emoji === emoji
        ? {
            ...reaction,
            count: reaction.count + (reaction.reacted ? -1 : 1),
            reacted: !reaction.reacted,
          }
        : reaction,
    )
    .filter((reaction) => reaction.count > 0)
}

/**
 * Returns `comments` with one comment, top-level or reply, replaced by what
 * `update` returns, or removed when it returns `null`. Spread the comment
 * into the result to keep fields of your own.
 */
function updateComment<T extends ThreadComment>(
  comments: T[],
  id: string,
  update: (comment: ThreadComment) => ThreadComment | null,
): T[] {
  return comments.flatMap((comment) => {
    if (comment.id === id) {
      const next = update(comment)
      return next ? [next as T] : []
    }
    if (!comment.replies) return [comment]
    return [{ ...comment, replies: updateComment(comment.replies, id, update) }]
  })
}

interface MentionSegment {
  /** The name mentioned. Leave out for plain text. */
  mention?: string
  text: string
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Splits text into plain runs and `@Name` mentions. Pass the names people can
 * mention so names with spaces match; without them, `@word` matches.
 */
function parseMentions(text: string, names?: string[]) {
  const name = names?.length
    ? [...names]
        .sort((a, b) => b.length - a.length)
        .map(escapeRegExp)
        .join('|')
    : '[\\p{L}\\p{N}_]+'
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}_@.])@(${name})(?![\\p{L}\\p{N}_])`, 'gu')
  const segments: MentionSegment[] = []
  let last = 0
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) segments.push({ text: text.slice(last, match.index) })
    segments.push({ mention: match[1], text: match[0] })
    last = match.index + match[0].length
  }
  if (last < text.length) segments.push({ text: text.slice(last) })
  return segments
}

/** The names mentioned in text, once each, in order. */
function getMentions(text: string, names?: string[]) {
  return [
    ...new Set(
      parseMentions(text, names).flatMap((segment) =>
        segment.mention ? [segment.mention] : [],
      ),
    ),
  ]
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

/** A person's picture, or their initials. Hidden from screen readers: show the name beside it. */
function CommentAvatar({
  author,
  className,
  size = 'default',
}: {
  author: CommentAuthor
  className?: string
  /** `sm` for replies. @default 'default' */
  size?: 'default' | 'sm'
}) {
  return (
    <Avatar aria-hidden size={size} className={className}>
      {author.avatar && <AvatarImage src={author.avatar} alt='' />}
      <AvatarFallback className={cn(size === 'sm' && 'text-[0.625rem]')}>
        {initials(author.name)}
      </AvatarFallback>
    </Avatar>
  )
}

/** A comment's text, with line breaks kept and mentions highlighted. */
function CommentBody({
  body,
  className,
  people,
}: {
  body: string
  className?: string
  /** People who can be mentioned, so names with spaces are highlighted whole. */
  people?: CommentAuthor[]
}) {
  return (
    <p className={cn('text-sm break-words whitespace-pre-wrap', className)}>
      {parseMentions(
        body,
        people?.map((person) => person.name),
      ).map((segment, index) =>
        segment.mention ? (
          <span
            key={index}
            className={cn('rounded-sm px-0.5 font-medium', activityToneClasses.info)}
          >
            {segment.text}
          </span>
        ) : (
          <Fragment key={index}>{segment.text}</Fragment>
        ),
      )}
    </p>
  )
}

interface ReactionBarProps {
  /** The emoji in the picker. @default defaultReactions */
  choices?: ReactionChoice[]
  className?: string
  /** Adds or takes back the current user's reaction. Leave out to show reactions read-only. */
  onToggle?: (emoji: string) => void
  reactions: CommentReaction[]
}

/**
 * Reactions with their counts, each a toggle for the current user, and a
 * button that opens a row of emoji to add one.
 */
function ReactionBar({
  choices = defaultReactions,
  className,
  onToggle,
  reactions,
}: ReactionBarProps) {
  const id = useId()
  const [picking, setPicking] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)
  const labelOf = (emoji: string) =>
    choices.find((choice) => choice.emoji === emoji)?.label ?? emoji

  useEffect(() => {
    if (picking) pickerRef.current?.querySelector('button')?.focus()
  }, [picking])

  function close() {
    setPicking(false)
    triggerRef.current?.focus()
  }

  function onPickerKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const buttons = [...(pickerRef.current?.querySelectorAll('button') ?? [])]
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      const step = event.key === 'ArrowRight' ? 1 : -1
      buttons[(index + step + buttons.length) % buttons.length]?.focus()
    }
  }

  if (!onToggle && reactions.length === 0) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      {reactions.map((reaction) =>
        onToggle ? (
          <Button
            key={reaction.emoji}
            type='button'
            variant='outline'
            size='xs'
            aria-pressed={reaction.reacted}
            aria-label={`${labelOf(reaction.emoji)}: ${reaction.count}`}
            className='tabular-nums aria-pressed:border-sky-500/40 aria-pressed:bg-sky-500/10'
            onClick={() => onToggle(reaction.emoji)}
          >
            <span aria-hidden>{reaction.emoji}</span>
            <span aria-hidden>{reaction.count}</span>
          </Button>
        ) : (
          <span
            key={reaction.emoji}
            role='img'
            aria-label={`${labelOf(reaction.emoji)}: ${reaction.count}`}
            className='bg-muted flex h-6 items-center gap-1 rounded-full px-2 text-xs tabular-nums'
          >
            <span aria-hidden>{reaction.emoji}</span>
            <span aria-hidden>{reaction.count}</span>
          </span>
        ),
      )}
      {onToggle && (
        <div
          className='flex items-center gap-1'
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null))
              setPicking(false)
          }}
        >
          <Button
            ref={triggerRef}
            type='button'
            variant='ghost'
            size='icon-xs'
            aria-label='Add reaction'
            aria-expanded={picking}
            aria-controls={picking ? `${id}-picker` : undefined}
            onClick={() => setPicking(!picking)}
          >
            <IconPlaceholder
              lucide='SmilePlusIcon'
              tabler='IconMoodPlus'
              hugeicons='SmilePlusIcon'
              phosphor='SmileyIcon'
              remixicon='RiEmotionLine'
            />
          </Button>
          {picking && (
            <div
              ref={pickerRef}
              id={`${id}-picker`}
              role='toolbar'
              tabIndex={-1}
              aria-label='Reactions'
              className='bg-popover text-popover-foreground ring-foreground/10 flex items-center gap-0.5 rounded-md p-0.5 shadow-xs ring-1'
              onKeyDown={onPickerKeyDown}
              // Safari doesn't focus a button on click, so pressing one would blur
              // the picker and close it before the click lands. Keep focus put.
              onMouseDown={(event) => event.preventDefault()}
            >
              {choices.map((choice) => (
                <Button
                  key={choice.emoji}
                  type='button'
                  variant='ghost'
                  size='icon-xs'
                  aria-label={choice.label}
                  aria-pressed={
                    reactions.find((reaction) => reaction.emoji === choice.emoji)
                      ?.reacted ?? false
                  }
                  className='text-sm aria-pressed:bg-sky-500/10'
                  onClick={() => {
                    onToggle(choice.emoji)
                    close()
                  }}
                >
                  {choice.emoji}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface CommentMenuItem {
  icon?: ReactNode
  label: string
  onSelect: () => void
  /** Red, for actions like delete. Put these last. */
  variant?: 'default' | 'destructive'
}

/** A "More actions" button with a menu, such as Edit and Delete, for one comment. */
function CommentMenu({
  items,
  label = 'More actions',
}: {
  items: CommentMenuItem[]
  /** Names the button for screen readers. @default 'More actions' */
  label?: string
}) {
  const firstDestructive = items.findIndex((item) => item.variant === 'destructive')
  return (
    <DropdownMenuTrigger>
      <Button variant='ghost' size='icon-xs' aria-label={label}>
        <IconPlaceholder
          lucide='EllipsisIcon'
          tabler='IconDots'
          hugeicons='MoreHorizontalCircle01Icon'
          phosphor='DotsThreeIcon'
          remixicon='RiMoreLine'
        />
      </Button>
      <DropdownMenu placement='bottom end' className='w-auto min-w-36'>
        {items.map((item, index) => (
          <Fragment key={item.label}>
            {index === firstDestructive && index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              variant={item.variant}
              textValue={item.label}
              onAction={item.onSelect}
            >
              {item.icon}
              {item.label}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenu>
    </DropdownMenuTrigger>
  )
}

interface CommentItemProps {
  /** After the reactions, such as Reply and Resolve buttons. */
  actions?: ReactNode
  /** Beside the author's name, such as an "Internal" badge. */
  badge?: ReactNode
  className?: string
  comment: ThreadComment
  /** Shown in place of the body and reactions, such as a composer to edit it. */
  editor?: ReactNode
  /** In the top corner, such as a CommentMenu. */
  menu?: ReactNode
  /** Pass a fixed date, so times render the same on the server and in the browser. */
  now: Date
  /** Adds or takes back the current user's reaction. Leave out to show reactions read-only. */
  onReact?: (emoji: string) => void
  /** People who can be mentioned, so their names are highlighted in the body. */
  people?: CommentAuthor[]
  /** `sm` for replies. @default 'default' */
  size?: 'default' | 'sm'
  /** @default 'UTC' */
  timeZone?: string
}

/** One comment: avatar, author, relative time, body, reactions and actions. */
function CommentItem({
  actions,
  badge,
  className,
  comment,
  editor,
  menu,
  now,
  onReact,
  people,
  size = 'default',
  timeZone = 'UTC',
}: CommentItemProps) {
  const id = useId()
  const reactions = comment.reactions ?? []
  return (
    <article
      aria-labelledby={`${id}-author ${id}-time`}
      data-comment-id={comment.id}
      className={cn('flex gap-3', className)}
    >
      <CommentAvatar author={comment.author} size={size} />
      <div className='flex min-w-0 flex-1 flex-col gap-1'>
        <div
          className={cn('flex items-center gap-2', size === 'sm' ? 'min-h-6' : 'min-h-8')}
        >
          <div className='flex min-w-0 flex-1 flex-wrap items-center gap-x-2'>
            <span
              id={`${id}-author`}
              title={comment.author.name}
              className='truncate text-sm font-medium'
            >
              {comment.author.name}
            </span>
            {badge}
            <span id={`${id}-time`} className='flex items-center gap-1'>
              <ActivityTime date={comment.at} now={now} timeZone={timeZone} />
              {comment.edited && (
                <span className='text-muted-foreground text-xs'>(edited)</span>
              )}
            </span>
          </div>
          {menu}
        </div>
        {editor || (
          <>
            <CommentBody body={comment.body} people={people} />
            {(reactions.length > 0 || onReact || actions) && (
              <div className='mt-1 flex flex-wrap items-center gap-1'>
                <ReactionBar reactions={reactions} onToggle={onReact} />
                {actions}
              </div>
            )}
          </>
        )}
      </div>
    </article>
  )
}

function findMentionQuery(text: string, caret: number) {
  const match = /(?:^|[\s(])@([\p{L}\p{M}'’.-]*(?: [\p{L}\p{M}'’.-]*)?)$/u.exec(
    text.slice(0, caret),
  )
  if (!match) return null
  return { query: match[1], start: caret - match[1].length - 1 }
}

interface CommentComposerProps {
  /**
   * Moves focus into the text box when it appears. Only for a composer the
   * user just opened, such as a reply or an edit, never on page load.
   */
  focusOnMount?: boolean
  className?: string
  /** The text to start from, such as the comment being edited. */
  defaultValue?: string
  /** Left of the buttons, such as a hint or who will be notified. */
  footer?: ReactNode
  /** Names the text box for screen readers. @default 'Comment' */
  label?: string
  /** Shows a Cancel button, and Escape cancels too. */
  onCancel?: () => void
  /** Saves the text. Resolve once it's saved; reject to keep the text and show an error. */
  onSubmit: (body: string) => void | Promise<void>
  /** Runs as the text changes. */
  onValueChange?: (value: string) => void
  /** On the submit button while saving. @default 'Posting…' */
  pendingLabel?: string
  /** People suggested after typing @. */
  people?: CommentAuthor[]
  /** @default 'Leave a comment…' */
  placeholder?: string
  /** @default 'Comment' */
  submitLabel?: string
  /** Controls the text. Leave out to let the composer manage it. */
  value?: string
}

/**
 * A text box for a comment. Typing @ suggests people: Up and Down choose,
 * Enter or Tab inserts, Escape closes the list. ⌘ or Ctrl + Enter submits.
 */
function CommentComposer({
  className,
  defaultValue = '',
  focusOnMount = false,
  footer,
  label = 'Comment',
  onCancel,
  onSubmit,
  onValueChange,
  pendingLabel = 'Posting…',
  people = [],
  placeholder = 'Leave a comment…',
  submitLabel = 'Comment',
  value,
}: CommentComposerProps) {
  const id = useId()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const pendingCaret = useRef<number | null>(null)
  const [uncontrolled, setUncontrolled] = useState(defaultValue)
  const [caret, setCaret] = useState(0)
  const [active, setActive] = useState(0)
  const [dismissed, setDismissed] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>()
  const text = value ?? uncontrolled

  const match = findMentionQuery(text, caret)
  const query = match?.query.toLowerCase() ?? ''
  const suggestions =
    match && match.start !== dismissed
      ? people
          .filter((person) => {
            const name = person.name.toLowerCase()
            return (
              name.startsWith(query) ||
              name.split(/\s+/).some((part) => part.startsWith(query))
            )
          })
          .slice(0, 6)
      : []
  const open = suggestions.length > 0
  const activeIndex = Math.min(active, suggestions.length - 1)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!focusOnMount || !textarea) return
    textarea.focus()
    textarea.setSelectionRange(textarea.value.length, textarea.value.length)
    setCaret(textarea.value.length)
  }, [focusOnMount])

  useLayoutEffect(() => {
    if (pendingCaret.current === null) return
    textareaRef.current?.setSelectionRange(pendingCaret.current, pendingCaret.current)
    pendingCaret.current = null
  }, [text])

  function change(next: string) {
    if (value === undefined) setUncontrolled(next)
    onValueChange?.(next)
    setError(undefined)
  }

  function insert(person: CommentAuthor) {
    if (!match) return
    const mention = `@${person.name} `
    const end = match.start + mention.length
    change(text.slice(0, match.start) + mention + text.slice(caret).replace(/^ /, ''))
    pendingCaret.current = end
    setCaret(end)
  }

  async function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    const body = text.trim()
    if (isSubmitting) return
    if (!body) return textareaRef.current?.focus()
    setIsSubmitting(true)
    try {
      await onSubmit(body)
      change('')
      setCaret(0)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      void submit()
    } else if (open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActive((activeIndex + step + suggestions.length) % suggestions.length)
    } else if (open && (event.key === 'Enter' || event.key === 'Tab')) {
      event.preventDefault()
      insert(suggestions[activeIndex])
    } else if (open && event.key === 'Escape') {
      event.preventDefault()
      setDismissed(match?.start ?? null)
    } else if (event.key === 'Escape' && onCancel) {
      event.preventDefault()
      onCancel()
    }
  }

  return (
    <form
      method='post'
      onSubmit={(event) => void submit(event)}
      className={cn('flex flex-col gap-1.5', className)}
    >
      <InputGroup>
        <InputGroupTextarea
          ref={textareaRef}
          aria-label={label}
          aria-describedby={`${id}-hint`}
          aria-autocomplete={people.length > 0 ? 'list' : undefined}
          aria-controls={open ? `${id}-people` : undefined}
          aria-activedescendant={open ? `${id}-person-${activeIndex}` : undefined}
          aria-invalid={error ? true : undefined}
          placeholder={placeholder}
          value={text}
          readOnly={isSubmitting}
          onChange={(event) => {
            change(event.target.value)
            setCaret(event.target.selectionStart)
            setActive(0)
          }}
          onSelect={(event) => setCaret(event.currentTarget.selectionStart)}
          onKeyDown={onKeyDown}
        />
        {open && (
          <div
            id={`${id}-people`}
            role='listbox'
            aria-label='People'
            className='w-full border-t p-1'
          >
            {suggestions.map((person, index) => (
              // Keys are handled on the text box, which keeps focus while the list is open.
              // oxlint-disable-next-line jsx-a11y/click-events-have-key-events
              <div
                key={person.name}
                id={`${id}-person-${index}`}
                role='option'
                tabIndex={-1}
                aria-selected={index === activeIndex}
                className='aria-selected:bg-accent aria-selected:text-accent-foreground flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm'
                onMouseDown={(event) => event.preventDefault()}
                onMouseMove={() => setActive(index)}
                onClick={() => insert(person)}
              >
                <CommentAvatar author={person} size='sm' />
                <span className='truncate'>{person.name}</span>
              </div>
            ))}
          </div>
        )}
        <InputGroupAddon align='block-end'>
          <div className='min-w-0 flex-1 text-xs font-normal'>{footer}</div>
          {onCancel && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              isDisabled={isSubmitting}
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button type='submit' size='sm' isDisabled={isSubmitting}>
            {isSubmitting ? pendingLabel : submitLabel}
          </Button>
        </InputGroupAddon>
      </InputGroup>
      <p id={`${id}-hint`} className='sr-only'>
        {people.length > 0 && 'Type @ to mention someone. '}
        Press Command or Control and Enter to submit.
      </p>
      <p aria-live='polite' className='sr-only'>
        {open &&
          `${suggestions.length} ${suggestions.length === 1 ? 'person' : 'people'} found`}
      </p>
      {error && (
        <p role='alert' className='text-destructive text-sm'>
          {error}
        </p>
      )}
    </form>
  )
}

interface CommentThreadProps {
  className?: string
  /** A top-level comment and its replies. */
  comment: ThreadComment
  /** Who is writing. Their own comments get Edit and Delete. */
  currentUser: CommentAuthor
  /** Above the first comment, such as the text a review comment is about. */
  header?: ReactNode
  /** Pass a fixed date, so times render the same on the server and in the browser. */
  now: Date
  /** Deletes one of the current user's comments. Adds Delete to its menu. */
  onDelete?: (commentId: string) => void
  /** Saves an edit to one of the current user's comments. Adds Edit to its menu. */
  onEdit?: (commentId: string, body: string) => Promise<void> | void
  /** Adds or takes back the current user's reaction to a comment. */
  onReact?: (commentId: string, emoji: string) => void
  /** Posts a reply. Adds Reply buttons. Resolve once it's saved. */
  onReply?: (body: string) => Promise<void> | void
  /** Resolves or reopens the thread. Adds a Resolve button. */
  onResolve?: (resolved: boolean) => void
  /** People suggested after @ and highlighted as mentions. */
  people?: CommentAuthor[]
  /** Beside each author's name, such as a role or an "Internal" badge. */
  renderBadge?: (comment: ThreadComment) => ReactNode
  /** @default 'UTC' */
  timeZone?: string
}

/**
 * A comment with one level of replies, joined by a line, and a reply box.
 * A resolved thread collapses to a summary with Show and Reopen.
 */
function CommentThread({
  className,
  comment,
  currentUser,
  header,
  now,
  onDelete,
  onEdit,
  onReact,
  onReply,
  onResolve,
  people,
  renderBadge,
  timeZone = 'UTC',
}: CommentThreadProps) {
  const id = useId()
  const [replying, setReplying] = useState(false)
  const [draft, setDraft] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState('')
  const pendingFocus = useRef<'reopen' | 'resolve' | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const replies = comment.replies ?? []
  const resolved = Boolean(comment.resolved)
  const canReply = Boolean(onReply) && !resolved

  useEffect(() => {
    const target = pendingFocus.current
    if (target && resolved === (target === 'reopen')) {
      document.getElementById(`${id}-${target}`)?.focus()
      pendingFocus.current = null
    }
  }, [id, resolved])

  function focusReply() {
    requestAnimationFrame(() => document.getElementById(`${id}-reply`)?.focus())
  }

  function startReply(to?: CommentAuthor) {
    const mention = to && to.name !== currentUser.name ? `@${to.name} ` : ''
    setDraft((current) =>
      mention && !current.includes(mention.trim())
        ? `${current}${current && !/\s$/.test(current) ? ' ' : ''}${mention}`
        : current,
    )
    if (!replying) return setReplying(true)
    requestAnimationFrame(() => {
      const textarea = document
        .getElementById(`${id}-composer`)
        ?.querySelector('textarea')
      textarea?.focus()
      textarea?.setSelectionRange(textarea.value.length, textarea.value.length)
    })
  }

  function stopReply() {
    setReplying(false)
    setDraft('')
    focusReply()
  }

  function stopEditing(commentId: string) {
    setEditingId(null)
    requestAnimationFrame(() =>
      rootRef.current
        ?.querySelector<HTMLElement>(
          `[data-comment-id="${CSS.escape(commentId)}"] [aria-label^="More actions"]`,
        )
        ?.focus(),
    )
  }

  function resolve(next: boolean) {
    pendingFocus.current = next ? 'reopen' : 'resolve'
    setStatus(next ? 'Thread resolved' : 'Thread reopened')
    setExpanded(false)
    onResolve?.(next)
  }

  function renderComment(item: ThreadComment, isReply: boolean) {
    const own = item.author.name === currentUser.name
    const editing = editingId === item.id
    const menuItems: CommentMenuItem[] = []
    if (own && onEdit) {
      menuItems.push({
        icon: (
          <IconPlaceholder
            lucide='PencilIcon'
            tabler='IconPencil'
            hugeicons='PencilEdit02Icon'
            phosphor='PencilSimpleIcon'
            remixicon='RiPencilLine'
          />
        ),
        label: 'Edit',
        onSelect: () => setEditingId(item.id),
      })
    }
    if (own && onDelete) {
      menuItems.push({
        icon: (
          <IconPlaceholder
            lucide='Trash2Icon'
            tabler='IconTrash'
            hugeicons='Delete02Icon'
            phosphor='TrashIcon'
            remixicon='RiDeleteBinLine'
          />
        ),
        label: 'Delete',
        onSelect: () => {
          onDelete(item.id)
          setStatus('Comment deleted')
          if (isReply) focusReply()
        },
        variant: 'destructive',
      })
    }
    return (
      <CommentItem
        comment={item}
        now={now}
        timeZone={timeZone}
        people={people}
        size={isReply ? 'sm' : 'default'}
        badge={renderBadge?.(item)}
        menu={
          menuItems.length > 0 &&
          !editing && (
            <CommentMenu
              items={menuItems}
              label={`More actions for comment by ${item.author.name}`}
            />
          )
        }
        onReact={onReact && ((emoji) => onReact(item.id, emoji))}
        editor={
          editing &&
          onEdit && (
            <CommentComposer
              focusOnMount
              className='mt-1'
              defaultValue={item.body}
              label='Edit comment'
              people={people}
              submitLabel='Save'
              pendingLabel='Saving…'
              onCancel={() => stopEditing(item.id)}
              onSubmit={async (body) => {
                await onEdit(item.id, body)
                stopEditing(item.id)
                setStatus('Comment saved')
              }}
            />
          )
        }
        actions={
          <>
            {canReply && (
              <Button
                id={isReply ? undefined : `${id}-reply`}
                type='button'
                variant='ghost'
                size='xs'
                aria-label={isReply ? `Reply to ${item.author.name}` : undefined}
                onClick={() => startReply(isReply ? item.author : undefined)}
              >
                <IconPlaceholder
                  lucide='ReplyIcon'
                  tabler='IconCornerUpLeft'
                  hugeicons='ArrowTurnBackwardIcon'
                  phosphor='ArrowBendUpLeftIcon'
                  remixicon='RiReplyLine'
                />
                Reply
              </Button>
            )}
            {!isReply && !resolved && onResolve && (
              <Button
                id={`${id}-resolve`}
                type='button'
                variant='ghost'
                size='xs'
                onClick={() => resolve(true)}
              >
                <IconPlaceholder
                  lucide='CircleCheckIcon'
                  tabler='IconCircleCheck'
                  hugeicons='CheckmarkCircle02Icon'
                  phosphor='CheckCircleIcon'
                  remixicon='RiCheckboxCircleLine'
                />
                Resolve
              </Button>
            )}
          </>
        }
      />
    )
  }

  const showComposer = replying && canReply
  const connected = replies.length > 0 || showComposer

  /** The line from the comment above into this row's avatar, carried on to the next row. */
  function connector(isLast: boolean) {
    return (
      <>
        <span
          aria-hidden
          className='border-border absolute top-0 left-[calc(1rem-0.5px)] h-7 w-6 rounded-bl-[0.625rem] border-b border-l'
        />
        {!isLast && (
          <span
            aria-hidden
            className='bg-border absolute top-[1.125rem] bottom-0 left-[calc(1rem-0.5px)] w-px'
          />
        )}
      </>
    )
  }

  return (
    <div ref={rootRef} className={cn('flex flex-col gap-3', className)}>
      {resolved && (
        <div className='bg-muted/50 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg px-3 py-2'>
          <p className='flex min-w-0 flex-1 basis-48 items-center gap-2 text-sm'>
            <ActivityIcon
              tone='success'
              className='ring-0 [--activity-marker:1.25rem] [&_svg]:size-3'
              icon={
                <IconPlaceholder
                  lucide='CheckIcon'
                  tabler='IconCheck'
                  hugeicons='Tick02Icon'
                  phosphor='CheckIcon'
                  remixicon='RiCheckLine'
                />
              }
            />
            <span className='font-medium'>Resolved</span>
            <span className='text-muted-foreground min-w-0 truncate'>
              {comment.author.name}: {comment.body}
            </span>
          </p>
          <div className='ml-auto flex items-center gap-1'>
            <Button
              type='button'
              variant='ghost'
              size='xs'
              aria-expanded={expanded}
              aria-controls={expanded ? `${id}-thread` : undefined}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded
                ? 'Hide'
                : replies.length > 0
                  ? `Show ${replies.length + 1} comments`
                  : 'Show'}
            </Button>
            {onResolve && (
              <Button
                id={`${id}-reopen`}
                type='button'
                variant='outline'
                size='xs'
                onClick={() => resolve(false)}
              >
                Reopen
              </Button>
            )}
          </div>
        </div>
      )}
      {(!resolved || expanded) && (
        <div id={`${id}-thread`} className='flex flex-col gap-3'>
          {header}
          <div>
            <div className='relative'>
              {connected && (
                <span
                  aria-hidden
                  className='bg-border absolute top-10 bottom-0 left-[calc(1rem-0.5px)] w-px'
                />
              )}
              {renderComment(comment, false)}
            </div>
            {replies.length > 0 && (
              <ul aria-label={`Replies to ${comment.author.name}`}>
                {replies.map((reply, index) => (
                  <li key={reply.id} className='relative pt-4 pl-11'>
                    {connector(index === replies.length - 1 && !showComposer)}
                    {renderComment(reply, true)}
                  </li>
                ))}
              </ul>
            )}
            {showComposer && (
              <div id={`${id}-composer`} className='relative flex gap-3 pt-4 pl-11'>
                {connector(true)}
                <CommentAvatar author={currentUser} size='sm' />
                <CommentComposer
                  focusOnMount
                  className='min-w-0 flex-1'
                  label={`Reply to ${comment.author.name}`}
                  placeholder='Reply…'
                  submitLabel='Reply'
                  people={people}
                  value={draft}
                  onValueChange={setDraft}
                  onCancel={stopReply}
                  onSubmit={async (body) => {
                    await onReply?.(body)
                    setStatus('Reply posted')
                    stopReply()
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
      <p aria-live='polite' className='sr-only'>
        {status}
      </p>
    </div>
  )
}

export {
  CommentAvatar,
  CommentBody,
  CommentComposer,
  CommentItem,
  CommentMenu,
  CommentThread,
  ReactionBar,
  defaultReactions,
  getMentions,
  parseMentions,
  toggleReaction,
  updateComment,
}

export type {
  CommentAuthor,
  CommentComposerProps,
  CommentItemProps,
  CommentMenuItem,
  CommentReaction,
  CommentThreadProps,
  MentionSegment,
  ReactionBarProps,
  ReactionChoice,
  ThreadComment,
}
