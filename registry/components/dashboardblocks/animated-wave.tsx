import { cn } from '@/lib/utils'

const waveStyles = `
  @keyframes dashboardblocks-wave {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .dashboardblocks-wave { animation: dashboardblocks-wave 3s linear infinite; }
  .dashboardblocks-wave-secondary { animation: dashboardblocks-wave 4s linear infinite reverse; }
  @media (prefers-reduced-motion: reduce) {
    .dashboardblocks-wave, .dashboardblocks-wave-secondary { animation: none; }
  }
`

export const AnimatedWave = ({
  className,
  percentage = 64,
  waveColor = 'currentColor',
  waveColorSecondary = 'currentColor',
  waveHeight = 16,
}: {
  /**
   * Sets the wave color through `currentColor`, e.g. `text-blue-300`
   */
  className?: string
  percentage?: number
  waveColor?: string
  waveColorSecondary?: string
  waveHeight?: number
}) => {
  const safePercentage = Number.isFinite(percentage) ? percentage : 0
  const normalized = Math.min(100, Math.max(0, safePercentage))

  return (
    <div className={cn('relative size-full text-blue-500', className)}>
      {/* Wave container */}
      <div
        className='absolute inset-0 transition-[transform] duration-1000 ease-out'
        style={{
          transform: `translateY(${100 - normalized}%)`,
        }}
      >
        {/* Primary wave */}
        <svg
          className='dashboardblocks-wave absolute top-0 left-0 w-[200%] h-full'
          viewBox='0 0 400 200'
          preserveAspectRatio='none'
        >
          <path
            d={`
                M 0 ${waveHeight}
                Q 50 0, 100 ${waveHeight}
                Q 150 ${waveHeight * 2}, 200 ${waveHeight}
                Q 250 0, 300 ${waveHeight}
                Q 350 ${waveHeight * 2}, 400 ${waveHeight}
                L 400 200
                L 0 200
                Z
              `}
            fill={waveColor}
          />
        </svg>

        {/* Secondary wave (offset) */}
        <svg
          className='dashboardblocks-wave-secondary absolute top-0 left-0 w-[200%] h-full opacity-60'
          viewBox='0 0 400 200'
          preserveAspectRatio='none'
        >
          <path
            d={`
                M 0 ${waveHeight}
                Q 50 ${waveHeight * 2}, 100 ${waveHeight}
                Q 150 0, 200 ${waveHeight}
                Q 250 ${waveHeight * 2}, 300 ${waveHeight}
                Q 350 0, 400 ${waveHeight}
                L 400 200
                L 0 200
                Z
              `}
            fill={waveColorSecondary}
          />
        </svg>
      </div>

      {/* Keyframes, hoisted and deduped by React 19 across instances */}
      <style href='dashboardblocks-wave' precedence='default'>
        {waveStyles}
      </style>
    </div>
  )
}
