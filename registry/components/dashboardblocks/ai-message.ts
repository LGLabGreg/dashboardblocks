/** The shape of the AI SDK's `UIMessage`, so `useChat().messages` and `readUIMessageStream` pass straight in, and any other provider can build one. */
interface AIMessage {
  id: string
  /** Anything the server attaches to the reply, such as token usage. */
  metadata?: unknown
  parts: AIMessagePart[]
  role: 'system' | 'user' | 'assistant'
}

type AIMessagePart =
  | AITextPart
  | AIReasoningPart
  | AIToolPart
  | AIDynamicToolPart
  | AISourceUrlPart
  | AISourceDocumentPart
  | AIFilePart
  | AIDataPart
  | { type: 'step-start' | 'custom' | 'reasoning-file' }

interface AITextPart {
  /** What the text cites, as the AI SDK gives it: the page or document, and where in the text when the provider says. */
  citations?: AICitation[]
  state?: 'streaming' | 'done'
  text: string
  type: 'text'
}

interface AICitation {
  /** Where the cited passage ends in the part's text, when the provider says. */
  endIndex?: number
  source:
    | { id: string; sourceType: 'url'; title?: string; url: string }
    | { id: string; sourceType: 'document'; title: string }
}

/** Empty when the provider keeps its reasoning to itself and sends only that it thought. */
interface AIReasoningPart {
  state?: 'streaming' | 'done'
  text: string
  type: 'reasoning'
}

type AIToolState =
  | 'input-streaming'
  | 'input-available'
  | 'approval-requested'
  | 'approval-responded'
  | 'output-available'
  | 'output-error'
  | 'output-denied'

interface AIToolCall {
  approval?: {
    approved?: boolean
    id: string
    reason?: string
    /** Why the server asks, when it says. */
    requestReason?: string
  }
  errorText?: string
  input?: unknown
  output?: unknown
  /** A result the tool will replace with its final one. */
  preliminary?: boolean
  state: AIToolState
  title?: string
  toolCallId: string
}

interface AIToolPart extends AIToolCall {
  type: `tool-${string}`
}

interface AIDynamicToolPart extends AIToolCall {
  toolName: string
  type: 'dynamic-tool'
}

interface AISourceUrlPart {
  sourceId: string
  title?: string
  type: 'source-url'
  url: string
}

interface AISourceDocumentPart {
  filename?: string
  mediaType: string
  sourceId: string
  title: string
  type: 'source-document'
}

interface AIFilePart {
  filename?: string
  mediaType: string
  type: 'file'
  /** A hosted file or a data URL. */
  url: string
}

interface AIDataPart {
  data: unknown
  id?: string
  type: `data-${string}`
}

/** A reply as it stands while it streams: what `readUIMessageStream` yields, or `replyFromText` for a provider that streams plain text. Its `id`, when the server sends one, is the reply's id from then on. */
type AIReply = Pick<AIMessage, 'metadata' | 'parts'> & { id?: string }

/** `submitted` waits for the first part of a reply, `streaming` while parts arrive. */
type AIChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'

interface AIToolApprovalResponse {
  approved: boolean
  /** The `approval.id` of the tool part, not its `toolCallId`. */
  id: string
  reason?: string
}

/** What a chat block runs on: `useChat()` from `@ai-sdk/react` as it is, or `useChatStream` for any other stream. */
interface AIChat {
  addToolApprovalResponse?: (response: AIToolApprovalResponse) => unknown
  error?: Error
  messages: AIMessage[]
  /** Writes the reply again: the one `messageId` names, or the last. */
  regenerate: (options?: { messageId?: string }) => unknown
  /** Shows that version of the message `messageId` names, and what followed it then. */
  selectVersion?: (messageId: string, index: number) => unknown
  /**
   * `metadata` goes on the person's message, such as what the page shows when they ask. With
   * `messageId`, the message is an edit of that question, and replaces it and what followed it.
   */
  sendMessage: (message: {
    files?: AIFilePart[]
    messageId?: string
    metadata?: unknown
    text: string
  }) => unknown
  /** Called with `[]` to start a new chat. */
  setMessages?: (messages: []) => void
  status: AIChatStatus
  stop: () => unknown
  /** The versions an edit or a regenerate kept. Leave out when the chat doesn't keep them. */
  versions?: AIMessageVersions
}

/**
 * The versions a chat keeps after an edit or a regenerate, by the id of the message before them
 * (`''` before the first): each version of what followed it, and the one showing. The one showing
 * is held as `[]`, since the chat's messages hold it.
 */
