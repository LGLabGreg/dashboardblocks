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

const NavigateContext = createContext<((href: string) => void) | undefined>(undefined)

interface LinkProviderProps {
  children: ReactNode
  component: LinkComponent
  /** Opens an in-app href with your router, for links that must not prefetch, such as one a model wrote. Leave out for a full page load. */
  navigate?: (href: string) => void
}

function LinkProvider({ children, component, navigate }: LinkProviderProps) {
  return (
    <LinkContext.Provider value={component}>
      <NavigateContext.Provider value={navigate}>{children}</NavigateContext.Provider>
    </LinkContext.Provider>
  )
}

/** The router's `navigate` from `LinkProvider`, if it has one. */
function useLinkNavigate() {
  return useContext(NavigateContext)
}

/** A primary click with no modifier key, which opens a link in place rather than in a new tab or window. */
function isPlainClick(
  event: Pick<MouseEvent, 'altKey' | 'button' | 'ctrlKey' | 'metaKey' | 'shiftKey'>,
) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  )
}

function Link({ children, href, ...props }: Omit<LinkProps, 'href'> & { href?: string }) {
  const Component = useContext(LinkContext)
  if (href === undefined) return <a {...props}>{children}</a>
  // Not JSX: eslint-plugin-react-hooks reads a component from context as one created during render (static-components), though it's the same one on every render.
  return createElement(Component, { href, ...props }, children)
}

export { isPlainClick, Link, LinkProvider, useLinkNavigate }

export type { LinkComponent, LinkProps, LinkProviderProps }
