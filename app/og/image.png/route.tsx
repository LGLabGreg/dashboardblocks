import { ImageResponse } from 'next/og'

export const revalidate = false

const bars = [28, 42, 36, 58, 46, 70, 54, 82, 64, 92, 76, 100]
const heat = [
  [1, 2, 2, 3, 4, 3, 2, 1],
  [2, 3, 4, 5, 5, 4, 3, 2],
  [1, 3, 5, 5, 4, 5, 4, 2],
  [1, 2, 3, 4, 4, 3, 2, 1],
]

const muted = '#737373'
const border = '#e5e5e5'
const orange = '#f97316'
const teal = '#14b8a6'

function Card({
  children,
  style,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
        border: `1px solid ${border}`,
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function GET() {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        background: '#fafafa',
        color: '#171717',
        padding: 56,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', width: 560 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <svg width='44' height='44' viewBox='0 0 24 24'>
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M2.87868 2.87868C2 3.75736 2 5.17157 2 8V16C2 18.8284 2 20.2426 2.87868 21.1213C3.75736 22 5.17157 22 8 22H16C18.8284 22 20.2426 22 21.1213 21.1213C22 20.2426 22 18.8284 22 16V8C22 5.17157 22 3.75736 21.1213 2.87868C20.2426 2 18.8284 2 16 2H8C5.17157 2 3.75736 2 2.87868 2.87868ZM17.8321 9.5547C18.1384 9.09517 18.0142 8.4743 17.5547 8.16795C17.0952 7.8616 16.4743 7.98577 16.1679 8.4453L13.1238 13.0115L12.6651 12.094C11.9783 10.7205 10.0639 10.6013 9.2121 11.8791L6.16795 16.4453C5.8616 16.9048 5.98577 17.5257 6.4453 17.8321C6.90483 18.1384 7.5257 18.0142 7.83205 17.5547L10.8762 12.9885L11.3349 13.906C12.0217 15.2795 13.9361 15.3987 14.7879 14.1209L17.8321 9.5547Z'
              fill='#171717'
            />
          </svg>
          <div style={{ display: 'flex', fontSize: 30, letterSpacing: '-0.03em' }}>
            <span>Dashboard</span>
            <span style={{ color: muted }}>blocks</span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 'auto',
            fontSize: 64,
            lineHeight: 1.08,
            letterSpacing: '-0.045em',
          }}
        >
          <span>Dashboard blocks</span>
          <span>for shadcn/ui.</span>
          <span style={{ color: muted }}>Copy a block,</span>
          <span style={{ color: muted }}>own the code.</span>
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 36,
            fontSize: 20,
            color: muted,
            fontFamily: 'monospace',
            letterSpacing: '0.04em',
          }}
        >
          {`KPIs · CHARTS · TABLES · OPEN SOURCE · MIT`}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          marginLeft: 'auto',
          width: 500,
        }}
      >
        <Card>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 20, color: muted }}>Revenue</span>
            <span
              style={{
                fontSize: 16,
                color: '#15803d',
                background: '#dcfce7',
                borderRadius: 999,
                padding: '4px 10px',
              }}
            >
              +12.5%
            </span>
          </div>
          <span style={{ fontSize: 44, letterSpacing: '-0.03em', marginTop: 4 }}>
            $87,500
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 10,
              height: 120,
              marginTop: 16,
            }}
          >
            {bars.map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  borderRadius: 4,
                  background: i % 2 ? teal : orange,
                }}
              />
            ))}
          </div>
        </Card>

        <div style={{ display: 'flex', gap: 20 }}>
          <Card style={{ flex: 1 }}>
            <span style={{ fontSize: 18, color: muted }}>Storage</span>
            <span style={{ fontSize: 34, letterSpacing: '-0.03em', marginTop: 4 }}>
              1,070 MB
            </span>
            <div
              style={{
                display: 'flex',
                height: 12,
                marginTop: 18,
                borderRadius: 999,
                background: '#f5f5f5',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  width: '71%',
                  borderRadius: 999,
                  background: orange,
                }}
              />
            </div>
            <span style={{ fontSize: 15, color: muted, marginTop: 10 }}>
              of 1,500 MB used
            </span>
          </Card>

          <Card style={{ flex: 1 }}>
            <span style={{ fontSize: 18, color: muted }}>Activity</span>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14 }}
            >
              {heat.map((row, r) => (
                <div key={r} style={{ display: 'flex', gap: 6 }}>
                  {row.map((v, c) => (
                    <div
                      key={c}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        background: orange,
                        opacity: v / 5,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  )
}