type AIMessageVersions<Message extends { id: string } = AIMessage> = Record<
  string,
  { current: number; versions: Message[][] }
>

interface AIBranch<Message extends { id: string }> {
  messages: Message[]
  versions: AIMessageVersions<Message>
}

const replaceAt = <Item>(items: Item[], index: number, item: Item) =>
  items.map((current, at) => (at === index ? item : current))

const versionKey = (messages: { id: string }[], index: number) =>
  messages[index - 1]?.id ?? ''

/** Replaces the messages from `index` on with `next`, keeping what was there as an earlier version. */
function branchMessages<Message extends { id: string }>(
  { messages, versions }: AIBranch<Message>,
  index: number,
  next: Message[],
): AIBranch<Message> {
  const before = messages.slice(0, index)
  const replaced = messages.slice(index)
  if (replaced.length === 0) return { messages: [...before, ...next], versions }
  const key = versionKey(messages, index)
  const kept = versions[key] ?? { current: 0, versions: [[]] }
  const all = replaceAt(kept.versions, kept.current, replaced)
  return {
    messages: [...before, ...next],
    versions: {
      ...versions,
      [key]: { current: all.length, versions: [...all, []] },
    },
  }
}

/** Shows version `index` of the message `messageId` names, and what followed it then. */
function selectMessageVersion<Message extends { id: string }>(
  branch: AIBranch<Message>,
  messageId: string,
  index: number,
): AIBranch<Message> {
  const { messages, versions } = branch
  const at = messages.findIndex((message) => message.id === messageId)
  const key = versionKey(messages, at)
  const kept = versions[key]
  const shown = kept?.versions[index]
  if (at === -1 || !kept || index === kept.current || !shown?.length) return branch
  const all = replaceAt(kept.versions, kept.current, messages.slice(at))
  return {
    messages: [...messages.slice(0, at), ...shown],
    versions: {
      ...versions,
      [key]: { current: index, versions: replaceAt(all, index, []) },
    },
  }
}

/** Which version of the message at `index` shows, and how many there are, or `undefined` when it has one. */
function getMessageVersion(
  messages: { id: string }[],
  versions: AIMessageVersions<{ id: string }> | undefined,
  index: number,
) {
  const kept = versions?.[versionKey(messages, index)]
  if (!kept || kept.versions.length < 2) return undefined
  return { count: kept.versions.length, index: kept.current }
}

/** A record a reply cites. `[2]` in the reply's text links to its second source. */
interface AISource {
  /** Leave out for a source with nothing to open, such as a document the model was given. */
  href?: string
  /** `'query'` shows the label as code. */
  kind?: 'query'
  label: string
}

type AIAnyToolPart = AIToolPart | AIDynamicToolPart

function isToolPart(part: AIMessagePart): part is AIAnyToolPart {
  return part.type === 'dynamic-tool' || part.type.startsWith('tool-')
}

function getToolName(part: AIAnyToolPart) {
  return part.type === 'dynamic-tool' ? part.toolName : part.type.slice('tool-'.length)
}

