'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProgressBar } from '@/components/ui/progress'
import { LoadingState, ErrorState } from '@/components/ui/states'
import { ExpIcon, CoinsIcon, GemIcon, FlameIcon, TrophyIcon, EnergyIcon } from '@/components/ui/icons'

interface DashboardData {
  character: {
    level: number
    currentExp: number
    expToNextLevel: number
    currentEnergy: number
    maxEnergy: number
    gold: number
    gems: number
    currentStreak: number
    longestStreak: number
  }
  todayHabits: {
    total: number
    completed: number
    remaining: number
  }
  quests: {
    daily: { completed: number; total: number }
    weekly: { completed: number; total: number }
    pendingRewards: number
  }
  recentAchievements: Array<{
    id: string
    title: string
    icon: string
    completedAt: string
  }>
  stats: {
    totalHabitsCompleted: number
    totalQuestsCompleted: number
    achievementsUnlocked: number
    totalExpEarned: number
  }
}

async function fetchDashboard(): Promise<DashboardData> {
  const response = await fetch('/api/dashboard')
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data')
  }
  return response.json()
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    refetchInterval: 60000, // Refetch every minute
  })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <LoadingState message="대시보드를 불러오는 중..." />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-6">
        <ErrorState message="대시보드를 불러오는데 실패했습니다." />
      </div>
    )
  }

  const expProgress = (data.character.currentExp / data.character.expToNextLevel) * 100
  const energyProgress = (data.character.currentEnergy / data.character.maxEnergy) * 100
  const habitsProgress = (data.todayHabits.completed / data.todayHabits.total) * 100

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">대시보드</h1>
        <p className="text-gray-600 dark:text-gray-400">
          오늘도 습관을 완성해보세요! 🎯
        </p>
      </div>

      {/* Character Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Character Card */}
        <Card variant="elevated" className="lg:col-span-2 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    Lv{data.character.level}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      레벨 {data.character.level}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">모험가</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-full">
                <FlameIcon size={24} />
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {data.character.currentStreak}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">일</span>
              </div>
            </div>

            {/* Experience Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">경험치</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {data.character.currentExp} / {data.character.expToNextLevel}
                </span>
              </div>
              <ProgressBar
                value={data.character.currentExp}
                max={data.character.expToNextLevel}
                variant="default"
                size="lg"
              />
            </div>

            {/* Energy Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">에너지</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {data.character.currentEnergy} / {data.character.maxEnergy}
                </span>
              </div>
              <ProgressBar
                value={data.character.currentEnergy}
                max={data.character.maxEnergy}
                variant="success"
                size="lg"
              />
            </div>

            {/* Currency */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-lg flex-1">
                <CoinsIcon size={20} />
                <span className="font-bold text-gray-900 dark:text-white">
                  {data.character.gold.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-lg flex-1">
                <GemIcon size={20} />
                <span className="font-bold text-gray-900 dark:text-white">
                  {data.character.gems.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Habits */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>오늘의 습관</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                {data.todayHabits.completed}/{data.todayHabits.total}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">완료</p>
            </div>
            <ProgressBar
              value={data.todayHabits.completed}
              max={data.todayHabits.total}
              variant="success"
              size="lg"
              className="mb-4"
            />
            <Link
              href="/habits"
              className="block w-full py-2 px-4 bg-indigo-600 text-white text-center rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              습관 보기
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quests & Achievements Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Quests */}
        <Card variant="bordered">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>퀘스트 진행</CardTitle>
              {data.quests.pendingRewards > 0 && (
                <Badge variant="warning" size="md">
                  {data.quests.pendingRewards}개 보상
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    일일 퀘스트
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {data.quests.daily.completed}/{data.quests.daily.total}
                  </span>
                </div>
                <ProgressBar
                  value={data.quests.daily.completed}
                  max={data.quests.daily.total}
                  variant="default"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    주간 퀘스트
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {data.quests.weekly.completed}/{data.quests.weekly.total}
                  </span>
                </div>
                <ProgressBar
                  value={data.quests.weekly.completed}
                  max={data.quests.weekly.total}
                  variant="warning"
                />
              </div>
            </div>
            <Link
              href="/quests"
              className="block w-full mt-4 py-2 px-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-center rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              모든 퀘스트 보기
            </Link>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>최근 업적</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentAchievements.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <TrophyIcon size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">아직 달성한 업적이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentAchievements.slice(0, 3).map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                  >
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {achievement.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(achievement.completedAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/achievements"
              className="block w-full mt-4 py-2 px-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-center rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              모든 업적 보기
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>전체 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {data.stats.totalHabitsCompleted.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">완료한 습관</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {data.stats.totalQuestsCompleted.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">완료한 퀘스트</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <TrophyIcon size={24} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {data.stats.achievementsUnlocked.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">달성한 업적</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <ExpIcon size={24} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {data.stats.totalExpEarned.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">총 경험치</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
