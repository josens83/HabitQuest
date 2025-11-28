'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProgressBar } from '@/components/ui/progress'
import { TrophyIcon, CoinsIcon, ExpIcon, GemIcon } from '@/components/ui/icons'
import { cn } from '@/utils/cn'

interface AchievementCardProps {
  achievement: {
    id: string
    currentProgress: number
    isCompleted: boolean
    completedAt?: string | null
    achievement: {
      title: string
      description: string
      icon: string
      category: string
      tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'
      targetType: string
      targetValue: number
      expReward: number
      goldReward: number
      gemReward: number
      titleReward?: string | null
    }
  }
  className?: string
}

export function AchievementCard({ achievement, className }: AchievementCardProps) {
  const { achievement: details, currentProgress, isCompleted } = achievement

  const tierConfig = {
    BRONZE: { label: '동메달', variant: 'default' as const, color: 'text-amber-700' },
    SILVER: { label: '은메달', variant: 'default' as const, color: 'text-gray-400' },
    GOLD: { label: '금메달', variant: 'warning' as const, color: 'text-yellow-500' },
    PLATINUM: {
      label: '백금',
      variant: 'info' as const,
      color: 'text-cyan-400',
    },
    DIAMOND: {
      label: '다이아',
      variant: 'purple' as const,
      color: 'text-purple-400',
    },
  }

  const tierInfo = tierConfig[details.tier]

  return (
    <Card
      variant="bordered"
      className={cn(
        'transition-all',
        isCompleted
          ? 'ring-2 ring-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
          : 'opacity-75 hover:opacity-100',
        className,
      )}
    >
      <CardContent>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center',
                isCompleted
                  ? 'bg-yellow-100 dark:bg-yellow-900/30'
                  : 'bg-gray-100 dark:bg-gray-800',
              )}
            >
              <span className="text-3xl">{details.icon}</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={tierInfo.variant} size="sm">
                {tierInfo.label}
              </Badge>
              {isCompleted && (
                <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                  ✓ 달성완료
                </span>
              )}
            </div>

            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              {details.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {details.description}
            </p>

            {!isCompleted && (
              <ProgressBar
                value={currentProgress}
                max={details.targetValue}
                size="sm"
                variant="warning"
                className="mb-3"
              />
            )}

            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <ExpIcon size={14} />
                <span className="text-gray-700 dark:text-gray-300">
                  {details.expReward}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <CoinsIcon size={14} />
                <span className="text-gray-700 dark:text-gray-300">
                  {details.goldReward}
                </span>
              </div>
              {details.gemReward > 0 && (
                <div className="flex items-center gap-1">
                  <GemIcon size={14} />
                  <span className="text-gray-700 dark:text-gray-300">
                    {details.gemReward}
                  </span>
                </div>
              )}
              {details.titleReward && (
                <div className="flex items-center gap-1">
                  <TrophyIcon size={14} />
                  <span className="text-gray-700 dark:text-gray-300">
                    {details.titleReward}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
