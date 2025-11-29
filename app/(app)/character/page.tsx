'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge, RarityBadge } from '@/components/ui/badge'
import { ProgressBar } from '@/components/ui/progress'
import { LoadingState, ErrorState } from '@/components/ui/states'
import { ExpIcon, CoinsIcon, GemIcon, FlameIcon, TrophyIcon } from '@/components/ui/icons'

type ItemRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
type ItemType = 'COSMETIC' | 'EQUIPMENT' | 'CONSUMABLE' | 'BOOST' | 'SPECIAL'

interface EquippedItem {
  slot: string
  item: {
    id: string
    name: string
    icon: string
    rarity: ItemRarity
    type: ItemType
  } | null
}

interface CharacterData {
  character: {
    id: string
    level: number
    currentExp: number
    expToNextLevel: number
    currentEnergy: number
    maxEnergy: number
    gold: number
    gems: number
    currentStreak: number
    longestStreak: number
    className: string
    appearance: {
      skin: string
      hair: string
      outfit: string
    }
  }
  stats: {
    strength: number
    intelligence: number
    vitality: number
    spirit: number
    charisma: number
  }
  equippedItems: EquippedItem[]
  achievements: {
    total: number
    unlocked: number
  }
  progress: {
    totalHabits: number
    totalQuests: number
    totalExpEarned: number
    daysPlayed: number
  }
}

async function fetchCharacter(): Promise<CharacterData> {
  const response = await fetch('/api/character')
  if (!response.ok) {
    throw new Error('Failed to fetch character data')
  }
  return response.json()
}

export default function CharacterPage() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['character'],
    queryFn: fetchCharacter,
  })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <LoadingState message="캐릭터 정보를 불러오는 중..." />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-6">
        <ErrorState message="캐릭터 정보를 불러오는데 실패했습니다." />
      </div>
    )
  }

  const expProgress = (data.character.currentExp / data.character.expToNextLevel) * 100
  const achievementProgress = (data.achievements.unlocked / data.achievements.total) * 100

  const statColors = {
    strength: 'bg-red-500',
    intelligence: 'bg-blue-500',
    vitality: 'bg-green-500',
    spirit: 'bg-purple-500',
    charisma: 'bg-yellow-500',
  }

  const maxStat = 100 // Maximum stat value for display

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">내 캐릭터</h1>
        <p className="text-gray-600 dark:text-gray-400">캐릭터를 성장시키고 꾸며보세요!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Character Display */}
        <div className="lg:col-span-2 space-y-6">
          {/* Character Card */}
          <Card variant="elevated" className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Character Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-8xl relative overflow-hidden">
                    ⚔️
                    {/* Future: Character sprite/avatar */}
                  </div>
                  <button className="w-full mt-4 px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    외형 변경
                  </button>
                </div>

                {/* Character Info */}
                <div className="flex-1 w-full">
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="purple" size="lg">
                        Lv. {data.character.level}
                      </Badge>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {data.character.className}
                      </h2>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <FlameIcon size={16} />
                        <span>{data.character.currentStreak}일 연속</span>
                      </div>
                      <span>•</span>
                      <div>플레이 {data.progress.daysPlayed}일</div>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        경험치
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {data.character.currentExp.toLocaleString()} /{' '}
                        {data.character.expToNextLevel.toLocaleString()}
                      </span>
                    </div>
                    <ProgressBar
                      value={data.character.currentExp}
                      max={data.character.expToNextLevel}
                      variant="default"
                      size="lg"
                      showPercentage
                    />
                  </div>

                  {/* Currency */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 bg-yellow-100 dark:bg-yellow-900/30 px-4 py-3 rounded-lg">
                      <CoinsIcon size={24} />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">골드</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {data.character.gold.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-purple-100 dark:bg-purple-900/30 px-4 py-3 rounded-lg">
                      <GemIcon size={24} />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">젬</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {data.character.gems.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>스탯</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(data.stats).map(([stat, value]) => (
                  <div key={stat}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {stat === 'strength' && '힘'}
                        {stat === 'intelligence' && '지능'}
                        {stat === 'vitality' && '체력'}
                        {stat === 'spirit' && '정신'}
                        {stat === 'charisma' && '매력'}
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {value}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`${statColors[stat as keyof typeof statColors]} h-2 rounded-full transition-all`}
                        style={{ width: `${(value / maxStat) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  💡 스탯은 습관 완료와 레벨업을 통해 자동으로 증가합니다
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Equipped Items */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>장착 아이템</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {data.equippedItems.map((equipped) => (
                  <div
                    key={equipped.slot}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center"
                  >
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase">
                      {equipped.slot}
                    </p>
                    {equipped.item ? (
                      <div>
                        <div className="text-4xl mb-2">{equipped.item.icon}</div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {equipped.item.name}
                        </p>
                        <RarityBadge rarity={equipped.item.rarity} size="sm" className="mt-1" />
                      </div>
                    ) : (
                      <div>
                        <div className="text-4xl mb-2 opacity-30">📦</div>
                        <p className="text-xs text-gray-400">비어있음</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Progress & Achievements */}
        <div className="space-y-6">
          {/* Progress Summary */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>진행 상황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">업적 달성률</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {data.achievements.unlocked} / {data.achievements.total}
                    </span>
                  </div>
                  <ProgressBar
                    value={data.achievements.unlocked}
                    max={data.achievements.total}
                    variant="warning"
                    showPercentage
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">완료한 습관</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {data.progress.totalHabits.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">완료한 퀘스트</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {data.progress.totalQuests.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">총 경험치</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {data.progress.totalExpEarned.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">최장 연속</span>
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                      {data.character.longestStreak}일
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>빠른 이동</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <a
                  href="/inventory"
                  className="block w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-center"
                >
                  📦 인벤토리
                </a>
                <a
                  href="/shop"
                  className="block w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-center"
                >
                  🛒 상점
                </a>
                <a
                  href="/achievements"
                  className="block w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-center"
                >
                  🏆 업적
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Streak Motivation */}
          <Card variant="bordered" className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
            <CardContent className="text-center p-6">
              <FlameIcon size={48} className="mx-auto mb-3 text-orange-500" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {data.character.currentStreak}일 연속!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                매일 습관을 완료하고
                <br />
                연속 기록을 유지하세요! 🔥
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
