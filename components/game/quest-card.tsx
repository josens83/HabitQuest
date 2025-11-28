'use client'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge, DifficultyBadge } from '@/components/ui/badge'
import { ProgressBar } from '@/components/ui/progress'
import { CoinsIcon, ExpIcon, GemIcon, CheckCircleIcon } from '@/components/ui/icons'
import { cn } from '@/utils/cn'

interface QuestCardProps {
  quest: {
    id: string
    title: string
    description: string
    type: 'DAILY' | 'WEEKLY' | 'EVENT' | 'ACHIEVEMENT' | 'STORY'
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'LEGENDARY'
    expReward: number
    goldReward: number
    gemReward: number
    targetCount: number
    progress?: Array<{
      currentCount: number
      isCompleted: boolean
      rewardClaimed: boolean
    }>
  }
  onClaim?: (questId: string) => void
  className?: string
}

export function QuestCard({ quest, onClaim, className }: QuestCardProps) {
  const progress = quest.progress?.[0]
  const currentCount = progress?.currentCount || 0
  const isCompleted = progress?.isCompleted || false
  const rewardClaimed = progress?.rewardClaimed || false

  const typeConfig = {
    DAILY: { label: '일일', variant: 'info' as const },
    WEEKLY: { label: '주간', variant: 'purple' as const },
    EVENT: { label: '이벤트', variant: 'warning' as const },
    ACHIEVEMENT: { label: '업적', variant: 'success' as const },
    STORY: { label: '스토리', variant: 'default' as const },
  }

  return (
    <Card
      variant="bordered"
      className={cn(
        'transition-all hover:shadow-md',
        isCompleted && !rewardClaimed && 'ring-2 ring-green-500',
        className,
      )}
    >
      <CardContent>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={typeConfig[quest.type].variant} size="sm">
                {typeConfig[quest.type].label}
              </Badge>
              <DifficultyBadge difficulty={quest.difficulty} size="sm" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              {quest.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {quest.description}
            </p>
          </div>
          {isCompleted && !rewardClaimed && (
            <CheckCircleIcon size={24} className="flex-shrink-0 ml-2" />
          )}
        </div>

        <ProgressBar
          value={currentCount}
          max={quest.targetCount}
          label="진행도"
          size="md"
          variant={isCompleted ? 'success' : 'default'}
          className="mb-3"
        />

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <ExpIcon size={16} />
            <span className="font-medium text-gray-900 dark:text-white">
              {quest.expReward}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <CoinsIcon size={16} />
            <span className="font-medium text-gray-900 dark:text-white">
              {quest.goldReward}
            </span>
          </div>
          {quest.gemReward > 0 && (
            <div className="flex items-center gap-1">
              <GemIcon size={16} />
              <span className="font-medium text-gray-900 dark:text-white">
                {quest.gemReward}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      {isCompleted && !rewardClaimed && onClaim && (
        <CardFooter>
          <button
            onClick={() => onClaim(quest.id)}
            className="w-full py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            보상 받기
          </button>
        </CardFooter>
      )}

      {rewardClaimed && (
        <CardFooter>
          <div className="w-full text-center text-sm text-gray-500 dark:text-gray-400">
            ✓ 보상을 받았습니다
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
