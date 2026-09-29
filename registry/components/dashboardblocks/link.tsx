'use client'

import {
  type ComponentProps,
  type ComponentType,
  createContext,
  type ReactNode,
  useContext,
} from 'react'

/*
 * Primitives render in-app links with `Link`. Without a provider it's a plain
 * anchor, which reloads the page. Wrap your app in `LinkProvider` with your
 * router's link to navigate on the client instead.
 */

type LinkProps = ComponentProps<'a'> & { href: string }

/** A link that takes anchor props with a string `href`, such as Next.js's `Link`. */
type LinkComponent = ComponentType<LinkProps>

const LinkContext = createContext<LinkComponent | 'a'>('a')

interface LinkProviderProps {
  children: ReactNode
  /** Your router's link. Wrap one that takes `to` so it takes `href`. */
  component: LinkComponent
}

/** Sets the link every dashboardblocks primitive inside it renders. */
function LinkProvider({ children, component }: LinkProviderProps) {
  return <LinkContext.Provider value={component}>{children}</LinkContext.Provider>
}

/**
 * An in-app link: the provider's component, or a plain anchor without one.
 * Without `href` it's an anchor that goes nowhere, as `<a>` without one is.
 */
function Link({ href, ...props }: Omit<LinkProps, 'href'> & { href?: string }) {
  const Component = useContext(LinkContext)
  // oxlint-disable-next-line jsx-a11y/anchor-has-content -- the content comes in `children`
  if (href === undefined) return <a {...props} />
  // oxlint-disable-next-line react/static-components -- it comes from context, so it's the same component on every render
  return <Component href={href} {...props} />
}

export { Link, LinkProvider }

export type { LinkComponent, LinkProps, LinkProviderProps }
