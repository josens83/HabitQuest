'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ItemCard } from '@/components/game/item-card'
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states'
import { CoinsIcon, GemIcon } from '@/components/ui/icons'

type ItemType = 'CONSUMABLE' | 'COSMETIC' | 'BOOST' | 'SPECIAL'
type ItemCategory = string
type ItemRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'

interface ShopItem {
  id: string
  name: string
  description: string
  icon: string
  rarity: ItemRarity
  type: ItemType
  category: ItemCategory
  buyPrice: number | null
  gemPrice: number | null
}

interface ShopResponse {
  items: ShopItem[]
  userGold: number
  userGems: number
}

async function fetchShopItems(
  category?: string,
  type?: string,
): Promise<ShopResponse> {
  const params = new URLSearchParams()
  if (category) params.append('category', category)
  if (type) params.append('type', type)

  const response = await fetch(`/api/shop?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch shop items')
  }
  return response.json()
}

async function purchaseItem(itemId: string) {
  const response = await fetch('/api/shop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to purchase item')
  }
  return response.json()
}

export default function ShopPage() {
  const [filterType, setFilterType] = useState<'all' | ItemType>('all')
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['shop', filterType],
    queryFn: () => fetchShopItems(undefined, filterType === 'all' ? undefined : filterType),
  })

  const purchaseMutation = useMutation({
    mutationFn: purchaseItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['character'] })
      alert('아이템을 구매했습니다!')
    },
    onError: (error: Error) => {
      alert(`구매 실패: ${error.message}`)
    },
  })

  const handlePurchase = (itemId: string) => {
    const item = data?.items.find((i) => i.id === itemId)
    if (!item) return

    const priceText =
      item.buyPrice && item.gemPrice
        ? `골드 ${item.buyPrice} 또는 젬 ${item.gemPrice}`
        : item.buyPrice
          ? `골드 ${item.buyPrice}`
          : `젬 ${item.gemPrice}`

    if (confirm(`${item.name}을(를) ${priceText}에 구매하시겠습니까?`)) {
      purchaseMutation.mutate(itemId)
    }
  }

  const filterTypes: Array<{ key: 'all' | ItemType; label: string; icon: string }> = [
    { key: 'all', label: '전체', icon: '🛒' },
    { key: 'CONSUMABLE', label: '소모품', icon: '⚗️' },
    { key: 'COSMETIC', label: '코스메틱', icon: '👔' },
    { key: 'BOOST', label: '부스트', icon: '🚀' },
    { key: 'SPECIAL', label: '특별', icon: '✨' },
  ]

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">상점</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              다양한 아이템을 구매하세요
            </p>
          </div>
          {data && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-lg">
                <CoinsIcon size={20} />
                <span className="font-bold text-gray-900 dark:text-white">
                  {data.userGold.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-lg">
                <GemIcon size={20} />
                <span className="font-bold text-gray-900 dark:text-white">
                  {data.userGems.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {filterTypes.map((type) => (
          <button
            key={type.key}
            onClick={() => setFilterType(type.key)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap
              ${
                filterType === type.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }
            `}
          >
            <span>{type.icon}</span>
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      {/* Item Grid */}
      {isLoading && <LoadingState message="상점 아이템을 불러오는 중..." />}

      {error && (
        <ErrorState
          message="상점 아이템을 불러오는데 실패했습니다."
          action={{
            label: '다시 시도',
            onClick: () => queryClient.invalidateQueries({ queryKey: ['shop', filterType] }),
          }}
        />
      )}

      {data && data.items.length === 0 && (
        <EmptyState
          icon="🛒"
          title="판매 중인 아이템이 없습니다"
          description="현재 이 카테고리에서 판매 중인 아이템이 없습니다."
        />
      )}

      {data && data.items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              mode="shop"
              onPurchase={handlePurchase}
            />
          ))}
        </div>
      )}

      {/* Help Text */}
      <Card variant="bordered" className="mt-6">
        <CardContent>
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                상점 이용 안내
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• 골드는 퀘스트와 습관 완료로 획득할 수 있습니다</li>
                <li>• 젬은 프리미엄 재화로 구매 또는 특별 보상으로 획득할 수 있습니다</li>
                <li>• 소모품은 사용 시 즉시 효과가 적용됩니다</li>
                <li>• 코스메틱 아이템은 캐릭터를 꾸밀 수 있습니다</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
