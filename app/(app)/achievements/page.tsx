'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { AchievementCard } from '@/components/game/achievement-card'
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states'
import { TrophyIcon } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'

type AchievementCategory = 'HABIT' | 'QUEST' | 'SOCIAL' | 'COLLECTION' | 'SPECIAL'
type AchievementTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'

interface Achievement {
  id: string
  currentProgress: number
  isCompleted: boolean
  completedAt: string | null
  achievement: {
    id: string
    title: string
    description: string
    icon: string
    category: AchievementCategory
    tier: AchievementTier
    targetType: string
    targetValue: number
    expReward: number
    goldReward: number
    gemReward: number
    titleReward: string | null
  }
}

interface AchievementsResponse {
  achievements: Achievement[]
  stats: {
    totalAchievements: number
    completedAchievements: number
    completionRate: number
    totalExpEarned: number
    totalGoldEarned: number
    totalGemsEarned: number
  }
}

async function fetchAchievements(completed?: boolean): Promise<AchievementsResponse> {
  const params = new URLSearchParams()
  if (completed !== undefined) {
    params.append('completed', completed.toString())
  }

  const response = await fetch(`/api/achievements?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch achievements')
  }
  return response.json()
}

export default function AchievementsPage() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'inProgress'>('all')
  const [filterCategory, setFilterCategory] = useState<'all' | AchievementCategory>('all')
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['achievements', filterStatus],
    queryFn: () => {
      if (filterStatus === 'completed') return fetchAchievements(true)
      if (filterStatus === 'inProgress') return fetchAchievements(false)
      return fetchAchievements()
    },
  })

  const statusFilters = [
    { key: 'all' as const, label: '전체', icon: '📋' },
    { key: 'inProgress' as const, label: '진행 중', icon: '🎯' },
    { key: 'completed' as const, label: '완료', icon: '✅' },
  ]

  const categoryFilters: Array<{ key: 'all' | AchievementCategory; label: string; icon: string }> =
    [
      { key: 'all', label: '전체', icon: '🌟' },
      { key: 'HABIT', label: '습관', icon: '✨' },
      { key: 'QUEST', label: '퀘스트', icon: '📜' },
      { key: 'SOCIAL', label: '소셜', icon: '👥' },
      { key: 'COLLECTION', label: '수집', icon: '📦' },
      { key: 'SPECIAL', label: '특별', icon: '🎁' },
    ]

  const filteredAchievements =
    filterCategory === 'all'
      ? data?.achievements
      : data?.achievements.filter((a) => a.achievement.category === filterCategory)

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <TrophyIcon size={32} />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">업적</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          다양한 업적을 달성하고 특별한 보상을 받으세요!
        </p>
      </div>

      {/* Stats Cards */}
      {data?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card variant="bordered">
            <CardContent>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">완료율</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {data.stats.completionRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {data.stats.completedAchievements} / {data.stats.totalAchievements}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardContent>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">획득 경험치</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {data.stats.totalExpEarned.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardContent>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">획득 골드</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {data.stats.totalGoldEarned.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardContent>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">획득 젬</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {data.stats.totalGemsEarned.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {statusFilters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setFilterStatus(filter.key)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap
              ${
                filterStatus === filter.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }
            `}
          >
            <span>{filter.icon}</span>
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {categoryFilters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setFilterCategory(filter.key)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
              ${
                filterCategory === filter.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }
            `}
          >
            <span>{filter.icon}</span>
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Achievement Grid */}
      {isLoading && <LoadingState message="업적을 불러오는 중..." />}

      {error && (
        <ErrorState
          message="업적을 불러오는데 실패했습니다."
          action={{
            label: '다시 시도',
            onClick: () =>
              queryClient.invalidateQueries({ queryKey: ['achievements', filterStatus] }),
          }}
        />
      )}

      {filteredAchievements && filteredAchievements.length === 0 && (
        <EmptyState
          icon="🏆"
          title="업적이 없습니다"
          description={
            filterStatus === 'completed'
              ? '아직 완료한 업적이 없습니다. 계속 도전해보세요!'
              : filterStatus === 'inProgress'
                ? '진행 중인 업적이 없습니다.'
                : '업적을 찾을 수 없습니다.'
          }
        />
      )}

      {filteredAchievements && filteredAchievements.length > 0 && (
        <div className="space-y-4">
          {filteredAchievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      )}

      {/* Help Text */}
      <Card variant="bordered" className="mt-6">
        <CardContent>
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">업적 안내</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• 업적은 게임 플레이 중 자동으로 진행됩니다</li>
                <li>• 완료된 업적은 자동으로 보상이 지급됩니다</li>
                <li>• 티어가 높을수록 보상도 풍성합니다</li>
                <li>• 일부 업적은 특별한 칭호를 부여합니다</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
