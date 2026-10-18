import { Children, type ComponentProps, Fragment } from 'react'

import { cn } from '@/lib/utils'

function Details({ children, className, ...props }: ComponentProps<'span'>) {
  const parts = Children.toArray(children)

  return (
    <span data-slot='details' className={cn(className)} {...props}>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <>
              {' '}
              <span aria-hidden>·</span>
              {' '}
            </>
          )}
          {part}
        </Fragment>
      ))}
    </span>
  )
}

export { Details }
