'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingState, ErrorState } from '@/components/ui/states'

interface UserSettings {
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
  notifications: {
    dailyReminder: boolean
    questComplete: boolean
    achievementUnlocked: boolean
    friendRequest: boolean
    guildActivity: boolean
    emailNotifications: boolean
  }
  preferences: {
    theme: 'light' | 'dark' | 'system'
    language: 'ko' | 'en'
    timezone: string
  }
  subscription: {
    tier: 'FREE' | 'PREMIUM' | 'FAMILY'
    expiresAt: string | null
  }
}

async function fetchSettings(): Promise<UserSettings> {
  const response = await fetch('/api/settings')
  if (!response.ok) {
    throw new Error('Failed to fetch settings')
  }
  return response.json()
}

async function updateSettings(settings: Partial<UserSettings>) {
  const response = await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update settings')
  }
  return response.json()
}

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'preferences'>(
    'profile',
  )

  const { data, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  })

  const updateMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      alert('설정이 저장되었습니다!')
    },
    onError: (error: Error) => {
      alert(`오류: ${error.message}`)
    },
  })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <LoadingState message="설정을 불러오는 중..." />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-6">
        <ErrorState message="설정을 불러오는데 실패했습니다." />
      </div>
    )
  }

  const tabs = [
    { key: 'profile' as const, label: '프로필', icon: '👤' },
    { key: 'notifications' as const, label: '알림', icon: '🔔' },
    { key: 'preferences' as const, label: '환경설정', icon: '⚙️' },
  ]

  const tierLabels = {
    FREE: '무료',
    PREMIUM: '프리미엄',
    FAMILY: '패밀리',
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">설정</h1>
        <p className="text-gray-600 dark:text-gray-400">계정 및 알림 설정을 관리하세요</p>
      </div>

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

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>계정 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                    {data.user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {data.user.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{data.user.email}</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    프로필 수정
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle>구독 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">현재 플랜</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {tierLabels[data.subscription.tier]}
                  </p>
                  {data.subscription.expiresAt && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      만료일: {new Date(data.subscription.expiresAt).toLocaleDateString('ko-KR')}
                    </p>
                  )}
                </div>
                <a
                  href="/subscription/manage"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  플랜 관리
                </a>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle>계정 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-left">
                  비밀번호 변경
                </button>
                <button className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-left">
                  데이터 내보내기
                </button>
                <button className="w-full px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-left">
                  계정 삭제
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>알림 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {key === 'dailyReminder' && '일일 리마인더'}
                      {key === 'questComplete' && '퀘스트 완료'}
                      {key === 'achievementUnlocked' && '업적 달성'}
                      {key === 'friendRequest' && '친구 요청'}
                      {key === 'guildActivity' && '길드 활동'}
                      {key === 'emailNotifications' && '이메일 알림'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {key === 'dailyReminder' && '매일 정해진 시간에 습관 알림을 받습니다'}
                      {key === 'questComplete' && '퀘스트를 완료했을 때 알림을 받습니다'}
                      {key === 'achievementUnlocked' && '새로운 업적을 달성했을 때 알림을 받습니다'}
                      {key === 'friendRequest' && '친구 요청을 받았을 때 알림을 받습니다'}
                      {key === 'guildActivity' && '길드 활동 알림을 받습니다'}
                      {key === 'emailNotifications' && '이메일로 알림을 받습니다'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => {
                        updateMutation.mutate({
                          notifications: {
                            ...data.notifications,
                            [key]: e.target.checked,
                          },
                        })
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>테마 설정</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {['light', 'dark', 'system'].map((theme) => (
                  <label
                    key={theme}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={theme}
                      checked={data.preferences.theme === theme}
                      onChange={(e) => {
                        updateMutation.mutate({
                          preferences: {
                            ...data.preferences,
                            theme: e.target.value as 'light' | 'dark' | 'system',
                          },
                        })
                      }}
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-gray-900 dark:text-white font-medium">
                      {theme === 'light' && '라이트 모드'}
                      {theme === 'dark' && '다크 모드'}
                      {theme === 'system' && '시스템 설정'}
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle>언어 설정</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={data.preferences.language}
                onChange={(e) => {
                  updateMutation.mutate({
                    preferences: {
                      ...data.preferences,
                      language: e.target.value as 'ko' | 'en',
                    },
                  })
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
              </select>
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle>시간대</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={data.preferences.timezone}
                onChange={(e) => {
                  updateMutation.mutate({
                    preferences: {
                      ...data.preferences,
                      timezone: e.target.value,
                    },
                  })
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Asia/Seoul">서울 (GMT+9)</option>
                <option value="America/New_York">뉴욕 (GMT-5)</option>
                <option value="Europe/London">런던 (GMT+0)</option>
                <option value="Asia/Tokyo">도쿄 (GMT+9)</option>
              </select>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
