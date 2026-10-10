'use client'

import {
  type ComponentProps,
  type ComponentType,
  createContext,
  createElement,
  type ReactNode,
  useContext,
} from 'react'

type LinkProps = ComponentProps<'a'> & { href: string }

/** A link that takes anchor props with a string `href`, such as Next.js's `Link`. */
type LinkComponent = ComponentType<LinkProps>

const LinkContext = createContext<LinkComponent | 'a'>('a')

interface LinkProviderProps {
  children: ReactNode
  component: LinkComponent
}

function LinkProvider({ children, component }: LinkProviderProps) {
  return <LinkContext.Provider value={component}>{children}</LinkContext.Provider>
}

function Link({ children, href, ...props }: Omit<LinkProps, 'href'> & { href?: string }) {
  const Component = useContext(LinkContext)
  if (href === undefined) return <a {...props}>{children}</a>
  // Not JSX: eslint-plugin-react-hooks reads a component from context as one created during render (static-components), though it's the same one on every render.
  return createElement(Component, { href, ...props }, children)
}

export { Link, LinkProvider }

export type { LinkComponent, LinkProps, LinkProviderProps }
