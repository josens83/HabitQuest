'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states'
import { TrophyIcon, FlameIcon, ExpIcon } from '@/components/ui/icons'

type LeaderboardType = 'LEVEL' | 'STREAK' | 'QUEST_COMPLETION' | 'ACHIEVEMENT_COUNT'
type LeaderboardPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ALL_TIME'

interface LeaderboardEntry {
  userId: string
  rank: number
  score: number
  user: {
    name: string
    image: string | null
    character: {
      level: number
      currentStreak: number
    } | null
  }
}

interface LeaderboardResponse {
  rankings: LeaderboardEntry[]
  userRank: {
    rank: number
    score: number
  } | null
  period: LeaderboardPeriod
  type: LeaderboardType
}

async function fetchLeaderboard(
  type: LeaderboardType,
  period: LeaderboardPeriod,
): Promise<LeaderboardResponse> {
  const response = await fetch(`/api/leaderboard?type=${type}&period=${period}`)
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard')
  }
  return response.json()
}

export default function LeaderboardPage() {
  const [selectedType, setSelectedType] = useState<LeaderboardType>('LEVEL')
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('ALL_TIME')
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['leaderboard', selectedType, selectedPeriod],
    queryFn: () => fetchLeaderboard(selectedType, selectedPeriod),
  })

  const leaderboardTypes: Array<{ key: LeaderboardType; label: string; icon: JSX.Element }> = [
    { key: 'LEVEL', label: '레벨', icon: <ExpIcon size={16} /> },
    { key: 'STREAK', label: '연속 기록', icon: <FlameIcon size={16} /> },
    { key: 'QUEST_COMPLETION', label: '퀘스트', icon: <span>📜</span> },
    { key: 'ACHIEVEMENT_COUNT', label: '업적', icon: <TrophyIcon size={16} /> },
  ]

  const periods: Array<{ key: LeaderboardPeriod; label: string }> = [
    { key: 'DAILY', label: '일간' },
    { key: 'WEEKLY', label: '주간' },
    { key: 'MONTHLY', label: '월간' },
    { key: 'ALL_TIME', label: '전체' },
  ]

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600'
      case 2:
        return 'from-gray-300 to-gray-500'
      case 3:
        return 'from-orange-400 to-orange-600'
      default:
        return 'from-gray-200 to-gray-400'
    }
  }

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return `#${rank}`
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <TrophyIcon size={32} />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">리더보드</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          최고의 플레이어들과 경쟁하세요!
        </p>
      </div>

      {/* Type Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {leaderboardTypes.map((type) => (
          <button
            key={type.key}
            onClick={() => setSelectedType(type.key)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap
              ${
                selectedType === type.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }
            `}
          >
            {type.icon}
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      {/* Period Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {periods.map((period) => (
          <button
            key={period.key}
            onClick={() => setSelectedPeriod(period.key)}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
              ${
                selectedPeriod === period.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }
            `}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* User Rank Card */}
      {data?.userRank && (
        <Card variant="elevated" className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-xl">
                  #{data.userRank.rank}
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">내 순위</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.userRank.score.toLocaleString()}
                  </p>
                </div>
              </div>
              <Badge variant="info" size="lg">
                상위 {((data.userRank.rank / (data.rankings.length || 1)) * 100).toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard List */}
      {isLoading && <LoadingState message="리더보드를 불러오는 중..." />}

      {error && (
        <ErrorState
          message="리더보드를 불러오는데 실패했습니다."
          action={{
            label: '다시 시도',
            onClick: () =>
              queryClient.invalidateQueries({
                queryKey: ['leaderboard', selectedType, selectedPeriod],
              }),
          }}
        />
      )}

      {data && data.rankings.length === 0 && (
        <EmptyState
          icon="🏆"
          title="랭킹이 없습니다"
          description="아직 이 카테고리에 랭킹 데이터가 없습니다."
        />
      )}

      {data && data.rankings.length > 0 && (
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>
              {leaderboardTypes.find((t) => t.key === selectedType)?.label} 랭킹 -{' '}
              {periods.find((p) => p.key === selectedPeriod)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.rankings.map((entry) => (
                <div
                  key={entry.userId}
                  className={`
                    flex items-center justify-between p-4 rounded-lg transition-all
                    ${
                      entry.rank <= 3
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200 dark:border-yellow-800'
                        : 'bg-gray-50 dark:bg-gray-900/50'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`
                        flex items-center justify-center w-12 h-12 rounded-full font-bold text-white text-lg
                        bg-gradient-to-br ${getMedalColor(entry.rank)}
                      `}
                    >
                      {entry.rank <= 3 ? getMedalEmoji(entry.rank) : entry.rank}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {entry.user.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {entry.user.name}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Lv. {entry.user.character?.level || 1}
                          </span>
                          <span className="text-gray-400">•</span>
                          <div className="flex items-center gap-1">
                            <FlameIcon size={12} />
                            <span className="text-orange-600 dark:text-orange-400">
                              {entry.user.character?.currentStreak || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {entry.score.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedType === 'LEVEL' && '레벨'}
                      {selectedType === 'STREAK' && '일'}
                      {selectedType === 'QUEST_COMPLETION' && '퀘스트'}
                      {selectedType === 'ACHIEVEMENT_COUNT' && '업적'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card variant="bordered" className="mt-6">
        <CardContent>
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                리더보드 안내
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• 랭킹은 매일 자정에 업데이트됩니다</li>
                <li>• 상위 랭커는 특별한 보상을 받을 수 있습니다</li>
                <li>• 기간별로 다른 랭킹을 확인할 수 있습니다</li>
                <li>• 꾸준한 활동으로 순위를 올려보세요!</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
