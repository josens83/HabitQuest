'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { QuestCard } from '@/components/game/quest-card'
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states'
import { QuestIcon } from '@/components/ui/icons'

type QuestType = 'DAILY' | 'WEEKLY' | 'EVENT' | 'ACHIEVEMENT' | 'STORY'
type QuestDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'LEGENDARY'

interface Quest {
  id: string
  title: string
  description: string
  type: QuestType
  difficulty: QuestDifficulty
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

interface QuestsResponse {
  quests: Quest[]
  stats: {
    totalQuests: number
    completedQuests: number
    pendingRewards: number
  }
}

async function fetchQuests(type: string): Promise<QuestsResponse> {
  const response = await fetch(`/api/quests?type=${type}`)
  if (!response.ok) {
    throw new Error('Failed to fetch quests')
  }
  return response.json()
}

async function claimQuestReward(questId: string) {
  const response = await fetch('/api/quests/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questId }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to claim reward')
  }
  return response.json()
}

export default function QuestsPage() {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'all'>('daily')
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['quests', activeTab],
    queryFn: () => fetchQuests(activeTab),
  })

  const claimMutation = useMutation({
    mutationFn: claimQuestReward,
    onSuccess: (data) => {
      // Invalidate and refetch quests
      queryClient.invalidateQueries({ queryKey: ['quests'] })
      queryClient.invalidateQueries({ queryKey: ['character'] })

      // Show success notification
      alert(
        `보상을 받았습니다!\n경험치: +${data.expGained}\n골드: +${data.goldGained}${
          data.gemsGained > 0 ? `\n젬: +${data.gemsGained}` : ''
        }`,
      )
    },
    onError: (error: Error) => {
      alert(`오류: ${error.message}`)
    },
  })

  const handleClaim = (questId: string) => {
    claimMutation.mutate(questId)
  }

  const tabs = [
    { key: 'daily' as const, label: '일일 퀘스트', icon: '📅' },
    { key: 'weekly' as const, label: '주간 퀘스트', icon: '📆' },
    { key: 'all' as const, label: '전체', icon: '📋' },
  ]

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <QuestIcon size={32} />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">퀘스트</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          퀘스트를 완료하고 보상을 받으세요!
        </p>
      </div>

      {/* Stats Cards */}
      {data?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card variant="bordered">
            <CardContent>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">전체 퀘스트</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.stats.totalQuests}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardContent>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">완료한 퀘스트</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {data.stats.completedQuests}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardContent>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">받을 보상</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {data.stats.pendingRewards}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap
              ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }
            `}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Quest List */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>
            {tabs.find((t) => t.key === activeTab)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <LoadingState message="퀘스트를 불러오는 중..." />}

          {error && (
            <ErrorState
              message="퀘스트를 불러오는데 실패했습니다."
              action={{
                label: '다시 시도',
                onClick: () => queryClient.invalidateQueries({ queryKey: ['quests', activeTab] }),
              }}
            />
          )}

          {data && data.quests.length === 0 && (
            <EmptyState
              icon="📋"
              title="퀘스트가 없습니다"
              description="아직 사용 가능한 퀘스트가 없습니다."
            />
          )}

          {data && data.quests.length > 0 && (
            <div className="space-y-4">
              {data.quests.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onClaim={handleClaim}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
