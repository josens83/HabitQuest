'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states'
import { ExpIcon, FlameIcon } from '@/components/ui/icons'

interface Friend {
  id: string
  user1Id: string
  user2Id: string
  status: 'PENDING' | 'ACCEPTED'
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    image: string | null
    character: {
      level: number
      currentExp: number
      currentStreak: number
    } | null
  }
}

interface FriendsResponse {
  friends: Friend[]
  pendingRequests: Friend[]
}

async function fetchFriends(type: 'friends' | 'pending'): Promise<FriendsResponse> {
  const response = await fetch(`/api/social/friends?type=${type}`)
  if (!response.ok) {
    throw new Error('Failed to fetch friends')
  }
  return response.json()
}

async function sendFriendAction(action: 'send' | 'accept' | 'decline' | 'remove', friendId: string) {
  const response = await fetch('/api/social/friends', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, friendId }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to perform action')
  }
  return response.json()
}

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState<'friends' | 'pending'>('friends')
  const [searchEmail, setSearchEmail] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['friends', activeTab],
    queryFn: () => fetchFriends(activeTab),
  })

  const actionMutation = useMutation({
    mutationFn: ({ action, friendId }: { action: string; friendId: string }) =>
      sendFriendAction(action as any, friendId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })

      const messages = {
        send: '친구 요청을 보냈습니다.',
        accept: '친구 요청을 수락했습니다.',
        decline: '친구 요청을 거절했습니다.',
        remove: '친구를 삭제했습니다.',
      }
      alert(messages[variables.action as keyof typeof messages])
    },
    onError: (error: Error) => {
      alert(`오류: ${error.message}`)
    },
  })

  const handleSendRequest = () => {
    if (!searchEmail.trim()) {
      alert('이메일을 입력해주세요.')
      return
    }
    if (confirm(`${searchEmail}에게 친구 요청을 보내시겠습니까?`)) {
      actionMutation.mutate({ action: 'send', friendId: searchEmail })
      setSearchEmail('')
    }
  }

  const handleAccept = (friendId: string) => {
    actionMutation.mutate({ action: 'accept', friendId })
  }

  const handleDecline = (friendId: string) => {
    if (confirm('친구 요청을 거절하시겠습니까?')) {
      actionMutation.mutate({ action: 'decline', friendId })
    }
  }

  const handleRemove = (friendId: string) => {
    if (confirm('정말 친구를 삭제하시겠습니까?')) {
      actionMutation.mutate({ action: 'remove', friendId })
    }
  }

  const tabs = [
    { key: 'friends' as const, label: '내 친구', icon: '👥' },
    { key: 'pending' as const, label: '요청', icon: '📨' },
  ]

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">친구</h1>
        <p className="text-gray-600 dark:text-gray-400">
          친구와 함께 습관을 만들어가세요!
        </p>
      </div>

      {/* Add Friend Section */}
      <Card variant="bordered" className="mb-6">
        <CardHeader>
          <CardTitle>친구 추가</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="친구의 이메일 주소"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSendRequest()
              }}
            />
            <button
              onClick={handleSendRequest}
              disabled={actionMutation.isPending}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {actionMutation.isPending ? '처리 중...' : '요청'}
            </button>
          </div>
        </CardContent>
      </Card>

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
            {tab.key === 'pending' && data?.pendingRequests && data.pendingRequests.length > 0 && (
              <Badge variant="error" size="sm">
                {data.pendingRequests.length}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Friends/Requests List */}
      {isLoading && <LoadingState message="친구 목록을 불러오는 중..." />}

      {error && (
        <ErrorState
          message="친구 목록을 불러오는데 실패했습니다."
          action={{
            label: '다시 시도',
            onClick: () => queryClient.invalidateQueries({ queryKey: ['friends', activeTab] }),
          }}
        />
      )}

      {/* Friends Tab */}
      {activeTab === 'friends' && data?.friends && (
        <>
          {data.friends.length === 0 ? (
            <EmptyState
              icon="👥"
              title="친구가 없습니다"
              description="위의 검색창에서 이메일로 친구를 추가해보세요!"
            />
          ) : (
            <div className="space-y-3">
              {data.friends.map((friend) => (
                <Card key={friend.id} variant="bordered">
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                          {friend.user.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {friend.user.name || friend.user.email}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Lv.</span>
                              <span className="font-medium text-indigo-600 dark:text-indigo-400">
                                {friend.user.character?.level || 1}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <FlameIcon size={14} />
                              <span className="font-medium text-orange-600 dark:text-orange-400">
                                {friend.user.character?.currentStreak || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(friend.id)}
                        className="px-4 py-2 text-sm bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Pending Requests Tab */}
      {activeTab === 'pending' && data?.pendingRequests && (
        <>
          {data.pendingRequests.length === 0 ? (
            <EmptyState
              icon="📨"
              title="대기 중인 요청이 없습니다"
              description="친구 요청을 받으면 여기에 표시됩니다."
            />
          ) : (
            <div className="space-y-3">
              {data.pendingRequests.map((request) => (
                <Card key={request.id} variant="bordered">
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                          {request.user.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {request.user.name || request.user.email}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {request.user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(request.id)}
                          className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                          수락
                        </button>
                        <button
                          onClick={() => handleDecline(request.id)}
                          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          거절
                        </button>
                      </div>
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