/** `lookup_order` and `lookupOrder` read "Lookup order". */
function getToolLabel(part: AIAnyToolPart) {
  if (part.title) return part.title
  const words = getToolName(part)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

const citationKey = ({ source }: AICitation) =>
  source.sourceType === 'url' ? source.url : source.id

/** What the reply cites, once each, in the order first cited. */
function getCitations(parts: AIMessagePart[]) {
  const cited = new Map<string, AICitation>()
  for (const part of parts) {
    if (part.type !== 'text') continue
    for (const citation of byEnd(part)) {
      const key = citationKey(citation)
      if (!cited.has(key)) cited.set(key, citation)
    }
  }
  return cited
}

function byEnd(part: AITextPart) {
  const end = (citation: AICitation) => citation.endIndex ?? part.text.length
  return [...(part.citations ?? [])].sort((a, b) => end(a) - end(b))
}

/** The text with `[n]` after each passage it cites, before the space that follows. */
function markCitations(part: AITextPart, cited: string[]) {
  let text = part.text
  const marks = new Map<number, string>()
  for (const citation of byEnd(part)) {
    const end = Math.min(citation.endIndex ?? text.length, text.length)
    const mark = `[${cited.indexOf(citationKey(citation)) + 1}]`
    if (!marks.get(end)?.includes(mark)) marks.set(end, (marks.get(end) ?? '') + mark)
  }
  for (const [end, mark] of [...marks].sort(([a], [b]) => b - a)) {
    const before = text.slice(0, end).trimEnd()
    text = before + mark + text.slice(before.length)
  }
  return text
}

/**
 * A reply's parts as they read: text parts in a row joined into one, since a provider can split
 * its text wherever a citation starts or ends (Claude's web search does), and `[n]` after each
 * passage the text cites, `n` being the source's place in `getMessageSources`.
 */
function getReadableParts(message: Pick<AIMessage, 'parts'>): AIMessagePart[] {
  const cited = [...getCitations(message.parts).keys()]
  const parts: AIMessagePart[] = []
  message.parts.forEach((part, index) => {
    if (part.type !== 'text') {
      parts.push(part)
      return
    }
    const text = part.citations?.length ? markCitations(part, cited) : part.text
    const previous = parts.at(-1)
    if (previous?.type === 'text' && message.parts[index - 1]?.type === 'text') {
      parts[parts.length - 1] = {
        state: part.state,
        text: previous.text + text,
        type: 'text',
      }
    } else {
      parts.push({ state: part.state, text, type: 'text' })
    }
  })
  return parts
}

/** The reply's text, as written, for copying. */
function getMessageText(message: Pick<AIMessage, 'parts'>) {
  return getReadableParts(message)
    .flatMap((part) =>
      part.type === 'text' && part.text.trim() ? [part.text.trim()] : [],
    )
    .join('\n\n')
}

/** The link when it's safe to open from what a model wrote: http(s), mailto, or a path in the app. Anything else, such as `javascript:`, is dropped. */
function hasControlCharacter(value: string) {
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index)
    if (code < 32 || code === 127) return true
  }
  return false
}

function getSafeHref(href: string | undefined) {
  const value = href?.trim()
  if (!value || hasControlCharacter(value)) return undefined
  if (/^(?:https?:\/\/|mailto:)/i.test(value)) return value
  if (/^(?:\/(?![/\\])|#|\?)/.test(value)) return value
  return undefined
}

/** What `[n]` in the reply links to: the sources its text cites, in the order first cited, or, when it cites none, every source it sent. */
function getMessageSources(message: Pick<AIMessage, 'parts'>): AISource[] {
  const cited = getCitations(message.parts)
  if (cited.size > 0) {
    return [...cited.values()].map(({ source }) => {
      if (source.sourceType === 'document') return { label: source.title }
      return { href: getSafeHref(source.url), label: source.title || source.url }
    })
  }
  return message.parts.flatMap((part) => {
    if (part.type === 'source-url') {
      return [{ href: getSafeHref(part.url), label: part.title || part.url }]
    }
    if (part.type === 'source-document') return [{ label: part.title }]
    return []
  })
}

function getMessageFiles(message: Pick<AIMessage, 'parts'>) {
  return message.parts.filter((part): part is AIFilePart => part.type === 'file')
}

/** The reply still arriving: the last message, when it's the assistant's and the chat is busy. A reply that goes on after an approval waits as `submitted`, so it counts too. */
function getStreamingMessageId(
  messages: Pick<AIMessage, 'id' | 'role'>[],
  status: AIChatStatus,
) {
  const last = messages.at(-1)
  if (last?.role !== 'assistant') return undefined
  return status === 'streaming' || status === 'submitted' ? last.id : undefined
}

/** Turns a stream of text chunks into replies for `useChatStream`. */
async function* replyFromText(chunks: AsyncIterable<string>): AsyncGenerator<AIReply> {
  let text = ''
  for await (const chunk of chunks) {
    text += chunk
    yield { parts: [{ state: 'streaming', text, type: 'text' }] }
  }
  yield { parts: [{ state: 'done', text, type: 'text' }] }
}

export {
  branchMessages,
  getMessageFiles,
  getMessageSources,
  getMessageText,
  getSafeHref,
  getStreamingMessageId,
  getToolLabel,
  getMessageVersion,
  getReadableParts,
  getToolName,
  isToolPart,
  replyFromText,
  selectMessageVersion,
}

export type {
  AIAnyToolPart,
  AIBranch,
  AIChat,
  AICitation,
  AIChatStatus,
  AIDataPart,
  AIDynamicToolPart,
  AIFilePart,
  AIMessage,
  AIMessagePart,
  AIMessageVersions,
  AIReasoningPart,
  AIReply,
  AISource,
  AISourceDocumentPart,
  AISourceUrlPart,
  AITextPart,
  AIToolApprovalResponse,
  AIToolCall,
  AIToolPart,
  AIToolState,
}
