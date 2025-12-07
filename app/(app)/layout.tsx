'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/cn'
import { InstallPrompt } from '@/components/pwa/install-prompt'

interface NavItemType {
  icon: string
  label: string
  href: string
}

const mainNavItems: NavItemType[] = [
  { icon: '🏠', label: '홈', href: '/dashboard' },
  { icon: '✅', label: '습관', href: '/habits' },
  { icon: '📋', label: '퀘스트', href: '/quests' },
  { icon: '🏆', label: '업적', href: '/achievements' },
  { icon: '📦', label: '인벤토리', href: '/inventory' },
  { icon: '🛒', label: '상점', href: '/shop' },
]

const socialNavItems: NavItemType[] = [
  { icon: '👥', label: '친구', href: '/social/friends' },
  { icon: '🏰', label: '길드', href: '/social/guilds' },
  { icon: '🏅', label: '리더보드', href: '/leaderboard' },
]

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 md:bg-white md:dark:bg-gray-800 md:border-r md:border-gray-200 md:dark:border-gray-700">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              HabitQuest
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <div className="mb-4">
              <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                메인
              </p>
              {mainNavItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={pathname === item.href}
                />
              ))}
            </div>

            <div>
              <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                소셜
              </p>
              {socialNavItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={pathname === item.href}
                />
              ))}
            </div>
          </nav>

          {/* User Profile */}
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                U
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">User</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">레벨 1</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:pl-64 pb-16 md:pb-0">{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden z-50">
        <div className="flex justify-around items-center h-16">
          <MobileNavItem icon="🏠" label="홈" href="/dashboard" active={pathname === '/dashboard'} />
          <MobileNavItem icon="📋" label="퀘스트" href="/quests" active={pathname === '/quests'} />
          <MobileNavItem icon="🛒" label="상점" href="/shop" active={pathname === '/shop'} />
          <MobileNavItem
            icon="👥"
            label="소셜"
            href="/social/friends"
            active={pathname?.startsWith('/social')}
          />
          <MobileNavItem
            icon="🏅"
            label="랭킹"
            href="/leaderboard"
            active={pathname === '/leaderboard'}
          />
        </div>
      </nav>
    </div>
  )
}

function NavLink({
  href,
  icon,
  label,
  active,
}: {
  href: string
  icon: string
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        active
          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
      )}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </Link>
  )
}

function MobileNavItem({
  icon,
  label,
  href,
  active,
}: {
  icon: string
  label: string
  href: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center gap-1 px-3 py-2',
        active
          ? 'text-indigo-600 dark:text-indigo-400'
          : 'text-gray-500 dark:text-gray-400',
      )}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </Link>
  )
}
