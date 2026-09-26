/**
 * Copied into each verification project as src/App.tsx by verify-registry.ts.
 * Renders every installed block with its example props, so `vite build` has to
 * bundle all of them and a browser can show any that crash.
 */
import { Component, type ComponentType, type ReactNode } from 'react'

const modules = import.meta.glob('./components/dashboardblocks/*/*.tsx', {
  eager: true,
}) as Record<string, Record<string, unknown>>

class Boundary extends Component<
  { name: string; children: ReactNode },
  { error?: string }
> {
  state: { error?: string } = {}
  static getDerivedStateFromError(error: Error) {
    return { error: error.message }
  }
  componentDidCatch(error: Error) {
    console.error(`BLOCK ${this.props.name} crashed: ${error.message}`)
  }
  render() {
    return this.state.error ? (
      <p data-crashed={this.props.name}>
        {this.props.name}: {this.state.error}
      </p>
    ) : (
      this.props.children
    )
  }
}

const blocks = Object.entries(modules).flatMap(([path, mod]) => {
  const propsKey = Object.keys(mod).find((key) => key.endsWith('ExampleProps'))
  const compKey = Object.keys(mod).find(
    (key) => /^[A-Z]/.test(key) && typeof mod[key] === 'function',
  )
  if (!compKey) return []
  return [
    {
      name: path.split('/').pop()!.replace('.tsx', ''),
      Comp: mod[compKey] as ComponentType<object>,
      props: (propsKey ? mod[propsKey] : {}) as object,
    },
  ]
})

export default function App() {
  return (
    <div className='mx-auto grid max-w-5xl gap-8 p-8'>
      <p id='count'>{blocks.length} blocks</p>
      {blocks.map(({ name, Comp, props }) => (
        <section key={name} data-block={name}>
          <Boundary name={name}>
            <Comp {...props} />
          </Boundary>
        </section>
      ))}
    </div>
  )
}
