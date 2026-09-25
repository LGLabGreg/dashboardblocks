import { Blocks, Paintbrush, Terminal } from 'lucide-react'

import { SectionHeading } from './categories'

const steps = [
  {
    icon: Blocks,
    title: 'Pick a block',
    description: 'Browse live previews and find the one that fits your data.',
    code: (
      <>
        <span className='text-muted-foreground'>{'// '}docs/components/kpi</span>
        {'\n'}area-chart-kpi-01{'\n'}
        <span className='text-muted-foreground'>progress-kpi-02</span>
        {'\n'}
        <span className='text-muted-foreground'>bar-chart-kpi-02</span>
      </>
    ),
  },
  {
    icon: Terminal,
    title: 'Add it with the CLI',
    description: 'One command drops the source and its dependencies into your project.',
    code: (
      <>
        <span className='text-chart-1'>$</span> npx shadcn add \{'\n'}
        {'  '}dashboardblocks.com/r/{'\n'}
        {'  '}area-chart-kpi-01.json{'\n'}
        <span className='text-chart-2'>✔</span> Done.
      </>
    ),
  },
  {
    icon: Paintbrush,
    title: 'Make it yours',
    description: 'Plain React and Tailwind. No wrapper library, no lock-in.',
    code: (
      <>
        {'<'}
        <span className='text-chart-1'>AreaChartKPI1</span>
        {'\n'}
        {'  '}title=<span className='text-chart-2'>&quot;MRR&quot;</span>
        {'\n'}
        {'  '}value={'{'}48200{'}'}
        {'\n'}
        {'  '}trend={'{'}12.4{'}'}
        {'\n'}
        {'/>'}
      </>
    ),
  },
]

export function Steps() {
  return (
    <section className='w-full border-y'>
      <div className='mx-auto max-w-6xl px-4 py-24'>
        <SectionHeading
          eyebrow='How it works'
          title='From zero to dashboard in three steps.'
          description='Built on the shadcn registry, so it works with the setup you already have.'
        />
        <ol className='mt-12 grid gap-4 md:grid-cols-3'>
          {steps.map((step, index) => (
            <li
              key={step.title}
              className='bg-card relative flex flex-col gap-4 overflow-hidden rounded-3xl border p-6'
            >
              <span
                aria-hidden
                className='text-muted/80 absolute -top-6 right-2 text-[8rem] leading-none font-bold tracking-tighter'
              >
                {index + 1}
              </span>
              <span className='bg-foreground text-background relative flex size-10 items-center justify-center rounded-xl'>
                <step.icon className='size-5' />
              </span>
              <div className='relative'>
                <h3 className='text-lg font-semibold'>{step.title}</h3>
                <p className='text-muted-foreground mt-1 text-sm'>{step.description}</p>
              </div>
              <pre className='mt-auto overflow-x-auto rounded-xl border p-4 font-mono text-xs leading-relaxed'>
                {step.code}
              </pre>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
