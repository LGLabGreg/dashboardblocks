/**
 * Source transforms that turn a block written against Base UI into the same
 * block for Radix UI or React Aria. The shadcn CLI resolves `button`, `tabs`
 * and friends to the user's own components, so only the props that differ
 * between the libraries need rewriting here.
 */
import {
  type JsxAttribute,
  type JsxElement,
  type JsxSelfClosingElement,
  Node,
  Project,
  type SourceFile,
  SyntaxKind,
} from 'ts-morph'

export const BASES = ['base', 'radix', 'aria'] as const
export type Base = (typeof BASES)[number]

const project = new Project({ useInMemoryFileSystem: true })

function createSourceFile(source: string) {
  return project.createSourceFile(`file-${Math.random()}.tsx`, source, {
    overwrite: true,
  })
}

type JsxOpening = JsxSelfClosingElement | ReturnType<JsxElement['getOpeningElement']>

function jsxOpenings(file: SourceFile): JsxOpening[] {
  return [
    ...file.getDescendantsOfKind(SyntaxKind.JsxOpeningElement),
    ...file.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement),
  ]
}

function attribute(element: JsxOpening, name: string) {
  const found = element.getAttribute(name)
  return found && Node.isJsxAttribute(found) ? found : undefined
}

function renameAttribute(element: JsxOpening, from: string, to: string) {
  attribute(element, from)?.getNameNode().replaceWithText(to)
}

/**
 * `<Trigger render={<Button variant='ghost' />}>Label</Trigger>` becomes
 * `<Trigger asChild><Button variant='ghost'>Label</Button></Trigger>`.
 * The reverse of what the shadcn CLI does when installing into a Base UI project.
 */
function renderToAsChild(file: SourceFile) {
  for (let pass = 0; pass < 10; pass++) {
    const element = file
      .getDescendantsOfKind(SyntaxKind.JsxElement)
      .find((candidate) => attribute(candidate.getOpeningElement(), 'render'))
    if (!element) return

    const opening = element.getOpeningElement()
    const render = attribute(opening, 'render') as JsxAttribute
    const initializer = render.getInitializer()
    const child = Node.isJsxExpression(initializer)
      ? initializer.getExpression()
      : undefined
    const inner =
      child && Node.isParenthesizedExpression(child) ? child.getExpression() : child
    if (!inner || !Node.isJsxSelfClosingElement(inner)) {
      throw new Error(`Unsupported render prop: ${render.getText()}`)
    }

    const tag = inner.getTagNameNode().getText()
    const childAttributes = inner
      .getAttributes()
      .map((item) => item.getText())
      .join(' ')
    const children = element
      .getJsxChildren()
      .map((item) => item.getText())
      .join('')
    const parentTag = opening.getTagNameNode().getText()
    const parentAttributes = opening
      .getAttributes()
      .filter((item) => item !== render)
      .map((item) => item.getText())
      .join(' ')

    element.replaceWithText(
      `<${parentTag} ${parentAttributes} asChild><${tag} ${childAttributes}>${children}</${tag}></${parentTag}>`,
    )
  }
  throw new Error('Too many nested render props')
}

export function toRadix(source: string) {
  const file = createSourceFile(source)
  renderToAsChild(file)
  for (const element of jsxOpenings(file)) {
    const tag = element.getTagNameNode().getText()
    // Radix closes on select by default; Base UI needs to be told to.
    attribute(element, 'closeOnClick')?.remove()
    attribute(element, 'nativeButton')?.remove()
    // Base UI keeps the menu open when toggling a checkbox item; Radix closes it.
    if (tag === 'DropdownMenuCheckboxItem' && !attribute(element, 'onSelect')) {
      element.addAttribute({
        name: 'onSelect',
        initializer: '{(event) => event.preventDefault()}',
      })
    }
  }
  return file.getFullText()
}

const ARIA_RENAMES: Record<string, Record<string, string>> = {
  Button: { disabled: 'isDisabled' },
  Switch: {
    checked: 'isSelected',
    defaultChecked: 'defaultSelected',
    disabled: 'isDisabled',
    onCheckedChange: 'onChange',
  },
  Tabs: {
    defaultValue: 'defaultSelectedKey',
    onValueChange: 'onSelectionChange',
    value: 'selectedKey',
  },
  TabsContent: { value: 'id' },
  TabsTrigger: { value: 'id' },
}

export function toAria(source: string) {
  const file = createSourceFile(source)
  for (const element of jsxOpenings(file)) {
    const renames = ARIA_RENAMES[element.getTagNameNode().getText()]
    if (!renames) continue
    for (const [from, to] of Object.entries(renames)) renameAttribute(element, from, to)
  }
  return file.getFullText()
}

/** Leftovers that mean a file needs a hand-written override for this base. */
const UNSUPPORTED: Record<Exclude<Base, 'base'>, RegExp[]> = {
  aria: [/\brender=\{/, /\bDropdownMenu\w*\b/, /\bcloseOnClick\b/, /\bnativeButton\b/],
  radix: [/\brender=\{/, /\bcloseOnClick\b/, /\bnativeButton\b/],
}

export function transformForBase(source: string, base: Base, path: string) {
  if (base === 'base') return source
  const output = base === 'radix' ? toRadix(source) : toAria(source)
  const leftover = UNSUPPORTED[base].find((pattern) => pattern.test(output))
  if (leftover) {
    throw new Error(
      `${path} uses ${leftover} which can't be converted to ${base}. ` +
        `Add an override at registry/bases/${base}/${path.replace(/^registry\//, '')}`,
    )
  }
  return output
}
