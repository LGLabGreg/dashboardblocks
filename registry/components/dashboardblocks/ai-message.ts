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
  state?: 'streaming' | 'done'
  text: string
  type: 'text'
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

/** A reply as it stands while it streams: what `readUIMessageStream` yields, or `replyFromText` for a provider that streams plain text. */
type AIReply = Pick<AIMessage, 'metadata' | 'parts'>

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
  regenerate: () => unknown
  /** `metadata` goes on the person's message, such as what the page shows when they ask. */
  sendMessage: (message: {
    files?: AIFilePart[]
    metadata?: unknown
    text: string
  }) => unknown
  /** Called with `[]` to start a new chat. */
  setMessages?: (messages: []) => void
  status: AIChatStatus
  stop: () => unknown
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

/** The reply's text, as written, for copying. */
function getMessageText(message: Pick<AIMessage, 'parts'>) {
  return message.parts
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

function getMessageSources(message: Pick<AIMessage, 'parts'>): AISource[] {
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
  getMessageFiles,
  getMessageSources,
  getMessageText,
  getSafeHref,
  getStreamingMessageId,
  getToolLabel,
  getToolName,
  isToolPart,
  replyFromText,
}

export type {
  AIAnyToolPart,
  AIChat,
  AIChatStatus,
  AIDataPart,
  AIDynamicToolPart,
  AIFilePart,
  AIMessage,
  AIMessagePart,
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
