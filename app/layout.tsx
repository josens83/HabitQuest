import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HabitQuest - 습관을 게임처럼, 성장을 모험처럼',
  description: 'RPG 캐릭터 육성처럼 재미있게 습관을 형성하는 게이미피케이션 앱',
  keywords: ['습관', '게이미피케이션', 'RPG', '자기계발', '스트릭'],
  authors: [{ name: 'HabitQuest Team' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6366F1' },
    { media: '(prefers-color-scheme: dark)', color: '#818CF8' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
