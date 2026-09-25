export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className='mx-auto flex max-w-2xl flex-col items-center text-center'>
      <span className='text-muted-foreground font-mono text-xs font-medium tracking-widest uppercase'>
        {eyebrow}
      </span>
      <h2 className='mt-3 text-3xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-4xl'>
        {title}
      </h2>
      <p className='text-muted-foreground mt-4 text-pretty'>{description}</p>
    </div>
  )
}
