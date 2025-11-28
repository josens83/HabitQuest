'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tantml:react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states'
import { TrophyIcon, CoinsIcon } from '@/components/ui/icons'

interface Guild {
  id: string
  name: string
  description: string
  level: number
  currentExp: number
  maxMembers: number
  isPublic: boolean
  createdAt: string
  _count: {
    members: number
  }
  members?: Array<{
    id: string
    role: 'LEADER' | 'OFFICER' | 'MEMBER'
    contributionPoints: number
    user: {
      id: string
      name: string
      character: {
        level: number
      } | null
    }
  }>
}

interface GuildsResponse {
  guild?: Guild
  topGuilds?: Guild[]
}

async function fetchGuilds(type: 'my' | 'top'): Promise<GuildsResponse> {
  const response = await fetch(`/api/social/guilds?type=${type}`)
  if (!response.ok) {
    throw new Error('Failed to fetch guilds')
  }
  return response.json()
}

async function guildAction(
  action: 'create' | 'join' | 'leave',
  guildId?: string,
  guildData?: { name: string; description: string; isPublic: boolean },
) {
  const response = await fetch('/api/social/guilds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, guildId, ...guildData }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to perform action')
  }
  return response.json()
}

export default function GuildsPage() {
  const [activeTab, setActiveTab] = useState<'my' | 'top'>('my')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true,
  })
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['guilds', activeTab],
    queryFn: () => fetchGuilds(activeTab),
  })

  const actionMutation = useMutation({
    mutationFn: ({
      action,
      guildId,
      guildData,
    }: {
      action: 'create' | 'join' | 'leave'
      guildId?: string
      guildData?: any
    }) => guildAction(action, guildId, guildData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['guilds'] })

      const messages = {
        create: '길드를 생성했습니다!',
        join: '길드에 가입했습니다!',
        leave: '길드를 탈퇴했습니다.',
      }
      alert(messages[variables.action])

      if (variables.action === 'create') {
        setShowCreateForm(false)
        setFormData({ name: '', description: '', isPublic: true })
      }
    },
    onError: (error: Error) => {
      alert(`오류: ${error.message}`)
    },
  })

  const handleCreateGuild = () => {
    if (!formData.name.trim()) {
      alert('길드 이름을 입력해주세요.')
      return
    }
    if (!formData.description.trim()) {
      alert('길드 설명을 입력해주세요.')
      return
    }

    actionMutation.mutate({ action: 'create', guildData: formData })
  }

  const handleJoinGuild = (guildId: string) => {
    if (confirm('이 길드에 가입하시겠습니까?')) {
      actionMutation.mutate({ action: 'join', guildId })
    }
  }

  const handleLeaveGuild = () => {
    if (confirm('정말 길드를 탈퇴하시겠습니까?')) {
      actionMutation.mutate({ action: 'leave' })
    }
  }

  const tabs = [
    { key: 'my' as const, label: '내 길드', icon: '🏰' },
    { key: 'top' as const, label: '인기 길드', icon: '🌟' },
  ]

  const roleLabels = {
    LEADER: '길드장',
    OFFICER: '임원',
    MEMBER: '회원',
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">길드</h1>
        <p className="text-gray-600 dark:text-gray-400">
          길드에 가입하여 함께 성장하세요!
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
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

      {isLoading && <LoadingState message="길드 정보를 불러오는 중..." />}

      {error && (
        <ErrorState
          message="길드 정보를 불러오는데 실패했습니다."
          action={{
            label: '다시 시도',
            onClick: () => queryClient.invalidateQueries({ queryKey: ['guilds', activeTab] }),
          }}
        />
      )}

      {/* My Guild Tab */}
      {activeTab === 'my' && data && !isLoading && (
        <>
          {data.guild ? (
            <div className="space-y-6">
              {/* Guild Info Card */}
              <Card variant="elevated">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{data.guild.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {data.guild.description}
                      </p>
                    </div>
                    <Badge variant={data.guild.isPublic ? 'success' : 'default'} size="md">
                      {data.guild.isPublic ? '공개' : '비공개'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">길드 레벨</p>
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {data.guild.level}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">회원 수</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {data.guild._count.members} / {data.guild.maxMembers}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">경험치</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {data.guild.currentExp}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleLeaveGuild}
                    className="w-full py-2 px-4 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    길드 탈퇴
                  </button>
                </CardContent>
              </Card>

              {/* Members List */}
              {data.guild.members && data.guild.members.length > 0 && (
                <Card variant="bordered">
                  <CardHeader>
                    <CardTitle>길드 회원</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {data.guild.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                              {member.user.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {member.user.name}
                                </span>
                                <Badge
                                  variant={member.role === 'LEADER' ? 'warning' : 'default'}
                                  size="sm"
                                >
                                  {roleLabels[member.role]}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Lv. {member.user.character?.level || 1} • 기여도:{' '}
                                {member.contributionPoints}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <>
              {showCreateForm ? (
                <Card variant="bordered">
                  <CardHeader>
                    <CardTitle>새 길드 만들기</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          길드 이름
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="멋진 길드 이름"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          길드 설명
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                          }
                          placeholder="길드에 대해 설명해주세요"
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isPublic"
                          checked={formData.isPublic}
                          onChange={(e) =>
                            setFormData({ ...formData, isPublic: e.target.checked })
                          }
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label
                          htmlFor="isPublic"
                          className="text-sm text-gray-700 dark:text-gray-300"
                        >
                          공개 길드 (누구나 가입 가능)
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCreateGuild}
                          disabled={actionMutation.isPending}
                          className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                          {actionMutation.isPending ? '생성 중...' : '길드 만들기'}
                        </button>
                        <button
                          onClick={() => setShowCreateForm(false)}
                          className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <EmptyState
                  icon="🏰"
                  title="가입한 길드가 없습니다"
                  description="새 길드를 만들거나 인기 길드 탭에서 길드에 가입해보세요!"
                  action={{
                    label: '새 길드 만들기',
                    onClick: () => setShowCreateForm(true),
                  }}
                />
              )}
            </>
          )}
        </>
      )}

      {/* Top Guilds Tab */}
      {activeTab === 'top' && data?.topGuilds && !isLoading && (
        <>
          {data.topGuilds.length === 0 ? (
            <EmptyState
              icon="🌟"
              title="길드가 없습니다"
              description="아직 생성된 길드가 없습니다."
            />
          ) : (
            <div className="space-y-3">
              {data.topGuilds.map((guild, index) => (
                <Card key={guild.id} variant="bordered">
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-xl">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {guild.name}
                            </h4>
                            <Badge variant={guild.isPublic ? 'success' : 'default'} size="sm">
                              {guild.isPublic ? '공개' : '비공개'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {guild.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Lv. {guild.level}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {guild._count.members}/{guild.maxMembers} 명
                            </span>
                          </div>
                        </div>
                      </div>
                      {guild.isPublic && (
                        <button
                          onClick={() => handleJoinGuild(guild.id)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                        >
                          가입
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
