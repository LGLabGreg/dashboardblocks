'use client'

import {
  type ComponentProps,
  type ComponentType,
  createContext,
  type ReactNode,
  useContext,
} from 'react'

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
function Link({ children, href, ...props }: Omit<LinkProps, 'href'> & { href?: string }) {
  const Component = useContext(LinkContext)
  if (href === undefined) return <a {...props}>{children}</a>
  return (
    // oxlint-disable-next-line react/static-components -- it comes from context, so it's the same component on every render
    <Component href={href} {...props}>
      {children}
    </Component>
  )
}

export { Link, LinkProvider }

export type { LinkComponent, LinkProps, LinkProviderProps }
