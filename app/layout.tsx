import { RootProvider } from 'fumadocs-ui/provider/next'
import { Geist_Mono, Inter } from 'next/font/google'

import './global.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400'],
})

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${inter.variable} ${fontMono.variable} font-sans antialiased flex flex-col min-h-screen`}
      >
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  )
}
