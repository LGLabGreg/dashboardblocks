import { RootProvider } from 'fumadocs-ui/provider/next'
import { type Metadata } from 'next'
import { Geist_Mono, Inter } from 'next/font/google'
import Script from 'next/script'

import { IS_PRODUCTION, siteConfig } from '@/lib/config'

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

export const metadata: Metadata = {
  title: siteConfig.name,
  metadataBase: new URL(siteConfig.url!),
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  creator: 'LGLab',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url!,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
}

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${inter.variable} ${fontMono.variable} font-sans antialiased flex flex-col min-h-screen`}
      >
        <RootProvider>{children}</RootProvider>
        {IS_PRODUCTION && (
          <Script
            src='https://cloud.umami.is/script.js'
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          />
        )}
      </body>
    </html>
  )
}
