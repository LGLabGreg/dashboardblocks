export const AnimatedWave = ({
  percentage = 64,
  waveColor = '#3b82f6',
  waveColorSecondary = '#3b82f6',
  waveHeight = 16,
}: {
  percentage?: number
  waveColor?: string
  waveColorSecondary?: string
  waveHeight?: number
}) => {
  return (
    <div className='relative size-full'>
      {/* Wave container */}
      <div
        className='absolute inset-0 transition-transform duration-1000 ease-out'
        style={{
          transform: `translateY(${100 - percentage}%)`,
        }}
      >
        {/* Primary wave */}
        <svg
          className='absolute w-[200%] h-full'
          style={{
            animation: 'wave 3s linear infinite',
            left: 0,
            top: 0,
          }}
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
          className='absolute w-[200%] h-full opacity-60'
          style={{
            animation: 'wave 4s linear infinite reverse',
            left: 0,
            top: 0,
          }}
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

      {/* Keyframes */}
      <style>{`
        @keyframes wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
