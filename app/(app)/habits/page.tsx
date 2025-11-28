'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge, DifficultyBadge } from '@/components/ui/badge'
import { ProgressBar } from '@/components/ui/progress'
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states'
import { FlameIcon, CheckCircleIcon } from '@/components/ui/icons'

type HabitCategory =
  | 'HEALTH'
  | 'PRODUCTIVITY'
  | 'LEARNING'
  | 'SOCIAL'
  | 'FINANCE'
  | 'CREATIVITY'
  | 'MINDFULNESS'
  | 'OTHER'
type HabitDifficulty = 'EASY' | 'MEDIUM' | 'HARD'
type HabitFrequency = 'DAILY' | 'WEEKLY' | 'CUSTOM'

interface Habit {
  id: string
  name: string
  description: string | null
  category: HabitCategory
  difficulty: HabitDifficulty
  frequency: HabitFrequency
  icon: string | null
  currentStreak: number
  longestStreak: number
  totalCompletions: number
  isCompletedToday: boolean
  lastCompletedAt: string | null
}

interface HabitsResponse {
  habits: Habit[]
  stats: {
    total: number
    completedToday: number
    activeStreaks: number
  }
}

async function fetchHabits(): Promise<HabitsResponse> {
  const response = await fetch('/api/habits')
  if (!response.ok) {
    throw new Error('Failed to fetch habits')
  }
  return response.json()
}

async function completeHabit(habitId: string) {
  const response = await fetch(`/api/habits/${habitId}/complete`, {
    method: 'POST',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to complete habit')
  }
  return response.json()
}

async function deleteHabit(habitId: string) {
  const response = await fetch(`/api/habits/${habitId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete habit')
  }
  return response.json()
}

export default function HabitsPage() {
  const [filterCategory, setFilterCategory] = useState<'all' | HabitCategory>('all')
  const [showCompleted, setShowCompleted] = useState(true)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['habits'],
    queryFn: fetchHabits,
  })

  const completeMutation = useMutation({
    mutationFn: completeHabit,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['character'] })
      alert(
        `습관 완료! 🎉\n경험치: +${data.expGained}\n골드: +${data.goldGained}${
          data.streakBonus ? `\n연속 보너스: +${data.streakBonus} EXP` : ''
        }`,
      )
    },
    onError: (error: Error) => {
      alert(`오류: ${error.message}`)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      alert('습관이 삭제되었습니다.')
    },
    onError: (error: Error) => {
      alert(`삭제 실패: ${error.message}`)
    },
  })

  const handleComplete = (habitId: string) => {
    completeMutation.mutate(habitId)
  }

  const handleDelete = (habitId: string, habitName: string) => {
    if (confirm(`정말 "${habitName}" 습관을 삭제하시겠습니까?`)) {
      deleteMutation.mutate(habitId)
    }
  }

  const categories: Array<{ key: 'all' | HabitCategory; label: string; icon: string }> = [
    { key: 'all', label: '전체', icon: '📋' },
    { key: 'HEALTH', label: '건강', icon: '💪' },
    { key: 'PRODUCTIVITY', label: '생산성', icon: '⚡' },
    { key: 'LEARNING', label: '학습', icon: '📚' },
    { key: 'SOCIAL', label: '소셜', icon: '👥' },
    { key: 'FINANCE', label: '재정', icon: '💰' },
    { key: 'CREATIVITY', label: '창의성', icon: '🎨' },
    { key: 'MINDFULNESS', label: '마음챙김', icon: '🧘' },
    { key: 'OTHER', label: '기타', icon: '📌' },
  ]

  const filteredHabits =
    filterCategory === 'all'
      ? data?.habits
      : data?.habits.filter((habit) => habit.category === filterCategory)

  const displayHabits = showCompleted
    ? filteredHabits
    : filteredHabits?.filter((habit) => !habit.isCompletedToday)

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">습관 관리</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              매일 습관을 완료하고 성장하세요!
            </p>
          </div>
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <span className="text-xl">+</span>
            <span>새 습관</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {data?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card variant="bordered">
            <CardContent>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">전체 습관</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {data.stats.total}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardContent>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">오늘 완료</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {data.stats.completedToday}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardContent>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">활성 연속 기록</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {data.stats.activeStreaks}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setFilterCategory(category.key)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                ${
                  filterCategory === category.key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }
              `}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showCompleted"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="showCompleted" className="text-sm text-gray-700 dark:text-gray-300">
            완료한 습관 보기
          </label>
        </div>
      </div>

      {/* Habits List */}
      {isLoading && <LoadingState message="습관을 불러오는 중..." />}

      {error && (
        <ErrorState
          message="습관을 불러오는데 실패했습니다."
          action={{
            label: '다시 시도',
            onClick: () => queryClient.invalidateQueries({ queryKey: ['habits'] }),
          }}
        />
      )}

      {displayHabits && displayHabits.length === 0 && (
        <EmptyState
          icon="✅"
          title="습관이 없습니다"
          description={
            showCompleted
              ? '새로운 습관을 추가하여 시작해보세요!'
              : '완료하지 않은 습관이 없습니다. 모든 습관을 완료했습니다! 🎉'
          }
          action={{
            label: '새 습관 추가',
            onClick: () => alert('습관 추가 모달 (향후 구현)'),
          }}
        />
      )}

      {displayHabits && displayHabits.length > 0 && (
        <div className="space-y-4">
          {displayHabits.map((habit) => (
            <Card
              key={habit.id}
              variant="bordered"
              className={habit.isCompletedToday ? 'bg-green-50 dark:bg-green-950/20' : ''}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-2xl flex-shrink-0">
                      {habit.icon || '✨'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {habit.name}
                        </h3>
                        <DifficultyBadge difficulty={habit.difficulty} size="sm" />
                        {habit.isCompletedToday && (
                          <Badge variant="success" size="sm">
                            완료
                          </Badge>
                        )}
                      </div>
                      {habit.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {habit.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <FlameIcon size={16} />
                          <span className="font-medium text-orange-600 dark:text-orange-400">
                            {habit.currentStreak}일
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">연속</span>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">•</div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">최고:</span>
                          <span className="ml-1 font-medium text-gray-900 dark:text-white">
                            {habit.longestStreak}일
                          </span>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">•</div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">총:</span>
                          <span className="ml-1 font-medium text-gray-900 dark:text-white">
                            {habit.totalCompletions}회
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {!habit.isCompletedToday && (
                      <button
                        onClick={() => handleComplete(habit.id)}
                        disabled={completeMutation.isPending}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <CheckCircleIcon size={20} />
                        <span>완료</span>
                      </button>
                    )}
                    <button
                      onClick={() => alert('습관 수정 모달 (향후 구현)')}
                      className="px-3 py-2 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(habit.id, habit.name)}
                      disabled={deleteMutation.isPending}
                      className="px-3 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card variant="bordered" className="mt-6">
        <CardContent>
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">습관 완성 팁</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• 매일 같은 시간에 습관을 실천하면 더 쉽게 유지할 수 있습니다</li>
                <li>• 작은 습관부터 시작하여 점차 늘려가세요</li>
                <li>• 연속 기록을 유지하면 추가 경험치 보너스를 받을 수 있습니다</li>
                <li>• 습관 완료 시 퀘스트 진행도도 함께 올라갑니다</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
