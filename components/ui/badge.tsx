import { cn } from '@/utils/cn'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        // Variants
        variant === 'default' &&
          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        variant === 'success' &&
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        variant === 'warning' &&
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        variant === 'error' &&
          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        variant === 'info' &&
          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        variant === 'purple' &&
          'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        // Sizes
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-1 text-sm',
        size === 'lg' && 'px-3 py-1.5 text-base',
        className,
      )}
    >
      {children}
    </span>
  )
}

interface RarityBadgeProps {
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  size?: 'sm' | 'md' | 'lg'
}

export function RarityBadge({ rarity, size = 'md' }: RarityBadgeProps) {
  const config = {
    COMMON: { label: '일반', variant: 'default' as const },
    UNCOMMON: { label: '고급', variant: 'success' as const },
    RARE: { label: '희귀', variant: 'info' as const },
    EPIC: { label: '영웅', variant: 'purple' as const },
    LEGENDARY: { label: '전설', variant: 'warning' as const },
  }

  const { label, variant } = config[rarity]

  return (
    <Badge variant={variant} size={size}>
      {label}
    </Badge>
  )
}

interface DifficultyBadgeProps {
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'LEGENDARY'
  size?: 'sm' | 'md' | 'lg'
}

export function DifficultyBadge({ difficulty, size = 'md' }: DifficultyBadgeProps) {
  const config = {
    EASY: { label: '쉬움', variant: 'success' as const },
    MEDIUM: { label: '보통', variant: 'info' as const },
    HARD: { label: '어려움', variant: 'warning' as const },
    LEGENDARY: { label: '전설', variant: 'error' as const },
  }

  const { label, variant } = config[difficulty]

  return (
    <Badge variant={variant} size={size}>
      {label}
    </Badge>
  )
}
