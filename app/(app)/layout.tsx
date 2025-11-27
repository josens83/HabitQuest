import { ReactNode } from 'react'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Navigation will be added later */}
      <main className="pb-16 md:pb-0">{children}</main>

      {/* Mobile Bottom Navigation - Placeholder */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-gray-800 md:hidden">
        <div className="flex justify-around items-center h-16">
          <NavItem icon="🏠" label="홈" active />
          <NavItem icon="✅" label="습관" />
          <NavItem icon="⚔️" label="캐릭터" />
          <NavItem icon="👥" label="소셜" />
          <NavItem icon="🏪" label="상점" />
        </div>
      </nav>
    </div>
  )
}

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: string
  label: string
  active?: boolean
}) {
  return (
    <button
      className={`flex flex-col items-center gap-1 px-4 py-2 ${
        active
          ? 'text-indigo-600 dark:text-indigo-400'
          : 'text-gray-500 dark:text-gray-400'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}
