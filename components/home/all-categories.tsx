import Link from 'next/link'

export function AllCategories({
  families,
}: {
  families: { title: string; href: string; count: number }[]
}) {
  return (
    <section id='all-blocks' className='mx-auto w-full max-w-6xl scroll-mt-20 px-4'>
      <div className='border-t pt-10'>
        <h2 className='text-xl font-medium tracking-tight'>
          All {families.length} families
        </h2>
        <ul className='mt-6 gap-x-8 sm:columns-2 lg:columns-4'>
          {families.map((family) => (
            <li key={family.href} className='break-inside-avoid'>
              <Link
                href={family.href}
                className='group hover:text-foreground flex items-baseline justify-between gap-3 border-b py-2.5 text-sm transition-colors'
              >
                <span className='group-hover:underline group-hover:underline-offset-4'>
                  {family.title}
                </span>
                <span className='text-muted-foreground text-xs tabular-nums'>
                  {family.count}
                  <span className='sr-only'> blocks</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
